import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import Chatbot from '../components/Chatbot';

import InicioScreen from '../Screens/Usuario_posible_comprador/InicioScreen';
import VehiculosScreen from '../Screens/Usuario_posible_comprador/VehiculosScreen';
import ReservasScreen from '../Screens/Usuario_posible_comprador/ReservasScreen';
import EstacionesScreen_usuario_vehiculo from '../Screens/Usuario_Vehiculo_electrico/EstacionesScreen_usuario_vehiculo';
import InicioScreen_usuario_vehiculo from '../Screens/Usuario_Vehiculo_electrico/InicioScreen_usuario_vehiculo';
import TalleresScreen_usuario_vehiculo from '../Screens/Usuario_Vehiculo_electrico/TalleresScreen_usuario_vehiculo';
import EmergenciasScreen_usuario_vehiculo from '../Screens/Usuario_Vehiculo_electrico/EmergenciasScreen_usuario_vehiculo';
import Interfaz_Administrador from '../Screens/Usuario_Administrador/Interfaz_Administrador_Inicio';
import Interfaz_Administrador_Usuarios from '../Screens/Usuario_Administrador/Interfaz_Administrador_usuarios';

import { AuthProvider, useAuth } from '../../ViewModel/AuthViewModel';

const Tab = createBottomTabNavigator();

function Tabs() {
  const insets = useSafeAreaInsets();
  const { esInvitado, esCliente, esAdministrador } = useAuth();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#38bdf8',
          tabBarInactiveTintColor: '#e2e8f0',
          tabBarStyle: {
            position: 'absolute',
            bottom: insets.bottom + 10,
            left: 15,
            right: 15,
            backgroundColor: '#0f172a',
            borderRadius: 20,
            height: 75,
            borderTopWidth: 0,
            elevation: 12,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
          tabBarItemStyle: { paddingVertical: 5 },
          tabBarIconStyle: { marginBottom: 2 },
        }}>
        {/* ── Por defecto / sin login (posible comprador) ── */}
        {esInvitado && (
          <>
            <Tab.Screen
              name="Inicio"
              component={InicioScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="home" size={size + 2} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Vehiculos"
              component={VehiculosScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="car" size={size + 2} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Reservas"
              component={ReservasScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="calendar-check" size={size + 2} color={color} />
                ),
              }}
            />
          </>
        )}

        {/* ── Rol: Cliente ── */}
        {esCliente && (
          <>
            <Tab.Screen
              name="Inicio Usuario"
              component={InicioScreen_usuario_vehiculo}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="home" size={size + 2} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Estaciones de Carga"
              component={EstacionesScreen_usuario_vehiculo}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="ev-station" size={size + 2} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Talleres Autorizados"
              component={TalleresScreen_usuario_vehiculo}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="wrench" size={size + 2} color={color} />
                ),
              }}
            />
            {/* NOTA: no especificaste en qué rol va "Emergencias", la dejo aquí por suposición */}
            <Tab.Screen
              name="Emergencias"
              component={EmergenciasScreen_usuario_vehiculo}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="alert-decagram" size={size + 2} color={color} />
                ),
              }}
            />
          </>
        )}

        {/* ── Rol: Administrador ── */}
        {esAdministrador && (
          <>
            <Tab.Screen
              name="Inicio Administrador"
              component={Interfaz_Administrador}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons
                    name="view-dashboard-outline"
                    size={size + 2}
                    color={color}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Usuarios"
              component={Interfaz_Administrador_Usuarios}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons
                    name="account-multiple-outline"
                    size={size + 2}
                    color={color}
                  />
                ),
              }}
            />
          </>
        )}
      </Tab.Navigator>
      <Chatbot bottomOffset={insets.bottom + 96} />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Tabs />
          <StatusBar style="light" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
