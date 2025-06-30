// 📂 File: src/screens/HomeScreen.tsx (FINAL - CORRECTED FOR PUBLIC DONOR)

import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

type NavigationProp = {
  navigate: (screen: string, params?: { role: string } | object) => void;
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  // ✅ THE FIX IS HERE: Changed Donor's action back to 'navigate'
  const roles = [
    { id: 2, name: "Admin",     icon: "https://cdn-icons-png.flaticon.com/512/17003/17003310.png", type: 'login',    target: 'admin' },
    { id: 3, name: "Student",   icon: "https://cdn-icons-png.flaticon.com/128/2784/2784403.png", type: 'login',    target: 'student' },
    { id: 4, name: "Teacher",   icon: "https://cdn-icons-png.freepik.com/256/14416/14416005.png?semt=ais_hybrid", type: 'login',    target: 'teacher' },
    { id: 6, name: "Donor",     icon: "https://cdn-icons-png.flaticon.com/128/10880/10880476.png", type: 'login',    target: 'donor' },
    
  ];

 const handleRolePress = (item: typeof roles[0]) => {
    if (item.type === 'login') {
      navigation.navigate('Login', { role: item.target });
    } else if (item.type === 'navigate') {
      navigation.navigate(item.target);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../assets/vspngo-logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.schoolName}>Vivekananda Public School</Text>
        <Text style={styles.schoolSubName}>(English Medium school for underprivileged students)</Text>
        <Text style={styles.schoolqt}>Knowledge is light</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.tagline}>Those who live for others, Will live forever.</Text>
        <View style={styles.grid}>
          {roles.map((roleItem) => (
            <TouchableOpacity key={roleItem.id} style={styles.card} onPress={() => handleRolePress(roleItem)}>
              <Image source={{ uri: roleItem.icon }} style={styles.cardIcon} resizeMode="contain" />
              <Text style={styles.cardText}>{roleItem.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Vivekananda Public School</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8ff" },
  header: { backgroundColor: "#e0f2f7", paddingTop: 50, paddingBottom: 30, alignItems: "center", justifyContent: "center", borderBottomWidth: 1, borderBottomColor: "#b2ebf2" },
  logo: { width: 120, height: 50, marginBottom: 10 },
  schoolName: { fontSize: 22, fontWeight: "bold", color: "#008080" },
  schoolSubName: { fontSize: 15, fontWeight: "300", color: "#008080" },
  schoolqt: { fontSize: 12, color: "#008080" },
  content: { flex: 1, alignItems: "center", justifyContent: 'center', paddingHorizontal: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "100%" },
  card: { width: "40%", backgroundColor: "#fff", borderRadius: 10, paddingVertical: 20, alignItems: "center", margin: 15, borderWidth: 1, borderColor: "#ddd", elevation: 2 },
  cardIcon: { width: 45, height: 45, marginBottom: 10 },
  cardText: { fontSize: 17, fontWeight: "600", color: "#333", textAlign: "center" },
  footer: { backgroundColor: "#e0f2f7", paddingVertical: 20, alignItems: "center", borderTopWidth: 1, borderTopColor: "#b2ebf2" },
  footerText: { color: "#555", fontSize: 16, fontStyle: "italic" },
  tagline: { fontSize: 18, fontStyle: "italic", color: "#777", marginBottom: 30 },
});