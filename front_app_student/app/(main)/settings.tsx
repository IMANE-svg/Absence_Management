import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@/config';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import variables from '../../styles/variables'; 
const NIVEAUX = ['1', '2', '3'];
const FILIERES = ['GI'];
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: variables.white,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: variables.white,
    borderRadius: 10,
    padding: 20,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: variables.black1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    color: variables.black1,
  },
  imageUploadButton: {
    backgroundColor: variables.blue,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imageUploadButtonText: {
    color: variables.white,
    fontWeight: '600',
    fontSize: 16,
  },
  imagePreview: {
    width: 120,
    height: 160,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: variables.blue,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  submitButtonText: {
    color: variables.white,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  pickerLabel: {
    padding: 12,
    color: variables.black1,
    fontSize: 16,
  },
  picker: {
    width: '100%',
    color: variables.black1,
  },
});

export default function SettingsScreen() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [filiere, setFiliere] = useState('');
  const [niveau, setNiveau] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [filieres, setFilieres] = useState<string[]>([]);
  const [niveaux, setNiveaux] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setLoading(true);
        const token = await SecureStore.getItemAsync('access_token');
        if (!token) throw new Error('Session invalide');

        const response = await fetch(`${API_URL}/etudiant/profil/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!response.ok) throw new Error('Erreur lors du chargement des données');

        const freshData = await response.json();
        setUserInfo(freshData);
        setNom(freshData.nom || '');
        setPrenom(freshData.prenom || '');
        setEmail(freshData.email || '');
        setFiliere(freshData.filiere || '');
        setNiveau(freshData.niveau || '');
        setPhoto(freshData.photo ? `${API_URL}${freshData.photo}` : null);

        await SecureStore.setItemAsync('userInfo', JSON.stringify(freshData));
      } catch (error) {
        console.error('Erreur API:', error);
        Alert.alert('Erreur', 'Impossible de charger les données du profil');
      } finally {
        setLoading(false);
      }
    };

    const fetchOptions = async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        const [filiereRes, niveauRes] = await Promise.all([
          fetch(`${API_URL}/filieres/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/niveaux/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const filiereData = await filiereRes.json();
        const niveauData = await niveauRes.json();

        setFilieres(filiereData.map((f: any) => f.nom));
        setNiveaux(niveauData.map((n: any) => n.nom));
      } catch (err) {
        console.error('Erreur chargement filières/niveaux', err);
      }
    };

    loadUserInfo();
    fetchOptions();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9_.+-]+@ump\.ac\.ma$/;
    if (!emailRegex.test(email)) {
      setEmailError("L'email doit être un email académique UMP (ex: nom.prenom@ump.ac.ma)");
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (password && password.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }
    setPasswordError('');
    return true;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    if (!validateEmail(email)) return;
    if (password && !validatePassword(password)) return;

    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) throw new Error('Session invalide');

      const formData = new FormData();
      formData.append('nom', nom);
      formData.append('prenom', prenom);
      formData.append('email', email);
      formData.append('filiere', filiere);
      formData.append('niveau', niveau);
      if (password) formData.append('password', password);

      if (photo && photo.startsWith('file://')) {
        const filename = photo.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';

        formData.append('photo', {
          uri: photo,
          name: filename || 'photo.jpg',
          type,
        } as any);
      }

      const response = await fetch(`${API_URL}/etudiant/profil/`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Échec de la mise à jour');

      const updatedUser = {
        ...userInfo,
        nom,
        prenom,
        email,
        filiere,
        niveau,
        photo: photo || userInfo?.photo,
      };

      await SecureStore.setItemAsync('userInfo', JSON.stringify(updatedUser));
      setUserInfo(updatedUser);

      Alert.alert('Succès', 'Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', (error as Error).message || 'Une erreur est survenue');
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!userInfo) {
    return <Text>Désolé, les informations de l'utilisateur ne sont pas disponibles.</Text>;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.mainContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Paramètres du Profil</Text>

            <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
              <Text style={styles.imageUploadButtonText}>Choisir une photo</Text>
            </TouchableOpacity>

            {photo && <Image source={{ uri: photo }} style={styles.imagePreview} />}

            <TextInput
              placeholder="Nom"
              value={nom}
              onChangeText={setNom}
              style={styles.input}
            />

            <TextInput
              placeholder="Prénom"
              value={prenom}
              onChangeText={setPrenom}
              style={styles.input}
            />

            <TextInput
              placeholder="Email académique (@ump.ac.ma)"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                validateEmail(text);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <TextInput
              placeholder={'Nouveau mot de passe\n(laisser vide pour si ne vous voullez pas \nchanger)'}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validatePassword(text);
              }}
              secureTextEntry
              style={styles.input}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            <View style={styles.pickerContainer}>
  <Text style={styles.pickerLabel}>Filière:</Text>
  <Picker
    selectedValue={filiere}
    onValueChange={(itemValue) => setFiliere(itemValue)}
    style={styles.picker}
  >
    <Picker.Item label="Sélectionnez une filière" value="" />
    {filieres.map((f) => (
      <Picker.Item key={f} label={f} value={f} />
    ))}
  </Picker>
</View>

            <View style={styles.pickerContainer}>
  <Text style={styles.pickerLabel}>Niveau:</Text>
  <Picker
    selectedValue={niveau}
    onValueChange={(itemValue) => setNiveau(itemValue)}
    style={styles.picker}
  >
    <Picker.Item label="Sélectionnez un niveau" value="" />
    {niveaux.map((n) => (
      <Picker.Item key={n} label={`Niveau ${n}`} value={n} />
    ))}
  </Picker>
</View>

            <TouchableOpacity style={styles.submitButton} onPress={handleUpdateProfile}>
              <Text style={styles.submitButtonText}>Mettre à jour</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}