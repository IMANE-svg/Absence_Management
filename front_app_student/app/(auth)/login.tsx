import { API_URL } from '@/config';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  Dimensions,
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');
const cardWidth = Math.min(width * 0.95, 900);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    console.log("Tentative de connexion avec:", { email, password });
    console.log("URL utilisée:", `${API_URL}/token/`);

    try {
      const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
    console.log("Réponse du serveur:", response.status);
    const result = await response.json();
    console.log("Résultat complet:", result);

    if (response.ok) {
        const { access, refresh, role } = result;

        if (role !== 'etudiant') {
          Alert.alert('Erreur', "Ce compte n'est pas un étudiant.");
          return;
        }

     // Stocker les tokens
        await SecureStore.setItemAsync('access_token', access);
        await SecureStore.setItemAsync('refresh_token', refresh);

        // Récupérer le profil étudiant
        const profileResponse = await fetch(`${API_URL}/etudiant/profil/`, {
          headers: {
            Authorization: `Bearer ${access}`,
            Accept: 'application/json',
          },
        });

        if (profileResponse.ok) {
          const studentData = await profileResponse.json();

          await SecureStore.setItemAsync(
            'userInfo',
            JSON.stringify({
              nom: studentData.nom,
              prenom: studentData.prenom,
              email: studentData.email,
              filiere: studentData.filiere,
              niveau: studentData.niveau,
              photo: studentData.photo ? `${API_URL}${studentData.photo}` : null,
            })
          );

          router.replace('/(main)/scan-qr');
        } else {
          Alert.alert('Erreur', 'Impossible de récupérer le profil.');
        }
      } else {
        const message = result.detail || result.error || 'Email ou mot de passe incorrect';
        Alert.alert('Erreur', message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de se connecter au serveur.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          {/* Section Bienvenue */}
          <View style={styles.welcomeSection}>
            <Image 
              source={require('../../assets/nv-removebg-preview.png')} 
              style={styles.logo} 
            />
            <Text style={styles.welcomeTitle}>Bienvenue !</Text>
            <Text style={styles.welcomeText}>
              Saisissez vos informations personnelles pour utiliser toutes les fonctionnalités
            </Text>
            
            <View style={styles.authButtons}>
              <TouchableOpacity 
                style={[styles.authButton]}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.authButtonText}>S'inscrire</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.authButton, styles.authButtonActive]}
              >
                <Text style={[styles.authButtonText, styles.authButtonTextActive]}>
                  Se connecter
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section Formulaire */}
          <View style={styles.formSection}>
            <View style={styles.form}>
              <Text style={styles.formTitle}>Se connecter</Text>
              
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleLogin}
              >
                <Text style={styles.submitButtonText}>SE CONNECTER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6de',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  card: {
    width: cardWidth,
    backgroundColor: 'white',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 5,
    minHeight: 480,
  },
  welcomeSection: {
    backgroundColor: '#78443a',
    padding: 40,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  authButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  authButtonActive: {
    backgroundColor: 'white',
  },
  authButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  authButtonTextActive: {
    color: '#78443a',
  },
  formSection: {
    padding: 40,
  },
  form: {
    width: '100%',
  },
  formTitle: {
    fontSize: 24,
    color: '#333',
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    width: '100%',
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#78443a',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});