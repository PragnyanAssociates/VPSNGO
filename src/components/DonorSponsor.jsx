// DonorSponsor.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const DonorSponsor = () => {
  const [currentScreen, setCurrentScreen] = useState(1); // 1 for Intro, 2 for Details
  const [selectedSponsorship, setSelectedSponsorship] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    message: '',
    receiveUpdates: false,
    attendEvents: false,
  });

  const navigateToDetails = () => {
    setCurrentScreen(2);
  };

  const navigateToIntro = () => {
    setCurrentScreen(1);
  };

  const handleFinalSubmit = () => {
    if (!selectedSponsorship) {
      alert('Please select a sponsorship type.');
      return;
    }
    if (selectedSponsorship === 'custom' && !customAmount) {
        alert('Please enter a custom amount.');
        return;
    }
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert('Please fill in all required fields (Full Name, Email, Phone).');
      return;
    }

    console.log('Sponsorship Data:', {
      sponsorshipType: selectedSponsorship,
      customAmount: selectedSponsorship === 'custom' ? customAmount : null,
      ...formData,
    });
    alert('Thank you for your sponsorship!');
    // Reset or navigate away
    setCurrentScreen(1); // Go back to intro screen after submission
    setSelectedSponsorship(null);
    setCustomAmount('');
    setFormData({
      fullName: '', email: '', phone: '', organization: '',
      message: '', receiveUpdates: false, attendEvents: false
    });
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sponsorshipOptions = [
    {
      id: 'child_sponsorship',
      icon: <Feather name="smile" size={40} color="#FF6B6B" />,
      title: 'Child Sponsorship',
      price: '₹2,500/month',
      description: 'Support a specific child’s complete education, including books, uniforms, and meals',
      features: [
        'Monthly progress reports with photos',
        'Direct communication with the child',
        'Certificate of sponsorship',
        'Annual meeting opportunity',
      ],
    },
    {
      id: 'birthday_events',
      icon: <MaterialCommunityIcons name="cake-variant" size={40} color="#4ECDC4" />,
      title: 'Birthday & Events',
      price: '₹1,500/event',
      description: 'Sponsor special celebrations, birthday parties, and cultural events for children',
      features: [
        'Event photos and videos',
        'Personalized thank you cards',
        'Option to attend celebrations',
        'Social media recognition',
      ],
    },
    {
      id: 'school_supplies',
      icon: <MaterialCommunityIcons name="notebook-edit-outline" size={40} color="#54A0FF" />,
      title: 'School Supplies',
      price: '₹800/month',
      description: 'Provide books, stationery, art supplies, and learning materials for classrooms',
      features: [
        'Quarterly supply distribution photos',
        'Impact reports on learning outcomes',
        'Name recognition on supply items',
        'Access to school newsletter',
      ],
    },
    {
      id: 'nutritious_meals',
      icon: <MaterialCommunityIcons name="silverware-fork-knife" size={40} color="#FFA500" />,
      title: 'Nutritious Meals',
      price: '₹1,200/month',
      description: 'Ensure children receive healthy, nutritious meals to support their growth and learning',
      features: [
        'Weekly meal program updates',
        'Nutrition impact reports',
        'Kitchen visit opportunities',
        'Menu planning consultation',
      ],
    },
  ];

  const renderIntroScreen = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerSolid}>
        {/* No back button on the very first screen or handle differently if part of a larger nav */}
        <View style={{width: 40}} /> {/* Placeholder for spacing if needed */}
        <View style={{flex: 1, alignItems: 'center'}}>
            <Text style={styles.headerTitle}>Become a Sponsor</Text>
            <Text style={styles.headerSubtitle}>Make a lasting impact on children's education</Text>
        </View>
        <View style={{width: 40}} /> {/* Placeholder for spacing */}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.mainIconCircleSolid}>
            <Icon name="graduation-cap" size={50} color="#5D001E" />
          </View>
        </View>

        <Text style={styles.mainTitle}>Transform Lives Through Sponsorship</Text>
        <Text style={styles.mainDescription}>
          Unlike one-time donations, sponsorship creates ongoing relationships and sustained impact for our students.
        </Text>

        <View style={styles.impactSectionSolid}>
          <Text style={styles.impactTitle}>Our Current Impact</Text>
          <View style={styles.impactStatsContainer}>
            <View style={styles.impactStat}>
              <Text style={styles.impactNumber}>156</Text>
              <Text style={styles.impactLabel}>Children Sponsored</Text>
            </View>
            <View style={styles.impactStat}>
              <Text style={styles.impactNumber}>45</Text>
              <Text style={styles.impactLabel}>Active Sponsors</Text>
            </View>
            <View style={styles.impactStat}>
              <Text style={styles.impactNumber}>89%</Text>
              <Text style={styles.impactLabel}>Graduation Rate</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.nextButton} onPress={navigateToDetails}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderSponsorshipCard = (option) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.sponsorshipCard,
        selectedSponsorship === option.id && styles.selectedCard,
      ]}
      onPress={() => setSelectedSponsorship(option.id)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconCircle, { backgroundColor: option.icon.props.color + '30' }]}>
            {option.icon}
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{option.title}</Text>
          <Text style={styles.cardPrice}>{option.price}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{option.description}</Text>
      {option.features.map((feature, index) => (
        <View key={index} style={styles.featureItem}>
          <Icon name="check-circle" size={16} color="#2ECC71" style={styles.featureIcon} />
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
    </TouchableOpacity>
  );

  const renderDetailsScreen = () => (
    <ScrollView style={styles.stepContainerScrollable} contentContainerStyle={styles.scrollContentDetails}>
      <TouchableOpacity onPress={navigateToIntro} style={styles.pageBackButton}>
         <Icon name="arrow-left" size={22} color="#333" />
         <Text style={styles.pageBackText}>Back to Intro</Text>
      </TouchableOpacity>

      {/* --- Sponsorship Type Section --- */}
      <Text style={styles.sectionTitle}>Choose Your Sponsorship Type</Text>
      {sponsorshipOptions.map(renderSponsorshipCard)}

      {/* Custom Sponsorship Card */}
      <TouchableOpacity
        style={[
          styles.sponsorshipCard,
          styles.customCard,
          selectedSponsorship === 'custom' && styles.selectedCard,
        ]}
        onPress={() => setSelectedSponsorship('custom')}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconCircle, { backgroundColor: '#D8BFD8'}]}>
            <MaterialCommunityIcons name="heart-plus-outline" size={40} color="#8A2BE2" />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Custom Sponsorship</Text>
            <Text style={styles.cardPrice}>Your Choice</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>
          Create a personalized sponsorship plan that fits your budget and impact goals.
        </Text>
        {selectedSponsorship === 'custom' && (
          <TextInput
            style={styles.customAmountInput}
            placeholder="Enter custom amount (₹)"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={customAmount}
            onChangeText={setCustomAmount}
          />
        )}
      </TouchableOpacity>

      {/* --- Sponsor Information Section --- */}
      <Text style={styles.sectionTitle}>Sponsor Information</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={formData.fullName}
          onChangeText={text => handleInputChange('fullName', text)}
          placeholder="Enter your full name"
          placeholderTextColor="#aaa"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={text => handleInputChange('email', text)}
          placeholder="Enter your email address"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={text => handleInputChange('phone', text)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          placeholderTextColor="#aaa"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Organization/Company (Optional)</Text>
        <TextInput
          style={styles.input}
          value={formData.organization}
          onChangeText={text => handleInputChange('organization', text)}
          placeholder="Enter organization name"
          placeholderTextColor="#aaa"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Special Message or Preferences</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.message}
          onChangeText={text => handleInputChange('message', text)}
          placeholder="Any specific requests or messages for the children..."
          multiline
          numberOfLines={4}
          placeholderTextColor="#aaa"
        />
      </View>

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => handleInputChange('receiveUpdates', !formData.receiveUpdates)}
      >
        <Icon name={formData.receiveUpdates ? 'check-square-o' : 'square-o'} size={22} color="#007AFF" />
        <Text style={styles.checkboxLabel}>I would like to receive regular updates, photos, and impact reports about my sponsorship</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => handleInputChange('attendEvents', !formData.attendEvents)}
      >
        <Icon name={formData.attendEvents ? 'check-square-o' : 'square-o'} size={22} color="#007AFF" />
        <Text style={styles.checkboxLabel}>I'm interested in attending school events and meeting the children I sponsor</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.nextButton, styles.submitButton]}
        onPress={handleFinalSubmit}
      >
        <Text style={styles.nextButtonText}>Start My Sponsorship Journey</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.safeArea}>
      {currentScreen === 1 && renderIntroScreen()}
      {currentScreen === 2 && renderDetailsScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  stepContainer: { // Used for IntroScreen now
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  stepContainerScrollable: { // Used for DetailsScreen
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: { // For IntroScreen ScrollView
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  scrollContentDetails: { // For DetailsScreen ScrollView
    padding: 20,
    paddingBottom: 80,
  },
  headerSolid: {
    backgroundColor: '#007AFF',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // To help center title if back button exists
  },
  pageBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, // Increased margin
    alignSelf: 'flex-start',
    paddingVertical: 5,
  },
  pageBackText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF', // Make it stand out
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22, // Adjusted size
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13, // Adjusted size
    color: '#E0E0E0',
    textAlign: 'center',
  },
  iconContainer: {
    marginVertical: 20,
  },
  mainIconCircleSolid: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD1D1', // Lighter pink
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainTitle: {
    fontSize: 24, // Adjusted size
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  mainDescription: {
    fontSize: 15, // Adjusted size
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  impactSectionSolid: {
    backgroundColor: '#6A82FB', // Slightly different blue/purple
    width: '100%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 3,
  },
  impactTitle: {
    fontSize: 18, // Adjusted size
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  impactStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  impactStat: {
    alignItems: 'center',
    paddingHorizontal: 5, // Add some padding
  },
  impactNumber: {
    fontSize: 26, // Adjusted size
    fontWeight: 'bold',
    color: '#FFF',
  },
  impactLabel: {
    fontSize: 11, // Adjusted size
    color: '#E0E0E0',
    marginTop: 3,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#10B981', // Greener teal
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignSelf: 'center',
    marginVertical: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 17, // Adjusted size
    fontWeight: 'bold',
  },
  sectionTitle: { // For titles within the details page
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50', // Darker blue-gray
    marginBottom: 15,
    marginTop: 10, // Add margin top for separation
    // borderBottomWidth: 1,
    // borderBottomColor: '#EAEAEA',
    // paddingBottom: 5,
  },
  sponsorshipCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 18, // Adjusted padding
    marginBottom: 18,
    elevation: 3,
    shadowColor: '#999',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#E8E8E8', // Light border
  },
  selectedCard: {
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconCircle: {
      width: 55, // Adjusted size
      height: 55,
      borderRadius: 27.5,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17, // Adjusted size
    fontWeight: 'bold',
    color: '#333',
  },
  cardPrice: {
    fontSize: 15, // Adjusted size
    color: '#007AFF',
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 13.5, // Adjusted size
    color: '#555',
    marginBottom: 10,
    lineHeight: 19,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureIcon: {
    marginRight: 8,
    color: '#27AE60', // Darker green
  },
  featureText: {
    fontSize: 13, // Adjusted size
    color: '#444',
    flex: 1,
  },
  customCard: {
    backgroundColor: '#F5F3FF', // Lighter purple
    borderColor: '#DCD0FF',
  },
  customAmountInput: {
    borderWidth: 1,
    borderColor: '#C5B3E8',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 12,
    color: '#333',
    backgroundColor: '#FFF'
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15, // Adjusted size
    color: '#3C4858', // Darker gray
    marginBottom: 7,
    fontWeight: '600',
  },
  required: {
    color: '#E74C3C', // Red
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CFD8DC', // Lighter border
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 11, // Adjusted padding
    fontSize: 15, // Adjusted size
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingVertical: 5,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14, // Adjusted size
    color: '#333',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    width: '90%',
    marginTop: 10, // Add some margin top before submit
  },
});

export default DonorSponsor;