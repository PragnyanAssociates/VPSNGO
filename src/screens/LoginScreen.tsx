// 📂 File: src/screens/LoginScreen.tsx (NEW DYNAMIC DESIGN)

import React, { useState } from "react";
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, Image, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, 
  ScrollView, StatusBar, SafeAreaView 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../../apiConfig';

// --- (Optional) For a better visual, you need to install these packages ---
// npm install react-native-linear-gradient
// npm install react-native-vector-icons (or @expo/vector-icons)
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather'; // Using Feather icons for a clean look

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type LoginScreenProps = {
  route: { params: { role: 'admin' | 'teacher' | 'student' | 'donor'; } }
};

type NavigationProp = {
  navigate: (screen: string) => void;
};

export default function LoginScreen({ route }: LoginScreenProps) {
  const { role } = route.params;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const handleLogin = async () => {
    // ... (Your handleLogin logic remains exactly the same, no changes needed here)
    if (!username || !password) {
      Alert.alert("Input Required", "Please enter your details.");
      return;
    }
    setIsLoggingIn(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.user.role !== role) {
          Alert.alert("Login Failed", `You are not registered as a ${role}.`);
          setIsLoggingIn(false);
          return;
        }
        await login(data.user, data.token);
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials.");
      }
    } catch (error) {
      Alert.alert("An Error Occurred", "Could not connect to the server.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <LinearGradient colors={['#E0F7FA', '#B2EBF2', '#f4bceeff']} style={styles.gradient}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            
            <View style={styles.header}>
              <Image source={require("../assets/pragnyan-logo.png")} style={styles.logo}/>
              <Text style={styles.welcomeText}>Welcome Back!</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.title}>{capitalize(role)} Login</Text>
              
              <View style={styles.inputContainer}>
                <Feather name={role === 'student' ? 'hash' : 'user'} size={20} color="#888" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder={role === 'student' ? 'Student ID' : 'Username'} 
                  value={username} 
                  onChangeText={setUsername} 
                  autoCapitalize="none" 
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="#888" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Password" 
                  secureTextEntry 
                  value={password} 
                  onChangeText={setPassword}
                  placeholderTextColor="#888"
                />
              </View>
              
              {role === 'donor' && (
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoggingIn}>
                {isLoggingIn ? (<ActivityIndicator color="#fff" />) : (<Text style={styles.loginButtonText}>Login</Text>)}
              </TouchableOpacity>

              {role === 'donor' && (
                <TouchableOpacity onPress={() => navigation.navigate('DonorRegistration')}>
                  <Text style={styles.registerText}>Don't have an account? <Text style={{fontWeight: 'bold', color: '#007BFF'}}>Register</Text></Text>
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.footerText}>© 2025 Pragnyan</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// --- NEW DYNAMIC STYLES ---
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between', // Pushes footer to the bottom
    alignItems: 'center',
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#370eedff', // A deep teal color
    marginTop: 0,
    marginBottom: 0,
  },
  formContainer: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 25,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: "#007BFF",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotPasswordText: { 
    textAlign: 'right', 
    color: '#007BFF', 
    marginBottom: 20, 
    fontWeight: '600' 
  },
  registerText: { 
    textAlign: 'center', 
    color: '#555', 
    fontSize: 16 
  },
  footerText: {
    color: '#070503ff',
    fontSize: 14,
    marginTop: 20,
  },
});