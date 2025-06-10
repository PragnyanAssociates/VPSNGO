// --- START OF FULL Transport.jsx ---

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome5';

// --- Data for Routes (Simulated) ---
// YOU MUST REPLACE ALL COORDINATES AND STOP NAMES WITH YOUR ACTUAL DATA
const ROUTES_DATA = [
  {
    id: 'Route-1',
    name: 'ROUTE NO: 1',
    driver: { name: 'Uvais Karani', phone: '9677434325' },
    conductor: { name: 'Ravi', phone: '9943798863' },
    stops: [
        { sno: 1, point: 'Senthaneerpuram' }, { sno: 2, point: 'Ponmalai' },
        { sno: 3, point: 'Ponmalaipatti' }, { sno: 4, point: 'K.K. Kottai' },
        { sno: 5, point: 'M.K. Kottai' }, { sno: 6, point: 'TVS Tollgate' },
        { sno: 7, point: 'Jail Corner' }, { sno: 8, point: 'Subramaniyapuram' },
        { sno: 9, point: 'Airport (Trichy)' }, { sno: 10, point: 'Wireless Road Terminus' },
    ],
    mapData: {
      initialRegion: { latitude: 10.7905, longitude: 78.7047, latitudeDelta: 0.12, longitudeDelta: 0.12 },
      busLocation: { latitude: 10.8061, longitude: 78.6949 }, // Example: Near Senthaneerpuram
      polylineCoordinates: [
        { latitude: 10.8061, longitude: 78.6949 }, { latitude: 10.7990, longitude: 78.7010 },
        { latitude: 10.7925, longitude: 78.7058 }, { latitude: 10.7850, longitude: 78.7100 },
        { latitude: 10.7780, longitude: 78.7130 }, { latitude: 10.7700, longitude: 78.7080 },
        { latitude: 10.7750, longitude: 78.6980 }, { latitude: 10.7830, longitude: 78.6900 },
        { latitude: 10.7650, longitude: 78.7097 }, { latitude: 10.7580, longitude: 78.7150 },
      ],
    },
    routeButtonIcon: { name: 'bus-alt', color: '#FF6F00', size: 40 },
  },
  {
    id: 'Route-2',
    name: 'ROUTE NO: 2',
    driver: { name: 'Anbu Selvan', phone: '9876543210' },
    conductor: { name: 'Kumar', phone: '9123456780' },
    stops: [
      { sno: 1, point: 'Central Bus Stand' }, { sno: 2, point: 'Chathiram Bus Stand' },
      { sno: 3, point: 'Thillai Nagar Main' }, { sno: 4, point: 'Srirangam Temple' }, { sno: 5, point: 'Samayapuram Toll' },
    ],
    mapData: {
      initialRegion: { latitude: 10.8550, longitude: 78.6900, latitudeDelta: 0.15, longitudeDelta: 0.15 },
      busLocation: { latitude: 10.8083, longitude: 78.6848 }, // Example: Central Bus Stand
      polylineCoordinates: [
        { latitude: 10.8083, longitude: 78.6848 }, { latitude: 10.8296, longitude: 78.6900 },
        { latitude: 10.8260, longitude: 78.6750 }, { latitude: 10.8550, longitude: 78.6900 },
        { latitude: 10.9400, longitude: 78.7300 },
      ],
    },
    routeButtonIcon: { name: 'route', color: '#4CAF50', size: 40 },
  },
  {
    id: 'Route-3',
    name: 'ROUTE NO: 3',
    driver: { name: 'Bala Murugan', phone: '9998887770' },
    conductor: { name: 'Siva', phone: '9776655440' },
    stops: [
      { sno: 1, point: 'Railway Junction' }, { sno: 2, point: 'Cantonment Police' },
      { sno: 3, point: 'Collector Office Road' }, { sno: 4, point: 'Mannarpuram Circle' },
    ],
     mapData: {
      initialRegion: { latitude: 10.7950, longitude: 78.6850, latitudeDelta: 0.05, longitudeDelta: 0.05 },
      busLocation: { latitude: 10.8000, longitude: 78.6800 }, // Junction
      polylineCoordinates: [
        { latitude: 10.8000, longitude: 78.6800 }, { latitude: 10.7950, longitude: 78.6850 },
        { latitude: 10.7900, longitude: 78.6900 }, { latitude: 10.7850, longitude: 78.6950 },
      ],
    },
    routeButtonIcon: { name: 'shipping-fast', color: '#03A9F4', size: 40 },
  },
  {
    id: 'Route-4',
    name: 'ROUTE NO: 4',
    driver: { name: 'Karthik Raja', phone: '9001122330' },
    conductor: { name: 'Velu', phone: '9332211000' },
    stops: [
      { sno: 1, point: 'KK Nagar Bus Stop' }, { sno: 2, point: 'LIC Colony Park' },
      { sno: 3, point: 'BHEL Township Gate' }, { sno: 4, point: 'NIT Trichy Campus' },
    ],
    mapData: {
      initialRegion: { latitude: 10.7600, longitude: 78.8150, latitudeDelta: 0.09, longitudeDelta: 0.09 },
      busLocation: { latitude: 10.7680, longitude: 78.7350 }, // KK Nagar
      polylineCoordinates: [
        { latitude: 10.7680, longitude: 78.7350 }, { latitude: 10.7650, longitude: 78.7300 },
        { latitude: 10.7400, longitude: 78.7800 }, { latitude: 10.7600, longitude: 78.8150 },
      ],
    },
    routeButtonIcon: { name: 'subway', color: '#9C27B0', size: 40 },
  },
];


