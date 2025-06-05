import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const StudentHelpdesk = () => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to Account Settings > Change Password.',
    },
    {
      question: 'Where can I find my exam schedule?',
      answer: 'Check the Exams tab in your dashboard.',
    },
    {
      question: 'Who do I contact for technical issues with the portal?',
      answer: 'Reach out via this Help Desk or email support@university.edu.',
    },
  ];

  const toggleFAQ = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleSubmit = () => {
    if (subject && description) {
      alert('Query submitted successfully!');
      setSubject('');
      setDescription('');
    } else {
      alert('Please fill out both fields before submitting.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="chatbox-ellipses-outline" size={24} color="#0d9488" />
        <Text style={styles.title}>Help Desk & Support for Student</Text>
      </View>
      <Text style={styles.subtitle}>Find answers or submit your queries.</Text>

      {/* FAQs */}
      <Text style={styles.sectionTitle}>Frequently Asked Questions (FAQs)</Text>
      {faqs.map((faq, index) => (
        <TouchableOpacity
          key={index}
          style={styles.faqBox}
          onPress={() => toggleFAQ(index)}
        >
          <View style={styles.faqHeader}>
            <Text style={styles.faqQuestion}>{faq.question}</Text>
            <Icon
              name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#007bff"
            />
          </View>
          {expandedIndex === index && (
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          )}
        </TouchableOpacity>
      ))}

      {/* Query Submission */}
      <Text style={styles.sectionTitle}>Submit a Query</Text>

      <Text style={styles.label}>Subject</Text>
      <TextInput
        placeholder="e.g., Issue with assignment submission"
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
      />

      <Text style={styles.label}>Describe your issue</Text>
      <TextInput
        placeholder="Please provide as much detail as possible..."
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <FontAwesome name="paper-plane" size={16} color="#fff" />
        <Text style={styles.submitText}>Submit Query</Text>
      </TouchableOpacity>
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
    gap: 10,
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    color: '#000',
  },
  subtitle: {
    color: '#666',
    fontSize: 13,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  faqBox: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  faqAnswer: {
    marginTop: 8,
    fontSize: 13,
    color: '#374151',
  },
  label: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default StudentHelpdesk;
