import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform, // For potential platform-specific styling if needed
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Using FontAwesome5

const { width } = Dimensions.get('window');
const studentId = ""; // Example student ID

// Mock data - replace with your actual data source
const resultsData = [
  {
    id: '1',
    examName: 'Half Yearly Exam',
    dateIssued: 'December 20, 2024',
    overallGrade: 'B+',
    teacherComments: 'Solid performance by Student in the Half Yearly exams. Shows good understanding in most subjects. Keep revising regularly.',
    reportUrl: 'path/to/half_yearly_report.pdf', // Placeholder
  },
  {
    id: '2',
    examName: 'Unit Test - 4',
    dateIssued: 'November 28, 2024',
    overallGrade: 'B',
    teacherComments: 'Student needs to focus on time management during tests. Social Studies concepts are clear.',
    reportUrl: 'path/to/unit_test_4_report.pdf',
  },
  {
    id: '3',
    examName: 'Unit Test - 3',
    dateIssued: 'October 30, 2024',
    overallGrade: 'A-',
    teacherComments: 'Good improvement in Mathematics by Student. English writing skills are commendable.',
    reportUrl: 'path/to/unit_test_3_report.pdf',
  },
  {
    id: '4',
    examName: 'Quarterly Exam',
    dateIssued: 'September 25, 2024',
    overallGrade: 'B+',
    teacherComments: 'Student performed well overall. Mathematics needs more attention, especially algebra.',
    reportUrl: 'path/to/quarterly_exam_report.pdf',
  },
];

const ReportCard = ({ report, onDownloadReport }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="file-alt" size={22} color="#4A90E2" style={styles.reportIcon} />
        <View>
          <Text style={styles.examName}>{report.examName}</Text>
          <Text style={styles.dateIssued}>Date Issued: {report.dateIssued}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Icon name="chart-line" size={16} color="#34A853" style={styles.detailIcon} />
        <Text style={styles.detailLabel}>Overall Grade: </Text>
        <Text style={styles.gradeValue}>{report.overallGrade}</Text>
      </View>

      <View style={styles.commentsSection}>
        <View style={styles.detailRow}>
          <Icon name="comment-dots" size={16} color="#5A67D8" style={styles.detailIcon} />
          <Text style={styles.detailLabel}>Teacher's Comments:</Text>
        </View>
        <View style={styles.commentsBox}>
          <Text style={styles.commentsText}>{report.teacherComments}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => onDownloadReport(report)}
      >
        <Icon name="download" size={16} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={styles.downloadButtonText}>Download Report</Text>
      </TouchableOpacity>
    </View>
  );
};

const StudentResults = () => {
  const handleDownloadReport = (report) => {
    // Implement actual download logic or linking to the report
    // For web, you might use Linking.openURL(report.reportUrl)
    // For native, you might use a library like react-native-fs to download and react-native-file-viewer to open
    alert(`Downloading report for ${report.examName}`);
    console.log("Report URL:", report.reportUrl);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.pageHeaderContainer}>
          <Icon name="chart-bar" size={30} color="#3B82F6" style={styles.pageHeaderIcon} />
          {/* Alternative icon: "poll" or "award" */}
          <View style={styles.pageHeaderTextContainer}>
            <Text style={styles.pageMainTitle}>
              Progress Reports for Student {studentId}
            </Text>
            <Text style={styles.pageSubTitle}>
              View and download term-wise progress reports.
            </Text>
          </View>
        </View>

        {resultsData.map(report => (
          <ReportCard key={report.id} report={report} onDownloadReport={handleDownloadReport} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FC', // A very light, almost white-blue
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
    color: '#2563EB', // A strong blue
  },
  pageHeaderTextContainer: {
    flex: 1,
  },
  pageMainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B', // Dark Slate Gray
    marginBottom: 4,
  },
  pageSubTitle: {
    fontSize: 14,
    color: '#64748B', // Slate Gray
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    // iOS Shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    // Android Shadow
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportIcon: {
    marginRight: 12,
    color: '#2563EB', // Matching blue
  },
  examName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B', // Dark Slate Gray
    marginBottom: 2,
  },
  dateIssued: {
    fontSize: 13,
    color: '#64748B', // Slate Gray
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
    width: 20, // Ensure consistent alignment
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#475569', // Slightly lighter Slate Gray
    fontWeight: '500',
  },
  gradeValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: 'bold',
  },
  commentsSection: {
    marginVertical: 8,
  },
  commentsBox: {
    backgroundColor: '#F8FAFC', // Very light gray, almost white
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Light border
  },
  commentsText: {
    fontSize: 14,
    color: '#334155', // Darker gray for comments
    lineHeight: 20,
  },
  downloadButton: {
    backgroundColor: '#2563EB', // Strong Blue
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonIcon: {
    marginRight: 10,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StudentResults;