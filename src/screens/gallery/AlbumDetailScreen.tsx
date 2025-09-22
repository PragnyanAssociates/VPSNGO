// 📂 File: src/screens/gallery/AlbumDetailScreen.tsx (FINAL, CORRECTED VERSION)

import React, { useState, useEffect, FC } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image, Dimensions,
    TouchableOpacity, Modal, SafeAreaView, Alert, ActivityIndicator,
    PermissionsAndroid, Platform
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFetchBlob from 'rn-fetch-blob';
// ★★★ 1. CORRECT IMPORTS ★★★
import apiClient from '../../api/client';
import { SERVER_URL } from '../../../apiConfig';
import { useAuth } from '../../context/AuthContext';

// --- Type Definitions ---
type GalleryItemType = { id: number; title: string; event_date: string; file_path: string; file_type: 'photo' | 'video'; };
type RootStackParamList = { AlbumDetail: { title: string; items: GalleryItemType[]; }; };
type AlbumDetailScreenRouteProp = RouteProp<RootStackParamList, 'AlbumDetail'>;

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 4;
const NUM_COLUMNS = 3;
const imageSize = (width - (ITEM_MARGIN * (NUM_COLUMNS + 1))) / NUM_COLUMNS;

const handleDownloadItem = async (item: GalleryItemType) => {
    if (!item) return;
    // ★★★ 2. CORRECT URL CONSTRUCTION ★★★
    const url = `${SERVER_URL}${item.file_path}`;
    const fileName = item.file_path.split('/').pop() || `gallery-item-${Date.now()}`;

    if (Platform.OS === 'android') {
        try {
            const permission = Platform.Version >= 33 
                ? item.file_type === 'video' ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO : PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
            const granted = await PermissionsAndroid.request(permission, { title: 'Storage Permission Required', message: 'App needs access to your storage to download this file.', buttonPositive: 'OK' });
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) { Alert.alert('Permission Denied', 'Storage permission is required to download files.'); return; }
        } catch (err) { console.warn(err); return; }
    }
    downloadFile(url, fileName);
};

const downloadFile = (url: string, fileName: string) => {
    const { dirs } = RNFetchBlob.fs;
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    let downloadPath = '';
    if (Platform.OS === 'ios') { downloadPath = dirs.DocumentDir + `/${fileName}`; } 
    else { const pathDir = (fileExt === 'mp4' || fileExt === 'mov' || fileExt === 'mkv') ? dirs.MovieDir : dirs.PictureDir; downloadPath = `${pathDir}/${fileName}`; }
    Alert.alert('Starting Download', `Downloading "${fileName}"...`);
    RNFetchBlob.config({ path: downloadPath, fileCache: true, addAndroidDownloads: { useDownloadManager: true, notification: true, path: downloadPath, description: 'Downloading media file.', title: fileName } })
    .fetch('GET', url)
    .then((res) => {
        if (Platform.OS === 'ios') { RNFetchBlob.ios.saveToCameraRoll(res.path()).then(() => { Alert.alert('Success', `"${fileName}" saved to Photos.`); RNFetchBlob.fs.unlink(res.path()); }).catch(() => Alert.alert('Save Error', 'Could not save to Photos.')); } 
        else { Alert.alert('Success', `"${fileName}" saved to your device.`); RNFetchBlob.fs.scanFile(res.path()); }
    }).catch((error) => { console.error(error); Alert.alert('Download Failed', 'An error occurred while downloading.'); });
};

