// 📂 File: src/screens/ForgotPasswordScreen.tsx (FINAL CORRECTED VERSION)

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from '../../apiConfig';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState(''); // ✅ CORRECT: State should be for email
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleResetRequest = async () => {
        if (!email.trim()) {
            return Alert.alert('Required', 'Please enter your email address.');
        }
        if (!validateEmail(email)) {
            return Alert.alert('Invalid Input', 'Please enter a valid email address.');
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }), // ✅ CORRECT: Send the email in the body
            });
            const data = await response.json();
            // Show the success message regardless of whether the email was found
            Alert.alert('Request Sent', data.message, [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('Error', 'Could not connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color="#008080" />
                </TouchableOpacity>
                <Text style={styles.title}>Reset Password</Text>
            </View>
            <View style={styles.form}>
                <Text style={styles.instructions}>
                    Enter the email address associated with your Donor account. If an account exists, we will send a password reset link.
                </Text>
                <TextInput
                    placeholder="Enter your email" // ✅ CORRECT: Placeholder asks for email
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    accessibilityLabel="Email input for password reset"
                />
                <TouchableOpacity style={styles.button} onPress={handleResetRequest} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Send Reset Link</Text>
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