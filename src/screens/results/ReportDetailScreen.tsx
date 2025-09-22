// 📂 File: src/screens/results/ReportDetailScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';

const ReportDetailScreen = ({ route, navigation }) => {
    const { reportId } = route.params;
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchReportDetails = async () => {
            try {
                // ★★★ 2. USE apiClient ★★★
                const response = await apiClient.get(`/reports/${reportId}/details`);
                setReportData(response.data);
            } catch (error: any) { 
                Alert.alert("Error", error.response?.data?.message || "Could not load report details."); 
            }
            finally { setIsLoading(false); }
        };
        fetchReportDetails();
    }, [reportId]);

    const handleDownloadPdf = async () => {
        if (!reportData) {
            Alert.alert("Error", "Report data is not available yet.");
            return;
        }
        setIsDownloading(true);
        const { reportDetails } = reportData;
        const fileName = `Report_${reportDetails.full_name.replace(/ /g, '_')}_${reportId}.pdf`;
        const htmlContent = generateHtmlForPdf(reportData);
        const options = {
            html: htmlContent,
            fileName: fileName,
            directory: Platform.OS === 'android' ? 'cache' : 'Documents',
        };
        try {
            const file = await RNHTMLtoPDF.convert(options);
            const sourcePath = file.filePath;
            if (Platform.OS === 'android') {
                const destinationPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
                await RNFS.moveFile(sourcePath, destinationPath);
                Alert.alert('Success!', `Report saved to your Downloads folder as ${fileName}`);
            } else {
                Alert.alert('Success!', `Report saved to your app's Documents folder.`);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Download Error', 'An error occurred while saving the PDF.');
        } finally {
            setIsDownloading(false);
        }
    };
    
    if (isLoading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    if (!reportData) return <View style={styles.centered}><Text>Report not found.</Text></View>;
    
    const { reportDetails, subjects } = reportData;
    let totalCredits = 0; let totalCreditPoints = 0;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mark Sheet</Text>
                <TouchableOpacity onPress={handleDownloadPdf} disabled={isDownloading} style={styles.downloadButtonHeader}>
                    {isDownloading ? <ActivityIndicator size="small" color="#0d47a1" /> : <MaterialIcons name="picture-as-pdf" size={24} color="#0d47a1" />}
                </TouchableOpacity>
            </View>
            <View style={styles.reportSheet}>
                <Text style={styles.mainTitle}>Report Card</Text>
                <View style={styles.grid}><View style={styles.row}><Text style={styles.cellLabel}>Student's Name: {reportDetails.full_name}</Text></View><View style={styles.row}><Text style={styles.cellLabel}>Class: {reportDetails.class_group}</Text></View><View style={styles.row}><Text style={styles.cellLabel}>Roll No: {reportDetails.roll_no || 'N/A'}</Text></View></View>
                <View style={styles.table}><View style={styles.tableHeader}><Text style={[styles.headerCell, {flex: 2}]}>Subject Name</Text><Text style={styles.headerCell}>Credit</Text><Text style={styles.headerCell}>Grade</Text><Text style={styles.headerCell}>Credit Point</Text></View>
                    {subjects.map((item) => { totalCredits += parseFloat(item.credit) || 0; totalCreditPoints += parseFloat(item.credit_point) || 0; return (<View key={item.subject_entry_id} style={styles.tableRow}><Text style={[styles.bodyCell, {flex: 2}]}>{item.subject_name}</Text><Text style={styles.bodyCell}>{item.credit || '-'}</Text><Text style={styles.bodyCell}>{item.grade || '-'}</Text><Text style={styles.bodyCell}>{item.credit_point || '-'}</Text></View>);})}
                    <View style={styles.tableRow}><Text style={[styles.footerCell, {flex: 2, textAlign: 'right'}]}>Total</Text><Text style={styles.footerCell}>{totalCredits.toFixed(2)}</Text><Text style={styles.footerCell}></Text><Text style={styles.footerCell}>{totalCreditPoints.toFixed(2)}</Text></View>
                </View>
                <View style={[styles.grid, {marginTop: 20}]}><View style={styles.row}><Text style={styles.cellLabel}>SGPA: {reportDetails.sgpa || 'N/A'}</Text></View><View style={styles.row}><Text style={styles.cellLabel}>CGPA: {reportDetails.cgpa || 'N/A'}</Text></View></View>
                <Text style={styles.footerNote}>{reportDetails.result_status}</Text>
            </View>
        </ScrollView>
    );
};

