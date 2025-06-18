// 📂 File: App.tsx (FINAL AND COMPLETE WITH DEEP LINKING)

import 'react-native-gesture-handler';
import React, { useEffect } from 'react'; // ✅ Import useEffect
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native'; // ✅ Import useNavigationContainerRef
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet, Linking } from 'react-native'; // ✅ Import Linking
import { AuthProvider, useAuth } from './src/context/AuthContext';

// --- Screen Imports (Your full list) ---

// Public (Pre-Login) Screens
import WelcomePage from './src/components/WelcomePage';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import DonorRegistrationScreen from './src/screens/DonorRegistrationScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import AboutUs from './src/components/AboutUs';
import { TransportFeatureNavigator } from './src/components/Transport';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';

// Authenticated Dashboards
import AdminDashboard from './src/components/AdminDashboard';
import TeacherDashboard from './src/components/TeacherDashboard';
import StudentDashboard from './src/components/StudentDashboard';
import DonorDashboard from './src/components/DonorDashboard';

// Shared Authenticated Sub-screens
import ProfileScreen from './src/screens/ProfileScreen';
import AcademicCalendar from './src/components/AcademicCalendar';
import TimetableScreen from './src/screens/TimetableScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import PhysicsSyllabus from './src/components/PhysicsSyllabus';

// Admin-Specific Screens
import AdminNotifications from './src/components/AdminNotifications';
import AdminLM from './src/components/AdminLM';
import AdminForgotPasswordScreen from './src/components/AdminForgotPasswordScreen';
import AdminHelpDeskScreen from './src/screens/helpdesk/AdminHelpDeskScreen';
import AdminEventsScreen from './src/screens/events/AdminEventsScreen';
import TeacherAdminPTMScreen from './src/screens/ptm/TeacherAdminPTMScreen';

// Teacher-Specific Screens
import TeacherNotifications from './src/components/TeacherNotifications';
import TeacherTB from './src/components/TeacherTB';
import TeacherPTM from './src/components/TeacherPTM';
import TeacherHomework from './src/components/TeacherHomework';
import TeacherSyllabus from './src/components/TeacherSyllabus';
import TeacherAttendance from './src/components/TeacherAttendance';
import TeacherResults from './src/components/TeacherResults';
import TeacherHealthAdminScreen from './src/screens/health/TeacherHealthAdminScreen';
import TeacherAdminLabsScreen from './src/screens/labs/TeacherAdminLabsScreen';

// Student-Specific Screens
import StudentNotifications from './src/components/StudentNotifications';
import StudentHealthScreen from './src/screens/health/StudentHealthScreen';
import StudentHelpdesk from './src/components/StudentHelpdesk';
import StudentPTM from './src/components/StudentPTM';
import StudentLabs from './src/components/StudentLabs';
import StudentHomework from './src/components/StudentHomework';
import StudentResults from './src/components/StudentResults';
import StudentSchedule from './src/components/StudentSchedule';
import StudentSM from './src/components/StudentSM';
import StudentAttendance from './src/components/StudentAttendance';
import StudentHistory from './src/components/StudentHistory';
import StudentTB from './src/components/StudentTB';
import StudentSyllabus from './src/components/StudentSyllabus';
import StudentExams from './src/components/StudentExams';
import StudentSportsScreen from './src/screens/sports/StudentSportsScreen';
import StudentEventsScreen from './src/screens/events/StudentEventsScreen';
import StudentPTMScreen from './src/screens/ptm/StudentPTMScreen';

// Donor-Specific Screens
import DonorNotifications from './src/components/DonorNotifications';
import DonorSuggestions from './src/components/DonorSuggestions';
import DonorReceipts from './src/components/DonorReceipts';
import DonorPayments from './src/components/DonorPayments';
import DonorSponsor from './src/components/DonorSponsor';
import DonorSI from './src/components/DonorSI';

// Unified Help Desk Screen for authenticated users
import UserHelpDeskScreen from './src/screens/helpdesk/UserHelpDeskScreen';

const Stack = createStackNavigator();