const AlbumDetailScreen: FC = () => {
    const route = useRoute<AlbumDetailScreenRouteProp>();
    const navigation = useNavigation();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [albumItems, setAlbumItems] = useState<GalleryItemType[]>(route.params.items);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
    const [isVideoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);

    useEffect(() => { navigation.setOptions({ title: route.params.title }); }, [navigation, route.params.title]);

    const handleItemPress = (item: GalleryItemType) => {
        if (item.file_type === 'photo') { setSelectedImageUri(`${SERVER_URL}${item.file_path}`); setImageModalVisible(true); } 
        else { setSelectedVideoUri(`${SERVER_URL}${item.file_path}`); setVideoModalVisible(true); }
    };

    const confirmDeleteItem = (itemToDelete: GalleryItemType) => {
        Alert.alert("Delete Item", "Are you sure you want to delete this item permanently?",
            [ { text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => deleteItem(itemToDelete.id) } ]
        );
    };

    const deleteItem = async (itemId: number) => {
        if (!user) return;
        try {
            await apiClient.delete(`/gallery/${itemId}`, { data: { role: user.role } });
            Alert.alert("Success", "Item has been deleted.");
            setAlbumItems(prevItems => prevItems.filter(item => item.id !== itemId));
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Could not delete the item.");
        }
    };

    const handleAddItem = () => {
        launchImageLibrary({ mediaType: 'mixed', selectionLimit: 5 }, async (response) => {
            if (response.didCancel || !response.assets) return;
            if (response.errorCode) { Alert.alert("Error", "ImagePicker Error: " + response.errorMessage); return; }
            setIsSubmitting(true);
            for (const asset of response.assets) { await uploadItem(asset); }
            setIsSubmitting(false);
        });
    };

    const uploadItem = async (asset: Asset) => {
        if (!user || !route.params.title || !albumItems[0]?.event_date) {
            Alert.alert('Upload Error', 'Cannot add to this album because its details are missing.');
            return;
        }
        const formData = new FormData();
        formData.append('title', route.params.title);
        formData.append('event_date', albumItems[0].event_date.split('T')[0]);
        formData.append('role', user.role);
        formData.append('adminId', String(user.id));
        formData.append('media', { uri: asset.uri, type: asset.type, name: asset.fileName || `media-${Date.now()}` });
        try {
            const { data } = await apiClient.post('/gallery/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            // This assumes the backend returns the full new item, which is good practice.
            // If not, you might need to refetch the whole album. For now, this optimistic update is fine.
            const newItem: GalleryItemType = { id: data.insertId, title: route.params.title, event_date: albumItems[0].event_date, file_path: data.filePath, file_type: asset.type?.startsWith('image') ? 'photo' : 'video' };
            setAlbumItems(prevItems => [newItem, ...prevItems]);
        } catch (error: any) {
            Alert.alert('Upload Error', error.response?.data?.message || 'An error occurred while uploading a file.');
        }
    };
    
    const closeModals = () => { setImageModalVisible(false); setVideoModalVisible(false); };

    const renderGridItem = ({ item }: { item: GalleryItemType }) => (
        <TouchableOpacity onPress={() => handleItemPress(item)}>
            <View style={styles.gridItemContainer}>
                {item.file_type === 'photo' ? (
                    <Image source={{ uri: `${SERVER_URL}${item.file_path}` }} style={styles.image} />
                ) : (
                    <View style={[styles.image, styles.videoPlaceholder]}><Icon name="play" size={30} color="white" /></View>
                )}
                {isAdmin && ( <TouchableOpacity style={styles.deleteItemButton} onPress={() => confirmDeleteItem(item)}><Icon name="trash" size={14} color="white" /></TouchableOpacity> )}
                <TouchableOpacity style={styles.downloadItemButton} onPress={() => handleDownloadItem(item)}><Icon name="cloud-download" size={16} color="white" /></TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList data={albumItems} keyExtractor={(item) => item.id.toString()} numColumns={NUM_COLUMNS} renderItem={renderGridItem} contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>This album is empty.</Text>
                        <Text style={styles.emptySubText}>{isAdmin ? "Press the '+' button to add photos or videos." : "The administrator has not added any items here yet."}</Text>
                    </View>
                }
            />
            {isAdmin && (<TouchableOpacity style={styles.fab} onPress={handleAddItem} disabled={isSubmitting}>{isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.fabText}>+</Text>}</TouchableOpacity>)}
            <Modal visible={isImageModalVisible} transparent={true} animationType="fade" onRequestClose={closeModals}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={closeModals}><Text style={styles.closeButtonText}>✕</Text></TouchableOpacity>
                    <Image source={{ uri: selectedImageUri! }} style={styles.fullscreenImage} resizeMode="contain" />
                </View>
            </Modal>
            <Modal visible={isVideoModalVisible} transparent={true} animationType="fade" onRequestClose={closeModals}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={closeModals}><Text style={styles.closeButtonText}>✕</Text></TouchableOpacity>
                    {selectedVideoUri && ( <Video source={{ uri: selectedVideoUri }} style={styles.fullscreenVideo} controls={true} resizeMode="contain" onError={(e) => console.log('Video Error:', e)} /> )}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f4f4f4' }, listContainer: { padding: ITEM_MARGIN / 2 }, gridItemContainer: { width: imageSize, height: imageSize, margin: ITEM_MARGIN / 2 }, image: { width: '100%', height: '100%', borderRadius: 4, backgroundColor: '#333' }, videoPlaceholder: { justifyContent: 'center', alignItems: 'center' }, deleteItemButton: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(211, 47, 47, 0.8)', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', zIndex: 1 }, downloadItemButton: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(2, 136, 209, 0.8)', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', zIndex: 1 }, modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }, fullscreenImage: { width: '100%', height: '100%' }, fullscreenVideo: { width: '100%', height: '100%' }, closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 1, padding: 10 }, closeButtonText: { color: 'white', fontSize: 24, fontWeight: 'bold' }, fab: { position: 'absolute', right: 25, bottom: 25, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6200EE', justifyContent: 'center', alignItems: 'center', elevation: 8 }, fabText: { fontSize: 30, color: 'white', lineHeight: 32 }, emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }, emptyText: { textAlign: 'center', fontSize: 16, color: 'gray' }, emptySubText: { textAlign: 'center', marginTop: 8, fontSize: 14, color: '#a0a0a0', paddingHorizontal: 40 } });
export default AlbumDetailScreen;