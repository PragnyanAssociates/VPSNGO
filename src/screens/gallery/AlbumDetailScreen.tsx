// 📂 File: src/screens/gallery/AlbumDetailScreen.tsx (UPDATED WITH VIDEO PLAYBACK)

import React, { useState, FC } from 'react';
import { 
    View, Text, StyleSheet, FlatList, Image, Dimensions, 
    TouchableOpacity, Modal, SafeAreaView, Alert
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import Video from 'react-native-video'; // <--- IMPORT THE VIDEO PLAYER
import { API_BASE_URL } from '../../../apiConfig';

// --- Type Definitions (Unchanged) ---
type GalleryItemType = {
    id: number;
    title: string;
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
    const { items } = route.params;

    // State for the full-screen modals
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

    const [isVideoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);

    const handleItemPress = (item: GalleryItemType) => {
        if (item.file_type === 'photo') {
            setSelectedImageUri(`${API_BASE_URL}/${item.file_path}`);
            setImageModalVisible(true);
        } else {
            // When a video is tapped, set its URI and open the video modal
            setSelectedVideoUri(`${API_BASE_URL}/${item.file_path}`);
            setVideoModalVisible(true);
        }
    };
    
    // Function to close both modals
    const closeModals = () => {
        setImageModalVisible(false);
        setVideoModalVisible(false);
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id.toString()}
                numColumns={NUM_COLUMNS}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleItemPress(item)}>
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
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContainer}
            />

            {/* Full-screen Image Modal */}
            <Modal visible={isImageModalVisible} transparent={true} animationType="fade" onRequestClose={closeModals}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={closeModals}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                    <Image source={{ uri: selectedImageUri }} style={styles.fullscreenImage} resizeMode="contain" />
                </View>
            </Modal>

            {/* Full-screen Video Modal */}
            <Modal visible={isVideoModalVisible} transparent={true} animationType="fade" onRequestClose={closeModals}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={closeModals}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                    {selectedVideoUri && (
                         <Video
                            source={{ uri: selectedVideoUri }}
                            style={styles.fullscreenVideo}
                            controls={true} // Show default playback controls
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
    image: { width: imageSize, height: imageSize, margin: ITEM_MARGIN / 2 },
    videoPlaceholder: { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
    playIcon: { fontSize: 30, color: 'white' },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    fullscreenImage: { width: '100%', height: '100%' },
    fullscreenVideo: { width: '100%', height: '100%' }, // Video player takes up the full screen
    closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 1, padding: 10 },
    closeButtonText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
});

export default AlbumDetailScreen;