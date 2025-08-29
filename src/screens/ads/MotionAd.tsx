// import React, { useEffect, useRef } from 'react';
// import { Animated, Image, StyleSheet, Dimensions } from 'react-native';
// import { Ad } from './TopNotchAd'; // Reuse the Ad interface
// import { API_BASE_URL } from '../../api/client';

// const { width: screenWidth } = Dimensions.get('window');

// interface Props {
//   ad: Ad;
// }

// const MotionAd: React.FC<Props> = ({ ad }) => {
//   const slideAnim = useRef(new Animated.Value(-300)).current; 

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(slideAnim, { toValue: screenWidth, duration: 15000, useNativeDriver: true }),
//         Animated.timing(slideAnim, { toValue: -300, duration: 0, useNativeDriver: true }),
//       ]),
//     ).start();
//   }, [slideAnim]);

//   const imageUrl = `${API_BASE_URL}${ad.ad_content_image_url}`;

//   return (
//     <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
//       <Image source={{ uri: imageUrl }} style={styles.image} />
//     </Animated.View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { position: 'absolute', bottom: 60, zIndex: 1001, elevation: 11, backgroundColor: 'white', borderRadius: 10, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
//   image: { width: 200, height: 50, resizeMode: 'contain' },
// });

// export default MotionAd;