const generateHtmlForPdf = (reportData) => {
    const { reportDetails, subjects } = reportData;
    let totalCredits = 0; let totalCreditPoints = 0;
    const subjectsHtml = subjects.map(item => { totalCredits += parseFloat(item.credit) || 0; totalCreditPoints += parseFloat(item.credit_point) || 0; return `<tr class="body-row"><td class="cell subject-cell">${item.subject_name}</td><td class="cell">${item.credit || '-'}</td><td class="cell">${item.grade || '-'}</td><td class="cell">${item.credit_point || '-'}</td></tr>`; }).join('');
    return `<html><head><style>body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#333}.sheet{padding:30px;border:1px solid #ccc;margin:20px}.main-title{font-size:20px;font-weight:bold;text-align:center;margin-bottom:25px;text-transform:uppercase}.grid{border:1px solid #999;margin-bottom:20px}.row{display:flex;border-bottom:1px solid #999}.row:last-child{border-bottom:none}.cell-label{padding:10px;font-size:13px}.table{width:100%;border-collapse:collapse;margin-top:20px}.table,.cell,.header-cell{border:1px solid #999}.header-row{background-color:#f2f2f2}.header-cell{padding:10px;font-weight:bold;text-align:center;font-size:12px}.body-row .cell{padding:10px;text-align:center;font-size:12px}.subject-cell{text-align:left}.footer-row .cell{padding:10px;font-weight:bold;text-align:center;font-size:12px}.footer-note{text-align:center;margin-top:30px;font-size:12px;color:#777}</style></head><body><div class="sheet"><div class="main-title">Semester Grade Report</div><div class="grid"><div class="row"><div class="cell-label">Student's Name: <strong>${reportDetails.full_name}</strong></div></div><div class="row"><div class="cell-label">Class: <strong>${reportDetails.class_group}</strong></div></div><div class="row"><div class="cell-label">Roll No: <strong>${reportDetails.roll_no || 'N/A'}</strong></div></div></div><table class="table"><tr class="header-row"><th class="header-cell" style="width:50%">Subject Name</th><th class="header-cell">Credit</th><th class="header-cell">Grade</th><th class="header-cell">Credit Point</th></tr>${subjectsHtml}<tr class="footer-row"><td class="cell" style="text-align:right"><strong>Total</strong></td><td class="cell"><strong>${totalCredits.toFixed(2)}</strong></td><td class="cell"></td><td class="cell"><strong>${totalCreditPoints.toFixed(2)}</strong></td></tr></table><div class="grid" style="margin-top:20px"><div class="row"><div class="cell-label">SGPA: <strong>${reportDetails.sgpa || 'N/A'}</strong></div></div><div class="row"><div class="cell-label">CGPA: <strong>${reportDetails.cgpa || 'N/A'}</strong></div></div></div><div class="footer-note">${reportDetails.result_status}</div></div></body></html>`;
};
const styles = StyleSheet.create({ centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }, container: { flex: 1, backgroundColor: '#eef2f8' }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' }, backButton: { padding: 5 }, headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#333' }, downloadButtonHeader: { padding: 5 }, reportSheet: { backgroundColor: '#fff', margin: 15, padding: 20, borderWidth: 1, borderColor: '#ddd' }, mainTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }, grid: { borderWidth: 1, borderColor: '#ccc' }, row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc' }, cellLabel: { padding: 8, fontSize: 12 }, table: { borderWidth: 1, borderColor: '#ccc', marginTop: 20 }, tableHeader: { flexDirection: 'row', backgroundColor: '#f4f6f8', borderBottomWidth: 1, borderBottomColor: '#ccc' }, headerCell: { flex: 1, padding: 8, fontWeight: 'bold', borderRightWidth: 1, borderRightColor: '#ccc', textAlign: 'center', fontSize: 10 }, tableRow: { flexDirection: 'row' }, bodyCell: { flex: 1, padding: 8, borderRightWidth: 1, borderRightColor: '#eee', borderTopWidth: 1, borderTopColor: '#eee', textAlign: 'center', fontSize: 10 }, footerCell: { flex: 1, padding: 8, fontWeight: 'bold', borderRightWidth: 1, borderRightColor: '#eee', borderTopWidth: 1, borderTopColor: '#ccc', textAlign: 'center', fontSize: 10 }, footerNote: { textAlign: 'center', marginTop: 20, fontSize: 12, color: '#666' }});
export default ReportDetailScreen;