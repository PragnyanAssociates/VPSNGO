import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Alert, Linking
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const StudentResourcesScreen = () => {
    const { user } = useAuth();
    const [view, setView] = useState('options'); // options, subjects, content
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [subjects, setSubjects] = useState([]);
    const [selectedSyllabus, setSelectedSyllabus] = useState(null);

    const fetchData = useCallback(async () => {
        if (!user?.class_group) {
            setError("You are not assigned to a class.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const subjectsResponse = await apiClient.get(`/resources/syllabus/class/${user.class_group}`);
            setSubjects(subjectsResponse.data);
        } catch (e) {
            setError("Syllabus not published for your class yet.");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTextbookPress = async () => {
        try {
            const response = await apiClient.get(`/resources/textbook/class/${user.class_group}`);
            const url = response.data.url;
            if (await Linking.canOpenURL(url)) {
                await Linking.openURL(url);
            }
        } catch (e) {
            Alert.alert("Not Found", "Textbook link has not been published for your class.");
        }
    };
    
    const viewSyllabusContent = async (subject) => {
        setIsLoading(true);
        try {
            const response = await apiClient.get(`/resources/syllabus/content/${subject.id}`);
            setSelectedSyllabus(response.data);
            setView('content');
        } catch (e) {
            Alert.alert("Error", "Could not fetch syllabus content.");
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoading) return <ActivityIndicator size="large" color="#008080" style={styles.loader} />;
    
    if (error) {
        return (
            <View style={styles.centeredContainer}>
                <MaterialIcons name="error-outline" size={30} color="#757575" />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (view === 'content') {
        return (
            <ScrollView style={styles.container}>
                 <TouchableOpacity onPress={() => setView('subjects')} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                    <Text style={styles.backButtonText}>{selectedSyllabus.subject_name}</Text>
                </TouchableOpacity>
                <View style={styles.contentView}>
                    <Text style={styles.contentText}>{selectedSyllabus.content}</Text>
                </View>
            </ScrollView>
        );
    }

    if (view === 'subjects') {
        return (
            <ScrollView 
                style={styles.container}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} />}
            >
                <TouchableOpacity onPress={() => setView('options')} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.mainHeaderText}>Syllabus - {user.class_group}</Text>
                {subjects.map(subject => (
                    <TouchableOpacity key={subject.id} style={styles.listItem} onPress={() => viewSyllabusContent(subject)}>
                        <Text style={styles.listItemText}>{subject.subject_name}</Text>
                        <MaterialIcons name="chevron-right" size={24} color="#757575" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    }
    
    // Default view: options
    return (
        <View style={styles.centeredContainer}>
            <TouchableOpacity style={styles.optionCard} onPress={() => setView('subjects')}>
                <MaterialIcons name="menu-book" size={50} color="#008080" />
                <Text style={styles.optionText}>Academic Syllabus</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionCard} onPress={handleTextbookPress}>
                <MaterialIcons name="launch" size={50} color="#008080" />
                <Text style={styles.optionText}>Textbooks</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' },
    loader: { flex: 1, justifyContent: 'center' },
    errorText: { marginTop: 10, fontSize: 16, color: '#757575' },
    mainHeaderText: { fontSize: 22, fontWeight: 'bold', color: '#263238', paddingHorizontal: 15, marginBottom: 10 },
    backButton: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    backButtonText: { marginLeft: 5, fontSize: 18, color: '#333', fontWeight: '500' },
    optionCard: { width: '80%', padding: 30, marginVertical: 15, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', elevation: 3 },
    optionText: { fontSize: 18, fontWeight: 'bold', color: '#37474f', marginTop: 15 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, marginHorizontal: 15, marginVertical: 6, borderRadius: 8, elevation: 1 },
    listItemText: { fontSize: 16, color: '#37474f' },
    contentView: { padding: 20 },
    contentText: { fontSize: 16, lineHeight: 24, color: '#444' },
});

export default StudentResourcesScreen;