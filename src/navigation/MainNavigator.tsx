import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import AlertsScreen from '../screens/AlertsScreen';
import AlertDetailScreen from '../screens/AlertDetailScreen';
import AlertFormScreen from '../screens/AlertFormScreen';
import SensorsScreen from '../screens/SensorsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import SecurityScreen from '../screens/settings/SecurityScreen';
import HelpScreen from '../screens/settings/HelpScreen';
import DevelopersScreen from '../screens/settings/DevelopersScreen';
import { COLORS, FONTS } from '../utils/theme';

const Tab = createBottomTabNavigator();
const AlertStack = createNativeStackNavigator();
const DashStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const HEADER_OPTIONS = {
  headerStyle: { backgroundColor: COLORS.bgCard },
  headerTintColor: COLORS.textPrimary,
  headerTitleStyle: { fontFamily: FONTS.bold, fontSize: 16 },
  headerShadowVisible: false,
};

function AlertsStackNav() {
  return (
    <AlertStack.Navigator screenOptions={HEADER_OPTIONS}>
      <AlertStack.Screen name="AlertsList" component={AlertsScreen} options={{ title: 'Alertas' }} />
      <AlertStack.Screen name="AlertDetail" component={AlertDetailScreen} options={{ title: 'Detalhe do Alerta' }} />
      <AlertStack.Screen name="AlertForm" component={AlertFormScreen} options={{ title: 'Novo Alerta' }} />
    </AlertStack.Navigator>
  );
}

function DashboardStackNav() {
  return (
    <DashStack.Navigator screenOptions={HEADER_OPTIONS}>
      <DashStack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <DashStack.Screen name="AlertDetail" component={AlertDetailScreen} options={{ title: 'Detalhe do Alerta' }} />
      <DashStack.Screen name="AlertForm" component={AlertFormScreen} options={{ title: 'Novo Alerta' }} />
    </DashStack.Navigator>
  );
}

function ProfileStackNav() {
  return (
    <ProfileStack.Navigator screenOptions={HEADER_OPTIONS}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Meu Perfil' }} />
      <ProfileStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notificações e Alertas' }}
      />
      <ProfileStack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ title: 'Segurança e Senha' }}
      />
      <ProfileStack.Screen
        name="Help"
        component={HelpScreen}
        options={{ title: 'Central de Ajuda' }}
      />
      <ProfileStack.Screen
        name="Developers"
        component={DevelopersScreen}
        options={{ title: 'Desenvolvedores' }}
      />
    </ProfileStack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primaryLight,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontFamily: FONTS.semiBold, fontSize: 11, marginTop: 4 },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNav}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Alertas"
        component={AlertsStackNav}
        options={{
          tabBarLabel: 'Alertas',
          tabBarIcon: ({ color }) => <Feather name="bell" size={22} color={color} />,
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
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="broadcast" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileStackNav}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
