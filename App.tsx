import 'react-native-gesture-handler';
import React from 'react';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


// Admin
import AdminStudentProfiles from './src/components/AdminStudentProfiles'; // No curly braces
import AdminLogin from './src/components/AdminLogin';
import AdminRegister from './src/components/AdminRegister';
import AdminForgotPasswordScreen from './src/components/AdminForgotPasswordScreen';
import AdminDashboard from './src/components/AdminDashboard'; // Assuming this is default export
import AdminProfile from './src/components/AdminProfile'; // Assuming this is default export
import AdminNotifications from './src/components/AdminNotifications'; // Assuming this is default export

// Screens
import WelcomePage from './src/components/WelcomePage';
import HomeScreen from './src/components/HomeScreen';
import ForgotPasswordScreen from './src/components/ForgotPasswordScreen';

// Student
import StudentLogin from './src/components/StudentLogin';
import StudentDashboard from './src/components/StudentDashboard';
import StudentNotifications from './src/components/StudentNotifications';
import StudentProfile from './src/components/StudentProfile';
import StudentHealth from './src/components/StudentHealth';
import StudentHelpdesk from './src/components/StudentHelpdesk';
import StudentSports from './src/components/StudentSports';
import StudentEvents from './src/components/StudentEvents';
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

//Subjects
import PhysicsSyllabus from './src/components/PhysicsSyllabus';

// Teacher
import TeacherLogin from './src/components/TeacherLogin';
import TeacherRegister from './src/components/TeacherRegister';
import TeacherDashboard from './src/components/TeacherDashboard';
import TeacherNotifications from './src/components/TeacherNotifications';
import TeacherProfile from './src/components/TeacherProfile';
import TeacherTB from './src/components/TeacherTB';
import TeacherCL from './src/components/TeacherCL';
import TeacherEvents from './src/components/TeacherEvents';
import TeacherPTM from './src/components/TeacherPTM';
import TeacherHomework from './src/components/TeacherHomework';
import TeacherSyllabus from './src/components/TeacherSyllabus';
import TeacherAttendance from './src/components/TeacherAttendance';
import TeacherHI from './src/components/TeacherHI';
import TeacherResults from './src/components/TeacherResults';

// Extras
import AcademicCalendar from './src/components/AcademicCalendar'; // Assuming this is default export
import { TransportFeatureNavigator } from './src/components/Transport';
import AboutUs from './src/components/AboutUs';

// Donor
import DonorLogin from './src/components/DonorLogin';
import DonorDashboard from './src/components/DonorDashboard';
import DonorNotifications from './src/components/DonorNotifications';
import DonorProfile from './src/components/DonorProfile';
import DonorHelp from './src/components/DonorHelp';
import DonorSuggestions from './src/components/DonorSuggestions';
import DonorReceipts from './src/components/DonorReceipts';
import DonorPayments from './src/components/DonorPayments';
import DonorSponsor from './src/components/DonorSponsor';
import DonorSI from './src/components/DonorSI';


enableScreens();
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WelcomePage">
        {/* General */}
        <Stack.Screen name="WelcomePage" component={WelcomePage} options={{ headerShown: false }} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ headerTitle: '', headerTransparent: true }} />

        {/* Student */}
        <Stack.Screen name="StudentLogin" component={StudentLogin} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentDashboard" component={StudentDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="StudentNotifications" component={StudentNotifications} options={{ headerShown: false }} />
        <Stack.Screen name="StudentProfile" component={StudentProfile} options={{ headerShown: false }} />
        <Stack.Screen name="StudentHealth" component={StudentHealth} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentHelpdesk" component={StudentHelpdesk} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentSports" component={StudentSports} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentEvents" component={StudentEvents} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentPTM" component={StudentPTM} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentLabs" component={StudentLabs} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentHomework" component={StudentHomework} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentSchedule" component={StudentSchedule} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentResults" component={StudentResults} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentSM" component={StudentSM} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentAttendance" component={StudentAttendance} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentHistory" component={StudentHistory} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentTB" component={StudentTB} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentSyllabus" component={StudentSyllabus} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="StudentExams" component={StudentExams} options={{ headerTitle: '', headerTransparent: true }} />

        {/* Subject syllabus */}
        <Stack.Screen name="PhysicsSyllabus" component={PhysicsSyllabus} options={{ headerTitle: '', headerTransparent: true }} />

        {/* Teacher */}
        <Stack.Screen name="TeacherLogin" component={TeacherLogin} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="TeacherRegister" component={TeacherRegister} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="TeacherNotifications" component={TeacherNotifications} options={{ headerShown: false }} />
        <Stack.Screen name="TeacherProfile" component={TeacherProfile} options={{ headerShown: false }} />
        <Stack.Screen name="TeacherTB" component={TeacherTB} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="TeacherCL" component={TeacherCL} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="TeacherEvents" component={TeacherEvents} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="TeacherPTM" component={TeacherPTM} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="TeacherHomework" component={TeacherHomework} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="TeacherSyllabus" component={TeacherSyllabus} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="TeacherAttendance" component={TeacherAttendance} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="TeacherHI" component={TeacherHI} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="TeacherResults" component={TeacherResults} options={{ headerTitle: '', headerTransparent: true }} />

        {/* Admin */}
        <Stack.Screen name="AdminLogin" component={AdminLogin} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="AdminRegister" component={AdminRegister} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="AdminForgotPasswordScreen" component={AdminForgotPasswordScreen} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="AdminProfile" component={AdminProfile} options={{ headerShown: false }} />
        <Stack.Screen name="AdminNotifications" component={AdminNotifications} options={{ headerShown: false }} />
        <Stack.Screen name="AdminStudentProfiles" component={AdminStudentProfiles} options={{ headerTitle: '', headerTransparent: true }} />

        {/* Academic */}
        <Stack.Screen name="AcademicCalendar" component={AcademicCalendar} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="Transport" component={TransportFeatureNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="AboutUs" component={AboutUs} options={{ headerShown: false }} />
        
        {/* Donor */}
        <Stack.Screen name="DonorLogin" component={DonorLogin} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="DonorDashboard" component={DonorDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="DonorNotifications" component={DonorNotifications} options={{ headerShown: false }} />
        <Stack.Screen name="DonorProfile" component={DonorProfile} options={{ headerShown: false }} />
        <Stack.Screen name="DonorHelp" component={DonorHelp} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="DonorSuggestions" component={DonorSuggestions} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="DonorReceipts" component={DonorReceipts} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="DonorPayments" component={DonorPayments} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="DonorSponsor" component={DonorSponsor} options={{ headerTitle: '', headerTransparent: true }} />
        <Stack.Screen name="DonorSI" component={DonorSI} options={{ headerTitle: '', headerTransparent: true }} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}