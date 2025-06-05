// DonorSI.jsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  Modal, // <-- Import Modal for WebView overlay
  ActivityIndicator, // <-- For loading indicator in WebView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { WebView } from 'react-native-webview'; // <-- Import WebView

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const COLORS = {
  primary: '#20B2AA',
  secondary: '#7E57C2',
  lightText: '#FFFFFF',
  darkText: '#333333',
  subtleText: '#555555',
  background: '#F4F6F8',
  cardBackground: '#FFFFFF',
  separator: '#E0E0E0',
  tabInactive: '#FFFFFF',
  tabTextInactive: '#A0A0A0',
  borderColor: '#DDDDDD',
  placeholderImageBg: '#E0E0E0',
  linkColor: '#007AFF',
  modalBackground: 'rgba(0,0,0,0.5)', // For WebView modal background
};

const initialPhotos = [
  { id: 'p1', uri: 'https://picsum.photos/seed/p1_img/200/300' },
  { id: 'p2', uri: 'https://picsum.photos/seed/p2_img/200/300' },
  { id: 'p3', uri: 'https://picsum.photos/seed/p3_img/200/300' },
  { id: 'p4', uri: 'https://picsum.photos/seed/p4_img/200/300' },
  { id: 'p5', uri: 'https://picsum.photos/seed/p5_img/200/300' },
];

const initialVideos = [
  { id: 'v1', title: 'School Annual Day Highlights', thumbnailUri: 'https://picsum.photos/seed/v1_thumb/200/120' },
  { id: 'v2', title: 'Science Fair 2024', thumbnailUri: 'https://picsum.photos/seed/v2_thumb/200/120' },
  { id: 'v3', title: 'Message from the Principal', thumbnailUri: 'https://picsum.photos/seed/v3_thumb/200/120' },
];

const schoolLogoSource = require('../assets/vspngo-logo.png'); // PLEASE VERIFY THIS PATH

const aboutUsText = `School Motto: 'Shramayeva Jayate'
At Vivekananda Public School, we believe that hard work is the key to success. Hard work always triumphs - this mantra for success is instilled in the young minds. Our students are taught that a positive attitude and self-discipline are essential to achieving their goals. We continually strive to nurture every child into a well-rounded individual, encouraging them to understand that there is no substitute for hard work. More importantly, the happiness a child feels upon achieving their goal through dedication is priceless. This reinforces our belief in the slogan, "A DILIGENT CHILD IS A FUTURE'S PRIDE."`;

// --- EDIT THIS WITH YOUR SCHOOL'S ACTUAL WEBSITE URL ---
const SCHOOL_WEBSITE_URL = 'https://www.google.com'; // <-- EXAMPLE: Replace with your link

