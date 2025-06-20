import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import TeacherAdminExamsScreen from './TeacherAdminExamsScreen';
import StudentExamsScreen from './StudentExamsScreen';

const ExamsScreen = ({ navigation }) => {
    const { user } = useAuth();

    if (!user) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
    }

    if (user.role === 'student') {
        return <StudentExamsScreen navigation={navigation} />;
    } else if (user.role === 'teacher' || user.role === 'admin') {
        return <TeacherAdminExamsScreen navigation={navigation} />;
    }

    return null; // Or a default screen
};

export default ExamsScreen;