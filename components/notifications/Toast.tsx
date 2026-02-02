import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

type ToastProps = {
  message: string;
  onHide: () => void;
};

/**
 * Componente Toast animado para mostrar notificaciones
 * Se oculta automáticamente después de 3 segundos
 */
export const Toast = ({ message, onHide }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onHide, 3000);
    return () => clearTimeout(timer);
  }, [onHide]);

  return (
    <Animated.View
      entering={FadeInUp.springify()}
      exiting={FadeOutUp}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <View style={styles.dot} />
        </View>
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 100,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#282a36',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#bd93f9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#44475a',
  },
  iconContainer: {
    marginRight: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#50fa7b',
  },
  text: {
    color: '#f8f8f2',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
});
