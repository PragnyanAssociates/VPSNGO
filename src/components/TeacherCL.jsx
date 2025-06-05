import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

// --- Mock Data ---
const announcementsData = [
  {
    id: '1',
    title: 'Staff Meeting Reminder - Nov 10th',
    date: '2024-11-08',
    forWhom: 'All Staff',
    fromWho: 'Principal\'s Office',
    content: 'A reminder that the monthly all-staff meeting will be held this Friday, Nov 10th, at 3:00 PM in the auditorium. Agenda includes Q3 review and upcoming events planning.',
  },
  {
    id: '2',
    title: 'Professional Development Workshop Opportunity',
    date: '2024-11-05',
    forWhom: 'Teaching Staff',
    fromWho: 'Academic Coordinator',
    content: 'We are pleased to announce a workshop on "Innovative Teaching Methodologies" on Nov 22nd. Limited seats available. Register via the staff portal.',
  },
  {
    id: '3',
    title: 'School Annual Day - Call for Volunteers',
    date: '2024-11-01',
    forWhom: 'All Staff',
    fromWho: 'Events Committee',
    content: 'Our Annual School Day is approaching! We are looking for staff volunteers to help with various activities. Please sign up with Ms. Jane in the Admin Office.',
  },
];

const internalMemosData = [
  {
    id: 'm1',
    title: 'Updated IT Policy Document',
    date: '2024-11-07',
    forWhom: 'All Staff',
    fromWho: 'IT Department',
    content: 'The IT usage policy has been updated. Please review the attached document in the staff portal by EOD Friday.',
  },
  {
    id: 'm2',
    title: 'Holiday Schedule - December 2024',
    date: '2024-11-03',
    forWhom: 'All Departments',
    fromWho: 'HR Department',
    content: 'Please find the approved holiday schedule for December 2024. Plan your leaves accordingly.',
  },
];

const recipientGroups = [
  'Parents of Class 10A',
  'All Teaching Staff',
  'Admin Department',
  'Sports Coaches',
  'PTA Members',
];

// --- Main Component ---
const TeacherCL = () => {
  const [activeTab, setActiveTab] = useState('Announcements'); // 'Announcements', 'SendMessage', 'InternalMemos'

  // Send Message Form State
  const [selectedRecipientGroup, setSelectedRecipientGroup] = useState(recipientGroups[0]);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');

  const handleSendMessage = () => {
    if (!selectedRecipientGroup || !messageSubject.trim() || !messageBody.trim()) {
      Alert.alert("Incomplete Form", "Please fill in all fields to send the message.");
      return;
    }
    Alert.alert(
      "Message Sent (Simulation)",
      `To: ${selectedRecipientGroup}\nSubject: ${messageSubject}\nMessage: ${messageBody}`
    );
    setMessageSubject('');
    setMessageBody('');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Announcements':
        return (
          <View style={styles.contentListContainer}>
            {announcementsData.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDate}>{item.date}</Text>
                </View>
                <Text style={styles.cardMeta}>For: {item.forWhom} | From: {item.fromWho}</Text>
                <Text style={styles.cardContent}>{item.content}</Text>
              </View>
            ))}
          </View>
        );
      case 'SendMessage':
        return (
          <View style={styles.formOuterContainer}>
            <View style={styles.formInnerContainer}>
                <Text style={styles.formTitle}>Compose Message</Text>

                <Text style={styles.label}>Recipient Group</Text>
                <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedRecipientGroup}
                    onValueChange={(itemValue) => setSelectedRecipientGroup(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#007AFF"
                >
                    {recipientGroups.map((group, index) => (
                    <Picker.Item key={index} label={group} value={group} />
                    ))}
                </Picker>
                </View>

                <Text style={styles.label}>Subject</Text>
                <TextInput
                style={styles.input}
                placeholder="Subject of your message"
                placeholderTextColor="#A0A0A0"
                value={messageSubject}
                onChangeText={setMessageSubject}
                />

                <Text style={styles.label}>Message</Text>
                <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Type your message here..."
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={6}
                value={messageBody}
                onChangeText={setMessageBody}
                textAlignVertical="top"
                />

                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Text style={styles.sendButtonIcon}>✈</Text>
                <Text style={styles.sendButtonText}>Send Message</Text>
                </TouchableOpacity>
            </View>
          </View>
        );
      case 'InternalMemos':
        return (
          <View style={styles.contentListContainer}>
            {internalMemosData.length > 0 ? internalMemosData.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDate}>{item.date}</Text>
                </View>
                <Text style={styles.cardMeta}>For: {item.forWhom} | From: {item.fromWho}</Text>
                <Text style={styles.cardContent}>{item.content}</Text>
              </View>
            )) : (
              <Text style={styles.emptyStateText}>No internal memos at the moment.</Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  const getTabIconStyle = (tabName) => {
    if (activeTab === tabName) return styles.activeTabIconText;
    switch (tabName) {
        case 'Announcements': return styles.inactiveAnnouncementsIcon;
        case 'SendMessage': return styles.inactiveSendMessageIcon;
        case 'InternalMemos': return styles.inactiveMemosIcon;
        default: return styles.inactiveTabIconText;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>✈</Text>
          <View>
            <Text style={styles.headerTitle}>Staff Communications Hub</Text>
            <Text style={styles.headerSubtitle}>
              Announcements,Messages & Internal memos.
            </Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
                styles.tabButton,
                activeTab === 'Announcements' ? styles.activeTabButton : styles.inactiveTabButton
            ]}
            onPress={() => setActiveTab('Announcements')}
          >
            <Text style={[styles.tabIconBase, getTabIconStyle('Announcements')]}>📢</Text>
            <Text style={[styles.tabTextBase, activeTab === 'Announcements' ? styles.activeTabIconText : styles.inactiveTabIconText]}>
              Announcements
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
                styles.tabButton,
                activeTab === 'SendMessage' ? styles.activeTabButton : styles.inactiveTabButton
            ]}
            onPress={() => setActiveTab('SendMessage')}
          >
            <Text style={[styles.tabIconBase, getTabIconStyle('SendMessage')]}>✏️</Text>
            <Text style={[styles.tabTextBase, activeTab === 'SendMessage' ? styles.activeTabIconText : styles.inactiveTabIconText]}>
              Send Message
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
                styles.tabButton,
                activeTab === 'InternalMemos' ? styles.activeTabButton : styles.inactiveTabButton
            ]}
            onPress={() => setActiveTab('InternalMemos')}
          >
            <Text style={[styles.tabIconBase, getTabIconStyle('InternalMemos')]}>📁</Text>
            <Text style={[styles.tabTextBase, activeTab === 'InternalMemos' ? styles.activeTabIconText : styles.inactiveTabIconText]}>
              Internal Memos
            </Text>
          </TouchableOpacity>
        </View>

        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---
