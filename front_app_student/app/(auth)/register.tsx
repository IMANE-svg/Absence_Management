// app/(auth)/register.tsx
import { API_URL } from '@/config';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { 
  Image, 
  StyleSheet,
  SafeAreaView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  ScrollView,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const cardWidth = Math.min(width * 0.95, 900);

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [prenom, setPrenom] = useState('');
  const [filiere, setFiliere] = useState('');
  const [niveau, setNiveau] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [showFilierePicker, setShowFilierePicker] = useState(false);
  const [showNiveauPicker, setShowNiveauPicker] = useState(false);
  const [filieres, setFilieres] = useState<string[]>([]);
  const [niveaux, setNiveaux] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [resFiliere, resNiveau] = await Promise.all([
          fetch(`${API_URL}/filieres/`),
          fetch(`${API_URL}/niveaux/`),
        ]);

        const filiereData = await resFiliere.json();
        const niveauData = await resNiveau.json();

        setFilieres(filiereData.map((f: any) => f.nom));
        setNiveaux(niveauData.map((n: any) => n.nom));
      } catch (err) {
        console.error(' Erreur ScrollView:', err);
      }
      
    };

    fetchOptions();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    console.log("Tentative d'inscription avec:", { 
    email, password, name, prenom, filiere, niveau, photo 
  });
    if (!photo) {
      Alert.alert('Erreur', 'Veuillez ajouter une photo');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('nom', name);
    formData.append('prenom', prenom);
    formData.append('filiere', filiere);
    formData.append('niveau', niveau);

    const uriParts = photo.split('.');
    const fileType = uriParts[uriParts.length - 1];
    formData.append('photo', {
      uri: photo,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    try {
      const response = await fetch(`${API_URL}/signup/etudiant/`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Succès', 'Inscription réussie !');
        router.push('/(auth)/login');
      } else {
        const errorMessage = result.error || 
                          (result.details && result.details.email && result.details.email[0]) || 
                          'Échec de l\'inscription';
        Alert.alert('Erreur', errorMessage);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur réseau', 'Impossible de se connecter au serveur.');
    }
  };

  const renderPickerModal = (options: {label: string, value: string}[], selectedValue: string, onSelect: (value: string) => void, visible: boolean, setVisible: (visible: boolean) => void) => (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            {options.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.modalOption,
                  selectedValue === option.value && styles.modalOptionSelected
                ]}
                onPress={() => {
                  onSelect(option.value);
                  setVisible(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedValue === option.value && styles.modalOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}
       onLayout={() => console.log('✅ ScrollView monté')}
      >

        <View style={styles.card}>
          {/* Section Bienvenue - Identique à LoginScreen */}
          <View style={styles.welcomeSection}>
            <Image 
              source={require('../../assets/nv-removebg-preview.png')} 
              style={styles.logo} 
            />
            <Text style={styles.welcomeTitle}>Créez votre compte</Text>
            <Text style={styles.welcomeText}>
              Enregistrez vos informations personnelles pour accéder à toutes les fonctionnalités
            </Text>
            
            <View style={styles.authButtons}>
              <TouchableOpacity 
                style={[styles.authButton, styles.authButtonActive]}
              >
                <Text style={[styles.authButtonText, styles.authButtonTextActive]}>
                  S'inscrire
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.authButton}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.authButtonText}>
                  Se connecter
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section Formulaire */}
          <View style={styles.formSection}>
            <View style={styles.form}>
              <Text style={styles.formTitle}>Inscription</Text>
              
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Nom"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Prénom"
                  placeholderTextColor="#999"
                  value={prenom}
                  onChangeText={setPrenom}
                />
              </View>
              
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
              
              {/* Champ Filière avec modal */}
              <View style={styles.inputGroup}>
                <Text style={styles.pickerLabel}>Filière</Text>
                <TouchableOpacity 
                  style={styles.pickerInput}
                  onPress={() => setShowFilierePicker(true)}
                >
                  <Text style={styles.pickerInputText}>
                    {filiere || 'Sélectionnez une filière'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#555" />
                </TouchableOpacity>
              </View>

              {/* Champ Niveau avec modal */}
              <View style={styles.inputGroup}>
                <Text style={styles.pickerLabel}>Niveau</Text>
                <TouchableOpacity 
                  style={styles.pickerInput}
                  onPress={() => setShowNiveauPicker(true)}
                >
                  <Text style={styles.pickerInputText}>
                    {niveau ? `Niveau ${niveau}` : 'Sélectionnez un niveau'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#555" />
                </TouchableOpacity>
              </View>

              {/* Upload de photo */}
              <View style={styles.inputGroup}>
                <Text style={styles.pickerLabel}>Photo d'étudiant (Format 3:4)</Text>
                <TouchableOpacity 
                  style={styles.imageUploadButton}
                  onPress={pickImage}
                >
                  <Text style={styles.imageUploadButtonText}>
                    {photo ? 'Photo sélectionnée' : 'Choisir une photo'}
                  </Text>
                </TouchableOpacity>
                {photo && (
                  <Image 
                    source={{ uri: photo }} 
                    style={styles.imagePreview} 
                  />
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleRegister}
              >
                <Text style={styles.submitButtonText}>S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modals pour les listes déroulantes */}
      {renderPickerModal(
  filieres.map((f) => ({ label: f, value: f })),
  filiere,
  setFiliere,
  showFilierePicker,
  setShowFilierePicker
)}

{renderPickerModal(
  niveaux.map((n) => ({ label: `Niveau ${n}`, value: n })),
  niveau,
  setNiveau,
  showNiveauPicker,
  setShowNiveauPicker
)}
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#fff6de',
  },
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
  pickerLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  pickerInput: {
    width: '100%',
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerInputText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionSelected: {
    backgroundColor: '#f5f5f5',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#78443a',
    fontWeight: '600',
  },
  imageUploadButton: {
    backgroundColor: '#78443a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageUploadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  imagePreview: {
    width: 120,
    height: 160,
    marginTop: 10,
    borderRadius: 8,
    alignSelf: 'center',
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