const DonorSI = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Photos');
  const [photosData, setPhotosData] = useState([...initialPhotos]);
  const [videosData, setVideosData] = useState([...initialVideos]);

  // --- WebView State ---
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [loadingWebView, setLoadingWebView] = useState(false);

  const handleOpenInAppBrowser = (url) => {
    setWebViewUrl(url);
    setWebViewVisible(true);
  };

  const renderPhotoItem = useCallback(({ item }) => {
    if (!item || typeof item.id !== 'string' || typeof item.uri !== 'string') {
        console.warn("Malformed photo item:", item);
        return <View style={styles.photoItemContainer}><Text style={styles.errorText}>Invalid Photo Data</Text></View>;
    }
    return (
        <View style={styles.photoItemContainer}>
        <Image
            source={{ uri: item.uri }}
            style={styles.photo}
            onError={(e) => console.log(`Failed to load photo: ${item.uri}. Error: ${e.nativeEvent.error}`)}
        />
        </View>
    );
  }, []);

  const renderVideoItem = useCallback(({ item }) => {
    if (!item || typeof item.id !== 'string' || typeof item.title !== 'string' || typeof item.thumbnailUri !== 'string') {
      console.warn("Malformed video item or missing properties:", item);
      return (
        <View style={styles.videoItemContainer}>
          <View style={[styles.videoThumbnail, styles.errorBackground]}><Text style={styles.errorText}>Invalid Video</Text></View>
          <View style={styles.videoInfo}><Text style={styles.videoTitle}>Error</Text></View>
        </View>
      );
    }
    return (
      <View style={styles.videoItemContainer}>
        <Image
          source={{ uri: item.thumbnailUri }}
          style={styles.videoThumbnail}
          onError={(e) => console.log(`Failed to load video thumbnail: ${item.thumbnailUri}. Error: ${e.nativeEvent.error}`)}
        />
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
          <Icon name="play-circle" size={20} color={COLORS.primary} style={styles.playIcon} solid/>
        </View>
      </View>
    );
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'Photos':
        return (
          <FlatList
            key={`photos-list-${photosData.length}`}
            data={photosData}
            renderItem={renderPhotoItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.photoGrid}
            ListEmptyComponent={<Text style={styles.emptyText}>No photos available.</Text>}
          />
        );
      case 'Videos':
        return (
          <FlatList
            key={`videos-list-${videosData.length}`}
            data={videosData}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.videoList}
            ListEmptyComponent={<Text style={styles.emptyText}>No videos available.</Text>}
          />
        );
      // case 'About us':
      //   return (
      //     <ScrollView key="about-us-scroll" contentContainerStyle={styles.aboutUsContainer}>
      //       <Image source={schoolLogoSource} style={styles.schoolLogo} resizeMode="contain" />
      //       <Text style={styles.aboutUsTitle}>About Us :-</Text>
      //       <Text style={styles.aboutUsText}>{aboutUsText}</Text>
      //       <TouchableOpacity onPress={() => handleOpenInAppBrowser(SCHOOL_WEBSITE_URL)} style={styles.linkContainer}>
      //         <Text style={styles.linkText}>Visit our School Website</Text>
      //       </TouchableOpacity>
      //     </ScrollView>
      //   );
      default:
        return null;
    }
  };

  const TabButton = ({ title }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === title && styles.activeTabButton,
      ]}
      onPress={() => setActiveTab(title)}
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === title ? styles.activeTabText : styles.inactiveTabText,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={styles.tabContainer}>
        <TabButton title="Photos" />
        <TabButton title="Videos" />
        {/* <TabButton title="About us" /> */}
      </View>

      <View style={styles.contentArea}>
        {renderContent()}
      </View>

      {/* --- WebView Modal --- */}
      <Modal
        animationType="slide"
        transparent={false} // Can be true if you want a semi-transparent background
        visible={webViewVisible}
        onRequestClose={() => {
          setWebViewVisible(false);
          setWebViewUrl('https://www.google.com'); // Clear URL on close
        }}
      >
        <SafeAreaView style={styles.webViewSafeArea}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity onPress={() => setWebViewVisible(false)} style={styles.closeButton}>
              <Icon name="times" size={24} color={COLORS.darkText} />
            </TouchableOpacity>
            <Text style={styles.webViewTitle} numberOfLines={1}>{webViewUrl}</Text>
          </View>
          <WebView
            source={{ uri: webViewUrl }}
            style={styles.webView}
            onLoadStart={() => setLoadingWebView(true)}
            onLoadEnd={() => setLoadingWebView(false)}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
              setLoadingWebView(false);
              // Optionally, show an error message to the user
            }}
            startInLoadingState={true}
            renderLoading={() => (
              <ActivityIndicator
                color={COLORS.primary}
                size="large"
                style={styles.webViewLoading}
              />
            )}
          />
          {loadingWebView && (
            <ActivityIndicator
              color={COLORS.primary}
              size="large"
              style={styles.webViewLoadingAbsolute} // For overlaying indicator
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: COLORS.secondary,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.secondary,
  },
  inactiveTabText: {
    color: COLORS.tabTextInactive,
  },
  contentArea: {
    flex: 1,
  },
  photoGrid: {
    padding: 8,
  },
  photoItemContainer: {
    flex: 1 / 2,
    margin: 4,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.placeholderImageBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  videoList: {
    paddingVertical: 10,
  },
  videoItemContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: 120,
    height: 80,
    backgroundColor: COLORS.placeholderImageBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.darkText,
    marginBottom: 5,
  },
  playIcon: {
    position: 'absolute',
    right: 12,
    bottom: 10,
  },
  aboutUsContainer: {
    padding: 20,
    backgroundColor: COLORS.cardBackground,
    flexGrow: 1,
  },
  schoolLogo: {
    width: SCREEN_WIDTH - 40,
    height: 150,
    marginBottom: 20,
    alignSelf: 'center',
  },
  aboutUsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  aboutUsText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.subtleText,
    textAlign: 'justify',
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: COLORS.subtleText,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.subtleText,
    textAlign: 'center',
  },
  errorBackground: {
    backgroundColor: COLORS.separator,
  },
  linkContainer: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 16,
    color: COLORS.linkColor,
    textDecorationLine: 'underline',
  },
  // --- WebView Modal Styles ---
  webViewSafeArea: {
    flex: 1,
    backgroundColor: COLORS.cardBackground, // Or your desired background for the modal
  },
  webViewHeader: {
    height: 50, // Adjust as needed
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
    backgroundColor: COLORS.cardBackground, // Header background
  },
  closeButton: {
    padding: 10,
  },
  webViewTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginRight: 40, // To balance the close button space
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground, // So it covers the webview during load
  },
  webViewLoadingAbsolute: { // For use when startInLoadingState doesn't cover everything
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 20, // Center it
    top: SCREEN_HEIGHT / 2 - 60, // Center it (approx)
  },
});

export default DonorSI;


