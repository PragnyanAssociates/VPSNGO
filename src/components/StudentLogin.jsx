import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function StudentLogin() {
  const navigation = useNavigation();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Student ID:", studentId);
    console.log("Password:", password);
    // Example: navigation.navigate("StudentDashboard");
    navigation.navigate("StudentDashboard");
  };

  const handleForgotPassword = () => {
    console.log("Forgot Password");
    // Example: navigation.navigate("ForgotPasswordScreen", { role: "student" });
    navigation.navigate("ForgotPasswordScreen");
  };

//   const handleRegister = () => {
//     console.log("Register");
//     navigation.navigate("StudentRegister");
//   };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../assets/vspngo-logo.png")} // Replace with your logo path
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

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Your School. All rights reserved.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8ff", // Very light gray background
  },
  header: {
    backgroundColor: "#e0f2f7", // Light cyan/teal shade
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
    color: "#008080", // Teal
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
    backgroundColor: "#e0f2f7", // Light cyan/teal shade
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