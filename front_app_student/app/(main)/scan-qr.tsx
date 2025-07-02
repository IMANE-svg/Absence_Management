import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { API_URL } from '@/config';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import variables from '../../styles/variables';
import { UserInfo } from '../../types/types';

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: variables.white,
    paddingTop: 10,
  },
  cardBox: {
    padding: 20,
  },
  cardNameText: {
    fontSize: 24,
    color: variables.blue,
  },
  details: {
    padding: 20,
  },
  cardCamera: {
    backgroundColor: variables.white,
    borderRadius: 10,
    padding: 20,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    elevation: 2,
    height: windowHeight * 0.7,
  },
  scanContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    color: '#cac5c5',
    marginBottom: 20,
  },
  scanText: {
    color: '#cac5c5',
    fontSize: 24,
    textAlign: 'center',
  },
  preview: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
  },
  cancelButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default function ScanQRScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  


  useEffect(() => {
    (async () => {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          "L'application a besoin d'accéder à votre caméra pour scanner les QR codes"
        );
      }
      loadUserInfo();
    })();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userData = await SecureStore.getItemAsync('userInfo');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUserInfo({
          nom: parsedData.nom || 'Étudiant(e)',
          prenom: parsedData.prenom || '',
          ...parsedData,
        });
      }
    } catch (error) {
      console.error('Erreur chargement infos:', error);
      Alert.alert('Erreur', 'Impossible de charger vos informations');
    }
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (!isScanning) return;
    setIsScanning(false);

    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        Alert.alert('Erreur', 'Session invalide');
        return;
      }
    
      const response = await fetch(`${API_URL}/presences/scan/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: data,
        }),
      });
      
      // ✅ Vérifie si la réponse est bien du JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Réponse inattendue du serveur');
    }
    const result = await response.json();
      

      if (response.ok) {
        Alert.alert('Succès', result.message || 'Présence enregistrée !');
      } else {
        Alert.alert('Erreur', result.error || "Échec de l'enregistrement");
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Problème de connexion');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.cardBox}>
        <Text style={styles.cardNameText}>
          Bonjour, {userInfo ? `${userInfo.prenom} ${userInfo.nom}` : 'Étudiant'}
        </Text>
      </View>

      <View style={styles.details}>
        <View style={styles.cardCamera}>
          {!isScanning ? (
            <TouchableOpacity
              style={styles.scanContainer}
              onPress={() => setIsScanning(true)}
            >
              <Ionicons name="camera-outline" size={150} style={styles.cameraIcon} />
              <Text style={styles.scanText}>Cliquez pour scanner un QR Code</Text>
            </TouchableOpacity>
          ) : permission?.granted ? (
            <View style={{ flex: 1 }}>
              <CameraView
                style={styles.preview}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={handleBarcodeScanned}
              />
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsScanning(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.scanContainer}>
              <Text>Permission caméra refusée</Text>
              <TouchableOpacity onPress={() => requestPermission()}>
                <Text style={{ color: variables.blue }}>Autoriser l'accès</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
