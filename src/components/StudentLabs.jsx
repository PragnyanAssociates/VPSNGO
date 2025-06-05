import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Using FontAwesome5

const { width } = Dimensions.get('window');
const studentId = ""; // Example student ID

// Mock data - replace with your actual data source
const labsData = [
  {
    id: '1',
    title: 'Virtual Chemistry Lab',
    icon: 'flask', // FontAwesome5 icon name
    subject: 'Science',
    type: 'Simulation',
    description: 'Conduct various chemistry experiments in a safe, simulated environment. Explore reactions, titrations, and more.',
    color: '#3498DB', // Blueish
  },
  {
    id: '2',
    title: 'Physics Interactive Simulations (PhET)',
    icon: 'atom', // FontAwesome5 icon name
    subject: 'Science',
    type: 'Interactive Module',
    description: 'Engage with a wide range of physics simulations covering topics like motion, energy, waves, and electricity.',
    color: '#E74C3C', // Reddish
  },
  {
    id: '3',
    title: 'Python Coding Playground',
    icon: 'code', // FontAwesome5 icon name
    subject: 'Computer Science',
    type: 'Coding Environment',
    description: 'Practice Python programming with interactive exercises and projects. Includes an online code editor.',
    color: '#2ECC71', // Greenish
  },
  {
    id: '4',
    title: 'Interactive Human Anatomy Explorer',
    icon: 'diagnoses', // FontAwesome5 icon name (or 'universal-access')
    subject: 'Biology',
    type: 'Interactive Module',
    description: 'Explore the human body with 3D models and detailed information about different organ systems.',
    color: '#F39C12', // Orangeish
  },
];

const LabCard = ({ lab, onAccessLab }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.labIconContainer, { backgroundColor: lab.color || '#00A99D' }]}>
            <Icon name={lab.icon} size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.labTitle}>{lab.title}</Text>
        </View>
        <Text style={styles.labSubjectType}>
          Subject: {lab.subject} | Type: {lab.type}
        </Text>
        <Text style={styles.labDescription}>{lab.description}</Text>
      </View>
      <TouchableOpacity
        style={[styles.accessButton, { backgroundColor: '#00A99D' }]} // Consistent button color
        onPress={() => onAccessLab(lab)}
      >
        <Icon name="external-link-alt" size={16} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={styles.accessButtonText}>Access Lab</Text>
      </TouchableOpacity>
    </View>
  );
};

const StudentLabs = () => {
  const handleAccessLab = (lab) => {
    // Implement navigation or linking to the lab URL/module
    alert(`Accessing ${lab.title}`);
    // Example: Linking.openURL(lab.url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.pageHeaderContainer}>
          <Icon name="desktop" size={30} color="#00796B" style={styles.pageHeaderIcon} />
          {/* Alternative icon: "play-circle" */}
          <View style={styles.pageHeaderTextContainer}>
            <Text style={styles.pageMainTitle}>
              Digital Labs & Simulations for Student {studentId}
            </Text>
            <Text style={styles.pageSubTitle}>
              Access interactive learning tools and virtual experiments.
            </Text>
          </View>
        </View>

        {labsData.map(lab => (
          <LabCard key={lab.id} lab={lab} onAccessLab={handleAccessLab} />
        ))}

        <View style={styles.footerNoteContainer}>
          <Text style={styles.footerNoteText}>
            Note: Access to some digital labs may require specific software or school credentials. Please refer to instructions provided by your teacher.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Light bluish-gray background
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pageHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  pageHeaderIcon: {
    marginRight: 16,
    color: '#00796B', // Darker Teal for header icon
  },
  pageHeaderTextContainer: {
    flex: 1,
  },
  pageMainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50', // Dark Blue-Gray
    marginBottom: 4,
  },
  pageSubTitle: {
    fontSize: 14,
    color: '#566573', // Medium Gray
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // Android Shadow
    elevation: 4,
    overflow: 'hidden', // Ensures button border radius is applied correctly
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  labIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22, // Make it circular
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    // backgroundColor is set dynamically via lab.color
  },
  labTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50', // Dark Blue-Gray
    flex: 1, // Allow title to wrap
  },
  labSubjectType: {
    fontSize: 13,
    color: '#7F8C8D', // Lighter Gray
    marginBottom: 8,
    fontStyle: 'italic',
  },
  labDescription: {
    fontSize: 14,
    color: '#566573', // Medium Gray
    lineHeight: 20,
    marginBottom: 12,
  },
  accessButton: {
    // backgroundColor set dynamically, or use a consistent color like '#00A99D' (Teal)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    // Button is full width of the card, but borderRadius won't show without overflow:hidden on card
    // borderBottomLeftRadius: 12,
    // borderBottomRightRadius: 12,
    // To make it not full width, add marginHorizontal and borderRadius to button itself.
  },
  buttonIcon: {
    marginRight: 8,
  },
  accessButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerNoteContainer: {
    marginTop: 10, // Space above the note
    padding: 12,
    backgroundColor: '#E9ECEF', // Light gray for note background
    borderRadius: 8,
  },
  footerNoteText: {
    fontSize: 13,
    color: '#495057', // Darker gray for note text
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default StudentLabs;