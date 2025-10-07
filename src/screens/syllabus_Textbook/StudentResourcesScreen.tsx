import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Alert, Linking, FlatList, Image, SafeAreaView
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../api/client';

const StudentResourcesScreen = () => {
    const [view, setView] = useState('CLASS_LIST'); // CLASS_LIST, OPTIONS, SUBJECTS
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [availableClasses, setAvailableClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [subjects, setSubjects] = useState([]);

    const fetchAvailableClasses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/resources/classes');
            setAvailableClasses(response.data);
        } catch (e) {
            setError("Could not load available classes.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAvailableClasses();
    }, [fetchAvailableClasses]);

    const handleClassPress = (classGroup) => {
        setSelectedClass(classGroup);
        setView('OPTIONS');
    };

    const handleSyllabusPress = async () => {
        if (!selectedClass) return;
        setIsLoading(true);
        try {
            const response = await apiClient.get(`/resources/syllabus/class/${selectedClass}`);
            setSubjects(response.data);
            setView('SUBJECTS');
        } catch (e) {
            Alert.alert("Not Found", "Syllabus has not been published for this class yet.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextbookPress = async () => {
        if (!selectedClass) return;
        try {
            const response = await apiClient.get(`/resources/textbook/class/${selectedClass}`);
            handleLinkPress(response.data.url, 'textbook');
        } catch (e) {
            Alert.alert("Not Found", "Textbook link has not been published for this class.");
        }
    };
    
    const handleLinkPress = async (url, type) => {
        if (!url) {
            Alert.alert("Not Available", `The link for this ${type} has not been provided yet.`);
            return;
        }
        if (await Linking.canOpenURL(url)) {
            await Linking.openURL(url);
        } else {
            Alert.alert("Error", `Could not open the ${type} link.`);
        }
    };

    const goBack = (targetView) => {
        setView(targetView);
        if (targetView === 'CLASS_LIST') {
            setSelectedClass(null);
        }
    };

    if (isLoading && view === 'CLASS_LIST') {
        return <ActivityIndicator size="large" color="#008080" style={styles.loader} />;
    }

    if (error) {
        return (
            <View style={styles.centeredContainer}>
                <MaterialIcons name="error-outline" size={30} color="#757575" />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }
    
    // --- Render Logic ---
    if (view === 'SUBJECTS') {
         return (
            <SafeAreaView style={styles.container}>
                <TouchableOpacity onPress={() => goBack('OPTIONS')} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.mainHeaderText}>Syllabus - {selectedClass}</Text>
                <FlatList
                    data={subjects}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.gridItem} onPress={() => handleLinkPress(item.url, 'syllabus')}>
                            <Image 
                                source={{ uri: item.cover_image_url || 'https://via.placeholder.com/150/DCDCDC/808080?text=No+Image' }} 
                                style={styles.coverImage} 
                            />
                            <Text style={styles.gridText}>{item.subject_name}</Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.gridContainer}
                    ListEmptyComponent={<Text style={styles.errorText}>No syllabus found for this class.</Text>}
                />
            </SafeAreaView>
        );
    }

    if (view === 'OPTIONS') {
        return (
            <View style={styles.container}>
                 <TouchableOpacity onPress={() => goBack('CLASS_LIST')} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                    <Text style={styles.backButtonText}>Change Class</Text>
                </TouchableOpacity>
                <View style={styles.centeredContainer}>
                    <Text style={styles.mainHeaderText}>{selectedClass} Resources</Text>
                    <TouchableOpacity style={styles.optionCard} onPress={handleSyllabusPress}>
                        <MaterialIcons name="menu-book" size={50} color="#008080" />
                        <Text style={styles.optionText}>Academic Syllabus</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionCard} onPress={handleTextbookPress}>
                        <MaterialIcons name="launch" size={50} color="#008080" />
                        <Text style={styles.optionText}>Textbooks</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Default view: CLASS_LIST
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.mainHeaderText}>Select a Class</Text>
            <FlatList
                data={availableClasses}
                keyExtractor={(item) => item}
                numColumns={3}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.classGridItem} onPress={() => handleClassPress(item)}>
                        <Text style={styles.classGridText}>{item.replace('Class ', '')}</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.gridContainer}
                ListEmptyComponent={<Text style={styles.errorText}>No resources have been published yet.</Text>}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAvailableClasses} />}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loader: { flex: 1, justifyContent: 'center' },
    errorText: { marginTop: 20, textAlign: 'center', fontSize: 16, color: '#757575' },
    mainHeaderText: { fontSize: 22, fontWeight: 'bold', color: '#263238', paddingHorizontal: 15, marginBottom: 10, textAlign: 'center' },
    backButton: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    backButtonText: { marginLeft: 5, fontSize: 18, color: '#333', fontWeight: '500' },
    optionCard: { width: '80%', paddingVertical: 20, paddingHorizontal: 10, marginVertical: 15, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', elevation: 3 },
    optionText: { fontSize: 18, fontWeight: 'bold', color: '#37474f', marginTop: 15, textAlign: 'center' },
    gridContainer: { padding: 5 },
    classGridItem: { flex: 1, margin: 8, height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, elevation: 3 },
    classGridText: { fontSize: 20, fontWeight: 'bold', color: '#008080' },
    gridItem: { flex: 1, margin: 10, backgroundColor: '#fff', borderRadius: 10, elevation: 3, alignItems: 'center', paddingBottom: 15 },
    coverImage: { width: '100%', height: 120, borderTopLeftRadius: 10, borderTopRightRadius: 10, resizeMode: 'cover', backgroundColor: '#e0e0e0' },
    gridText: { fontSize: 16, fontWeight: '600', color: '#37474f', marginTop: 10, paddingHorizontal: 5, textAlign: 'center' },
});

export default StudentResourcesScreen;