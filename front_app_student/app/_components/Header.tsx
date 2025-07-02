import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@/config';
import React from 'react';
import {
    Alert,
    Image,
    TouchableOpacity,
    View,
} from 'react-native';

// Services
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Styles
import { StyleSheet } from 'react-native';
import variables from '../../styles/variables';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginTop: 0,
    paddingTop: 30,
    backgroundColor: variables.blue,
    width: '100%',
  },
  logo: {
    height: 50,
    width: 50,
  },
  signOutButton: {
    padding: 8,
  },
});

const Header = () => {
  const handleLogout = () => {
  Alert.alert(
    'Déconnexion',
    'Êtes-vous sûr de vouloir vous déconnecter ?',
    [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: async () => {
          try {
            // D'abord appeler l'API de déconnexion côté serveur
            const token = await SecureStore.getItemAsync('access_token');
            if (token) {
              await fetch(`${API_URL}/logout/`, {
                method: 'POST',
                headers: {
                  'Authorization': `Token ${token}`,
                  'Content-Type': 'application/json',
                },
              });
            }

            // Ensuite supprimer les données utilisateur localement
           await SecureStore.deleteItemAsync('access_token');
           await SecureStore.deleteItemAsync('refresh_token');
           await SecureStore.deleteItemAsync('userInfo');

            // Redirection vers login
            router.replace('/(auth)/login');
          } catch (error) {
            console.error("Erreur lors de la déconnexion", error);
            // Même en cas d'erreur, on force la déconnexion locale
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');
            await SecureStore.deleteItemAsync('userInfo');
            router.replace('/(auth)/login');
          }
        },
      },
    ],
    { cancelable: true }
  );
};

  return (
    <View style={styles.header}>
      {/* Logo à gauche */}
      <Image
        source={require('../../assets/nv-removebg-preview.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Bouton Logout à droite */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;