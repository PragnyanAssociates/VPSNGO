import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function TeacherRegister() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (!email.includes("@") || email.length < 5) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password);
    // Add registration logic here (e.g., Firebase signup)
    // Example: navigation.navigate("TeacherLogin");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../assets/vspngo-logo.png")} // Replace with your logo path
          style={styles.logo}
          accessibilityLabel="School logo"
        />
        <Text style={styles.schoolName}>Your School Name</Text>
      </View>

      {/* Registration Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Register</Text>
        <Text style={styles.tagline}>Enter Your Personal Information</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={username}
            onChangeText={setUsername}
            accessibilityLabel="Username input"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            accessibilityLabel="Email input"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              accessibilityLabel="Password input"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Text style={styles.eyeIconText}>{showPassword ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter confirm password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              accessibilityLabel="Confirm password input"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Text style={styles.eyeIconText}>{showConfirmPassword ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
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
  backButton: {
    position: "absolute",
    left: 20,
    top: 50,
  },
  backArrow: {
    fontSize: 24,
    color: "#333",
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
    marginBottom: 10,
    textAlign: "center",
  },
  tagline: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#777",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 25,
    backgroundColor: "#fff",
  },
  eyeIcon: {
    padding: 10,
  },
  eyeIconText: {
    color: "#777",
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: "#007bff", // Blue to match the image
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  registerButtonText: {
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