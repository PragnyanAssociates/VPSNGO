import React from 'react';
// Make sure ImageBackground and Text are imported
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';

const WelcomePage = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('HomeScreen');
  };

  return (
    <ImageBackground
      source={require('../assets/school-background.jpg')} // Make sure this path is correct
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Image
          source={require("../assets/pragnyan-logo.png")} // Make sure this path is correct
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>
          The unified platform to manage your institution's resources and operations.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Get Started</Text>
            <Icon name="arrowright" size={22} color="#FFFFFF" style={styles.icon} />
          </View>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    // KEY CHANGE: This will center the entire content block vertically on the screen.
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 250,
    height: 200,
    // Space between logo and tagline
    marginBottom: 20, 
  },
  tagline: {
    fontSize: 17,
    color: '#0f0e0eff',
    textAlign: 'center',
    // KEY CHANGE: This is the main space between the text and the button. 
    // Reduced from 100 to a more reasonable 40.
    marginBottom: 40, 
    paddingHorizontal: 15,
    fontStyle:"italic",
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 10,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  icon: {
    marginLeft: 10,
  },
});

export default WelcomePage;