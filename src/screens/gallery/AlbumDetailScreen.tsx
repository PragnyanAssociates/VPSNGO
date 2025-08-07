// 📂 File: src/screens/gallery/AlbumDetailScreen.tsx (FULLY MODIFIED FOR TRASH ICON)

import React, { useState, useEffect, FC } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image, Dimensions,
    TouchableOpacity, Modal, SafeAreaView, Alert, ActivityIndicator
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons'; // <-- IMPORT ICON LIBRARY
import { API_BASE_URL } from '../../../apiConfig';
import { useAuth } from '../../context/AuthContext';

// --- Type Definitions ---
type GalleryItemType = {
    id: number;
    title: string;
    event_date: string;
    file_path: string;
    file_type: 'photo' | 'video';
};
type RootStackParamList = {
    AlbumDetail: {
      title: string;
      items: GalleryItemType[];
    };
};
type AlbumDetailScreenRouteProp = RouteProp<RootStackParamList, 'AlbumDetail'>;

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 4;
const NUM_COLUMNS = 3;
const imageSize = (width - (ITEM_MARGIN * (NUM_COLUMNS + 1))) / NUM_COLUMNS;

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

    useEffect(() => {
        navigation.setOptions({ title: route.params.title });
    }, [navigation, route.params.title]);

    const handleItemPress = (item: GalleryItemType) => {
        if (item.file_type === 'photo') {
            setSelectedImageUri(`${API_BASE_URL}/${item.file_path}`);
            setImageModalVisible(true);
        } else {
            setSelectedVideoUri(`${API_BASE_URL}/${item.file_path}`);
            setVideoModalVisible(true);
        }
    };

    const confirmDeleteItem = (itemToDelete: GalleryItemType) => {
        Alert.alert(
            "Delete Item",
            "Are you sure you want to delete this item permanently?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: () => deleteItem(itemToDelete.id) 
                }
            ]
        );
    };

    const deleteItem = async (itemId: number) => {
        if (!user) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/gallery/${itemId}`, {
                data: { role: user.role }
            });
            Alert.alert("Success", "Item has been deleted.");
            setAlbumItems(prevItems => prevItems.filter(item => item.id !== itemId));
        } catch (error) {
            console.error("Failed to delete item:", error);
            Alert.alert("Error", "Could not delete the item.");
        }
    };

    const handleAddItem = () => {
        launchImageLibrary({ mediaType: 'mixed', selectionLimit: 5 }, async (response) => {
            if (response.didCancel || !response.assets) return;
            if (response.errorCode) {
                Alert.alert("Error", "ImagePicker Error: " + response.errorMessage);
                return;
            }
            for (const asset of response.assets) {
                await uploadItem(asset);
            }
        });
    };

    const uploadItem = async (asset: Asset) => {
        if (!user || !route.params.title || !albumItems[0]?.event_date) {
            Alert.alert('Upload Error', 'Cannot add to this album because its details are missing.');
            return;
        }
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('title', route.params.title);
        formData.append('event_date', albumItems[0].event_date.split('T')[0]);
        formData.append('role', user.role);
        formData.append('adminId', String(user.id));
        formData.append('media', {
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName || `media-${Date.now()}`
        } as any);

        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/gallery/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const newItem: GalleryItemType = {
                id: data.insertId,
                title: route.params.title,
                event_date: albumItems[0].event_date,
                file_path: data.filePath,
                file_type: asset.type?.startsWith('image') ? 'photo' : 'video'
            };
            setAlbumItems(prevItems => [newItem, ...prevItems]);

        } catch (error) {
            Alert.alert('Upload Error', 'An error occurred while uploading a file.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const closeModals = () => {
        setImageModalVisible(false);
        setVideoModalVisible(false);
    };

    const renderGridItem = ({ item }: { item: GalleryItemType }) => (
        <TouchableOpacity onPress={() => handleItemPress(item)}>
            <View>
                {item.file_type === 'photo' ? (
                    <Image 
                        source={{ uri: `${API_BASE_URL}/${item.file_path}` }} 
                        style={styles.image} 
                    />
                ) : (
                    <View style={[styles.image, styles.videoPlaceholder]}>
                        <Text style={styles.playIcon}>▶️</Text>
                    </View>
                )}

                {/* --- DELETE ICON FOR SINGLE ITEM --- */}
                {isAdmin && (
                    <TouchableOpacity 
                        style={styles.deleteItemButton} 
                        onPress={() => confirmDeleteItem(item)}
                    >
                        <Icon name="trash" size={14} color="white" />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={albumItems}
                keyExtractor={(item) => item.id.toString()}
                numColumns={NUM_COLUMNS}
                renderItem={renderGridItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>This album is empty.</Text>
                        <Text style={styles.emptySubText}>
                            {isAdmin ? "Press the '+' button to add photos or videos." : "The administrator has not added any items here yet."}
                        </Text>
                    </View>
                }
            />
            
            {isAdmin && (
                <TouchableOpacity style={styles.fab} onPress={handleAddItem} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.fabText}>+</Text>}
                </TouchableOpacity>
            )}

            <Modal visible={isImageModalVisible} transparent={true} animationType="fade" onRequestClose={closeModals}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={closeModals}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                    <Image source={{ uri: selectedImageUri! }} style={styles.fullscreenImage} resizeMode="contain" />
                </View>
            </Modal>

            <Modal visible={isVideoModalVisible} transparent={true} animationType="fade" onRequestClose={closeModals}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={closeModals}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                    {selectedVideoUri && (
                         <Video
                            source={{ uri: selectedVideoUri }}
                            style={styles.fullscreenVideo}
                            controls={true}
                            resizeMode="contain"
                            onError={(e) => console.log('Video Error:', e)}
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f4' },
    listContainer: { padding: ITEM_MARGIN / 2 },
    image: { 
        width: imageSize, 
        height: imageSize, 
        margin: ITEM_MARGIN / 2, 
        borderRadius: 4,
        backgroundColor: '#e0e0e0'
    },
    videoPlaceholder: { 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    playIcon: { 
        fontSize: 30, 
        color: 'white' 
    },
    deleteItemButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#d32f2f', // Solid red color
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        elevation: 2,
    },
    modalContainer: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.9)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    fullscreenImage: { 
        width: '100%', 
        height: '100%' 
    },
    fullscreenVideo: { 
        width: '100%', 
        height: '100%' 
    },
    closeButton: { 
        position: 'absolute', 
        top: 50, 
        right: 20, 
        zIndex: 1, 
        padding: 10 
    },
    closeButtonText: { 
        color: 'white', 
        fontSize: 24, 
        fontWeight: 'bold' 
    },
    fab: { 
        position: 'absolute', 
        right: 25, 
        bottom: 25, 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        backgroundColor: '#6200EE', 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 8, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 4 
    },
    fabText: { 
        fontSize: 30, 
        color: 'white', 
        lineHeight: 32 
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: { 
        textAlign: 'center', 
        fontSize: 16, 
        color: 'gray' 
    },
    emptySubText: {
        textAlign: 'center',
        marginTop: 8,
        fontSize: 14,
        color: '#a0a0a0',
        paddingHorizontal: 40,
    }
});

export default AlbumDetailScreen;