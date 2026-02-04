import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/modules/auth/AuthProvider';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#bd93f9" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/orders" />;
  }

  return <Redirect href="/(auth)/login" />;
}
