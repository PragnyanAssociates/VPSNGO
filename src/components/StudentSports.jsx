import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const activities = [
  {
    title: "Basketball (Junior Team)",
    team: "Eagles",
    coach: "Mr. Jordan",
    schedule: "Mon, Wed, Fri: 04:00 PM - 05:30 PM",
    achievements: [
      "Runners-up - Inter-School Tournament 2023",
      "Best Defensive Player: Student",
    ],
  },
  {
    title: "Swimming Club",
    coach: "Ms. Phelps",
    schedule: "Tue, Thu: 07:00 AM - 08:00 AM",
    achievements: ["Participated in District Level Meet"],
  },
  {
    title: "Chess Club",
    coach: "Mr. Fischer",
    schedule: "Friday: 03:30 PM - 04:30 PM (Library)",
    achievements: ["School Champion 2024"],
  },
];

const upcomingEvents = [
  {
    title: "Cricket (Junior Team)",
    team: "Sunrisers",
    coach: "Mr. Victory",
    schedule: "Mon, Wed, Fri: 04:00 PM - 05:30 PM",
    achievements: [
      "Runners-up - Inter-School Tournament 2023",
      "Best Defensive Player: Student",
    ],
  },
];

const StudentSports = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          <FontAwesome5 name="shield-alt" size={20} color="#ffffff" /> Sports & Activities for Student{" "}
          <Text style={styles.bold}></Text>
        </Text>
        <Text style={styles.subText}>
          Track your club participation, match schedules & achievements.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>🎯 Registered Activities</Text>
      {activities.map((activity, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>
            <FontAwesome5 name="basketball-ball" size={16} color="#f97316" /> {activity.title}
          </Text>
          {activity.team && <Text style={styles.metaText}>Team: {activity.team}</Text>}
          <Text style={styles.detail}>
            <FontAwesome5 name="user" size={14} color="#4b5563" /> Coach: {activity.coach}
          </Text>
          <Text style={styles.detail}>
            <FontAwesome5 name="calendar-alt" size={14} color="#4b5563" /> Schedule: {activity.schedule}
          </Text>
          <Text style={styles.achieveLabel}>
            <FontAwesome5 name="trophy" size={14} color="#d97706" /> Achievements:
          </Text>
          {activity.achievements.map((ach, i) => (
            <Text key={i} style={styles.achievement}>
              • {ach}
            </Text>
          ))}
        </View>
      ))}

      <Text style={styles.sectionTitle}>📅 Upcoming Sports Events</Text>
      {upcomingEvents.map((event, index) => (
        <View key={index} style={styles.cardUpcoming}>
          <Text style={styles.cardTitle}>
            <FontAwesome5 name="calendar-check" size={16} color="#3b82f6" /> {event.title}
          </Text>
          {event.team && <Text style={styles.metaText}>Team: {event.team}</Text>}
          <Text style={styles.detail}>
            <FontAwesome5 name="user" size={14} color="#4b5563" /> Coach: {event.coach}
          </Text>
          <Text style={styles.detail}>
            <FontAwesome5 name="clock" size={14} color="#4b5563" /> Schedule: {event.schedule}
          </Text>
          <Text style={styles.achieveLabel}>
            <FontAwesome5 name="medal" size={14} color="#d97706" /> Highlights:
          </Text>
          {event.achievements.map((ach, i) => (
            <Text key={i} style={styles.achievement}>
              • {ach}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0fdf4",
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    backgroundColor: "#15803d",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 6,
  },
  bold: {
    fontWeight: "bold",
    color: "#fffacd",
  },
  subText: {
    color: "#ecfdf5",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#065f46",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#d1fae5",
    elevation: 2,
  },
  cardUpcoming: {
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 2,
  },
  achieveLabel: {
    marginTop: 8,
    fontWeight: "600",
    color: "#b45309",
  },
  achievement: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 10,
  },
});

export default StudentSports;
