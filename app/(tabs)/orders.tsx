import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/lib/modules/auth/AuthProvider';
import { AuthService } from '@/lib/modules/auth/auth.service';
import { OrdersService } from '@/lib/modules/orders/orders.service';

type Order = {
  id: string;
  status: string;
  created_at: string;
  ready_at?: string;
};

export default function OrdersScreen() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (session?.user.id) loadOrders();
  }, [session]);

  const handleCreateOrder = async () => {
    if (!session?.user.id) return;
    setLoading(true);
    const result = await OrdersService.createOrder(session.user.id);
    setLoading(false);
    if (result.success) loadOrders();
    else alert('Error al crear pedido');
  };

  const loadOrders = async () => {
    if (!session?.user.id) return;
    const data = await OrdersService.getUserOrders(session.user.id);
    setOrders(data);
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Pedido #{item.id.slice(0, 8)}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'ready' && styles.statusReady,
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'ready' ? 'Listo' : 'Pendiente'}
          </Text>
        </View>
      </View>
      <Text style={styles.orderDate}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Enviar Nuevo Pedido</Text>
        )}
      </TouchableOpacity>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        style={styles.list}
        onRefresh={loadOrders}
        refreshing={false}
      />

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => AuthService.signOut()}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f8f2' },
  button: {
    backgroundColor: '#bd93f9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  list: { flex: 1 },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#282a36' },
  statusBadge: {
    backgroundColor: '#ffb86c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusReady: { backgroundColor: '#50fa7b' },
  statusText: { color: '#282a36', fontWeight: '600', fontSize: 12 },
  orderDate: { fontSize: 14, color: '#6272a4' },
  logoutBtn: { alignItems: 'center', paddingVertical: 12 },
  logoutText: { color: '#ff5555', fontSize: 14 },
});
