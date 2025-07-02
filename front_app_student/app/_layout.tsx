import { Slot } from 'expo-router'; // 👈 Import du Slot
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import * as SecureStore from 'expo-secure-store';
import variables from '../styles/variables';

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: variables.white,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: variables.white,
  },
});

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token'); // ✅ Corrigé ici
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification", error);
      setIsLoggedIn(false);
    }
  };

  if (isLoggedIn === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={variables.blue} />
      </View>
    );
  }

  return <Slot />; // 👈 Affiche soit (auth)/login soit (main)/scan-qr etc.
}