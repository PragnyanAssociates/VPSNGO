import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function AdminLogin() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Email:", email);
    console.log("Password:", password);
    // Example: navigation.navigate("AdminDashboard");
    navigation.navigate("AdminDashboard");
  };

  const handleForgotPassword = () => {
    console.log("Forgot Password");
    // Example: navigation.navigate("ForgotPasswordScreen", { role: "Admin" });
    navigation.navigate("ForgotPasswordScreen");
  };

  const handleRegister = () => {
    console.log("Register");
    // Example: navigation.navigate("RegisterScreen");
    navigation.navigate("AdminRegister");
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
        <Text style={styles.schoolName}>Vivekananda Public School</Text>
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Admin Login</Text>
        {/* <Text style={styles.tagline}>Empowering educators, one login at a time</Text> */}

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

        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.Register}>Register</Text>
        </TouchableOpacity>

        {/* <Text style={styles.orLoginWith}>Or Login with</Text>

        <View style={styles.socialLoginContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../assets/facebook.png")} // Replace with your Facebook icon path
              style={styles.socialIcon}
              accessibilityLabel="Facebook login"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../assets/google.png")} // Replace with your Google icon path
              style={styles.socialIcon}
              accessibilityLabel="Google login"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.registerText}>Don't have an account? Register</Text>
        </TouchableOpacity> */}
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
  tagline: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#777",
    marginBottom: 20,
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
  orLoginWith: {
    textAlign: "center",
    marginBottom: 20,
    color: "#777",
  },
  Register: {
    color: "red",
    textAlign: "center",
    marginBottom: 20,
    
  },
  socialLoginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  socialIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  registerText: {
    color: "#007bff",
    textAlign: "center",
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