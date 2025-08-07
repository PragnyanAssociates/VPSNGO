// 📂 File: src/screens/ForgotPasswordScreen.tsx (CORRECTED FOR OTP/CODE METHOD)

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from '../../apiConfig';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (emailToValidate: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailToValidate);
    };

    // ✅ --- THIS IS THE FIX --- ✅
    // This function now sends the email to the backend and, on success,
    // navigates the user to the ResetPasswordScreen, passing the email along.
    const handleSendCodeRequest = async () => {
        if (!email.trim()) {
            return Alert.alert('Email Required', 'Please enter your email address.');
        }
        if (!validateEmail(email)) {
            return Alert.alert('Invalid Email', 'Please enter a valid email address.');
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            
            // The backend always sends a 200 status for security.
            // We use the response message to inform the user.
            if (response.ok) {
                Alert.alert('Check Your Email', data.message, [
                    {
                        text: 'OK',
                        // Navigate to the next screen, passing the email as a parameter.
                        // This is essential for the next step to work.
                        onPress: () => navigation.navigate('ResetPasswordScreen', { email: email }),
                    },
                ]);
            } else {
                // This would catch server errors (e.g., status 500)
                Alert.alert('Request Failed', data.message || 'An error occurred on the server.');
            }
        } catch (error) {
            console.error("Forgot Password network error:", error);
            Alert.alert('Connection Error', 'Could not connect to the server. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back">
                    <MaterialCommunityIcons name="arrow-left" size={28} color="#008080" />
                </TouchableOpacity>
                <Text style={styles.title}>Forgot Password</Text>
            </View>
            <View style={styles.form}>
                {/* Instructions updated for the code method */}
                <Text style={styles.instructions}>
                    Enter the email address associated with your Donor account. If an account exists, we will send a 6-digit reset code.
                </Text>
                <TextInput
                    placeholder="Enter your registered email"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    accessibilityLabel="Email input for password reset code"
                />
                {/* Button text and function updated */}
                <TouchableOpacity style={styles.button} onPress={handleSendCodeRequest} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Send Reset Code</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8ff' },
    header: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0f2f7',
        borderBottomWidth: 1,
        borderBottomColor: '#b2ebf2',
    },
    title: { fontSize: 22, fontWeight: 'bold', color: '#008080', marginLeft: 15 },
    form: { paddingHorizontal: 20, marginTop: 40 },
    instructions: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#008080',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default ForgotPasswordScreen;