// HomeScreen.jsx
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  const roles = [
    { id: 1, name: "About Us", icon: "https://cdn-icons-png.flaticon.com/128/3815/3815523.png" },
    { id: 2, name: "Admin", icon: "https://cdn-icons-png.flaticon.com/512/17003/17003310.png" },
    { id: 3, name: "Student", icon: "https://cdn-icons-png.flaticon.com/128/2784/2784403.png" },
    { id: 4, name: "Teacher", icon: "https://cdn-icons-png.freepik.com/256/14416/14416005.png?semt=ais_hybrid" },
    { id: 5, name: "Transport", icon: "https://cdn-icons-png.flaticon.com/128/207/207178.png" },
    { id: 6, name: "Donor", icon: "https://cdn-icons-png.flaticon.com/128/10880/10880476.png" },
  ];

  const handleRolePress = (roleName) => {
    if (roleName === "Student") {
      navigation.navigate("StudentLogin");
    } else if (roleName === "Teacher") {
      navigation.navigate("TeacherLogin");
    } else if (roleName === "Donor") {
      navigation.navigate("DonorLogin");
    } else if (roleName === "Admin") {
      navigation.navigate("AdminLogin");
    } else if (roleName === "Transport") {
      navigation.navigate("Transport");
    } else if (roleName === "About Us") { // <--- CORRECTED: "About Us" with a space
      navigation.navigate("AboutUs");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/vspngo-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.schoolName}>Vivekananda Public School</Text>
        <Text style={styles.schoolSubName}>(English Medium school for underprivileged students)</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.tagline}>Those who live for others, Will live forever.</Text>
        <View style={styles.grid}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={styles.card}
              onPress={() => handleRolePress(role.name)}
              activeOpacity={0.7}
            >
              <View style={styles.cardIconWrapper}>
                <Image source={{ uri: role.icon }} style={styles.cardIcon} resizeMode="contain" />
              </View>
              <Text style={styles.cardText}>{role.name}</Text>
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

// Styles remain the same as you provided for HomeScreen.jsx
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
  },
  schoolName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#008080",
  },
  schoolSubName: {
    fontSize: 15,
    fontWeight: "300",
    color: "#008080",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  tagline: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#777",
    marginBottom: 30,
    
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: -10,
  },
  card: {
    width: "40%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: "center",
    margin: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardIconWrapper: {
    marginBottom: 10,
  },
  cardIcon: {
    width: 45,
    height: 45,
  },
  cardText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
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
  bottomTagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
});