import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Carregando...' }: LoadingOverlayProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#0B0F1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1A1F2E',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  text: {
    color: '#94A3B8',
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
