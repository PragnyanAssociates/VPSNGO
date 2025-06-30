// 📂 File: src/screens/gallery/GalleryScreen.tsx (REWRITTEN FOR ALBUMS - COMPLETE)

import React, { useState, useEffect, FC } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image, Dimensions,
    TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput,
    Button, Platform, SafeAreaView
} from 'react-native';
import { TabView, SceneMap, TabBar, Route } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext'; 
import { API_BASE_URL } from '../../../apiConfig'; 

// --- Type Definitions ---
type GalleryItemType = {
    id: number;
    title: string;
    event_date: string;
    file_path: string;
    file_type: 'photo' | 'video';
    uploader_name: string;
};

type AlbumSection = {
    title: string;
    date: string;
    items: GalleryItemType[];
};

type RootStackParamList = {
    AlbumDetail: { title: string; items: GalleryItemType[] };
};
type GalleryScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

// --- AlbumCover Component ---
const AlbumCover: FC<{ section: AlbumSection, onPress: () => void }> = ({ section, onPress }) => {
    const coverItem = section.items.find(item => item.file_type === 'photo') || section.items[0];
    if (!coverItem) return null;

    return (
        <TouchableOpacity style={styles.albumContainer} onPress={onPress}>
            <Image
                source={{ uri: `${API_BASE_URL}/${coverItem.file_path}` }}
                style={styles.albumImage}
            />
            <View style={styles.albumInfo}>
                <Text style={styles.albumTitle} numberOfLines={1}>{section.title}</Text>
                <Text style={styles.albumDate}>{new Date(section.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                <Text style={styles.albumCount}>{section.items.length} items</Text>
            </View>
        </TouchableOpacity>
    );
};

const GalleryScreen: FC = () => {
    const { user } = useAuth(); 
    const navigation = useNavigation<GalleryScreenNavigationProp>();
    const isAdmin = user?.role === 'admin';

    const [index, setIndex] = useState<number>(0);
    const [routes] = useState<Route[]>([
        { key: 'photos', title: 'Photos' },
        { key: 'videos', title: 'Videos' },
    ]);
    
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
            const key = item.title;
            if (!acc[key]) {
                acc[key] = { title: item.title, date: item.event_date, items: [] };
            }
            acc[key].items.push(item);
            return acc;
        }, {} as Record<string, AlbumSection>);
        return Object.values(grouped).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const fetchData = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await axios.get<GalleryItemType[]>(`${API_BASE_URL}/api/gallery`);
            const allItems = response.data;
            const allAlbums = groupDataByTitle(allItems);
            setPhotoAlbums(allAlbums.filter(album => album.items.some(item => item.file_type === 'photo')));
            setVideoAlbums(allAlbums.filter(album => album.items.some(item => item.file_type === 'video')));
        } catch (error) { 
            console.error('Failed to fetch gallery items:', error); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAlbumPress = (section: AlbumSection) => {
        navigation.navigate('AlbumDetail', { title: section.title, items: section.items });
    };

    const handleOpenUploadModal = (): void => {
        setTitle('');
        setEventDate(new Date());
        setMediaAsset(null);
        setUploadModalVisible(true);
    };

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
        formData.append('media', { uri: mediaAsset.uri, type: mediaAsset.type, name: mediaAsset.fileName || `media-${Date.now()}` } as any);
        try {
            await axios.post(`${API_BASE_URL}/api/gallery/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            Alert.alert('Success', 'Media uploaded!');
            setUploadModalVisible(false);
            fetchData();
        } catch (error) {
            Alert.alert('Error', 'An error occurred while uploading.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => { 
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) setEventDate(selectedDate);
    };

    const renderScene = SceneMap({
        photos: () => (
            <FlatList
                data={photoAlbums}
                keyExtractor={(item) => item.title}
                numColumns={1}
                renderItem={({ item }) => <AlbumCover section={item} onPress={() => handleAlbumPress(item)} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No photo albums found.</Text>}
                contentContainerStyle={styles.listContainer}
                onRefresh={fetchData}
                refreshing={loading}
            />
        ),
        videos: () => (
            <FlatList
                data={videoAlbums}
                keyExtractor={(item) => item.title}
                numColumns={1}
                renderItem={({ item }) => <AlbumCover section={item} onPress={() => handleAlbumPress(item)} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No video albums found.</Text>}
                contentContainerStyle={styles.listContainer}
                onRefresh={fetchData}
                refreshing={loading}
            />
        ),
    });

    return (
        <SafeAreaView style={styles.container}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width }}
                renderTabBar={props =>
                    <TabBar {...props} indicatorStyle={{ backgroundColor: '#6200EE' }} style={{ backgroundColor: 'white' }} labelStyle={{ fontWeight: '600' }} activeColor={'#6200EE'} inactiveColor={'gray'} />
                }
            />
            {isAdmin && ( <TouchableOpacity style={styles.fab} onPress={handleOpenUploadModal}><Text style={styles.fabText}>+</Text></TouchableOpacity> )}
            
            <Modal visible={isUploadModalVisible} transparent={true} animationType="slide" onRequestClose={() => setUploadModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Upload New Media</Text>
                        <TextInput style={styles.input} placeholder="Event Name / Title" value={title} onChangeText={setTitle} />
                        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}><Text>Event Date: {eventDate.toLocaleDateString()}</Text></TouchableOpacity>
                        {showDatePicker && (<DateTimePicker value={eventDate} mode="date" display="default" onChange={onDateChange} />)}
                        <View style={styles.selectButton}><Button title={mediaAsset ? "1 File Selected" : "Select Photo/Video"} onPress={() => launchImageLibrary({ mediaType: 'mixed' }, r => r.assets && setMediaAsset(r.assets[0]))} color="#6200EE" />{mediaAsset?.fileName && <Text style={styles.fileName}>{mediaAsset.fileName}</Text>}</View>
                        <View style={styles.modalActions}><Button title="Cancel" onPress={() => setUploadModalVisible(false)} color="gray" /><View style={{ width: 20 }} /><Button title={isSubmitting ? "Submitting..." : 'Upload'} onPress={handleUpload} disabled={isSubmitting} /></View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f4' },
    listContainer: { padding: 12 },
    emptyText: { textAlign: 'center', marginTop: 50, color: 'gray' },
    albumContainer: { width: '100%', marginBottom: 16, borderRadius: 12, backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    albumImage: { width: '100%', height: 180, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
    albumInfo: { paddingVertical: 12, paddingHorizontal: 16 },
    albumTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    albumDate: { fontSize: 13, color: '#666', marginTop: 2 },
    albumCount: { fontSize: 13, color: '#666', marginTop: 4 },
    fab: { position: 'absolute', right: 25, bottom: 25, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6200EE', justifyContent: 'center', alignItems: 'center', elevation: 8 },
    fabText: { fontSize: 30, color: 'white', lineHeight: 32 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 15 },
    datePickerButton: { width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 15 },
    selectButton: { width: '100%', marginBottom: 20 },
    fileName: { fontSize: 12, color: 'gray', textAlign: 'center', marginTop: 5 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', marginTop: 20 },
});

export default GalleryScreen;