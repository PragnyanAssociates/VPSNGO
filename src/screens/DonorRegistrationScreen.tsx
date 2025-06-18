// 📂 File: src/screens/DonorRegistrationScreen.tsx (FINAL AND CORRECTED)

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from '../../apiConfig';

const DonorRegistrationScreen = ({ navigation }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!fullName.trim() || !username.trim() || !password.trim() || !email.trim()) {
            return Alert.alert("Error", "All fields are required.");
        }
        setLoading(true);
        try {
            const userResponse = await fetch(`${API_BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName,
                    username: username,
                    password: password,
                    email: email, // ✅ This now correctly sends the email
                    role: 'donor',
                    class_group: 'N/A' 
                })
            });

            const userData = await userResponse.json();
            if (!userResponse.ok) {
                throw new Error(userData.message || 'Failed to create user account.');
            }
            
            Alert.alert("Success", "Registration successful! You can now log in.", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (error: any) {
            Alert.alert("Registration Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                     <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={28} color="#008080" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Donor Registration</Text>
                </View>
                <View style={styles.form}>
                    <TextInput placeholder="Full Name *" style={styles.input} value={fullName} onChangeText={setFullName} />
                    <TextInput placeholder="Email Address *" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
                    <TextInput placeholder="Username *" style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />
                    <TextInput placeholder="Password *" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
                    <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8ff' },
    header: { padding: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: "#e0f2f7", borderBottomWidth: 1, borderBottomColor: "#b2ebf2"},
    title: { fontSize: 22, fontWeight: 'bold', color: '#008080', marginLeft: 15 },
    form: { paddingHorizontal: 20, marginTop: 40 },
    input: { height: 50, borderColor: "#ddd", borderWidth: 1, borderRadius: 25, paddingHorizontal: 20, backgroundColor: "#fff", fontSize: 16, marginBottom: 20 },
    button: { backgroundColor: "#007bff", height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", elevation: 2 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});

export default DonorRegistrationScreen;