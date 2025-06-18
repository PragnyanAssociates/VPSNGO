// 📂 File: src/screens/ResetPasswordScreen.tsx (COMPLETE - NO CHANGES NEEDED)

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { API_BASE_URL } from '../../apiConfig';

const ResetPasswordScreen = ({ route, navigation }) => {
    // The token is passed from the deep link URL
    const { token } = route.params; 
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            return Alert.alert("Error", "Please fill in both password fields.");
        }
        if (password !== confirmPassword) {
            return Alert.alert("Error", "Passwords do not match.");
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert("Success", data.message, [
                    { text: "OK", onPress: () => navigation.navigate('Login', { role: 'donor' }) }
                ]);
            } else {
                Alert.alert("Error", data.message);
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Set New Password</Text>
            </View>
            <View style={styles.form}>
                <Text style={styles.instructions}>Please enter and confirm your new password.</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="New Password" 
                    secureTextEntry 
                    value={password}
                    onChangeText={setPassword}
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Confirm New Password" 
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
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
    input: { height: 50, borderColor: "#ddd", borderWidth: 1, borderRadius: 25, paddingHorizontal: 20, backgroundColor: "#fff", fontSize: 16, marginBottom: 20 },
    button: { backgroundColor: "#008080", height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", elevation: 2 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});

export default ResetPasswordScreen;