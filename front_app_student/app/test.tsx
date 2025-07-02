import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { API_URL } from '@/config';

export default function TestScreen() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/filieres/`);
        const json = await res.json();
        console.log('✅ Données reçues:', json);
        setData(json);
      } catch (err) {
        console.error('❌ Erreur réseau:', err);
        Alert.alert('Erreur', 'Impossible de se connecter au backend');
      }
    };

    fetchData();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Test de connexion API</Text>
      {data.length > 0 ? (
        data.map((item, index) => (
          <Text key={index} style={{ marginVertical: 5 }}>
            • {item.nom}
          </Text>
        ))
      ) : (
        <Text style={{ marginTop: 20 }}>Aucune donnée chargée</Text>
      )}
    </ScrollView>
  );
}
