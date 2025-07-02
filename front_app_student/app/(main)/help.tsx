import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import variables from '../../styles/variables';
import { API_URL } from '@/config';
import * as SecureStore from 'expo-secure-store';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: variables.white,
  },
  details: {
    padding: 20,
  },
  recentOrders: {
    backgroundColor: variables.white,
    borderRadius: 10,
    padding: 20,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    elevation: 3,
  },
  contactSupport: {
    marginBottom: 30,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: variables.black1,
  },
  contactText: {
    fontSize: 16,
    color: variables.black2,
    marginBottom: 20,
  },
  supportForm: {
    gap: 25,
  },
  formGroup: {
    marginBottom: 8,
  },
  label: {
    color: variables.blue,
    fontWeight: '500',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: variables.black2,
    borderRadius: 6,
    fontSize: 16,
  },
  textarea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: variables.blue,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default function HelpScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!subject.trim()) {
      alert('Veuillez entrer un sujet.');
      return;
    }
    if (!message.trim()) {
      alert('Veuillez saisir votre message.');
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        alert("Session expirée. Veuillez vous reconnecter.");
        return;
      }

      const response = await fetch(`${API_URL}/my-help-requests/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ subject, message }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.status || 'Message envoyé avec succès.');
        setSubject('');
        setMessage('');
      } else {
        alert(result.error || 'Erreur lors de l’envoi du message.');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur réseau. Veuillez réessayer.');
    }
  };

  return (
    <ScrollView style={styles.mainContainer}>
      <View style={styles.details}>
        <View style={styles.recentOrders}>
          <View style={styles.contactSupport}>
            <Text style={styles.contactTitle}>Contactez le Support</Text>
            <Text style={styles.contactText}>
              Vous ne trouvez pas réponse à votre question ? Notre équipe est là pour vous aider.
            </Text>

            <View style={styles.supportForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Sujet</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Décrivez brièvement votre problème"
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Message</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Décrivez en détail votre problème ou question"
                  multiline
                  numberOfLines={5}
                  value={message}
                  onChangeText={setMessage}
                />
              </View>

              <TouchableOpacity style={styles.supportButton} onPress={handleSubmit}>
                <Ionicons name="send-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
