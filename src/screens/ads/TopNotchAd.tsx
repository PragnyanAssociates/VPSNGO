// 📂 File: src/components/ads/TopNotchAd.tsx (FINAL - CHANGED TO A POP-UP MODAL)

import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { API_BASE_URL } from '../../api/client';

// The Ad interface remains the same
export interface Ad {
  id: number;
  ad_type: 'motion' | 'top_notch'; // 'top_notch' now means 'pop-up'
  ad_content_image_url: string;
  ad_content_text?: string;
}

interface Props {
  ad: Ad;
}

// The component is now renamed internally to better reflect its function
const PopupAd: React.FC<Props> = ({ ad }) => {
  const [modalVisible, setModalVisible] = useState(true); // Modal is visible by default

  const imageUrl = `${API_BASE_URL}${ad.ad_content_image_url}`;

  // This function is called when the user presses the close button or outside the modal
  const handleClose = () => {
    setModalVisible(false);
  };

  return (
    <Modal
      animationType="fade" // The pop-up will fade in
      transparent={true}    // The background will be see-through
      visible={modalVisible}
      onRequestClose={handleClose} // Allows closing with the Android back button
    >
      <SafeAreaView style={styles.centeredView}>
        <View style={styles.modalView}>
          
          {/* Close button is now in the top-right corner */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* The Ad's Image */}
          <Image source={{ uri: imageUrl }} style={styles.adImage} />

          {/* The Ad's Text (if it exists) */}
          {ad.ad_content_text && (
            <Text style={styles.modalText}>{ad.ad_content_text}</Text>
          )}

        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // This is the dark, semi-transparent background that covers the whole screen
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark overlay
  },
  // This is the white container for the pop-up ad itself
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // The pop-up will take 90% of the screen width
  },
  // The close button
  closeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#333',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6, // Make sure it's on top
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // The ad image inside the pop-up
  adImage: {
    width: '100%',
    height: 200, // You can adjust the height
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  // The ad text inside the pop-up
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
});

export default PopupAd;