import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { API_URL } from '@/config';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PresenceItem } from '@/types/types';
import variables from '../../styles/variables';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: variables.black1,
  },
  list: {
    paddingBottom: 20,
  },
  presenceItem: {
    borderBottomWidth: 1,
    borderBottomColor: variables.gray,
    paddingVertical: 10,
  },
  matiere: {
    fontSize: 16,
    fontWeight: '600',
    color: variables.black1,
  },
  date: {
    fontSize: 14,
    color: variables.black2,
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    marginTop: 4,
  },
  present: {
    color: '#28a745',
  },
  absent: {
    color: '#dc3545',
  },
  scanTime: {
    fontSize: 13,
    color: variables.black2,
    fontStyle: 'italic',
    marginTop: 4,
  },
  noData: {
    textAlign: 'center',
    color: variables.black2,
    marginTop: 20,
    fontStyle: 'italic',
  },
  prof: {
    fontSize: 14,
    color: variables.black2,
    marginTop: 4,
  },
  salle: {
    fontSize: 14,
    color: variables.black2,
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
  },
});

export default function PresenceListScreen() {
  const [presences, setPresences] = useState<PresenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPresence();
  }, []);

  const fetchPresence = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const response = await fetch(`${API_URL}/presences/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setPresences(data);
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: PresenceItem }) => (
    <View style={styles.presenceItem}>
      <Text style={styles.matiere}>{item.matiere}</Text>
      <Text style={styles.date}>
        {new Date(item.date).toLocaleDateString()} -{' '}
        {new Date(item.date).toLocaleTimeString()} à{' '}
        {new Date(item.date_fin).toLocaleTimeString()}
      </Text>
      <Text style={styles.prof}>Professeur: {item.prof_nom}</Text>
      <Text style={styles.salle}>
        Salle: {item.salle_nom} ({item.salle_type})
      </Text>
      <Text
        style={[
          styles.status,
          item.status === 'présent(e)' ? styles.present : styles.absent,
        ]}
      >
        Statut: {item.status}
      </Text>
      {item.scanned_at && (
        <Text style={styles.scanTime}>
          Scanné à : {new Date(item.scanned_at).toLocaleTimeString()}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.details}>
        <View style={styles.recentOrders}>
          <Text style={styles.title}>Historique des Présences</Text>
          {presences.length === 0 ? (
            <Text style={styles.noData}>Aucune présence enregistrée.</Text>
          ) : (
            <FlatList
              data={presences}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
            />
          )}
        </View>
      </View>
    </View>
  );
}
