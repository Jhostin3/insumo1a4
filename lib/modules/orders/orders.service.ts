import { supabase } from '../../core/supabase/client.supabase';

/**
 * Servicio para gestión de pedidos
 */
export const OrdersService = {
  /**
   * Crea un nuevo pedido y programa notificación de listo
   */
  async createOrder(userId: string) {
    try {
      // 1. Crear pedido en la base de datos
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Programar notificación de "pedido listo" después de 1 minuto
      setTimeout(async () => {
        await supabase.rpc('send_ready_notification', {
          order_id_param: order.id,
        });
      }, 60000); // 60,000 ms = 1 minuto

      return { success: true, order };
    } catch (error) {
      console.error('Error creando pedido:', error);
      return { success: false, error };
    }
  },

  /**
   * Obtiene los pedidos del usuario
   */
  async getUserOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo pedidos:', error);
      return [];
    }

    return data || [];
  },
};
