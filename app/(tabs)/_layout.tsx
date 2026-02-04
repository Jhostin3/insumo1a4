import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#282a36' },
        headerTintColor: '#f8f8f2',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  );
}
