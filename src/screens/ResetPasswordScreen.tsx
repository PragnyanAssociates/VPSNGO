// 📂 File: src/screens/ResetPasswordScreen.tsx (CORRECTED FOR OTP/CODE METHOD)

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { API_BASE_URL } from '../../apiConfig';

// This screen now expects the user's email to be passed via navigation
const ResetPasswordScreen = ({ route, navigation }) => {
    // ✅ --- STEP 3: FRONTEND SCREEN CORRECTION --- ✅

    // Get the user's email from the ForgotPasswordScreen navigation parameter
    const { email } = route.params;

    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!code || !password || !confirmPassword) {
            return Alert.alert("Error", "Please fill in all fields.");
        }
        if (password !== confirmPassword) {
            return Alert.alert("Error", "Passwords do not match.");
        }
        if (password.length < 6) {
            return Alert.alert("Error", "Password must be at least 6 characters long.");
        }

        setLoading(true);
        try {
            // The API call now sends email, the code (as 'token'), and the new password
            const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    token: code,
                    newPassword: password
                })
            });

            const data = await response.json();
            console.log("Backend Response:", { status: response.status, body: data });

            if (response.ok) {
                Alert.alert("Success!", data.message, [
                    { text: "Proceed to Login", onPress: () => navigation.navigate('LoginScreen') }
                ]);
            } else {
                Alert.alert("Reset Failed", data.message || "An unknown error occurred.");
            }
        } catch (error) {
            console.error("Fatal API Call Error on password reset:", error);
            Alert.alert("Network Error", "Unable to connect to the server. Please check your internet connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Reset Your Password</Text>
            </View>
            <View style={styles.form}>
                <Text style={styles.instructions}>A reset code was sent to {email}. Please enter it below.</Text>

                <TextInput
                    style={styles.input}
                    placeholder="6-Digit Code"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                />
                <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirm New Password"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8ff' },
    header: { padding: 20, alignItems: 'center', backgroundColor: "#e0f2f7" },
    title: { fontSize: 22, fontWeight: 'bold', color: '#008080' },
    form: { paddingHorizontal: 20, marginTop: 40 },
    instructions: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 30 },
    input: { height: 50, borderColor: "#ddd", borderWidth: 1, borderRadius: 25, paddingHorizontal: 20, backgroundColor: "#fff", fontSize: 16, marginBottom: 20, textAlign: 'center' },
    button: { backgroundColor: "#008080", height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", elevation: 2 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default ResetPasswordScreen;