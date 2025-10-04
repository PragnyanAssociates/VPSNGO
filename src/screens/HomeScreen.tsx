import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";

type NavigationProp = {
  navigate: (screen: string, params?: { role: string } | object) => void;
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const roles = [
    { id: 2, name: "Admin",     icon: "https://cdn-icons-png.flaticon.com/512/17003/17003310.png", type: 'login',    target: 'admin' },
    { id: 3, name: "Student",   icon: "https://cdn-icons-png.flaticon.com/128/2784/2784403.png", type: 'login',    target: 'student' },
    { id: 4, name: "Teacher",   icon: "https://cdn-icons-png.freepik.com/256/14416/14416005.png?semt=ais_hybrid", type: 'login',    target: 'teacher' },
    { id: 5, name: "Driver",    icon: "https://cdn-icons-png.flaticon.com/128/2798/2798177.png", type: 'login',    target: 'Driver' },
  ];

  const handleRolePress = (item: typeof roles[0]) => {
    if (item.type === 'login') {
      navigation.navigate('Login', { role: item.target });
    } else if (item.type === 'navigate') {
      navigation.navigate(item.target);
    }
  };

  return (
    // SafeAreaView ensures content doesn't overlap with the status bar or notches
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e0f2f7" />
      <View style={styles.header}>
        <Image 
          source={require("../assets/pragnyan-logo.png")} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.tagline}>Empowering Easy Institutional Management</Text>
      </View>
      
      <View style={styles.content}>
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
        <Text style={styles.footerText}>© 2025 Pragnyan</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f7f9fc" // Slightly cleaner background color
  },
  header: { 
    backgroundColor: "#e0f2f7", 
    paddingVertical: 30, // Balanced vertical padding
    alignItems: "center", 
    justifyContent: "center",
    borderBottomLeftRadius: 30, // Added curve to the header
    borderBottomRightRadius: 30,
  },
  // KEY CHANGE: Corrected the logo size to be proportional and not oversized.
  logo: { 
    width: 200,
    height: 200,
    marginBottom: 10, 
  },
  // KEY CHANGE: Better styling for the tagline for good hierarchy.
  tagline: { 
    fontSize: 18, 
    color: "#005662", // A darker, more professional color
    textAlign: 'center',
  },
  content: { 
    flex: 1, // This makes the content area take up all available space
    justifyContent: 'center', // This centers the grid vertically in the content area
    paddingHorizontal: 10,
  },
  grid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    // KEY CHANGE: This distributes the cards evenly with space around them
    justifyContent: "space-around", 
    alignItems: "center", 
  },
  // KEY CHANGE: Adjusted card styling for better spacing.
  card: { 
    width: "42%", // Slightly increased width
    backgroundColor: "#fff", 
    borderRadius: 15, // Softer corners
    padding: 20, 
    alignItems: "center", 
    // Replaced generic margin with marginBottom for consistent vertical spacing
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  cardIcon: { 
    width: 50, 
    height: 50, 
    marginBottom: 12 
  },
  cardText: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#333", 
  },
  footer: { 
    backgroundColor: "#e0f2f7", 
    paddingVertical: 15, 
    alignItems: "center", 
  },
  footerText: { 
    color: "#005662", 
    fontSize: 14,
  },
});