// --- STACK 1: Screens available BEFORE a user logs in ---
const PublicStack = () => (
  <Stack.Navigator initialRouteName="WelcomePage" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="WelcomePage" component={WelcomePage} />
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="DonorRegistration" component={DonorRegistrationScreen} />
    <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
    <Stack.Screen name="AboutUs" component={AboutUs} />
    <Stack.Screen name="Transport" component={TransportFeatureNavigator} />
    <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

// --- STACK 2: Screens available ONLY AFTER a user logs in ---
const AuthenticatedStack = () => {
  const { user } = useAuth();
  const getInitialRouteName = () => {
    switch (user?.role) {
      case 'admin':   return 'AdminDashboard';
      case 'teacher': return 'TeacherDashboard';
      case 'donor':   return 'DonorDashboard';
      case 'student': return 'StudentDashboard';
      default:        return 'StudentDashboard';
    }
  };

  return (
    <Stack.Navigator initialRouteName={getInitialRouteName()} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
      <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
      <Stack.Screen name="DonorDashboard" component={DonorDashboard} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AcademicCalendar" component={AcademicCalendar} />
      <Stack.Screen name="Timetable" component={TimetableScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="PhysicsSyllabus" component={PhysicsSyllabus} />
      <Stack.Screen name="UserHelpDesk" component={UserHelpDeskScreen} />
      <Stack.Screen name="AdminNotifications" component={AdminNotifications} />
      <Stack.Screen name="AdminLM" component={AdminLM} />
      <Stack.Screen name="AdminForgotPasswordScreen" component={AdminForgotPasswordScreen} />
      <Stack.Screen name="AdminHelpDeskScreen" component={AdminHelpDeskScreen} />
      <Stack.Screen name="AdminEventsScreen" component={AdminEventsScreen} />
      <Stack.Screen name="TeacherNotifications" component={TeacherNotifications} />
      <Stack.Screen name="TeacherTB" component={TeacherTB} />
      <Stack.Screen name="TeacherPTM" component={TeacherPTM} />
      <Stack.Screen name="TeacherHomework" component={TeacherHomework} />
      <Stack.Screen name="TeacherSyllabus" component={TeacherSyllabus} />
      <Stack.Screen name="TeacherAttendance" component={TeacherAttendance} />
      <Stack.Screen name="TeacherHealthAdminScreen" component={TeacherHealthAdminScreen} />
      <Stack.Screen name="TeacherResults" component={TeacherResults} />
      <Stack.Screen name="StudentNotifications" component={StudentNotifications} />
      <Stack.Screen name="StudentHealthScreen" component={StudentHealthScreen} />
      <Stack.Screen name="StudentHelpdesk" component={StudentHelpdesk} />
      <Stack.Screen name="StudentSportsScreen" component={StudentSportsScreen} />
      <Stack.Screen name="StudentEventsScreen" component={StudentEventsScreen} />
      <Stack.Screen name="StudentPTM" component={StudentPTM} />
      <Stack.Screen name="StudentLabs" component={StudentLabs} />
      <Stack.Screen name="StudentHomework" component={StudentHomework} />
      <Stack.Screen name="StudentResults" component={StudentResults} />
      <Stack.Screen name="StudentSchedule" component={StudentSchedule} />
      <Stack.Screen name="StudentSM" component={StudentSM} />
      <Stack.Screen name="StudentAttendance" component={StudentAttendance} />
      <Stack.Screen name="StudentHistory" component={StudentHistory} />
      <Stack.Screen name="StudentTB" component={StudentTB} />
      <Stack.Screen name="StudentSyllabus" component={StudentSyllabus} />
      <Stack.Screen name="StudentExams" component={StudentExams} />
      <Stack.Screen name="DonorNotifications" component={DonorNotifications} />
      <Stack.Screen name="DonorSuggestions" component={DonorSuggestions} />
      <Stack.Screen name="DonorReceipts" component={DonorReceipts} />
      <Stack.Screen name="DonorPayments" component={DonorPayments} />
      <Stack.Screen name="DonorSponsor" component={DonorSponsor} />
      <Stack.Screen name="DonorSI" component={DonorSI} />
      <Stack.Screen name="TeacherAdminPTMScreen" component={TeacherAdminPTMScreen} />
      <Stack.Screen name="StudentPTMScreen" component={StudentPTMScreen} />
      <Stack.Screen name="TeacherAdminLabsScreen" component={TeacherAdminLabsScreen} />
    </Stack.Navigator>
  );
};


// --- Main Router ---
const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const navigationRef = useNavigationContainerRef(); // ✅ Create a ref

  // ✅ This object defines your app's custom URL scheme and how to map it to screens
  const linking = {
    prefixes: ['vspngo://'],
    config: {
      screens: {
        // This name MUST match the screen name in the PublicStack
        ResetPasswordScreen: 'reset-password/:token',
      },
    },
  };

  // ✅ This effect listens for incoming deep links while the app is already running
  useEffect(() => {
    const onReceiveURL = ({ url }: { url: string }) => {
      // This function can be expanded to handle more complex links later if needed
      console.log("Deep link received: ", url);
    };

    // Set up the event listener
    const subscription = Linking.addEventListener('url', onReceiveURL);

    // Clean up the listener when the component is unmounted
    return () => {
      subscription.remove();
    };
  }, []);


  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }

  // ✅ The `linking` object is passed to the NavigationContainer to handle all deep links
  return (
    <NavigationContainer ref={navigationRef} linking={linking} fallback={<ActivityIndicator color="#008080" />}>
      {user ? <AuthenticatedStack /> : <PublicStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8ff'
  }
});