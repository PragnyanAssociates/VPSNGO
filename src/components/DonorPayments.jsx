// DonorPayments.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Image, // Added for potential logo usage
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Picker } from '@react-native-picker/picker';

const COLORS = {
  primaryGreen: '#28a745',
  primaryBlue: '#007bff',
  primaryOrange: '#fd7e14', // For card payment button
  primaryGray: '#6c757d',
  lightGray: '#f8f9fa',
  mediumGray: '#e9ecef',
  darkGray: '#343a40',
  text: '#212529',
  white: '#ffffff',
  inputBorder: '#ced4da',
  placeholder: '#6c757d',
  danger: '#dc3545',
  pickerComponentBackground: Platform.OS === 'ios' ? '#f8f9fa' : '#ffffff',
  upiHeaderBg: '#f0f0f0',
  newTagBg: '#ffc107',
  newTagText: '#000000',
};

const CAUSE_OPTIONS = [
  { label: 'All', value: 'All' },
  { label: 'Scholarship Fund', value: 'Scholarship Fund' },
  { label: 'Community Kitchen', value: 'Community Kitchen' },
  { label: 'Disaster Relief', value: 'Disaster Relief' },
  { label: 'Education Drive', value: 'Education Drive' },
  { label: 'Animal Welfare', value: 'Animal Welfare' },
];

const FREQUENCY_OPTIONS = [
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'Annually', value: 'Annually' },
];

const PAYMENT_METHODS = [
  { id: 'UPI', name: 'UPI', emoji: '📲' },
  { id: 'CreditCard', name: 'Credit Card', emoji: '💳' },
  { id: 'DebitCard', name: 'Debit Card', emoji: '🏧' },
  { id: 'Add Bank Account', name: 'Bank Account', emoji: '💸' },
];

// Mock UPI Apps Data (Replace placeholders with actual Image components if needed)
const UPI_APPS = [
  { id: 'swiggy', name: 'Unlock Swiggy UPI', subtitle: 'Activate fastest UPI in 10 seconds', logoType: 'icon', logoName: 'utensils', newTag: 'NEW', logoColor: '#fc8019' },
  { id: 'gpay', name: 'Google Pay', logoType: 'icon', logoName: 'google', logoColor: '#EA4335'},
  { id: 'phonepe', name: 'PhonePe UPI', subtitle: 'Up to ₹100 cashback using RuPay Credit Card on UPI on transactions above ₹299', logoType: 'icon', logoName: 'rupee-sign', logoColor: '#6739B7'}, // Using rupee as placeholder
  { id: 'slice', name: 'slice', logoType: 'icon', logoName: 'credit-card', logoColor: '#8A2BE2'}, // Placeholder
];

