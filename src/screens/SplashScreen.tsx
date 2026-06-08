import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, FONTS } from '../utils/theme';

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
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ringScale, { toValue: 1.8, duration: 800, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 0.25, duration: 400, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      if (!isLoading) {
        navigation.replace(isAuthenticated ? 'Main' : 'Auth');
      }
    }, 2600);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      {/* Anel de efeito */}
      <Animated.View
        style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
      />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Text style={styles.tagline}>Monitoramento via satélite em tempo real</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Powered by ESA Copernicus · Sentinel-1</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  ring: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  logoContainer: {
    width: 260,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
    letterSpacing: 0.4,
    textAlign: 'center',
    maxWidth: width * 0.65,
  },
  pill: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillText: {
    color: COLORS.textDimmed,
    fontSize: 10,
    fontFamily: FONTS.medium,
    letterSpacing: 0.3,
  },
});
