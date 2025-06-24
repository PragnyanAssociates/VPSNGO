import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import TeacherAdminResultsScreen from './TeacherAdminResultsScreen';
import StudentResultsScreen from './StudentResultsScreen';

const ResultsScreen = ({ navigation }) => {
    const { user } = useAuth();

    if (!user) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    if (user.role === 'student') {
        return <StudentResultsScreen navigation={navigation} />;
    } else if (user.role === 'teacher' || user.role === 'admin') {
        return <TeacherAdminResultsScreen navigation={navigation} />;
    }

    return null;
};

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ResultsScreen;