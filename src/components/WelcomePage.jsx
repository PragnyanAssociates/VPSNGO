import React from 'react';
// Make sure ImageBackground is imported
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';

const WelcomePage = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('HomeScreen');
  };

  return (
    // Use require() for local images
    <ImageBackground
      source={require('../assets/school-background.jpg')} // <-- KEY CHANGE HERE
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Image
          source={require("../assets/pragnyan-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
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
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(255, 255, 255, 0.85)', 
    paddingHorizontal: 20,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
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