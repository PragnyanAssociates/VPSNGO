// src/components/StudentLogin.jsx

import React, { useState } from "react";
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, Image,
  Alert, ActivityIndicator 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from '../../apiConfig'; // Import the backend address

export default function StudentLogin() {
  const navigation = useNavigation();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  
  // ✅ NEW: State to show a loading spinner on the button
  const [isLoading, setIsLoading] = useState(false);

  // ✅ NEW: The full, backend-connected login function
  const handleLogin = async () => {
    // 1. Basic check to make sure fields aren't empty
    if (!studentId || !password) {
      Alert.alert("Input Required", "Please enter your Student ID and Password.");
      return;
    }

    setIsLoading(true); // Show the loading spinner

    try {
      // 2. Send the login data to the backend server
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: studentId, password: password })
      });

      const data = await response.json();

      // 3. Check if the server responded with an error
      if (!response.ok) {
        throw new Error(data.message); // Use the error message from the backend
      }
      
      // 4. Double-check that the logged-in user is actually a student
      if (data.user.role !== 'student') {
        throw new Error("Access Denied. This is not a student account.");
      }

      // 5. If everything is successful, navigate to the dashboard
      //    We use 'replace' to prevent the user from going back to the login screen.
      navigation.replace("StudentDashboard", { userProfile: data.user });

    } catch (error) {
      // 6. If any step failed, show an alert with the error message
      Alert.alert("Login Failed", error.message);
    } finally {
      // 7. Always hide the loading spinner, whether it succeeded or failed
      setIsLoading(false); 
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPasswordScreen");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../assets/vspngo-logo.png")}
          style={styles.logo}
          accessibilityLabel="School logo"
        />
        <Text style={styles.schoolName}>Vivekananda Public School</Text>
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Student Login</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Student ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your student ID"
            value={studentId}
            onChangeText={setStudentId}
            autoCapitalize="none"
            accessibilityLabel="Student ID input"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            accessibilityLabel="Password input"
          />
        </View>

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* ✅ UPDATED: The button now shows a loading spinner */}
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin} 
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Your School. All rights reserved.</Text>
      </View>
    </View>
  );
}

// Your original styles remain unchanged.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8ff",
  },
  header: {
    backgroundColor: "#e0f2f7",
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#b2ebf2",
  },
  logo: {
    width: 120,
    height: 50,
    marginBottom: 10,
    resizeMode: "contain",
  },
  schoolName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#008080",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: "#f8f8f8",
  },
  forgotPassword: {
    color: "#007bff",
    textAlign: "right",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#007bff",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    backgroundColor: "#e0f2f7",
    paddingVertical: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#b2ebf2",
  },
  footerText: {
    color: "#555",
    fontSize: 16,
    fontStyle: "italic",
  },
});