import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import StudentSyllabusNavigator from './StudentSyllabusScreen'; // ✅ EDITED: Renamed for clarity
import TeacherSyllabusNavigator from './TeacherSyllabusScreen'; // ✅ EDITED: Renamed for clarity
import AdminSyllabusScreen from './AdminSyllabusScreen';

const SyllabusScreen = ({ navigation }) => {
    const { user } = useAuth();
    if (!user) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    if (user.role === 'student') return <StudentSyllabusNavigator navigation={navigation} />;
    if (user.role === 'teacher') return <TeacherSyllabusNavigator navigation={navigation} />;
    if (user.role === 'admin') return <AdminSyllabusScreen navigation={navigation} />;
    return null;
};
const styles = StyleSheet.create({ centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }});
export default SyllabusScreen;