// 📂 File: src/screens/LoginScreen.tsx (FINAL - COPY/PASTE THIS)

import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../../apiConfig';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type LoginScreenProps = {
  route: { params: { role: 'admin' | 'teacher' | 'student' | 'donor'; } }
};

export default function LoginScreen({ route }: LoginScreenProps) {
  const { role } = route.params;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Input Required", "Please enter your details.");
      return;
    }
    setIsLoggingIn(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.user.role !== role) {
          Alert.alert("Login Failed", `You are not registered as a ${role}. Please check your credentials or selected role.`);
          setIsLoggingIn(false);
          return;
        }
        await login(data.user);
      } else {
        Alert.alert("Login Failed", data.message || "Invalid username or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("An Error Occurred", "Could not connect to the server. Please try again later.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <View style={styles.header}>
          <Image source={require("../assets/vspngo-logo.png")} style={styles.logo}/>
          <Text style={styles.schoolName}>Vivekananda Public School</Text>
          <Text style={styles.schoolSubName}>(English Medium school for underprivileged students)</Text>
          <Text style={styles.schoolqt}>Knowledge is light</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.title}>{capitalize(role)} Login</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{role === 'student' ? 'Student ID' : 'Username'}</Text>
            <TextInput style={styles.input} placeholder={role === 'student' ? 'Enter your student ID' : 'Enter your username'} value={username} onChangeText={setUsername} autoCapitalize="none" />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="Enter password" secureTextEntry value={password} onChangeText={setPassword} />
          </View>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoggingIn}>
            {isLoggingIn ? (<ActivityIndicator color="#fff" />) : (<Text style={styles.loginButtonText}>Login</Text>)}
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Your School. All rights reserved.</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8ff" },
  header: { backgroundColor: "#e0f2f7", paddingTop: 50, paddingBottom: 30, alignItems: "center", justifyContent: "center", borderBottomWidth: 1, borderBottomColor: "#b2ebf2" },
  logo: { width: 120, height: 50, marginBottom: 10, resizeMode: "contain" },
  schoolName: { fontSize: 22, fontWeight: "bold", color: "#008080" },
  formContainer: { flex: 1, paddingHorizontal: 20, paddingVertical: 40, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "bold", color: "#333", marginBottom: 30, textAlign: "center" },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 5, color: '#333' },
  input: { height: 50, borderColor: "#ddd", borderWidth: 1, borderRadius: 25, paddingHorizontal: 20, backgroundColor: "#fff", fontSize: 16 },
  loginButton: { backgroundColor: "#007bff", height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", marginBottom: 20, elevation: 2 },
  loginButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  footer: { backgroundColor: "#e0f2f7", paddingVertical: 20, alignItems: "center", borderTopWidth: 1, borderTopColor: "#b2ebf2" },
  footerText: { color: "#555", fontSize: 16, fontStyle: "italic" },
  schoolSubName: { fontSize: 15, fontWeight: "300", color: "#008080" },
  schoolqt: { fontSize: 12, color: "#008080" },
});