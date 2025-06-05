// DonorReceipts.jsx
import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Picker } from '@react-native-picker/picker';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_PADDING = 16;

// --- Colors ---
const PRIMARY_PURPLE = '#673AB7'; // Deep Purple 500 - for buttons and highlights
const LIGHT_PURPLE_BACKGROUND = '#EDE7F6'; // Deep Purple 50 - for some backgrounds
const TEXT_PRIMARY_COLOR = '#212121'; // Almost black for main titles
const TEXT_SECONDARY_COLOR = '#424242'; // Dark Gray for subtitles/details
const TEXT_TERTIARY_COLOR = '#757575'; // Medium Gray for less important text
const BORDER_COLOR = '#E0E0E0'; // Light gray for borders
const BACKGROUND_COLOR = '#F5F5F5'; // Very light gray page background
const CARD_BACKGROUND_COLOR = '#FFFFFF'; // White for cards

// --- Data ---
const receiptsData = [
  {
    id: 'INV001',
    date: '10/16/2024',
    amount: '100.00',
    purpose: 'Scholarship Fund',
  },
  {
    id: 'INV002',
    date: '7/2/2024',
    amount: '250.00',
    purpose: 'Technology Upgrade',
  },
  {
    id: 'INV003',
    date: '12/21/2023',
    amount: '50.00',
    purpose: 'Library Books',
  },
];

const taxYearsData = [
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '2022', value: '2022' },
  { label: '2021', value: '2021' },
];

const PageHeader = ({ title, subtitle, iconName }) => (
  <View style={styles.pageHeaderContainer}>
    <View style={styles.pageHeaderIconBackground}>
      <Icon name={iconName} size={30} color={PRIMARY_PURPLE} />
    </View>
    <View style={styles.pageHeaderTextContainer}>
      <Text style={styles.pageHeaderTitle}>{title}</Text>
      <Text style={styles.pageHeaderSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

const SectionHeader = ({ title, iconName }) => (
  <View style={styles.sectionHeaderContainer}>
    <Icon name={iconName} size={22} color={PRIMARY_PURPLE} style={styles.sectionHeaderIcon} />
    <Text style={styles.sectionHeaderTitle}>{title}</Text>
  </View>
);

const ReceiptItem = ({ receiptId, date, amount, purpose }) => (
  <View style={styles.receiptItemCard}>
    <View style={styles.receiptInfoContainer}>
      <Text style={styles.receiptIdText}>Receipt ID: {receiptId}</Text>
      <Text style={styles.receiptDetailText}>Date: {date} | Amount: <Text style={styles.amountText}>${amount}</Text></Text>
      <Text style={styles.receiptDetailText}>For: {purpose}</Text>
    </View>
    <TouchableOpacity style={styles.downloadButton} activeOpacity={0.7} onPress={() => Alert.alert("Download", `Downloading PDF for ${receiptId}...`)}>
      <Icon name="file-pdf" size={16} color="#FFFFFF" />
      <Text style={styles.downloadButtonText}>Download PDF</Text>
    </TouchableOpacity>
  </View>
);

const YearlyTaxSummary = () => {
  const [selectedYear, setSelectedYear] = useState(taxYearsData[0].value);

  const handleGenerateSummary = () => {
    Alert.alert("Generate Summary", `Generating tax summary for the year ${selectedYear}... (Mock Action)`);
  };

  return (
    <View style={styles.taxSummaryCard}>
      <Text style={styles.taxSummaryInfoText}>
        Generate a summary of your donations for a specific tax year. (Mock feature)
      </Text>
      <Text style={styles.pickerLabel}>Select Tax Year</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedYear}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
          style={styles.pickerStyle}
          dropdownIconColor={PRIMARY_PURPLE}
        >
          {taxYearsData.map(year => (
            <Picker.Item key={year.value} label={year.label} value={year.value} />
          ))}
        </Picker>
      </View>
      <TouchableOpacity style={styles.generateButton} activeOpacity={0.7} onPress={handleGenerateSummary}>
        <Icon name="download" size={18} color="#FFFFFF" />
        <Text style={styles.generateButtonText}>Generate Summary</Text>
      </TouchableOpacity>
    </View>
  );
};

const DonorReceipts = () => {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <PageHeader
        title="Donation Receipts & Invoices"
        subtitle="Access your official donation receipts for tax purposes."
        iconName="file-invoice-dollar"
      />

      <SectionHeader title="Your Receipts" iconName="receipt" />
      {receiptsData.map(receipt => (
        <ReceiptItem
          key={receipt.id}
          receiptId={receipt.id}
          date={receipt.date}
          amount={receipt.amount}
          purpose={receipt.purpose}
        />
      ))}

      <SectionHeader title="Yearly Tax Summary" iconName="calendar-alt" />
      <YearlyTaxSummary />

      <Text style={styles.footerDisclaimer}>
        Please consult with a tax professional for advice. Receipts are for donations made directly to the school.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  scrollViewContent: {
    padding: CONTAINER_PADDING,
    paddingBottom: 30,
  },
  // Page Header Styles
  pageHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  pageHeaderIconBackground: {
    width: 50,
    height: 50,
    borderRadius: 10, // Squarish rounded icon
    backgroundColor: LIGHT_PURPLE_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  pageHeaderTextContainer: {
    flex: 1,
  },
  pageHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TEXT_PRIMARY_COLOR,
  },
  pageHeaderSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY_COLOR,
    marginTop: 3,
  },
  // Section Header Styles
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10, // Space above new section
    marginBottom: 15,
  },
  sectionHeaderIcon: {
    marginRight: 10,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_PRIMARY_COLOR,
  },
  // Receipt Item Styles
  receiptItemCard: {
    backgroundColor: CARD_BACKGROUND_COLOR,
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  receiptInfoContainer: {
    flex: 1, // Take available space before button
    marginRight: 10,
  },
  receiptIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY_COLOR,
    marginBottom: 4,
  },
  receiptDetailText: {
    fontSize: 13,
    color: TEXT_SECONDARY_COLOR,
    lineHeight: 18,
  },
  amountText: {
    fontWeight: '600',
    color: PRIMARY_PURPLE,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_PURPLE,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  // Yearly Tax Summary Styles
  taxSummaryCard: {
    backgroundColor: LIGHT_PURPLE_BACKGROUND, // Distinct background for this section
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#D1C4E9', // Slightly darker purple border
  },
  taxSummaryInfoText: {
    fontSize: 14,
    color: TEXT_SECONDARY_COLOR,
    marginBottom: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    color: TEXT_SECONDARY_COLOR,
    marginBottom: 5,
    marginLeft: 5, // Align with picker's default padding
  },
  pickerContainer: {
    backgroundColor: CARD_BACKGROUND_COLOR, // White background for picker
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 15,
    height: 50, // Standard height for input fields
    justifyContent: 'center', // Vertically center picker content
  },
  pickerStyle: {
    width: '100%',
    height: '100%', // Ensure picker fills container
    color: TEXT_PRIMARY_COLOR,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_PURPLE,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  // Footer Disclaimer
  footerDisclaimer: {
    fontSize: 12,
    color: TEXT_TERTIARY_COLOR,
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
});

export default DonorReceipts;