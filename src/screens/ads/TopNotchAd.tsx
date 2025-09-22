// 📂 File: src/components/ads/TopNotchAd.tsx (FINAL & VERIFIED)

import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { SERVER_URL } from '../../../apiConfig';

export interface Ad {
  id: number;
  ad_type: 'motion' | 'top_notch'; // 'top_notch' acts as a pop-up
  ad_content_image_url: string;
  ad_content_text?: string;
}

interface Props {
  ad: Ad;
}

const TopNotchAd: React.FC<Props> = ({ ad }) => {
  const [modalVisible, setModalVisible] = useState(true);

  const imageUrl = `${SERVER_URL}${ad.ad_content_image_url}`;

  const handleClose = () => {
    setModalVisible(false);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.centeredView}>
        <View style={styles.modalView}>
          
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Image source={{ uri: imageUrl }} style={styles.adImage} />

          {ad.ad_content_text && (
            <Text style={styles.modalText}>{ad.ad_content_text}</Text>
          )}

        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
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
    width: '90%',
  },
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
    elevation: 6,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  adImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
});

export default TopNotchAd;