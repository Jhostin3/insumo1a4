import { useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../../core/supabase/client.supabase';
import { NotificationAdapter } from '../../core/notifications/notification.adapter';

// Setup inicial fuera del componente
NotificationAdapter.setup();

/**
 * Hook para registrar dispositivo en Supabase para notificaciones push
 * @param userId - ID del usuario autenticado
 */
export const usePushNotifications = (userId?: string) => {
  useEffect(() => {
    // Si no hay usuario, no registramos
    if (!userId) return;

    const register = async () => {
      // Obtener token del adaptador
      const token = await NotificationAdapter.registerForPushNotificationsAsync();

      if (token) {
        console.log('Token obtenido:', token);
        await saveTokenToDatabase(token, userId);
      }
    };

    register();
  }, [userId]);
};

/**
 * Guarda el token en la tabla devices de Supabase
 */
async function saveTokenToDatabase(token: string, userId: string) {
  const { error } = await supabase
    .from('devices')
    .upsert(
      {
        user_id: userId,
        token: token,
        platform: Platform.OS,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: 'token' }
    );

  if (error) {
    console.error('Error guardando device:', error);
  } else {
    console.log('Dispositivo registrado en Supabase');
  }
}
