import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const { isAuthenticated, isLoading } = useAuth();

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de entrada
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 1.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Navegar após 2.5s
    const timer = setTimeout(() => {
      if (!isLoading) {
        navigation.replace(isAuthenticated ? 'Main' : 'Auth');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      {/* Anel de efeito */}
      <Animated.View
        style={[
          styles.ring,
          {
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />

      {/* Logo + ícone */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Text style={styles.satelliteIcon}>🛰️</Text>
      </Animated.View>

      {/* Textos */}
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Text style={styles.brand}>OrbitAlert</Text>
        <Text style={styles.tagline}>Monitoramento via satélite em tempo real</Text>
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: textOpacity }]}>
        <Text style={styles.footerText}>Powered by ESA Copernicus · Sentinel-1</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#1A1F2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    marginBottom: 28,
  },
  satelliteIcon: {
    fontSize: 52,
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    color: '#F1F5F9',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    color: '#64748B',
    fontSize: 13,
    letterSpacing: 0.5,
    textAlign: 'center',
    maxWidth: width * 0.65,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    color: '#334155',
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
