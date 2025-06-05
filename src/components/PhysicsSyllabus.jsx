// PhysicsSyllabus.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Or your preferred icon library

const { width } = Dimensions.get('window');

// Specific syllabus data for Physics
const physicsChapterData = [
  { sno: 1, chapterName: 'Mechanics: Newton\'s Laws of Motion', startDate: '01/08/24', endDate: '15/08/24' },
  { sno: 2, chapterName: 'Work, Energy, and Power', startDate: '16/08/24', endDate: '30/08/24' },
  { sno: 3, chapterName: 'Optics: Reflection & Refraction', startDate: '01/09/24', endDate: '15/09/24' },
  { sno: 4, chapterName: 'Thermodynamics: Basic Concepts', startDate: '16/09/24', endDate: '30/09/24' },
  { sno: 5, chapterName: 'Electromagnetism: Introduction', startDate: '01/10/24', endDate: '15/10/24' },
  { sno: 6, chapterName: 'Modern Physics: Atomic Structure', startDate: '16/10/24', endDate: '30/10/24' },
  { sno: 7, chapterName: 'Lab Session 1: Verifying Newton\'s Laws', startDate: '05/08/24', endDate: '05/08/24' },
  { sno: 8, chapterName: 'Lab Session 2: Lens Experiments', startDate: '10/09/24', endDate: '10/09/24' },
];


// Adjusted column widths based on the new screenshot proportions
// Total width for table content area, considering padding of pageContainer
const TABLE_CONTENT_WIDTH = width - 20; // 10 padding on each side of pageContainer

const SNO_COL_WIDTH = TABLE_CONTENT_WIDTH * 0.13;       // Approx 13%
const CHAPTER_COL_WIDTH = TABLE_CONTENT_WIDTH * 0.44;  // Approx 44%
const START_DATE_COL_WIDTH = TABLE_CONTENT_WIDTH * 0.215; // Approx 21.5%
const END_DATE_COL_WIDTH = TABLE_CONTENT_WIDTH * 0.215;   // Approx 21.5%
// Sum should be close to 100% of TABLE_CONTENT_WIDTH

const PhysicsSyllabus = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="back" size={20} color="#008080" />
        </TouchableOpacity>
        <Text style={styles.appHeaderTitle}>Physics - Syllabus</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.pageContainer}>
        <View style={styles.tableContainer}>
          {/* Table Header Row */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableHeaderCell, { width: SNO_COL_WIDTH }]}><Text style={styles.tableHeaderText}>S.No</Text></View>
            <View style={[styles.tableHeaderCell, { width: CHAPTER_COL_WIDTH }]}><Text style={styles.tableHeaderText}>Chapter Name / Topic</Text></View>
            <View style={[styles.tableHeaderCell, { width: START_DATE_COL_WIDTH }]}><Text style={styles.tableHeaderText}>Start Date</Text></View>
            <View style={[styles.tableHeaderCell, styles.lastHeaderCell, { width: END_DATE_COL_WIDTH }]}><Text style={styles.tableHeaderText}>End Date</Text></View>
          </View>

          {/* Table Data Rows */}
          {physicsChapterData.map((item) => ( // Removed index as it's not used for alternating rows now
            <View key={item.sno} style={styles.tableRow}>
              <View style={[styles.tableCell, { width: SNO_COL_WIDTH }]}><Text style={styles.cellText}>{item.sno}</Text></View>
              <View style={[styles.tableCell, styles.chapterCell, { width: CHAPTER_COL_WIDTH }]}>
                <Text style={styles.cellTextLeft} numberOfLines={3}>{item.chapterName}</Text>
              </View>
              <View style={[styles.tableCell, { width: START_DATE_COL_WIDTH }]}><Text style={styles.cellText}>{item.startDate}</Text></View>
              <View style={[styles.tableCell, styles.lastCell, { width: END_DATE_COL_WIDTH }]}><Text style={styles.cellText}>{item.endDate}</Text></View>
            </View>
          ))}
          {physicsChapterData.length === 0 && (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No syllabus details available for Physics.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8EAF6', // Light indigo/blue background for the entire safe area (matches header accent)
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#b2ebf2', // Darker Indigo/Blue for header
    paddingVertical: 14, // Slightly more padding
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5, // For easier touch
    width: 40, // To help with title centering
    alignItems: 'flex-start',
  },
  appHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008080',
  },
  headerSpacer: { // To balance the title when back button is present
    width: 40,
  },
  pageContainer: {
    padding: 10, // Overall padding for the scrollable content area
    flexGrow: 1, // Allows content to grow and ScrollView to work correctly
    backgroundColor: '#FFFFFF', // White background for the main content area below header
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#545454', // Darker gray/black border for table outer
    backgroundColor: '#FFFFFF', // White background inside table
    borderRadius: 0, // Screenshot has sharp corners for the table
    overflow: 'hidden', // Keep this if you add borderRadius later
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0', // Light gray for header background (as per screenshot)
    borderBottomWidth: 1,
    borderBottomColor: '#545454', // Darker gray/black
  },
  tableHeaderCell: {
    paddingVertical: 10, // Adjusted padding
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#545454', // Darker gray/black
  },
  lastHeaderCell: {
    borderRightWidth: 0,
  },
  tableHeaderText: {
    fontSize: 12, // Slightly smaller
    fontWeight: 'bold',
    color: '#000000', // Black text for header
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#545454', // Darker gray/black for row separators
    backgroundColor: '#FFFFFF', // Ensure rows are white by default
  },
  // tableRowEven: { // Removed alternating row color as it's not in the screenshot
  //   backgroundColor: '#F9F9F9',
  // },
  tableCell: {
    paddingVertical: 10,
    paddingHorizontal: 5, // Adjusted padding
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#545454', // Darker gray/black
    minHeight: 48, // Adjusted min height
  },
  chapterCell: {
    alignItems: 'flex-start', // Left-align chapter names
    paddingLeft: 8, // Indent chapter name slightly
    justifyContent: 'flex-start', // Align text to top-left
    paddingTop: 8, // Ensure padding from top
    paddingBottom: 8,
  },
  lastCell: {
    borderRightWidth: 0,
  },
  cellText: {
    fontSize: 12,
    color: '#333333', // Dark gray for cell text
    textAlign: 'center',
  },
  cellTextLeft: {
    fontSize: 12,
    color: '#333333',
    textAlign: 'left',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#757575',
  }
});

export default PhysicsSyllabus;