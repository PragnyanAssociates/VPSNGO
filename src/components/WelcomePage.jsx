import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WelcomePage = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    // Navigate to another screen, e.g., HomeScreen
    navigation.navigate('HomeScreen');
  };

  return (
    <View style={styles.container}>
      {/* <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/8074/8074788.png' }} // Replace with your image URL
        style={styles.icon}
      /> */}
      <Image
                source={require("../assets/vspngo-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
      <Text style={styles.title}>Welcome</Text>
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#F5FCFF',
    backgroundColor: '#e0f2f7',
    paddingHorizontal: 20,
  },
  icon: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    marginTop: 15
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomePage;