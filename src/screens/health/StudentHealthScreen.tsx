// 📂 File: src/screens/health/StudentHealthScreen.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../../apiConfig';

interface HealthData {
  full_name: string;
  blood_group?: string;
  height_cm?: number;
  weight_kg?: number;
  last_checkup_date?: string;
  allergies?: string;
  medical_conditions?: string;
  medications?: string;
}

const PRIMARY_COLOR = '#008080';
const TEXT_COLOR_DARK = '#333';
const TEXT_COLOR_MEDIUM = '#555';

const StudentHealthScreen = () => {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const { user } = useAuth(); // Uses your existing AuthContext

  useEffect(() => {
    const fetchHealthRecord = async () => {
      if (!user) return;
      try {
        // This follows your app's existing pattern of passing ID in the URL
        const response = await fetch(`${API_BASE_URL}/api/health/my-record/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setHealthData(data);
        } else {
          console.error("Failed to fetch health record");
        }
      } catch (error) {
        console.error("Error fetching health record:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHealthRecord();
  }, [user]);

  const calculatedBmi = useMemo(() => {
    if (healthData?.height_cm && healthData?.weight_kg) {
      const heightM = healthData.height_cm / 100;
      const bmi = healthData.weight_kg / (heightM * heightM);
      return bmi.toFixed(2);
    }
    return 'N/A';
  }, [healthData]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not Set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={PRIMARY_COLOR} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.grid}>
          <InfoBox icon="opacity" label="Blood Group" value={healthData?.blood_group || 'N/A'} color="#e53935" />
          <InfoBox icon="height" label="Height" value={healthData?.height_cm ? `${healthData.height_cm} cm` : 'N/A'} color="#1e88e5" />
          <InfoBox icon="monitor-weight" label="Weight" value={healthData?.weight_kg ? `${healthData.weight_kg} kg` : 'N/A'} color="#fdd835" />
          <InfoBox icon="calculate" label="BMI" value={calculatedBmi} color="#43a047" />
        </View>
         <InfoBox icon="event" label="Last Checkup" value={formatDate(healthData?.last_checkup_date)} color="#8e24aa" isFullWidth />
      </View>
      
      <Section title="Allergies" icon="warning" content={healthData?.allergies || 'None reported'} />
      <Section title="Medical Conditions" icon="local-hospital" content={healthData?.medical_conditions || 'None reported'} />
      <Section title="Medications" icon="healing" content={healthData?.medications || 'None'} />
    </ScrollView>
  );
};

const InfoBox = ({ icon, label, value, color, isFullWidth = false }) => (
  <View style={[styles.infoBox, isFullWidth && styles.fullWidth]}>
    <MaterialIcons name={icon} size={28} color={color} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const Section = ({ title, icon, content }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <MaterialIcons name={icon} size={22} color={PRIMARY_COLOR} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <Text style={styles.sectionContent}>{content}</Text>
  </View>
);

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 10, backgroundColor: '#f0f4f7' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  infoBox: { width: '48%', backgroundColor: '#f8f9fa', borderRadius: 8, padding: 15, alignItems: 'center', marginBottom: 10 },
  fullWidth: { width: '100%' },
  infoLabel: { fontSize: 13, color: TEXT_COLOR_MEDIUM, marginTop: 5 },
  infoValue: { fontSize: 16, fontWeight: 'bold', color: TEXT_COLOR_DARK, marginTop: 2 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: PRIMARY_COLOR, marginLeft: 10 },
  sectionContent: { fontSize: 14, color: TEXT_COLOR_MEDIUM, lineHeight: 20 },
});

export default StudentHealthScreen;