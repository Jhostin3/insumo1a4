import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from '@/lib/modules/auth/AuthProvider';
import { usePushNotifications } from '@/lib/modules/notifications/usePushNotifications';
import { Toast } from '@/components/notifications/Toast';

function AuthGate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  usePushNotifications(session?.user.id);

  const [notification, setNotification] = useState<string | null>(null);

  // Redirigir según sesión
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)/orders');
    }
  }, [session, loading, segments]);

  // Listener de notificaciones en primer plano
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((n) => {
      const title = n.request.content.title;
      const body = n.request.content.body;
      setNotification(`${title}: ${body}`);
    });
    return () => sub.remove();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {notification && (
        <Toast
          message={notification}
          onHide={() => setNotification(null)}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
