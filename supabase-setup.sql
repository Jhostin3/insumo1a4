-- ============================================
-- INSTRUCCIONES PARA CONFIGURAR SUPABASE
-- ============================================
-- Ejecuta estos comandos en el SQL Editor de Supabase
-- Dashboard > SQL Editor > New query

-- 0. Trigger automático: crear perfil cuando se registra un usuario
-- Esto se ejecuta con SECURITY DEFINER, así que no afecta RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, updated_at)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1. Habilitar extensión HTTP (si no está habilitada)
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- 2. Crear función para enviar notificaciones push
CREATE OR REPLACE FUNCTION public.send_push_notification(
    target_user_id uuid,
    title text,
    body text,
    data jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
DECLARE
    user_token text;
BEGIN
    -- Obtener el token del dispositivo más reciente
    SELECT token INTO user_token
    FROM public.devices
    WHERE user_id = target_user_id
    ORDER BY last_used_at DESC
    LIMIT 1;

    IF user_token IS NULL THEN
        RETURN; -- Usuario sin dispositivos registrados
    END IF;

    -- Enviar POST a Expo Push API
    PERFORM extensions.http((
        'POST',
        'https://exp.host/--/api/v2/push/send',
        ARRAY[http_header('Content-Type', 'application/json')],
        'application/json',
        jsonb_build_object(
            'to', user_token,
            'title', title,
            'body', body,
            'data', data,
            'sound', 'default',
            'priority', 'high'
        )::text
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Función para trigger de pedidos (ejecuta inmediatamente)
CREATE OR REPLACE FUNCTION public.handle_order_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Enviar notificación inmediata
    PERFORM public.send_push_notification(
        new.user_id,
        '✅ Pedido enviado con éxito',
        'Tu pedido ha sido registrado correctamente.',
        jsonb_build_object('order_id', new.id, 'screen', 'orders')
    );

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear trigger para cuando se crea un pedido
DROP TRIGGER IF EXISTS on_order_created ON public.orders;
CREATE TRIGGER on_order_created
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_order_created();

-- 5. Función para enviar notificación después de 1 minuto
CREATE OR REPLACE FUNCTION public.send_ready_notification(order_id_param uuid)
RETURNS void AS $$
DECLARE
    order_user_id uuid;
BEGIN
    -- Obtener el user_id del pedido
    SELECT user_id INTO order_user_id
    FROM public.orders
    WHERE id = order_id_param;

    IF order_user_id IS NOT NULL THEN
        -- Actualizar estado del pedido
        UPDATE public.orders
        SET ready_at = NOW(),
            status = 'ready'
        WHERE id = order_id_param;

        -- Enviar notificación
        PERFORM public.send_push_notification(
            order_user_id,
            '🎉 ¡Su pedido está listo!',
            'Puede pasar a recoger su pedido.',
            jsonb_build_object('order_id', order_id_param, 'screen', 'orders')
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Configurar políticas RLS (Row Level Security) para la tabla devices
-- Permitir a los usuarios insertar/actualizar sus propios dispositivos
DROP POLICY IF EXISTS "Users can manage own devices" ON public.devices;
CREATE POLICY "Users can manage own devices"
ON public.devices
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Habilitar RLS en la tabla devices si no está habilitado
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- 8. Políticas para orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 9. Habilitar RLS en orders si no está habilitado
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 10. Política para profiles (lectura pública, escritura propia)
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable"
ON public.profiles
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 11. Habilitar RLS en profiles si no está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
