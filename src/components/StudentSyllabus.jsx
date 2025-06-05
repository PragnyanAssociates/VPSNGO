// StudentSyllabus.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Or your preferred icon library



const { width } = Dimensions.get('window');

const studentEmail = "Vv860027@gmail.com";
const studentClass = "Class 10A";

const syllabusData = [
  // Ensure the screen name 'PhysicsSyllabusScreen' matches what you defined in your navigator
  { id: '8', subjectName: 'Physics', iconName: 'atom', navigateToScreen: 'PhysicsSyllabus' },
  { id: '1', subjectName: 'English', iconName: 'book-open', navigateToScreen: 'EnglishSyllabusScreen' }, // Example for English
  { id: '2', subjectName: 'Mathematics', iconName: 'calculator', navigateToScreen: 'MathSyllabusScreen' }, // Example for Math
  { id: '3', subjectName: 'Environmental Science', iconName: 'leaf' /* navigateToScreen: 'GenericSyllabusDetail', params: { subject: 'Environmental Science'} */ },
  { id: '4', subjectName: 'Second Language\n(e.g., Hindi/Telugu)', iconName: 'language' },
  { id: '5', subjectName: 'Art', iconName: 'palette' },
  { id: '6', subjectName: 'Computer Basics', iconName: 'laptop-code' },
  { id: '7', subjectName: 'Social Studies', iconName: 'globe-americas' },
  // Add more subjects as needed
];

// Calculate card width for 2 columns
const PAGE_HORIZONTAL_PADDING = 16;
const CARD_MARGIN_HORIZONTAL = 8;
const NUM_COLUMNS = 2;
const effectiveGridWidth = width - (PAGE_HORIZONTAL_PADDING * 2) - (CARD_MARGIN_HORIZONTAL * (NUM_COLUMNS -1));
const cardWidth = effectiveGridWidth / NUM_COLUMNS - (CARD_MARGIN_HORIZONTAL);


const SyllabusCard = ({ subjectName, iconName, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardIconContainer}>
        <Icon name={iconName || 'book-reader'} size={30} color="#7B61FF" />
      </View>
      <Text style={styles.cardSubjectName} numberOfLines={2}>{subjectName}</Text>
      <View style={styles.cardViewDetailsContainer}>
        <Text style={styles.cardViewDetailsText}>View Details</Text>
        <Icon name="chevron-right" size={12} color="#7B61FF" style={styles.cardViewDetailsIcon} />
      </View>
    </TouchableOpacity>
  );
};
             


const StudentSyllabus = ({ navigation }) => {
  const handleCardPress = (subjectItem) => {
    console.log(`View details for ${subjectItem.subjectName}`);
    if (subjectItem.navigateToScreen) {
      // If 'params' object exists in subjectItem, pass it, otherwise pass subjectName
      const navParams = subjectItem.params ? subjectItem.params : { subjectName: subjectItem.subjectName };
      navigation.navigate(subjectItem.navigateToScreen, navParams);
    } else {
      // Fallback or default navigation if navigateToScreen is not defined
      // For example, navigate to a generic detail screen or show an alert
      console.warn(`No specific navigation target for ${subjectItem.subjectName}. Define 'navigateToScreen' in syllabusData.`);
      // Example fallback to a generic screen if you have one:
      // navigation.navigate('GenericSyllabusDetail', { subjectName: subjectItem.subjectName });
    }
    
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.headerIconBackground}>
            <Icon name="clipboard-list" size={26} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.mainTitle}>Syllabus Overview</Text>
            <Text style={styles.subTitle}>Subjects for {studentEmail} ( {studentClass} )</Text>
          </View>
        </View>

        <View style={styles.gridContainer}>
          {syllabusData.map((item) => (
            <SyllabusCard
              key={item.id}
              subjectName={item.subjectName}
              iconName={item.iconName}
              onPress={() => handleCardPress(item)} // Pass the whole item object
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  scrollViewContainer: {
    paddingHorizontal: PAGE_HORIZONTAL_PADDING,
    paddingVertical: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIconBackground: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#7B61FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 3,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  headerTextContainer: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  subTitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#D9D4E7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  cardIconContainer: {
    marginBottom: 12,
  },
  cardSubjectName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7B61FF',
    textAlign: 'center',
    minHeight: Platform.OS === 'ios' ? 34 : 38,
    marginBottom: 12,
  },
  cardViewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardViewDetailsText: {
    fontSize: 12,
    color: '#7B61FF',
    fontWeight: '500',
  },
  cardViewDetailsIcon: {
    marginLeft: 4,
  },
});

export default StudentSyllabus;