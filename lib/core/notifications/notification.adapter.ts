import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/**
 * Adaptador de notificaciones push
 * Maneja la configuración y registro de dispositivos para notificaciones
 */
export const NotificationAdapter = {
  /**
   * Configura el comportamiento de notificaciones en primer plano
   */
  setup: () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  },

  /**
   * Registra el dispositivo para recibir notificaciones push
   * @returns Token de Expo Push o null si falla
   */
  registerForPushNotificationsAsync: async (): Promise<string | null> => {
    let token;

    // Configuración específica para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Verificación de dispositivo físico
    if (Device.isDevice) {
      // Gestión de permisos
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permiso de notificaciones denegado');
        return null;
      }

      // Obtener el token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    } else {
      console.log('Debes usar un dispositivo físico para notificaciones push');
    }

    return token || null;
  },
};
