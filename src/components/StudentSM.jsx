// StudentSM.jsx

import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

// Get screen width for responsive card sizing
const screenWidth = Dimensions.get('window').width;

// Define constants for styling to make it easier to adjust
const CONTAINER_PADDING = 16;
const CARD_GAP = 12; // Gap between cards horizontally and vertically
// Calculate card width for a two-column layout
const cardWidth = (screenWidth - (CONTAINER_PADDING * 2) - CARD_GAP) / 2;

const studyMaterialsData = [
  {
    id: '1',
    iconName: 'file-alt', // For Notes
    iconColor: '#3498DB', // A nice blue
    title: 'Chapter 1: Introduction to Algebra - Notes',
    subject: 'Mathematics',
    type: 'Notes',
    addedDate: 'Oct 15, 2024',
    description: 'Comprehensive notes covering the basics of algebraic expressions and equations.',
  },
  {
    id: '2',
    iconName: 'desktop', // For Presentation Slides
    iconColor: '#3498DB',
    title: 'The Cell Cycle - Presentation Slides',
    subject: 'Biology',
    type: 'Presentation',
    addedDate: 'Oct 20, 2024',
    description: 'Visual slides explaining mitosis, meiosis, and the importance of the cell cycle.',
  },
  {
    id: '3',
    iconName: 'video', // For Recorded Lecture
    iconColor: '#3498DB',
    title: 'Recorded Lecture: World War I Causes',
    subject: 'History',
    type: 'Video Lecture',
    addedDate: 'Oct 22, 2024',
    description: 'A video lecture detailing the primary causes and triggers of World War I. (Link to external platform)',
  },
  {
    id: '4',
    iconName: 'file-alt', // For Worksheet (could also use 'clipboard-list' or 'tasks')
    iconColor: '#3498DB',
    title: 'Practice Problems: Newtonian Physics',
    subject: 'Science',
    type: 'Worksheet',
    addedDate: 'Nov 01, 2024',
    description: 'A set of practice problems focusing on Newton\'s laws of motion and gravity.',
  },
];

const MaterialCard = ({ iconName, iconColor, title, subject, type, addedDate, description }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Icon name={iconName} size={22} color={iconColor} style={styles.cardIcon} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardMetaInfoText}>Subject: {subject} | Type: {type}</Text>
      <Text style={styles.cardMetaInfoText}>Added: {addedDate}</Text>
      <Text style={styles.cardDescriptionText}>{description}</Text>
      <TouchableOpacity style={styles.downloadButton} activeOpacity={0.7}>
        <Icon name="download" size={16} color="#FFFFFF" />
        <Text style={styles.downloadButtonText}>Download</Text>
      </TouchableOpacity>
    </View>
  );
};

const StudentSM = () => {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.pageContainer}>
        <View style={styles.headerContainer}>
          <Icon name="folder-open" size={40} color="#5DBE79" style={styles.mainHeaderIcon} />
          <View style={styles.headerTextGroup}>
            <Text style={styles.mainHeaderTitle}>Study Materials & Resources for Student </Text>
            <Text style={styles.mainHeaderSubtitle}>Access notes, presentations, and other learning resources.</Text>
          </View>
        </View>

        <View style={styles.cardsLayoutGrid}>
          {studyMaterialsData.map(material => (
            <MaterialCard
              key={material.id}
              iconName={material.iconName}
              iconColor={material.iconColor}
              title={material.title}
              subject={material.subject}
              type={material.type}
              addedDate={material.addedDate}
              description={material.description}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Light grayish-blue background, pleasant for eyes
  },
  scrollViewContent: {
    flexGrow: 1, // Ensures content can scroll and container can expand
  },
  pageContainer: {
    flex: 1,
    padding: CONTAINER_PADDING,
  },
  // Main Header Styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Aligns icon to the top of potentially multi-line text
    marginBottom: 24,
  },
  mainHeaderIcon: {
    marginRight: 16,
    marginTop: 4, // Small adjustment for better visual alignment with text
  },
  headerTextGroup: {
    flex: 1, // Allows text to wrap and utilize available horizontal space
  },
  mainHeaderTitle: {
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#2C3E50', // Dark, slightly desaturated blue for a professional look
    marginBottom: 6,
  },
  mainHeaderSubtitle: {
    fontSize: 14,
    color: '#566573', // Softer gray for less emphasis
  },
  // Cards Grid Layout
  cardsLayoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Distributes space evenly between cards
  },
  // Individual Card Styles
  cardContainer: {
    backgroundColor: '#FFFFFF', // White card background
    borderRadius: 10, // Softer, more modern rounded corners
    padding: 16,
    marginBottom: CARD_GAP, // Vertical gap between rows of cards
    width: cardWidth, // Calculated width to fit two cards per row
    elevation: 3, // Subtle shadow for Android
    shadowColor: '#000000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Light shadow
    shadowRadius: 3,   // Soft shadow spread
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Icon aligns with the top of the title text
    marginBottom: 12,
  },
  cardIcon: {
    marginRight: 12,
    marginTop: 3, // Fine-tune vertical alignment of icon with title
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700', // Bolder font for title emphasis
    color: '#34495E', // Dark blue-gray, matching professional theme
    flex: 1, // Ensures title text wraps if it's long
  },
  cardMetaInfoText: {
    fontSize: 12,
    color: '#7F8C8D', // Muted gray for meta information
    marginBottom: 5,
  },
  cardDescriptionText: {
    fontSize: 13,
    color: '#4A4A4A', // Standard dark gray for body text, good readability
    lineHeight: 19, // Improved line spacing for easier reading
    marginBottom: 16, // Space above the download button
    minHeight: 57, // Approx 3 lines of text to give cards some consistent height
  },
  downloadButton: {
    backgroundColor: '#007AFF', // Standard bright blue for actionable items
    borderRadius: 8, // Rounded corners for button
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 'auto', // Could be used if card content above has flex:1, to push to bottom
  },
  downloadButtonText: {
    color: '#FFFFFF', // White text on blue button
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600', // Semi-bold for button text
  },
});

export default StudentSM;