const DonorPayments = () => {
  // 'main', 'oneTimeForm', 'recurringForm', 'upiPayment', 'cardPayment', 'paypalPayment', 'history'
  const [activeView, setActiveView] = useState('main');
  const [previousView, setPreviousView] = useState('main'); // To know where to go back to

  // General form state
  const [amount, setAmount] = useState('');
  const [cause, setCause] = useState(CAUSE_OPTIONS[0].value);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(PAYMENT_METHODS[0].id);
  const [frequency, setFrequency] = useState(FREQUENCY_OPTIONS[0].value);
  const [isRecurring, setIsRecurring] = useState(false);


  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState(''); // MM/YY
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');

  // UPI state
  const [selectedUpiAppId, setSelectedUpiAppId] = useState(null);

  const paymentHistoryData = [
    { id: '1', date: '2024-07-20', description: 'Donation to Scholarship Fund', amount: 50.00, status: 'Success', method: 'UPI' },
    { id: '2', date: '2024-06-15', description: 'Monthly - Education Drive', amount: 25.00, status: 'Success', method: 'Credit Card' },
  ];

  const resetFormFields = () => {
    setAmount('');
    setCause(CAUSE_OPTIONS[0].value);
    // Keep selectedPaymentMethodId for now, or reset if needed
    setFrequency(FREQUENCY_OPTIONS[0].value);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardHolderName('');
    setSelectedUpiAppId(null);
  };
  
  const navigateTo = (view, fromView) => {
      setPreviousView(fromView || activeView);
      setActiveView(view);
  }

  const handleBack = () => {
      // If on a payment detail screen, go back to the form
      if (['upiPayment', 'cardPayment', 'paypalPayment'].includes(activeView)) {
          setActiveView(isRecurring ? 'recurringForm' : 'oneTimeForm');
      } else if (['oneTimeForm', 'recurringForm', 'history'].includes(activeView)) {
          setActiveView('main');
          resetFormFields(); // Reset if going back to main screen
      } else {
          setActiveView('main'); // Default fallback
      }
  };

  const handleNextFromForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    // Navigate based on selected payment method
    const fromView = activeView; // 'oneTimeForm' or 'recurringForm'
    if (selectedPaymentMethodId === 'UPI') {
      navigateTo('upiPayment', fromView);
    } else if (selectedPaymentMethodId === 'CreditCard' || selectedPaymentMethodId === 'DebitCard') {
      navigateTo('cardPayment', fromView);
    } else if (selectedPaymentMethodId === 'PayPal') {
      navigateTo('paypalPayment', fromView);
    }
  };
  
  const handleUpiPay = () => {
      if (!selectedUpiAppId) {
          alert("Please select a UPI app.");
          return;
      }
      console.log("Processing UPI Payment:", { amount, cause, frequency: isRecurring ? frequency : undefined, upiApp: selectedUpiAppId });
      alert(`Mock UPI payment initiated with ${selectedUpiAppId} for ₹${amount}!`);
      resetFormFields();
      navigateTo('main');
  };

  const handleCardPay = () => {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardHolderName) {
          alert("Please fill all card details.");
          return;
      }
      // Add validation for card details here (format, length, etc.)
      console.log("Processing Card Payment:", { amount, cause, frequency: isRecurring ? frequency : undefined, cardNumber, cardExpiry, cardCvv, cardHolderName });
      alert(`Mock Card payment initiated for ₹${amount}!`);
      resetFormFields();
      navigateTo('main');
  };


  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Icon name="credit-card" size={30} color={COLORS.primaryGreen} solid />
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerTitle}>Make a Payment</Text>
        <Text style={styles.headerSubtitle}>Manage your donations and payments.</Text>
      </View>
    </View>
  );

  const renderMainView = () => (
    <View style={styles.buttonGroup}>
      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: COLORS.primaryGreen }]}
        onPress={() => { resetFormFields(); setIsRecurring(false); navigateTo('oneTimeForm', 'main'); }}
        activeOpacity={0.7}
      >
        <Icon name="" size={20} color={COLORS.white} style={styles.buttonIcon} />
        <Text style={styles.mainButtonText}>Make a Payment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: COLORS.primaryBlue }]}
        onPress={() => { resetFormFields(); setIsRecurring(true); navigateTo('recurringForm', 'main'); }}
        activeOpacity={0.7}
      >
        <Icon name="" size={20} color={COLORS.white} style={styles.buttonIcon} />
        <Text style={styles.mainButtonText}>Set Up Auto Payment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: COLORS.primaryGray }]}
        onPress={() => navigateTo('history', 'main')}
        activeOpacity={0.7}
      >
        <Icon name="" size={20} color={COLORS.white} style={styles.buttonIcon} />
        <Text style={styles.mainButtonText}>View Payment History</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPicker = (label, selectedValue, onValueChange, items) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          dropdownIconColor={COLORS.primaryGray}
        >
          {items.map((item) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    </View>
  );

  const renderPaymentMethodSelector = () => (
    <View>
      <Text style={styles.label}>Select Payment Method</Text>
      <View style={styles.radioGroup}>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={styles.radioButtonContainer}
            onPress={() => setSelectedPaymentMethodId(method.id)}
            activeOpacity={0.7}
          >
            <View style={[
                styles.radioOuterCircle,
                selectedPaymentMethodId === method.id && styles.radioOuterCircleSelected
            ]}>
              {selectedPaymentMethodId === method.id && <View style={styles.radioInnerCircle} />}
            </View>
            <Text style={styles.radioEmoji}>{method.emoji}</Text>
            <Text style={styles.radioLabel}>{method.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderInitialForm = (isRecurringForm) => (
    <View style={[styles.formContainer, { borderColor: isRecurringForm ? COLORS.primaryBlue : COLORS.primaryGreen, shadowColor: isRecurringForm ? COLORS.primaryBlue : COLORS.primaryGreen }]}>
      <Text style={[styles.formTitle, { color: isRecurringForm ? COLORS.primaryBlue : COLORS.primaryGreen }]}>
        {isRecurringForm ? 'Set Up Recurring Donation/Payment' : 'New Payment'}
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount (USD/Rupees)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          keyboardType="numeric"
          placeholderTextColor={COLORS.placeholder}
        />
      </View>

      {renderPicker("Cause/Fund", cause, (itemValue) => setCause(itemValue), CAUSE_OPTIONS)}
      {renderPaymentMethodSelector()}
      {isRecurringForm && renderPicker("Frequency", frequency, (itemValue) => setFrequency(itemValue), FREQUENCY_OPTIONS)}

      <Text style={styles.mockNotice}>Payment processing is mocked for this demo.</Text>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: isRecurringForm ? COLORS.primaryBlue : COLORS.primaryGreen }]}
          onPress={handleNextFromForm}
          activeOpacity={0.7}
        >
          <Icon name={isRecurringForm ? "" : ""} size={18} color={COLORS.white} style={styles.buttonIconSmall} />
          <Text style={styles.actionButtonText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={handleBack} // Changed from handleCancel to generic handleBack
          activeOpacity={0.7}
        >
          <Text style={[styles.actionButtonText, { color: COLORS.primaryGray }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUpiPaymentView = () => (
    <View style={styles.paymentDetailContainer}>
        <View style={styles.upiHeader}>
            <Icon name="rupee-sign" size={24} color={COLORS.darkGray} /> {/* Placeholder for UPI logo */}
            <Text style={styles.upiHeaderText}>Pay by any UPI App</Text>
        </View>

        {UPI_APPS.map(app => (
            <TouchableOpacity 
                key={app.id} 
                style={[styles.upiAppItem, selectedUpiAppId === app.id && styles.upiAppItemSelected]}
                onPress={() => setSelectedUpiAppId(app.id)}
            >
                <View style={styles.upiAppLogoContainer}>
                    {app.logoType === 'icon' ? 
                        <Icon name={app.logoName} size={24} color={app.logoColor || COLORS.primaryGray} />
                        : <Image source={{uri: app.logo}} style={styles.upiAppLogo} /> // Placeholder for actual image
                    }
                </View>
                <View style={styles.upiAppTextContainer}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={styles.upiAppName}>{app.name}</Text>
                        {app.newTag && <Text style={styles.newTag}>{app.newTag}</Text>}
                    </View>
                    {app.subtitle && <Text style={styles.upiAppSubtitle}>{app.subtitle}</Text>}
                </View>
                <View style={[styles.radioOuterCircle, {marginLeft: 'auto'}]}>
                    {selectedUpiAppId === app.id && <View style={styles.radioInnerCircle} />}
                </View>
                {app.id === 'swiggy' && <Icon name="chevron-right" size={18} color={COLORS.primaryGray} style={{marginLeft: 10}}/>}
            </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.upiAppItem}>
            <View style={styles.upiAppLogoContainer}>
                <Icon name="plus-circle" size={24} color={COLORS.primaryBlue} />
            </View>
            <View style={styles.upiAppTextContainer}>
                <Text style={styles.upiAppName}>Add New UPI ID</Text>
                <Text style={styles.upiAppSubtitle}>You need to have a registered UPI ID</Text>
            </View>
        </TouchableOpacity>

      <View style={styles.formActions}>
        <TouchableOpacity style={[styles.actionButton, { flex: 1, backgroundColor: COLORS.primaryGreen }]} onPress={handleUpiPay}>
          <Text style={styles.actionButtonText}>Pay ₹{amount || 0}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.backLink} onPress={handleBack}>
        <Text style={styles.backLinkText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCardPaymentView = () => (
    <View style={styles.paymentDetailContainer}>
        <Text style={styles.paymentDetailTitle}>Pay using {selectedPaymentMethodId === 'CreditCard' ? 'Credit Card' : 'Debit Card'}</Text>
        {/* Mock card type icons */}
        <View style={styles.cardTypeIconsContainer}>
            <Icon name="cc-visa" size={30} color="#1A1F71" style={styles.cardTypeIcon} />
            <Icon name="cc-mastercard" size={30} color="#EB001B" style={styles.cardTypeIcon} />
            <Icon name="cc-amex" size={30} color="#2E77BB" style={styles.cardTypeIcon} />
            <Icon name="cc-discover" size={30} color="#FF6600" style={styles.cardTypeIcon} />
        </View>

        <View style={styles.cardForm}>
            <TextInput
                style={styles.input}
                placeholder="Card Number"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                maxLength={19} // Max for Visa/MC with spaces
            />
            <TextInput
                style={[styles.input, styles.marginTop]}
                placeholder="Card Holder Name"
                value={cardHolderName}
                onChangeText={setCardHolderName}
            />
            <View style={styles.cardRow}>
                <TextInput
                    style={[styles.input, styles.cardInputHalf]}
                    placeholder="Expiry Date (MM/YY)"
                    value={cardExpiry}
                    onChangeText={setCardExpiry}
                    keyboardType="numeric"
                    maxLength={5}
                />
                <TextInput
                    style={[styles.input, styles.cardInputHalf]}
                    placeholder="CVV"
                    value={cardCvv}
                    onChangeText={setCardCvv}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={3}
                />
            </View>
            <View style={styles.saveCardOption}>
                <Icon name="check-square" size={20} color={COLORS.primaryGray} solid/>
                <Text style={styles.saveCardText}>This card will be saved for faster payment experience</Text>
                <Icon name="question-circle" size={16} color={COLORS.primaryGray} style={{marginLeft: 5}}/>
            </View>
        </View>

        <View style={styles.formActions}>
            <TouchableOpacity style={[styles.actionButton, {flex: 1, backgroundColor: COLORS.primaryOrange}]} onPress={handleCardPay}>
                <Text style={styles.actionButtonText}>Save and Pay ₹{amount || 0}</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.securityNoticeContainer}>
             <Icon name="shield-alt" size={16} color={COLORS.primaryGray} />
             <Text style={styles.securityNoticeText}>100% Security Guaranteed</Text>
        </View>
        <TouchableOpacity style={styles.backLink} onPress={handleBack}>
            <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
    </View>
  );
  
  // const renderPaypalPaymentView = () => (
  //   <View style={styles.paymentDetailContainer}>
  //       {/* <Text style={styles.paymentDetailTitle}>PayPal Payment</Text>
  //       <Icon name="paypal" size={60} color={COLORS.primaryBlue} style={{alignSelf: 'center', marginVertical: 30}}/>
  //       <Text style={{textAlign: 'center', fontSize: 16, color: COLORS.primaryGray, marginBottom: 30}}>
  //           PayPal integration is coming soon. You will be redirected to PayPal to complete your payment.
  //       </Text> */}
  //       <View style={styles.formActions}>
  //           <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleBack}>
  //           <Text style={[styles.actionButtonText, {color: COLORS.primaryGray}]}>Go Back</Text>
  //           </TouchableOpacity>
  //       </View>
  //   </View>
  // );


  const renderPaymentHistoryView = () => (
    <View style={styles.historyContainer}>
      <View style={styles.historyHeader}>
        <Text style={styles.formTitle}>Payment History</Text>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-left" size={18} color={COLORS.primaryBlue} />
            <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      {paymentHistoryData.length === 0 ? (
        <Text style={styles.emptyHistoryText}>No payment history found.</Text>
      ) : (
        paymentHistoryData.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <View style={styles.historyItemLeft}>
              <Icon 
                name={item.status === 'Success' ? "check-circle" : "times-circle"} 
                size={24} 
                color={item.status === 'Success' ? COLORS.primaryGreen : COLORS.danger} 
                solid
                style={styles.historyIcon}
              />
              <View>
                <Text style={styles.historyDescription}>{item.description}</Text>
                <Text style={styles.historySubText}>{item.date} via {item.method}</Text>
              </View>
            </View>
            <Text style={[
                styles.historyAmount, 
                { color: item.status === 'Success' ? COLORS.text : COLORS.danger }
            ]}>
                ${item.amount.toFixed(2)}
            </Text>
          </View>
        ))
      )}
    </View>
  );


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lightGray} />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.outerContainer}>
          {activeView !== 'upiPayment' && activeView !== 'cardPayment' && activeView !== '' && renderHeader()}
          
          {activeView === 'main' && renderMainView()}
          {activeView === 'oneTimeForm' && renderInitialForm(false)}
          {activeView === 'recurringForm' && renderInitialForm(true)}
          {activeView === 'upiPayment' && renderUpiPaymentView()}
          {activeView === 'cardPayment' && renderCardPaymentView()}
          {/* {activeView === 'paypalPayment' && renderPaypalPaymentView()} */}
          {activeView === 'history' && renderPaymentHistoryView()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightGray },
  scrollContainer: { flexGrow: 1, paddingBottom: 30 },
  outerContainer: { paddingHorizontal: 20, paddingTop: 10 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.mediumGray },
  headerTextContainer: { marginLeft: 15 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.darkGray },
  headerSubtitle: { fontSize: 15, color: COLORS.primaryGray },
  buttonGroup: { marginTop: 10 },
  mainButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 10, marginBottom: 18, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3 },
  buttonIcon: { marginRight: 12 },
  buttonIconSmall: { marginRight: 8 },
  mainButtonText: { color: COLORS.white, fontSize: 17, fontWeight: '600', letterSpacing: 0.5 },
  formContainer: { backgroundColor: COLORS.white, padding: 20, borderRadius: 12, borderWidth: 1.5, elevation: 5, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, marginBottom: 20 },
  formTitle: { fontSize: 22, fontWeight: '700', marginBottom: 25, textAlign: 'center' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 15, color: COLORS.primaryGray, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 8, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 15 : 12, fontSize: 16, color: COLORS.text },
  marginTop: { marginTop: 15 },
  pickerWrapper: { borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 8, backgroundColor: COLORS.white, overflow: 'hidden' },
  picker: { height: Platform.OS === 'ios' ? undefined : 50, width: '100%', color: COLORS.text, backgroundColor: COLORS.pickerComponentBackground },
  pickerItem: { color: COLORS.text },
  radioGroup: { flexDirection: 'column', marginBottom: 10 },
  radioButtonContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  radioOuterCircle: { height: 22, width: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.primaryGray, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  radioOuterCircleSelected: { borderColor: COLORS.primaryBlue },
  radioInnerCircle: { height: 12, width: 12, borderRadius: 6, backgroundColor: COLORS.primaryBlue },
  radioEmoji: { fontSize: Platform.OS === 'ios' ? 22 : 20, marginRight: 10, color: COLORS.text },
  radioLabel: { fontSize: 16, color: COLORS.text },
  mockNotice: { fontSize: 13, color: COLORS.primaryGray, fontStyle: 'italic', textAlign: 'center', marginTop: 10, marginBottom: 15 },
  formActions: { marginTop: 25, flexDirection: 'row', justifyContent: 'space-around' },
  actionButton: { flex: 0.48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  actionButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  cancelButton: { backgroundColor: COLORS.mediumGray },
  historyContainer: { backgroundColor: COLORS.white, paddingHorizontal: 15, paddingVertical: 20, borderRadius: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.mediumGray },
  backButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6 },
  backButtonText: { marginLeft: 6, color: COLORS.primaryBlue, fontSize: 16, fontWeight: '500' },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.mediumGray },
  historyItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  historyIcon: { marginRight: 15 },
  historyDescription: { fontSize: 15, color: COLORS.text, fontWeight: '500', marginBottom: 3 },
  historySubText: { fontSize: 13, color: COLORS.primaryGray },
  historyAmount: { fontSize: 16, fontWeight: 'bold' },
  emptyHistoryText: { textAlign: 'center', color: COLORS.primaryGray, fontSize: 16, marginTop: 25, paddingBottom: 20 },
  
  // Styles for Payment Detail Screens
  paymentDetailContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    // elevation: 4, // Can add if desired
  },
  paymentDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  backLink: {
    marginTop: 20,
    alignSelf: 'center',
  },
  backLinkText: {
    color: COLORS.primaryBlue,
    fontSize: 16,
    fontWeight: '500',
  },

  // UPI Payment Styles
  upiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10, // UPI header has less padding
    backgroundColor: COLORS.upiHeaderBg, // Light background for header
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: 10,
  },
  upiHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginLeft: 10,
  },
  upiAppItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
    backgroundColor: COLORS.white,
  },
  upiAppItemSelected: {
    backgroundColor: COLORS.lightGray, // Highlight selected
  },
  upiAppLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    // backgroundColor: COLORS.mediumGray, // Placeholder bg for logo
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  upiAppLogo: { // If using Image
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  upiAppTextContainer: {
    flex: 1,
  },
  upiAppName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  newTag: {
      backgroundColor: COLORS.newTagBg,
      color: COLORS.newTagText,
      fontSize: 10,
      fontWeight: 'bold',
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 4,
      marginLeft: 8,
      overflow: 'hidden', // For borderRadius on Text (iOS)
  },
  upiAppSubtitle: {
    fontSize: 12,
    color: COLORS.primaryGray,
    marginTop: 2,
  },

  // Card Payment Styles
  cardTypeIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTypeIcon: {
    marginHorizontal: 8,
  },
  cardForm: {
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cardInputHalf: {
    flex: 0.48, // Take slightly less than half to account for potential spacing
  },
  saveCardOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      paddingVertical: 10,
  },
  saveCardText: {
      marginLeft: 10,
      fontSize: 13,
      color: COLORS.primaryGray,
      flex: 1, // Allow text to wrap
  },
  securityNoticeContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 15,
      paddingVertical: 10,
      backgroundColor: COLORS.mediumGray,
      borderRadius: 6,
  },
  securityNoticeText: {
      marginLeft: 8,
      fontSize: 13,
      color: COLORS.primaryGray,
      fontWeight: '500',
  }
});

export default DonorPayments;