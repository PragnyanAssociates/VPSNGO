import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Alert, Modal, TextInput, Linking, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useIsFocused } from '@react-navigation/native';
import { decode } from "@googlemaps/polyline-codec";
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../../apiConfig';
import DropDownPicker from 'react-native-dropdown-picker';
import { Country, State, City }  from 'country-state-city';
import Toast from 'react-native-simple-toast'; 

const Stack = createStackNavigator();

const makeCall = (phoneNumber) => {
    if (phoneNumber) Linking.openURL(`tel:${phoneNumber}`);
};

// --- COMPONENT 1: The Form Modal ---
const RouteFormModal = ({ routeToEdit, onClose, onSave }) => {
    const { user } = useAuth();
    const isEditMode = !!routeToEdit;
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSaving, setIsSaving] = useState(false);
    
    const [routeName, setRouteName] = useState('');
    const [driverName, setDriverName] = useState('');
    const [driverPhone, setDriverPhone] = useState('');
    const [conductorName, setConductorName] = useState('');
    const [conductorPhone, setConductorPhone] = useState('');
    const [stops, setStops] = useState([{ point: '' }, { point: '' }]);
    
    const [countryOpen, setCountryOpen] = useState(false);
    const [stateOpen, setStateOpen] = useState(false);
    const [cityOpen, setCityOpen] = useState(false);
    const [country, setCountry] = useState(null);
    const [state, setState] = useState(null);
    const [city, setCity] = useState(null);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => { setCountries(Country.getAllCountries().map(c => ({ label: c.name, value: c.isoCode }))); }, []);
    useEffect(() => { const loadData = async () => { if (isEditMode && routeToEdit) { try { const res = await fetch(`${API_BASE_URL}/api/transport/routes/${routeToEdit.route_id}`); const data = await res.json(); setRouteName(data.route_name || ''); setDriverName(data.driver_name || ''); setDriverPhone(data.driver_phone || ''); setConductorName(data.conductor_name || ''); setConductorPhone(data.conductor_phone || ''); setStops(data.stops.length > 0 ? data.stops.map(s => ({ point: s.point })) : [{ point: '' }, { point: '' }]); const allCountries = Country.getAllCountries(); const foundCountry = allCountries.find(c => c.name === data.country); if (foundCountry) { setCountry(foundCountry.isoCode); const allStates = State.getStatesOfCountry(foundCountry.isoCode); const foundState = allStates.find(s => s.name === data.state); if (foundState) { setState(foundState.isoCode); setCity(data.city); } } } catch (e) { Alert.alert("Error", e.message); onClose(); } finally { setIsLoading(false); } } else { setIsLoading(false); } }; loadData(); }, [isEditMode, routeToEdit]);
    useEffect(() => { if (country) setStates(State.getStatesOfCountry(country).map(s => ({ label: s.name, value: s.isoCode }))); else setStates([]); setState(null); }, [country]);
    useEffect(() => { if (state && country) setCities(City.getCitiesOfState(country, state).map(c => ({ label: c.name, value: c.name }))); else setCities([]); setCity(null); }, [state, country]);

    const handleStopChange = (text, index) => {
        const newStops = [...stops];
        newStops[index].point = text;
        setStops(newStops);
    };
    const addStop = () => setStops([...stops, { point: '' }]);
    const removeStop = (index) => { if (stops.length > 2) setStops(stops.filter((_, i) => i !== index)); };

    const handleFormSubmit = async () => {
        const countryName = Country.getCountryByCode(country)?.name;
        const stateName = State.getStateByCodeAndCountry(state, country)?.name;
        if (!routeName || !driverName || !countryName || !stateName || !city || stops.length < 2 || stops.some(s => !s.point.trim())) { return Alert.alert("Validation Error", "Please fill all required fields and provide at least two valid boarding points."); }
        const payload = { route_name: routeName, driver_name: driverName, driver_phone: driverPhone, conductor_name: conductorName, conductor_phone: conductorPhone, stops, city, state: stateName, country: countryName, created_by: user.id };
        const url = isEditMode ? `${API_BASE_URL}/api/transport/routes/${routeToEdit.route_id}` : `${API_BASE_URL}/api/transport/routes`;
        const method = isEditMode ? 'PUT' : 'POST';
        setIsSaving(true);
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const resJson = await response.json();
            if (!response.ok) throw new Error(resJson.message || "Failed to save route.");
            Alert.alert("Success", `Route ${isEditMode ? 'updated' : 'created'}!`);
            onSave();
            onClose();
        } catch (error) { Alert.alert("Error", error.message); } finally { setIsSaving(false); }
    };
    
    return (
        <Modal visible={true} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={{flex: 1}}>
                <ScrollView style={styles.modalContainer} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 50 }}>
                    <Text style={styles.modalHeader}>{isEditMode ? "Edit Route" : "Create New Route"}</Text>
                    {isLoading ? <ActivityIndicator size="large" color="#3498db" /> : (
                        <>
                            <TextInput style={styles.input} placeholder="Route Name (e.g., Route-1)" defaultValue={routeName} onChangeText={setRouteName} />
                            <TextInput style={styles.input} placeholder="Driver Name" defaultValue={driverName} onChangeText={setDriverName} />
                            <TextInput style={styles.input} placeholder="Driver Phone" defaultValue={driverPhone} onChangeText={setDriverPhone} keyboardType="phone-pad"/>
                            <TextInput style={styles.input} placeholder="Conductor Name" defaultValue={conductorName} onChangeText={setConductorName} />
                            <TextInput style={styles.input} placeholder="Conductor Phone" defaultValue={conductorPhone} onChangeText={setConductorPhone} keyboardType="phone-pad"/>
                            <Text style={styles.formSectionHeader}>Location</Text>
                            <DropDownPicker listMode="MODAL" searchable={true} open={countryOpen} value={country} items={countries} setOpen={setCountryOpen} setValue={setCountry} placeholder="Select a Country" zIndex={3000} zIndexInverse={1000} style={styles.dropdown} containerStyle={styles.dropdownContainer} />
                            <DropDownPicker listMode="MODAL" searchable={true} open={stateOpen} value={state} items={states} setOpen={setStateOpen} setValue={setState} placeholder="Select a State" disabled={!country} zIndex={2000} zIndexInverse={2000} style={styles.dropdown} containerStyle={styles.dropdownContainer}/>
                            <DropDownPicker listMode="MODAL" searchable={true} open={cityOpen} value={city} items={cities} setOpen={setCityOpen} setValue={setCity} placeholder="Select a City" disabled={!state} zIndex={1000} zIndexInverse={3000} style={styles.dropdown} containerStyle={styles.dropdownContainer}/>
                            <Text style={styles.formSectionHeader}>Boarding Points (in order)</Text>
                            {stops.map((stop, index) => (
                                <View key={index} style={styles.stopInputContainer}>
                                    <TextInput style={styles.stopInput} placeholder={`Stop ${index + 1} (e.g., Ameerpet)`} onChangeText={(text) => handleStopChange(text, index)} defaultValue={stop.point} />
                                    {stops.length > 2 && ( <TouchableOpacity style={styles.removeStopButton} onPress={() => removeStop(index)}> <Icon name="times-circle" size={24} color="#e74c3c" /> </TouchableOpacity> )}
                                </View>
                            ))}
                            <TouchableOpacity style={styles.addStopButton} onPress={addStop}>
                                <Text style={styles.addStopButtonText}>+ Add Another Stop</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose} disabled={isLoading}><Text style={styles.modalButtonText}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleFormSubmit} disabled={isSaving || isLoading}>{isSaving ? <ActivityIndicator color="#fff"/> : <Text style={styles.saveButtonText}>Save Route</Text>}</TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