const ACTIVE_BLUE = '#007AFF';
const INACTIVE_TAB_BACKGROUND = '#E9ECEF';
const INACTIVE_TAB_BORDER = '#DDE2E6';
const INACTIVE_ICON_TEXT_COLOR = '#4A4A4A';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerIcon: {
    fontSize: 32,
    marginRight: 15,
    color: ACTIVE_BLUE,
    transform: [{ rotate: '-20deg'}]
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
    flexShrink: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 10, // Overall padding for the tab bar
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,     // Slightly reduced vertical padding
    paddingHorizontal: 8,   // Reduced horizontal padding
    borderRadius: 18,       // Slightly smaller border radius
    marginRight: 6,         // Reduced margin between tabs
  },
  activeTabButton: {
    backgroundColor: ACTIVE_BLUE,
  },
  inactiveTabButton: {
    backgroundColor: INACTIVE_TAB_BACKGROUND,
    borderWidth: 1,
    borderColor: INACTIVE_TAB_BORDER,
  },
  tabIconBase: {
    fontSize: Platform.OS === 'ios' ? 15 : 13, // Slightly smaller icon
    marginRight: 5, // Reduced margin next to icon
  },
  tabTextBase: {
    fontSize: 12,         // Reduced font size
    fontWeight: '600',
    flexShrink: 1,        // Allow text to shrink if necessary
  },
  activeTabIconText: {
    color: '#FFFFFF',
  },
  inactiveTabIconText: {
    color: INACTIVE_ICON_TEXT_COLOR,
  },
  inactiveAnnouncementsIcon: {
    color: ACTIVE_BLUE,
  },
  inactiveSendMessageIcon: {
    color: '#555555',
  },
  inactiveMemosIcon: {
    color: '#FFA500',
  },
  contentListContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2.5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ACTIVE_BLUE,
    flex: 1,
    marginRight: 10,
  },
  cardDate: {
    fontSize: 12,
    color: '#777777',
  },
  cardMeta: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
  },
  formOuterContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  formInnerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    ...Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2.5,
        },
        android: {
            elevation: 3,
        },
    }),
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#444444',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#CED4DA',
    marginBottom: 15,
  },
  pickerContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CED4DA',
    marginBottom: 15,
    justifyContent: 'center',
  },
  picker: {
    height: Platform.OS === 'ios' ? undefined : 50,
    color: '#333',
    paddingVertical: Platform.OS === 'ios' ? 10 : 0,
  },
  textArea: {
    height: 120,
  },
  sendButton: {
    backgroundColor: ACTIVE_BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  sendButtonIcon: {
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    color: '#FFFFFF',
    marginRight: 10,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
    color: '#777',
  },
});

export default TeacherCL;