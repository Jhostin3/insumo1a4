import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/lib/modules/auth/AuthProvider';
import { usePushNotifications } from '@/lib/modules/notifications/usePushNotifications';
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Toast } from '@/components/notifications/Toast';

/**
 * Layout interno que tiene acceso al contexto de Auth
 */
function AuthLayout() {
  const { session } = useAuth();
  const userId = session?.user.id;

  // Registrar dispositivo para notificaciones push
  usePushNotifications(userId);

  // Estado para mostrar toast cuando llegue notificación
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Listener para notificaciones recibidas mientras la app está abierta
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const title = notification.request.content.title;
        const body = notification.request.content.body;
        setNotification(`${title}: ${body}`);
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <>
      <Stack />
      {notification && (
        <Toast message={notification} onHide={() => setNotification(null)} />
      )}
    </>
  );
}

/**
 * Layout raíz con providers globales
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthLayout />
    </AuthProvider>
  );
}
