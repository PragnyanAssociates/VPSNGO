import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import TeacherAdminMaterialsScreen from './TeacherAdminMaterialsScreen';
import StudentMaterialsScreen from './StudentMaterialsScreen';

const StudyMaterialsScreen = ({ navigation }) => {
    const { user } = useAuth();

    if (!user) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (user.role === 'student') {
        return <StudentMaterialsScreen navigation={navigation} />;
    } else if (user.role === 'teacher' || user.role === 'admin') {
        return <TeacherAdminMaterialsScreen navigation={navigation} />;
    }

    return null; // Or a default screen for other roles
};

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default StudyMaterialsScreen;