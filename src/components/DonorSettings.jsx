// DonorSettings.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Switch,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Using FontAwesome5

const DARK_COLORS = {
  background: 'FFFFFF', // Very dark gray, almost black
  card: '#2C2C2E',       // Slightly lighter dark gray for cards/items
  text: '#333333',         // Light gray/off-white for primary text
  subtleText: '#8E8E93',   // Gray for less important text (like section headers)
  icon: '#333333',
  separator: '#38383A',   // Separator line color
  primaryAction: '#34C759', // Green for active toggle
  inactiveToggle: '#787880', // Gray for inactive toggle track
  white: '#FFFFFF',
  black: '#000000',
};

const DonorSettings = ({ navigation }) => { // Assuming you might pass navigation prop
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSoundEffectOn, setIsSoundEffectOn] = useState(false);
  const [learningGoal, setLearningGoal] = useState('Relaxed');

  const toggleDarkMode = () => setIsDarkMode(previousState => !previousState);
  const toggleSoundEffect = () => setIsSoundEffectOn(previousState => !previousState);

  const handleLearningGoalPress = () => {
    console.log("Navigate to Learning Goal settings");
    // Example: navigation.navigate('LearningGoalScreen');
    alert("Learning Goal pressed (navigation placeholder)");
  };

  const SettingItem = ({ iconName, title, children, onPress, iconColor = DARK_COLORS.icon }) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.settingItem}>
        <Icon name={iconName} size={20} color={iconColor} style={styles.settingIcon} />
        <Text style={styles.settingTitle}>{title}</Text>
        <View style={styles.settingControl}>
          {children}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_COLORS.card} />
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation ? navigation.goBack() : alert("Back pressed")} style={styles.backButton}>
          <Icon name="chevron-left" size={22} color={DARK_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} /> Spacer for centering title
      </View> */}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>APP SETTINGS</Text>
          <View style={styles.settingsCard}>
            <SettingItem iconName="moon" title="Dark Mode" iconColor={DARK_COLORS.icon}>
              <Switch
                trackColor={{ false: DARK_COLORS.inactiveToggle, true: DARK_COLORS.primaryAction }}
                thumbColor={DARK_COLORS.white}
                ios_backgroundColor={DARK_COLORS.inactiveToggle}
                onValueChange={toggleDarkMode}
                value={isDarkMode}
              />
            </SettingItem>
            <View style={styles.separator} />
            <SettingItem iconName="volume-up" title="Sound Effect" iconColor={DARK_COLORS.icon}>
              <Switch
                trackColor={{ false: DARK_COLORS.inactiveToggle, true: DARK_COLORS.primaryAction }}
                thumbColor={DARK_COLORS.white}
                ios_backgroundColor={DARK_COLORS.inactiveToggle}
                onValueChange={toggleSoundEffect}
                value={isSoundEffectOn}
              />
            </SettingItem>
            <View style={styles.separator} />
            <SettingItem
                iconName="bullseye" // or 'crosshairs', 'flag-checkered'
                title="Learning Goal"
                iconColor={DARK_COLORS.icon}
                onPress={handleLearningGoalPress}
            >
              <Text style={styles.settingValue}>{learningGoal}</Text>
              <Icon name="chevron-right" size={16} color={DARK_COLORS.subtleText} style={styles.arrowIcon} />
            </SettingItem>
          </View>
        </View>

        {/* You can add more settings groups here */}
        {/* <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>ACCOUNT</Text>
          <View style={styles.settingsCard}>
             ... more SettingItem components ...
          </View>
        </View> */}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    // backgroundColor: DARK_COLORS.card, // Header background
    borderBottomWidth: 1,
    // borderBottomColor: DARK_COLORS.separator,
  },
  backButton: {
    padding: 5, // Easier to tap
    width: 40, // To balance the spacer on the right
    alignItems: 'flex-start'
  },
  headerTitle: {
    color: DARK_COLORS.text,
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  settingsGroup: {
    marginBottom: 25,
  },
  groupTitle: {
    color: DARK_COLORS.subtleText,
    fontSize: 15,
    fontWeight: '500',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  settingsCard: {
    // backgroundColor: DARK_COLORS.card,
    borderRadius: 10,
    marginHorizontal: 15,
    overflow: 'hidden', // Ensures separator lines don't go beyond rounded corners
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    minHeight: 50, // Consistent height for items
  },
  settingIcon: {
    width: 30, // To align text nicely
    marginRight: 15,
    textAlign: 'center',
  },
  settingTitle: {
    flex: 1,
    color: DARK_COLORS.text,
    fontSize: 17,
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    color: DARK_COLORS.subtleText,
    fontSize: 17,
    marginRight: 8,
  },
  arrowIcon: {
    // marginLeft: 5, // Already handled by settingValue marginRight
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DARK_COLORS.separator,
    marginLeft: 60, // Align with text, after icon + margin
  },
});

export default DonorSettings;