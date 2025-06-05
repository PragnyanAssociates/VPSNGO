import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendCode = () => {
    console.log("Sending code to:", email);
    setStep(2);
  };

  const handleVerifyOtp = () => {
    console.log("Verifying OTP:", otp);
    setStep(3);
  };

  const handleResendCode = () => {
    console.log("Resending code to:", email);
  };

  const handleResetPassword = () => {
    if (newPassword === confirmPassword) {
      console.log("Resetting password for:", email, "New Password:", newPassword);
      // Navigate back to login or show success message
      navigation.navigate("StudentLogin");
    } else {
      console.log("Passwords do not match");
    }
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

      {/* Step 1: Email Entry */}
      {step === 1 && (
        <View style={styles.formContainer}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Don't worry! It occurs. Please enter the email address linked with your account.
          </Text>

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

          <TouchableOpacity style={styles.actionButton} onPress={handleSendCode}>
            <Text style={styles.actionButtonText}>Send Code</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2: OTP Verification */}
      {step === 2 && (
        <View style={styles.formContainer}>
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Enter the verification code we sent on your email address.
          </Text>

          <View style={styles.otpContainer}>
            <TextInput
              style={styles.otpInput}
              maxLength={1}
              keyboardType="numeric"
              value={otp[0] || ""}
              onChangeText={(text) => setOtp(otp.slice(0, 0) + text + otp.slice(1))}
              accessibilityLabel="OTP digit 1"
            />
            <TextInput
              style={styles.otpInput}
              maxLength={1}
              keyboardType="numeric"
              value={otp[1] || ""}
              onChangeText={(text) => setOtp(otp.slice(0, 1) + text + otp.slice(2))}
              accessibilityLabel="OTP digit 2"
            />
            <TextInput
              style={styles.otpInput}
              maxLength={1}
              keyboardType="numeric"
              value={otp[2] || ""}
              onChangeText={(text) => setOtp(otp.slice(0, 2) + text + otp.slice(3))}
              accessibilityLabel="OTP digit 3"
            />
            <TextInput
              style={styles.otpInput}
              maxLength={1}
              keyboardType="numeric"
              value={otp[3] || ""}
              onChangeText={(text) => setOtp(otp.slice(0, 3) + text)}
              accessibilityLabel="OTP digit 4"
            />
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleVerifyOtp}>
            <Text style={styles.actionButtonText}>Verify</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResendCode}>
            <Text style={styles.resendText}>Didn't receive code? Resend</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 3: Create New Password */}
      {step === 3 && (
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Your new password must be unique from those previously used.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              accessibilityLabel="New password input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter confirm password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              accessibilityLabel="Confirm password input"
            />
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleResetPassword}>
            <Text style={styles.actionButtonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      )}

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
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  otpInput: {
    height: 50,
    width: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    backgroundColor: "#f8f8f8",
  },
  actionButton: {
    backgroundColor: "#007bff",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  resendText: {
    color: "#007bff",
    textAlign: "center",
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