const TransportStack = createStackNavigator();

const makeCall = (phoneNumber) => {
  if (phoneNumber) Linking.openURL(`tel:${phoneNumber}`);
  else console.warn('Phone number is not available.');
};

const TransportListScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.listContainerSafe}>
      {/* <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>Transport Routes</Text>
      </View> */}
      <ScrollView contentContainerStyle={styles.listScrollContainer}>
        <View style={styles.gridContainer}>
          {ROUTES_DATA.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={styles.routeButton}
              onPress={() => navigation.navigate('RouteDetails', { routeData: route })}
            >
              {route.routeButtonIcon && (
                <Icon
                  name={route.routeButtonIcon.name}
                  size={route.routeButtonIcon.size || 40}
                  color={route.routeButtonIcon.color || '#333333'}
                />
              )}
              <Text style={styles.routeButtonText}>{route.id}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const RouteDetailScreen = ({ route }) => {
  const { routeData } = route.params;

  if (!routeData) {
    return (
      <SafeAreaView style={styles.detailContainerSafe}>
        <Text style={styles.errorText}>Error: Route data not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.detailContainerSafe}>
      <ScrollView style={styles.detailScroll}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailHeaderText}>{routeData.name}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Driver : </Text>
            <Text style={styles.infoValueName}>{routeData.driver.name}</Text>
          </View>
          <TouchableOpacity onPress={() => makeCall(routeData.driver.phone)}>
            <Text style={[styles.infoValue, styles.phoneValue, styles.phoneLink]}>{routeData.driver.phone}</Text>
          </TouchableOpacity>

          <View style={[styles.infoRow, { marginTop: 10 }]}>
            <Text style={styles.infoLabel}>Conductor : </Text>
            <Text style={styles.infoValueName}>{routeData.conductor.name}</Text>
          </View>
          <TouchableOpacity onPress={() => makeCall(routeData.conductor.phone)}>
           <Text style={[styles.infoValue, styles.phoneValue, styles.phoneLink]}>{routeData.conductor.phone}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stopsTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.snoCell]}>S.No.</Text>
            <Text style={[styles.tableHeaderCell, styles.boardingCell]}>Boarding point</Text>
          </View>
          {routeData.stops.map((stop, index) => (
            <View key={stop.sno || `stop-${index}`} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}>
              <Text style={[styles.tableCell, styles.snoCell, styles.stopText]}>{stop.sno}</Text>
              <Text style={[styles.tableCell, styles.boardingCell, styles.stopText]}>{stop.point}</Text>
            </View>
          ))}
        </View>

        <View style={styles.mapContainer}>
          <Text style={styles.mapTitle}>Live Bus Tracking (Simulated)</Text>
          {routeData.mapData && routeData.mapData.initialRegion ? (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={routeData.mapData.initialRegion}
            >
              {routeData.mapData.polylineCoordinates && routeData.mapData.polylineCoordinates.length > 0 && (
                <Polyline
                  coordinates={routeData.mapData.polylineCoordinates}
                  strokeColor="#FF6347"
                  strokeWidth={4}
                />
              )}
              {routeData.mapData.busLocation && (
                <Marker
                  coordinate={routeData.mapData.busLocation}
                  title="Current Bus Location"
                  description={routeData.name}
                >
                  <Icon name="bus" size={30} color="#007AFF" />
                </Marker>
              )}
            </MapView>
          ) : (
            <Text style={styles.mapPlaceholder}>
              Map data is not available for this route.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export function TransportFeatureNavigator() {
  return (
    <TransportStack.Navigator
      initialRouteName="TransportRoutesList"
      screenOptions={{
        headerStyle: { backgroundColor: '#008080' }, // Purple theme for this navigator
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
      }}
    >
      <TransportStack.Screen
        name="TransportRoutesList"
        component={TransportListScreen}
        options={{ title: 'Select Transport Route' }}
      />
      <TransportStack.Screen
        name="RouteDetails"
        component={RouteDetailScreen}
        options={({ route }) => ({
           title: route.params?.routeData?.name || 'Route Details'
        })}
      />
    </TransportStack.Navigator>
  );
}

const styles = StyleSheet.create({
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
  phoneValue: { paddingLeft: '22%', color: '#DD2C00', },
  phoneLink: { textDecorationLine: 'underline', color: '#007AFF', },
  listContainerSafe: { flex: 1, backgroundColor: '#F5F5F5', },
  // listHeader: {
  //   backgroundColor: '#6200EE', // Purple header to match navigator
  //   paddingVertical: 18,
  //   paddingHorizontal: 20,
  //   alignItems: 'center',
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#4A00A8',
  // },
  // listHeaderText: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', }, // White text on purple
  listScrollContainer: { padding: 10, },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', },
  routeButton: {
    backgroundColor: '#FFFFFF', width: '45%', aspectRatio: 1.2, marginVertical: 10,
    paddingVertical: 20, paddingHorizontal: 15,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.20,
    shadowRadius: 5, elevation: 5, position: 'relative', borderWidth: 1, borderColor: '#E0E0E0',
  },
  routeButtonText: { marginTop: 12, fontSize: 15, fontWeight: '500', color: '#333333', textAlign: 'center', },
  detailContainerSafe: { flex: 1, backgroundColor: '#FFFFFF', },
  detailScroll: { flex: 1, },
  detailHeader: {
    backgroundColor: '#F0F0F0', paddingVertical: 12, paddingHorizontal: 15, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#D0D0D0', marginBottom: 15,
  },
  detailHeaderText: { fontSize: 18, fontWeight: 'bold', color: '#DD2C00', },
  infoSection: {
    paddingHorizontal: 20, marginBottom: 20, borderBottomWidth: 1,
    borderBottomColor: '#EEE', paddingBottom: 20,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3, },
  infoLabel: { fontSize: 16, fontWeight: 'bold', color: '#C62828', marginRight: 5, width: '25%', },
  infoValueName: { fontSize: 16, color: '#C62828', flex: 1, },
  stopsTable: {
    marginHorizontal: 15, borderWidth: 1, borderColor: '#BDBDBD',
    borderRadius: 8, marginBottom: 25, overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#616161', borderBottomWidth: 1, borderColor: '#424242',
  },
  tableHeaderCell: {
    paddingVertical: 12, paddingHorizontal: 8, fontWeight: 'bold',
    fontSize: 15, color: '#FFFFFF', textAlign: 'center',
  },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#E0E0E0', },
  tableRowEven: { backgroundColor: '#F9F9F9', },
  tableCell: { paddingVertical: 10, paddingHorizontal: 8, fontSize: 14, },
  snoCell: { flex: 0.2, textAlign: 'center', borderRightWidth: 1, borderColor: '#E0E0E0', },
  boardingCell: { flex: 0.8, paddingLeft: 10, },
  stopText: { color: '#D32F2F', },
  mapContainer: {
    marginHorizontal: 15, marginBottom: 30, borderTopWidth: 1,
    borderTopColor: '#DDD', paddingTop: 20,
  },
  mapTitle: { fontSize: 19, fontWeight: '600', marginBottom: 15, textAlign: 'center', color: '#333', },
  map: { width: '100%', height: 350, borderRadius: 8, },
  mapPlaceholder: {
    textAlign: 'center', color: '#757575', marginTop: 20, padding: 20,
    backgroundColor: '#FAFAFA', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0',
    minHeight: 100, // Ensure placeholder has some height
    justifyContent: 'center',
    alignItems: 'center'
  }
});

// --- END OF FULL Transport.jsx ---