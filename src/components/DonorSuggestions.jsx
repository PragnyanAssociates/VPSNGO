// DonorCL.jsx
import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Using FontAwesome5

const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_PADDING = 16;

// --- Colors ---
const PRIMARY_BLUE = '#007AFF'; // A vibrant blue for highlights and actions
const LIGHT_BLUE_BACKGROUND = '#EBF5FF'; // For new/unread items
const TEXT_PRIMARY_COLOR = '#1D2939'; // Very dark blue/almost black for main titles
const TEXT_SECONDARY_COLOR = '#475467'; // Medium dark gray for subtitles/details
const TEXT_TERTIARY_COLOR = '#667085'; // Lighter gray for less important text
const LINK_COLOR = PRIMARY_BLUE;
const BADGE_COLOR = PRIMARY_BLUE;
const BORDER_COLOR = '#D0D5DD'; // Light gray for borders
const BACKGROUND_COLOR = '#F9FAFB'; // Very light gray page background
const CARD_BACKGROUND_COLOR = '#FFFFFF'; // White for read items

// --- Data ---
const initialCommunicationsData = [
  {
    id: '1',
    title: 'Our Gratitude for Your Support!',
    date: '11/1/2024',
    from: 'Development Office',
    type: 'Thank You Note',
    snippet: 'Dear Vv860027, we are deeply grateful for your recent contribution to the Scholarship Fund. Your generosity makes a real difference...',
    isNew: true,
    isRead: false,
    hasPdf: true,
  },
  {
    id: '2',
    title: 'Fall 2024 Newsletter',
    date: '10/20/2024',
    from: 'School Communications',
    type: 'Newsletter',
    snippet: 'Catch up on the latest school news, student achievements, and upcoming events in our Fall newsletter.',
    isNew: false,
    isRead: true,
    hasPdf: true,
  },
  {
    id: '3',
    title: 'Impact Report: Technology Upgrades',
    date: '9/15/2024',
    from: 'Principal\'s Office',
    type: 'Impact Report',
    snippet: 'See how your donations have helped us upgrade our computer labs and provide new learning tools for students.',
    isNew: false,
    isRead: true,
    hasPdf: true,
  },
  {
    id: '4',
    title: 'Upcoming Donor Appreciation Event',
    date: '8/30/2024',
    from: 'Events Team',
    type: 'Invitation',
    snippet: 'You are cordially invited to our annual Donor Appreciation Gala. Join us for an evening of celebration and gratitude.',
    isNew: false,
    isRead: false, // Example of an older unread item
    hasPdf: false,
  }
];

const Header = () => (
  <View style={styles.headerContainer}>
    <View style={styles.headerTitleContainer}>
      <Icon name="envelope-open-text" size={32} color={PRIMARY_BLUE} style={styles.headerIcon} />
      <View>
        <Text style={styles.headerTitle}>Suggestions</Text>
        <Text style={styles.headerSubtitle}>Messages, newsletters, and reports from the school.</Text>
      </View>
    </View>
    {/* <TouchableOpacity style={styles.preferencesButton} activeOpacity={0.7}>
      <Icon name="cog" size={20} color={PRIMARY_BLUE} />
      <Text style={styles.preferencesText}>Preferences</Text>
    </TouchableOpacity> */}
  </View>
);

const CommunicationItem = ({ item, onToggleReadStatus }) => {
  const cardStyle = [
    styles.communicationItemCard,
    !item.isRead ? styles.unreadCard : styles.readCard,
  ];
  const titleStyle = [
    styles.itemTitle,
    !item.isRead && styles.unreadTitle,
  ];

  return (
    <View style={cardStyle}>
      { !item.isRead && <View style={styles.unreadIndicatorBorder} />}
      <View style={styles.itemHeader}>
        <Text style={titleStyle}>{item.title}</Text>
        <Text style={styles.itemDate}>{item.date}</Text>
      </View>
      <Text style={styles.itemMeta}>
        From: {item.from} | Type: {item.type}
      </Text>
      <Text style={styles.itemSnippet} numberOfLines={2} ellipsizeMode="tail">
        {item.snippet}
      </Text>
      <View style={styles.itemFooter}>
        <View style={styles.actionsContainer}>
            <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.actionLink}>
                    Read More {item.hasPdf ? '/ View PDF' : ''}
                </Text>
            </TouchableOpacity>
            {item.isNew && !item.isRead && (
                <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                </View>
            )}
        </View>
        <TouchableOpacity onPress={() => onToggleReadStatus(item.id)} activeOpacity={0.7}>
          <Text style={styles.markAsReadLink}>
            Mark as {item.isRead ? 'Unread' : 'Read'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DonorSuggestions = () => {
  const [communications, setCommunications] = useState(initialCommunicationsData);

  const toggleReadStatus = (itemId) => {
    setCommunications(prevCommunications =>
      prevCommunications.map(item =>
        item.id === itemId ? { ...item, isRead: !item.isRead, isNew: false } : item
      )
    );
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <Header />
      <Text style={styles.inboxTitle}>Inbox</Text>
      {communications.map(item => (
        <CommunicationItem key={item.id} item={item} onToggleReadStatus={toggleReadStatus} />
      ))}
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
    paddingBottom: 30, // Extra space at bottom
  },
  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align items to the top for multi-line subtitle
    marginBottom: 25,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1, // Allow title container to take available space
  },
  headerIcon: {
    marginRight: 12,
    marginTop: 2, // Align with first line of title
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TEXT_PRIMARY_COLOR,
  },
  headerSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY_COLOR,
    marginTop: 3,
    flexWrap: 'wrap', // Ensure subtitle wraps
    maxWidth: SCREEN_WIDTH * 0.6, // Prevent overlap with preferences button
  },
  // preferencesButton: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingVertical: 5,
  //   paddingHorizontal: 0,
  //   // backgroundColor: '#E0EFFF',
  //   // borderRadius: 6,
  // },
  // preferencesText: {
  //   marginLeft: 6,
  //   fontSize: 14,
  //   color: PRIMARY_BLUE,
  //   fontWeight: '500',
  // },
  // Inbox Title
  inboxTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_PRIMARY_COLOR,
    marginBottom: 15,
  },
  // Communication Item Card
  communicationItemCard: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    position: 'relative', // For the unread indicator border
  },
  readCard: {
    backgroundColor: CARD_BACKGROUND_COLOR,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  unreadCard: {
    backgroundColor: LIGHT_BLUE_BACKGROUND, // Light blue for unread
    // borderColor: PRIMARY_BLUE, // Distinct border for unread
    // borderWidth: 1,
  },
  unreadIndicatorBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5, // Width of the indicator
    backgroundColor: PRIMARY_BLUE,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT_PRIMARY_COLOR,
    flex: 0.85, // Give more space to title
  },
  unreadTitle: {
    color: PRIMARY_BLUE, // Highlight title for unread
  },
  itemDate: {
    fontSize: 13,
    color: TEXT_TERTIARY_COLOR,
  },
  itemMeta: {
    fontSize: 13,
    color: TEXT_SECONDARY_COLOR,
    marginBottom: 8,
  },
  itemSnippet: {
    fontSize: 14,
    color: TEXT_SECONDARY_COLOR,
    lineHeight: 20,
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLink: {
    fontSize: 14,
    color: LINK_COLOR,
    fontWeight: '500',
  },
  newBadge: {
    backgroundColor: BADGE_COLOR,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 10,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  markAsReadLink: {
    fontSize: 13,
    color: TEXT_TERTIARY_COLOR, // More subtle link color
    fontWeight: '500',
  },
});

export default DonorSuggestions;