// --- COMPONENT 2: The List of All Routes ---
const TransportListScreen = ({ navigation }) => {
    const [routes, setRoutes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const isFocused = useIsFocused();
    const fetchRoutes = useCallback(async () => { setIsLoading(true); try { const response = await fetch(`${API_BASE_URL}/api/transport/routes`); if (!response.ok) throw new Error("Could not fetch routes."); setRoutes(await response.json()); } catch (error) { Alert.alert("Error", error.message); } finally { setIsLoading(false); } }, []);
    useEffect(() => { if (isFocused) { fetchRoutes(); } }, [isFocused, fetchRoutes]);
    if (isLoading) { return <View style={styles.centered}><ActivityIndicator size="large" color="#3498db" /></View>; }
    return (
        <SafeAreaView style={styles.listContainerSafe}>
            <FlatList data={routes} keyExtractor={(item) => item.route_id.toString()} renderItem={({ item }) => ( <TouchableOpacity style={styles.routeListItem} onPress={() => navigation.navigate('RouteDetails', { routeId: item.route_id, routeName: item.route_name })}> <View style={styles.routeIconContainer}><Icon name="route" size={24} color="#3498db" /></View> <Text style={styles.routeListItemText}>{item.route_name}</Text> <Icon name="chevron-right" size={16} color="#bdc3c7" /> </TouchableOpacity> )} contentContainerStyle={styles.listContentContainer} ListEmptyComponent={<Text style={styles.emptyText}>No transport routes have been added yet.</Text>} />
        </SafeAreaView>
    );
};

// --- COMPONENT 3: The Route Detail View with Map (UPGRADED FOR LIVE ANIMATION) ---
const RouteDetailScreen = ({ route }) => {
    const { routeId } = route.params;
    const [routeData, setRouteData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMapFullScreen, setIsMapFullScreen] = useState(false);
    const mapRef = useRef(null); 
    const liveMarkerRef = useRef(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [busHeading, setBusHeading] = useState(0);
    const prevCoordsRef = useRef(null);

    const getBearing = (startLat, startLng, destLat, destLng) => {
        startLat = startLat * Math.PI / 180;
        startLng = startLng * Math.PI / 180;
        destLat = destLat * Math.PI / 180;
        destLng = destLng * Math.PI / 180;
        const y = Math.sin(destLng - startLng) * Math.cos(destLat);
        const x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
        let brng = Math.atan2(y, x);
        brng = brng * 180 / Math.PI;
        return (brng + 360) % 360;
    };

    useEffect(() => {
        const fetchAndTrack = async (isInitialLoad = false) => { 
            try { 
                const response = await fetch(`${API_BASE_URL}/api/transport/routes/${routeId}`); 
                if (!response.ok) throw new Error("Could not fetch route details."); 
                const data = await response.json(); 
                
                if (isInitialLoad) {
                    setRouteData(data); 
                    if (data && data.route_path_polyline) {
                        const decoded = decode(data.route_path_polyline, 5);
                        setRouteCoordinates(decoded.map(c => ({ latitude: parseFloat(c[0]), longitude: parseFloat(c[1]) })));
                    } else {
                        setRouteCoordinates([]);
                    }
                } else {
                    setRouteData(prevData => ({ ...prevData, ...data }));
                }

                const newLat = parseFloat(data.current_lat);
                const newLng = parseFloat(data.current_lng);

                if (!isNaN(newLat) && !isNaN(newLng)) {
                    const newCoordinate = { latitude: newLat, longitude: newLng };
                    if (prevCoordsRef.current) {
                        const prevLat = prevCoordsRef.current.latitude;
                        const prevLng = prevCoordsRef.current.longitude;
                        if (prevLat !== newLat || prevLng !== newLng) {
                           const heading = getBearing(prevLat, prevLng, newLat, newLng);
                           setBusHeading(heading);
                           liveMarkerRef.current?.animateMarkerToCoordinate(newCoordinate, 2000); // 2-second animation
                        }
                    }
                    prevCoordsRef.current = newCoordinate;
                }

            } catch (error) { 
                console.error("Failed to update route data:", error.message);
                if (isInitialLoad) Alert.alert("Error", error.message);
                else Toast.show('Could not update live location.', Toast.SHORT);
            } finally { 
                if (isInitialLoad) setIsLoading(false); 
            } 
        };

        fetchAndTrack(true);
        const interval = setInterval(() => fetchAndTrack(false), 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [routeId]);

    useEffect(() => {
        if (mapRef.current && routeCoordinates.length > 1) {
            setTimeout(() => {
                mapRef.current.fitToCoordinates(routeCoordinates, { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true });
            }, 500); 
        }
    }, [routeCoordinates, isMapFullScreen]);

    if (isLoading) return <View style={styles.centered}><ActivityIndicator size="large" color="#3498db" /></View>;
    if (!routeData) return <View style={styles.centered}><Text>Route data not found.</Text></View>;
    
    const osmTileUrl = "https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=LcjtfAnfWsn73mRnaArK";
    
    const MapDisplay = (
        <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            provider={null} 
            mapType="none"
            initialRegion={routeCoordinates.length > 0 ? { latitude: routeCoordinates[0].latitude, longitude: routeCoordinates[0].longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 } : undefined}
        >
            <UrlTile urlTemplate={osmTileUrl} maximumZ={19} zIndex={-1} shouldReplaceMapContent={true} />
            {routeCoordinates.length > 0 && <Polyline coordinates={routeCoordinates} strokeColor="#E53935" strokeWidth={6} />}
            {routeData.stops && routeData.stops.map(stop => {
                const stopLat = parseFloat(stop.stop_lat);
                const stopLng = parseFloat(stop.stop_lng);
                if (!isNaN(stopLat) && !isNaN(stopLng)) {
                    return (<Marker key={`stop-${stop.sno}`} coordinate={{ latitude: stopLat, longitude: stopLng }}><View style={styles.stopMarker}><Text style={styles.stopMarkerText}>{stop.sno}</Text></View></Marker>);
                }
                return null;
            })}

            {(() => {
                const currentLat = parseFloat(routeData.current_lat);
                const currentLng = parseFloat(routeData.current_lng);
                if (!isNaN(currentLat) && !isNaN(currentLng)) {
                    return (
                        <Marker 
                            ref={liveMarkerRef}
                            anchor={{ x: 0.5, y: 0.5 }}
                            coordinate={{ latitude: currentLat, longitude: currentLng }} 
                            rotation={busHeading}
                            flat={true} // Important for smooth rotation on Android
                        >
                             <View style={styles.liveMarker}>
                                <Icon name="location-arrow" size={18} color="#fff" style={styles.liveMarkerArrow} />
                             </View>
                        </Marker>
                    );
                }
                return null;
            })()}
        </MapView>
    );

    return (
        <SafeAreaView style={styles.detailContainerSafe}>
            {!isMapFullScreen && (
                <ScrollView>
                    <View style={styles.detailHeader}><View style={styles.driverInfo}><Text style={styles.infoLabel}>Driver</Text><View style={styles.contactRow}><Text style={styles.infoValue}>{routeData.driver_name}</Text><TouchableOpacity onPress={() => makeCall(routeData.driver_phone)} style={{marginLeft: 10}}><Icon name="phone-alt" size={16} color="#3498db"/></TouchableOpacity></View></View><View style={styles.driverInfo}><Text style={styles.infoLabel}>Conductor</Text><View style={styles.contactRow}><Text style={styles.infoValue}>{routeData.conductor_name}</Text><TouchableOpacity onPress={() => makeCall(routeData.conductor_phone)} style={{marginLeft: 10}}><Icon name="phone-alt" size={16} color="#3498db"/></TouchableOpacity></View></View></View>
                    <TouchableOpacity activeOpacity={0.9} onPress={() => setIsMapFullScreen(true)} style={styles.mapContainer}>
                        <Text style={styles.mapTitle}>Live Bus Tracking</Text>
                        {routeCoordinates.length > 0 ? MapDisplay : <View style={styles.mapPlaceholder}><Text>Route map is unavailable.</Text></View>}
                        <View style={styles.mapOverlay}><Text style={styles.mapOverlayText}>Tap to track live</Text></View>
                    </TouchableOpacity>
                    <View style={styles.stopsTable}><View style={styles.tableHeader}><Text style={[styles.tableHeaderCell, {flex: 0.2}]}>S.No.</Text><Text style={[styles.tableHeaderCell, {flex: 0.8}]}>Boarding Point</Text></View>{routeData.stops.map((stop, index) => (<View key={index} style={styles.tableRow}><Text style={styles.snoCell}>{stop.sno}</Text><Text style={styles.boardingCell}>{stop.point}</Text></View>))}</View>
                </ScrollView>
            )}
            
            {isMapFullScreen && (
                <View style={styles.fullScreenMapContainer}>
                    {MapDisplay}
                    <TouchableOpacity style={styles.closeMapButton} onPress={() => setIsMapFullScreen(false)}>
                        <Icon name="times" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};


// --- COMPONENT 4: The Admin Panel ---
const AdminTransportPanel = ({ navigation }) => { 
    const [routes, setRoutes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const isFocused = useIsFocused();
    const fetchAdminRoutes = useCallback(async () => { setIsLoading(true); try { const response = await fetch(`${API_BASE_URL}/api/transport/routes`); if (!response.ok) throw new Error("Could not fetch routes."); setRoutes(await response.json()); } catch (error) { Alert.alert("Error", error.message); } finally { setIsLoading(false); } }, []);
    useEffect(() => { if (isFocused) { fetchAdminRoutes(); } }, [isFocused, fetchAdminRoutes]);
    const handleOpenModal = (route = null) => { setEditingRoute(route); setIsModalVisible(true); };
    const handleDelete = async (routeId) => { Alert.alert("Confirm Deletion", "Are you sure you want to delete this route?", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: async () => { try { const response = await fetch(`${API_BASE_URL}/api/transport/routes/${routeId}`, { method: 'DELETE' }); if (!response.ok) throw new Error("Failed to delete route."); Alert.alert("Success", "Route deleted."); fetchAdminRoutes(); } catch (error) { Alert.alert("Error", error.message); } } }]); };
    return (
        <SafeAreaView style={styles.listContainerSafe}>
            <Text style={styles.adminHeader}>Manage Routes</Text>
            <FlatList
                data={routes}
                keyExtractor={item => item.route_id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.adminCard} onPress={() => navigation.navigate('RouteDetails', { routeId: item.route_id, routeName: item.route_name })}>
                        <Text style={styles.adminCardTitle}>{item.route_name}</Text>
                        <View style={styles.adminCardActions}>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleOpenModal(item); }}><Icon name="edit" size={20} color="#3498db" /></TouchableOpacity>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleDelete(item.route_id); }}><Icon name="trash" size={20} color="#e74c3c" /></TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
                ListFooterComponent={<TouchableOpacity style={styles.adminAddButton} onPress={() => handleOpenModal(null)}><Text style={styles.adminAddButtonText}>+ Add New Route</Text></TouchableOpacity>}
                onRefresh={fetchAdminRoutes}
                refreshing={isLoading}
                ListEmptyComponent={!isLoading && <Text style={styles.emptyText}>No routes created yet.</Text>}
            />
            {isModalVisible && <RouteFormModal routeToEdit={editingRoute} onSave={fetchAdminRoutes} onClose={() => setIsModalVisible(false)} />}
        </SafeAreaView>
    );
};

// --- Navigators & Main Export ---
const StudentTransportNavigator = () => (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#2c3e50' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }}>
        <Stack.Screen name="TransportRoutesList" component={TransportListScreen} options={{ title: 'School Transport' }} />
        <Stack.Screen name="RouteDetails" component={RouteDetailScreen} options={({ route }) => ({ title: route.params?.routeName || 'Route Details' })} />
    </Stack.Navigator>
);

const AdminNavigator = () => (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#2c3e50' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }}>
        <Stack.Screen name="AdminTransportPanel" component={AdminTransportPanel} options={{ title: 'Manage Routes' }} />
        <Stack.Screen name="RouteDetails" component={RouteDetailScreen} options={({ route }) => ({ title: route.params?.routeName || 'Route Details' })} />
    </Stack.Navigator>
);

const TransportScreen = () => {
    const { user } = useAuth();
    if (!user) return <View style={styles.centered}><ActivityIndicator size="large" color="#3498db" /></View>;
    if (user.role === 'student' || user.role === 'teacher') return <StudentTransportNavigator />;
    if (user.role === 'admin') return <AdminNavigator />;
    return <View style={styles.centered}><Text>Transport module not available for your role.</Text></View>;
};

// --- Styles ---
const styles = StyleSheet.create({
    fullScreenMapContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'white', zIndex: 1000, },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#7f8c8d' },
    listContainerSafe: { flex: 1, backgroundColor: '#f5f5f5' },
    listContentContainer: { paddingHorizontal: 16, paddingVertical: 10, },
    routeListItem: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, },
    routeIconContainer: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#eaf5ff', justifyContent: 'center', alignItems: 'center', marginRight: 15, },
    routeListItemText: { flex: 1, fontSize: 17, fontWeight: '600', color: '#34495e', },
    detailContainerSafe: { flex: 1, backgroundColor: '#f8f9fa' },
    detailHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
    driverInfo: { flex: 1, alignItems: 'center', gap: 5 },
    contactRow: { flexDirection: 'row', alignItems: 'center' },
    infoLabel: { fontSize: 14, color: '#7f8c8d' },
    infoValue: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
    mapContainer: { marginHorizontal: 15, marginTop: 15, borderRadius: 12, overflow: 'hidden', elevation: 5, backgroundColor: '#ddd', height: 220 },
    mapPlaceholder: { height: 220, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e9ecef', marginHorizontal: 15, marginTop: 15, borderRadius: 12, borderWidth: 1, borderColor: '#ced4da', },
    mapTitle: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, fontSize: 18, fontWeight: 'bold', padding: 15, textAlign: 'center', color: '#34495e', backgroundColor: 'rgba(236, 240, 241, 0.8)' },
    mapOverlay: { ...StyleSheet.absoluteFillObject, top: 50, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    mapOverlayText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 },
    closeMapButton: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 20, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 20, elevation: 5 }, 
    stopMarker: { backgroundColor: '#fff', borderColor: '#555', borderWidth: 2, borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2, },
    stopMarkerText: { color: '#555', fontWeight: 'bold', fontSize: 14, },
    liveMarker: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#4285F4', justifyContent: 'center', alignItems: 'center', borderColor: '#fff', borderWidth: 3, elevation: 6, },
    liveMarkerArrow: { transform: [{ translateY: -1 }] },
    stopsTable: { marginHorizontal: 15, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, overflow: 'hidden', marginBottom: 20, backgroundColor: '#fff' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#34495e' },
    tableHeaderCell: { padding: 12, fontWeight: 'bold', fontSize: 15, color: '#fff', textAlign: 'left' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ecf0f1' },
    snoCell: { flex: 0.2, textAlign: 'center', paddingVertical: 12, fontSize: 14, color: '#7f8c8d', backgroundColor: '#f8f9fa' },
    boardingCell: { flex: 0.8, paddingVertical: 12, paddingHorizontal: 10, fontSize: 16, color: '#2c3e50' },
    adminHeader: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', padding: 15, backgroundColor: '#fff' },
    adminCard: { backgroundColor: '#fff', padding: 20, marginVertical: 8, marginHorizontal: 15, borderRadius: 8, elevation: 3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    adminCardTitle: { fontSize: 18, fontWeight: '600' },
    adminCardActions: { flexDirection: 'row', gap: 25 },
    adminAddButton: { backgroundColor: '#27ae60', padding: 15, margin: 15, borderRadius: 8, alignItems: 'center' },
    adminAddButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    modalContainer: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
    modalHeader: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ced4da', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 15 },
    formSectionHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 15, marginBottom: 10, color: '#2c3e50' },
    dropdownContainer: { marginBottom: 15 },
    dropdown: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ced4da' },
    stopInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    stopInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ced4da', padding: 12, borderRadius: 8, marginRight: 10, fontSize: 16 },
    addStopButton: { backgroundColor: '#e9ecef', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ced4da', marginTop: 10 },
    addStopButtonText: { color: '#495057', fontWeight: 'bold' },
    removeStopButton: { marginLeft: 10, padding: 5, justifyContent: 'center' },
    modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30, paddingBottom: 20 },
    modalButton: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: '#6c757d', marginRight: 10 },
    saveButton: { backgroundColor: '#28a745', marginLeft: 10 },
    modalButtonText: { color: '#fff', fontWeight: 'bold' },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default TransportScreen;