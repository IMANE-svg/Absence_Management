import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

// Composants
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../_components/Header';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* En-tête commun */}
      <Header />

      {/* Tabs */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#ccc',
          tabBarStyle: {
            backgroundColor: '#845448',
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 90,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="scan-qr"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="presence-list"
          options={{
            title: 'Présence',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="event-available" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="help"
          options={{
            title: 'Aide',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="help" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="account-circle" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}