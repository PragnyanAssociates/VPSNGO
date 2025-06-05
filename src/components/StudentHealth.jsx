import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';

const StudentHealth = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [healthInfo, setHealthInfo] = useState({
    bloodGroup: 'O+',
    height: '175cm',
    weight: '75kg',
    bmi: '68',
    lastCheckup: '25-05-2025',
    allergies: '',
    medicalConditions: '',
    medications: '',
  });

  const handleChange = (field, value) => {
    setHealthInfo({ ...healthInfo, [field]: value });
  };

  const renderField = (label, icon, fieldKey) => (
    <View style={styles.row}>
      {icon}
      <Text style={styles.label}>{label}:</Text>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={healthInfo[fieldKey]}
          onChangeText={(text) => handleChange(fieldKey, text)}
          placeholder="N/A"
        />
      ) : (
        <Text style={styles.value}>
          {healthInfo[fieldKey] ? healthInfo[fieldKey] : 'N/A'}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="heart" size={24} color="red" />
        <Text style={styles.title}>Rahul Kumar</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Icon name={isEditing ? 'checkmark' : 'create-outline'} size={24} color="#007bff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Overview of student's health records.</Text>

      {/* Health Details */}
      {renderField('Blood Group', <FontAwesome5 name="tint" size={18} color="#007bff" />, 'bloodGroup')}
      {renderField('Height', <Entypo name="ruler" size={18} color="#007bff" />, 'height')}
      {renderField('Weight', <FontAwesome5 name="weight" size={18} color="#007bff" />, 'weight')}
      {renderField('BMI', <Icon name="pulse" size={18} color="#007bff" />, 'bmi')}
      {renderField('Last Health Checkup', <Icon name="calendar" size={18} color="#007bff" />, 'lastCheckup')}

      {/* Allergies */}
      <Text style={styles.sectionTitle}>
        <MaterialCommunityIcons name="shield-alert" size={18} color="#f57c00" /> Allergies
      </Text>
      <Text style={styles.subsectionTitle}>Reported Allergies:</Text>
      {isEditing ? (
        <TextInput
          style={[styles.input, { minHeight: 40 }]}
          value={healthInfo.allergies}
          onChangeText={(text) => handleChange('allergies', text)}
          placeholder="None reported"
          multiline
        />
      ) : (
        <Text style={styles.bullet}>
          {healthInfo.allergies ? `• ${healthInfo.allergies}` : '~ Food Allergies '}
        </Text>
      )}

      {/* Medical Conditions */}
      <Text style={styles.sectionTitle}>
        <MaterialCommunityIcons name="alert-circle" size={18} color="red" /> Medical Conditions
      </Text>
      <Text style={styles.subsectionTitle}>Reported Medical Conditions:</Text>
      {isEditing ? (
        <TextInput
          style={[styles.input, { minHeight: 40 }]}
          value={healthInfo.medicalConditions}
          onChangeText={(text) => handleChange('medicalConditions', text)}
          placeholder="None reported"
          multiline
        />
      ) : (
        <Text style={styles.bullet}>
          {healthInfo.medicalConditions ? `• ${healthInfo.medicalConditions}` : '~ Fever'}
        </Text>
      )}

      {/* Medications */}
      <Text style={styles.sectionTitle}>
        <MaterialCommunityIcons name="pill" size={18} color="#2ecc71" /> Medications
      </Text>
      <Text style={styles.subsectionTitle}>Reported Medications:</Text>
      {isEditing ? (
        <TextInput
          style={[styles.input, { minHeight: 40 }]}
          value={healthInfo.medications}
          onChangeText={(text) => handleChange('medications', text)}
          placeholder="None"
          multiline
        />
      ) : (
        <Text style={styles.bullet}>
          {healthInfo.medications ? `• ${healthInfo.medications}` : '~ Antibiotics'}
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
  subtitle: {
    color: '#888',
    marginVertical: 5,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  label: {
    fontWeight: '500',
    marginLeft: 10,
    fontSize: 14,
    width: 120,
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 14,
    padding: 4,
    flex: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 20,
    fontSize: 15,
  },
  subsectionTitle: {
    color: '#555',
    marginTop: 8,
    marginBottom: 2,
    fontSize: 13,
  },
  bullet: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 10,
  },
});

export default StudentHealth;
