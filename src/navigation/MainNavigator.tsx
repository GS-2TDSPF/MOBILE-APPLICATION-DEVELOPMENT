import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import AlertsScreen from '../screens/AlertsScreen';
import AlertDetailScreen from '../screens/AlertDetailScreen';
import SensorsScreen from '../screens/SensorsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const AlertStack = createNativeStackNavigator();
const DashStack = createNativeStackNavigator();

const HEADER_OPTIONS = {
  headerStyle: { backgroundColor: '#1A1F2E' },
  headerTintColor: '#F1F5F9',
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
};

function AlertsStackNav() {
  return (
    <AlertStack.Navigator screenOptions={HEADER_OPTIONS}>
      <AlertStack.Screen name="AlertsList" component={AlertsScreen} options={{ title: 'Alertas' }} />
      <AlertStack.Screen name="AlertDetail" component={AlertDetailScreen} options={{ title: 'Detalhe do Alerta' }} />
    </AlertStack.Navigator>
  );
}

function DashboardStackNav() {
  return (
    <DashStack.Navigator screenOptions={HEADER_OPTIONS}>
      <DashStack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <DashStack.Screen name="AlertDetail" component={AlertDetailScreen} options={{ title: 'Detalhe do Alerta' }} />
    </DashStack.Navigator>
  );
}

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', opacity: focused ? 1 : 0.5 }}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1F2E',
          borderTopColor: '#0F1420',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNav}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Alertas"
        component={AlertsStackNav}
        options={{
          tabBarLabel: 'Alertas',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🚨" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Sensores"
        component={SensorsScreen}
        options={{
          headerShown: true,
          ...HEADER_OPTIONS,
          title: 'Sensores IoT',
          tabBarLabel: 'Sensores',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📡" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          headerShown: true,
          ...HEADER_OPTIONS,
          title: 'Meu Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
