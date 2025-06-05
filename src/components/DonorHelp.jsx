// DonorHelp.jsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_PADDING = 16;
const PRIMARY_ORANGE = '#FF6F00'; // A vibrant orange for accents
const TEXT_PRIMARY_COLOR = '#2C3E50'; // Dark slate blue for titles
const TEXT_SECONDARY_COLOR = '#566573'; // Medium gray for subtitles/details
const BACKGROUND_COLOR = '#FFFFFF'; // Main background
const CARD_BACKGROUND_COLOR = '#FFFFFF';
const LIGHT_GREY_BACKGROUND = '#F8F9FA'; // For FAQ items
const BORDER_COLOR = '#E0E6ED';

const faqsData = [
  { id: '1', question: 'How can I get a tax receipt for my donation?' },
  { id: '2', question: 'What are the different ways I can donate?' },
  { id: '3', question: 'How do I update my contact information?' },
  { id: '4', question: 'Who should I contact for information about upcoming school events for donors?' },
];

const supportTicketsData = [
  {
    id: 'T1',
    title: 'Issue with my last donation receipt',
    ticketId: 'DTKT001',
    submitted: '11/10/2024',
    category: 'Donation Query',
    status: 'In Progress',
    statusColor: '#F57F17', // Dark Yellow/Orange
    statusBgColor: '#FFF9C4', // Light Yellow
    statusIcon: 'sync-alt',
  },
  {
    id: 'T2',
    title: 'How to update my contact address?',
    ticketId: 'DTKT002',
    submitted: '11/5/2024',
    category: 'Profile Issue',
    status: 'Resolved',
    statusColor: '#2E7D32', // Dark Green
    statusBgColor: '#C8E6C9', // Light Green
    statusIcon: 'check-circle',
  },
];

const Header = () => (
  <View style={styles.headerContainer}>
    <View style={styles.headerIconCircle}>
      <Icon name="life-ring" size={28} color={PRIMARY_ORANGE} solid />
    </View>
    <View style={styles.headerTextContainer}>
      <Text style={styles.headerTitle}>Donor Help Desk</Text>
      <Text style={styles.headerSubtitle}>Get support for your donation-related queries.</Text>
    </View>
  </View>
);

const SectionTitle = ({ title, children }) => (
  <View style={styles.sectionTitleContainer}>
    <Text style={styles.sectionTitleText}>{title}</Text>
    {children}
  </View>
);

const FAQItem = ({ question }) => (
  <TouchableOpacity style={styles.faqItem} activeOpacity={0.7}>
    <Text style={styles.faqQuestionText}>{question}</Text>
    <Icon name="question-circle" size={22} color={PRIMARY_ORANGE} solid />
  </TouchableOpacity>
);

const SupportTicketCard = ({ title, ticketId, submitted, category, status, statusColor, statusBgColor, statusIcon }) => (
  <View style={styles.ticketCard}>
    <View style={styles.ticketHeaderContainer}>
        <Text style={styles.ticketTitle}>{title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
            <Icon name={statusIcon} size={12} color={statusColor} style={styles.statusIcon} />
            <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
        </View>
    </View>
    <Text style={styles.ticketMetaText}>
      ID: {ticketId} | Submitted: {submitted} | Category: {category}
    </Text>
    <TouchableOpacity style={styles.viewDetailsButton} activeOpacity={0.7}>
      <Text style={styles.viewDetailsText}>View Details</Text>
      <Icon name="eye" size={16} color={PRIMARY_ORANGE} style={styles.viewDetailsIcon} />
    </TouchableOpacity>
  </View>
);

const SubmitQueryButton = () => (
    <TouchableOpacity style={styles.submitQueryButton} activeOpacity={0.8}>
        <Icon name="paper-plane" size={16} color="#FFFFFF" style={styles.submitQueryIcon} solid />
        <Text style={styles.submitQueryButtonText}>Submit New Query</Text>
    </TouchableOpacity>
);


const DonorHelp = () => {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <Header />

      <SectionTitle title="Frequently Asked Questions" />
      <View style={styles.faqListContainer}>
        {faqsData.map(faq => (
          <FAQItem key={faq.id} question={faq.question} />
        ))}
      </View>

      <SectionTitle title="My Support Tickets">
        <SubmitQueryButton />
      </SectionTitle>
      <View style={styles.ticketListContainer}>
        {supportTicketsData.map(ticket => (
          <SupportTicketCard key={ticket.id} {...ticket} />
        ))}
      </View>
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
    paddingBottom: 40, // Extra padding at the bottom
  },
  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE0B2', // Lighter orange for icon background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TEXT_PRIMARY_COLOR,
  },
  headerSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY_COLOR,
    marginTop: 2,
  },
  // Section Title Styles
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10, // Add some space above sections
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_PRIMARY_COLOR,
  },
  // FAQ Styles
  faqListContainer: {
    marginBottom: 20,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: LIGHT_GREY_BACKGROUND,
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  faqQuestionText: {
    fontSize: 15,
    color: TEXT_SECONDARY_COLOR,
    flex: 1, // Allow text to wrap
    marginRight: 10,
  },
  // Submit Query Button
  submitQueryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_ORANGE,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20, // More rounded for a modern button feel
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  submitQueryIcon: {
    marginRight: 8,
  },
  submitQueryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Support Ticket Styles
  ticketListContainer: {
    // Container for all ticket cards
  },
  ticketCard: {
    backgroundColor: CARD_BACKGROUND_COLOR,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    elevation: 1, // Subtle shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  ticketHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align items to the top
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY_COLOR,
    flex: 1, // Allow title to take available space and wrap
    marginRight: 10,
  },
  ticketMetaText: {
    fontSize: 12,
    color: TEXT_SECONDARY_COLOR,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12, // Pill shape
    alignSelf: 'flex-start', // Don't stretch vertically
  },
  statusIcon: {
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end', // Push to the right
    marginTop: 8, // Space above the button
  },
  viewDetailsText: {
    fontSize: 14,
    color: PRIMARY_ORANGE,
    fontWeight: '600',
    marginRight: 5,
  },
  viewDetailsIcon: {
    // Icon already has color from props
  },
});

export default DonorHelp;