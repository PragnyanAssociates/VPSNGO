// 📂 File: src/screens/gallery/GalleryScreen.tsx (FINAL, CORRECTED VERSION)

import React, { useState, useEffect, FC, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image, Dimensions,
    TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput,
    Button, Platform, SafeAreaView
} from 'react-native';
import { TabView, SceneMap, TabBar, Route } from 'react-native-tab-view';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext'; 
// ★★★ 1. CORRECT IMPORTS ★★★
import apiClient from '../../api/client';
import { SERVER_URL } from '../../../apiConfig';

// --- Type Definitions ---
type GalleryItemType = { id: number; title: string; event_date: string; file_path: string; file_type: 'photo' | 'video'; uploader_name: string; };
type AlbumSection = { title: string; date: string; items: GalleryItemType[]; };
type RootStackParamList = { AlbumDetail: { title: string; items: GalleryItemType[] }; };
type GalleryScreenNavigationProp = StackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

const AlbumCover: FC<{ 
    section: AlbumSection, 
    onPress: () => void,
    onDelete: () => void,
    isAdmin: boolean
}> = ({ section, onPress, onDelete, isAdmin }) => {
    const coverItem = section.items.find(item => item.file_type === 'photo') || section.items[0];
    if (!coverItem) return null;

    return (
        <TouchableOpacity style={styles.albumContainer} onPress={onPress}>
            {/* ★★★ 2. CORRECT IMAGE URL CONSTRUCTION ★★★ */}
            <Image
                source={{ uri: `${SERVER_URL}${coverItem.file_path}` }}
                style={styles.albumImage}
            />
            <View style={styles.albumInfo}>
                <Text style={styles.albumTitle} numberOfLines={1}>{section.title}</Text>
                <Text style={styles.albumDate}>{new Date(section.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                <Text style={styles.albumCount}>{section.items.length} items</Text>
            </View>
            <View style={styles.iconContainer}>
                {isAdmin && (
                    <TouchableOpacity style={[styles.iconButton, styles.deleteButton]} onPress={(e) => { e.stopPropagation(); onDelete(); }}>
                        <Icon name="trash" size={20} color="white" />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const GalleryScreen: FC = () => {
    const { user } = useAuth(); 
    const navigation = useNavigation<GalleryScreenNavigationProp>();
    const isAdmin = user?.role === 'admin';
    const [index, setIndex] = useState<number>(0);
    const [routes] = useState<Route[]>([ { key: 'photos', title: 'Photos' }, { key: 'videos', title: 'Videos' } ]);
    const [photoAlbums, setPhotoAlbums] = useState<AlbumSection[]>([]);
    const [videoAlbums, setVideoAlbums] = useState<AlbumSection[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isUploadModalVisible, setUploadModalVisible] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('');
    const [eventDate, setEventDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [mediaAsset, setMediaAsset] = useState<Asset | null>(null);

    const groupDataByTitle = (data: GalleryItemType[]): AlbumSection[] => {
        if (!data) return [];
        const grouped = data.reduce((acc, item) => {
            if (!acc[item.title]) { acc[item.title] = { title: item.title, date: item.event_date, items: [] }; }
            acc[item.title].items.push(item);
            return acc;
        }, {} as Record<string, AlbumSection>);
        return Object.values(grouped).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const fetchData = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            // ★★★ 3. USE apiClient FOR ALL DATA OPERATIONS ★★★
            const response = await apiClient.get<GalleryItemType[]>('/gallery');
            const allItems = response.data;
            const allAlbums = groupDataByTitle(allItems);
            const photoData = allAlbums.filter(album => album.items.some(item => item.file_type === 'photo'));
            const videoData = allAlbums.filter(album => album.items.some(item => item.file_type === 'video'));
            setPhotoAlbums(photoData);
            setVideoAlbums(videoData);
        } catch (error: any) { 
            Alert.alert("Error", error.response?.data?.message || "Failed to load gallery items.");
        } finally { 
            setLoading(false); 
        }
    }, []);

    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

    const handleAlbumPress = (section: AlbumSection) => navigation.navigate('AlbumDetail', { title: section.title, items: section.items });

    const handleDeleteAlbum = (albumTitle: string) => {
        Alert.alert("Delete Album", `Are you sure you want to permanently delete the "${albumTitle}"?`,
            [ { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive",
                onPress: async () => {
                    try {
                        await apiClient.delete('/gallery/album', { data: { title: albumTitle, role: user?.role } });
                        Alert.alert("Success", `Album "${albumTitle}" has been deleted.`);
                        fetchData();
                    } catch (error: any) {
                        Alert.alert("Error", error.response?.data?.message || "Could not delete album.");
                    }
                },
              },
            ]
        );
    };

    const handleOpenUploadModal = (): void => { setTitle(''); setEventDate(new Date()); setMediaAsset(null); setUploadModalVisible(true); };

    const handleUpload = async (): Promise<void> => { 
        if (!user || !title.trim() || !eventDate || !mediaAsset) {
            Alert.alert('Validation Error', 'All fields and a media file are required.'); 
            return; 
        }
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('event_date', eventDate.toISOString().split('T')[0]);
        formData.append('role', user.role);
        formData.append('adminId', String(user.id));
        formData.append('media', { uri: mediaAsset.uri, type: mediaAsset.type, name: mediaAsset.fileName || `media-${Date.now()}` });
        try {
            await apiClient.post('/gallery/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            Alert.alert('Success', 'Media uploaded!');
            setUploadModalVisible(false);
            fetchData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'An error occurred while uploading.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => { 
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) setEventDate(selectedDate);
    };

    const renderScene = SceneMap({
        photos: () => (<FlatList data={photoAlbums} keyExtractor={(item) => item.title} renderItem={({ item }) => ( <AlbumCover section={item} onPress={() => handleAlbumPress(item)} onDelete={() => handleDeleteAlbum(item.title)} isAdmin={isAdmin} /> )} ListEmptyComponent={<Text style={styles.emptyText}>No photo albums found.</Text>} contentContainerStyle={styles.listContainer} onRefresh={fetchData} refreshing={loading} />),
        videos: () => (<FlatList data={videoAlbums} keyExtractor={(item) => item.title} renderItem={({ item }) => ( <AlbumCover section={item} onPress={() => handleAlbumPress(item)} onDelete={() => handleDeleteAlbum(item.title)} isAdmin={isAdmin} /> )} ListEmptyComponent={<Text style={styles.emptyText}>No video albums found.</Text>} contentContainerStyle={styles.listContainer} onRefresh={fetchData} refreshing={loading} />),
    });

    return (
        <SafeAreaView style={styles.container}>
            <TabView navigationState={{ index, routes }} renderScene={renderScene} onIndexChange={setIndex} initialLayout={{ width }} renderTabBar={props => <TabBar {...props} indicatorStyle={{ backgroundColor: '#6200EE' }} style={{ backgroundColor: 'white' }} labelStyle={{ fontWeight: '600' }} activeColor={'#6200EE'} inactiveColor={'gray'} />} />
            {isAdmin && ( <TouchableOpacity style={styles.fab} onPress={handleOpenUploadModal}><Text style={styles.fabText}>+</Text></TouchableOpacity> )}
            <Modal visible={isUploadModalVisible} transparent={true} animationType="slide" onRequestClose={() => setUploadModalVisible(false)}>
                 <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Create New Album</Text>
                        <TextInput style={styles.input} placeholder="Album Title" value={title} onChangeText={setTitle} />
                        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}><Text>Event Date: {eventDate.toLocaleDateString()}</Text></TouchableOpacity>
                        {showDatePicker && (<DateTimePicker value={eventDate} mode="date" display="default" onChange={onDateChange} />)}
                        <View style={styles.selectButton}><Button title={mediaAsset ? "1 File Selected" : "Select Cover Photo/Video"} onPress={() => launchImageLibrary({ mediaType: 'mixed' }, r => r.assets && setMediaAsset(r.assets[0]))} color="#6200EE" />{mediaAsset?.fileName && <Text style={styles.fileName}>{mediaAsset.fileName}</Text>}</View>
                        <View style={styles.modalActions}><Button title="Cancel" onPress={() => setUploadModalVisible(false)} color="gray" /><View style={{ width: 20 }} /><Button title={isSubmitting ? "Uploading..." : 'Upload'} onPress={handleUpload} disabled={isSubmitting} /></View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f4f4f4' }, listContainer: { padding: 12 }, emptyText: { textAlign: 'center', marginTop: 50, color: 'gray' }, albumContainer: { width: '100%', marginBottom: 16, borderRadius: 12, backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, albumImage: { width: '100%', height: 180, borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: '#e0e0e0' }, albumInfo: { padding: 16 }, albumTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' }, albumDate: { fontSize: 13, color: '#666', marginTop: 2 }, albumCount: { fontSize: 13, color: '#666', marginTop: 4 }, iconContainer: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', zIndex: 1 }, iconButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 10, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2 }, deleteButton: { backgroundColor: '#d32f2f' }, fab: { position: 'absolute', right: 25, bottom: 25, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6200EE', justifyContent: 'center', alignItems: 'center', elevation: 8 }, fabText: { fontSize: 30, color: 'white', lineHeight: 32 }, modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }, modalView: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 }, modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 }, input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 15 }, datePickerButton: { width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 15 }, selectButton: { width: '100%', marginBottom: 20 }, fileName: { fontSize: 12, color: 'gray', textAlign: 'center', marginTop: 5 }, modalActions: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', marginTop: 20 } });
export default GalleryScreen;