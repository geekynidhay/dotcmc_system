import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator, 
  Alert, 
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Connects to dev server running on Mac
// 10.0.2.2 for Android Studio Emulator, or your Mac's LAN IP for physical device
const API_BASE = 'http://192.168.1.17:8080/ajax.php';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Screen 1: Student Lookup & Confirmation
  // Step 1: Name search
  const [nameInput, setNameInput] = useState('');
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchingNames, setSearchingNames] = useState(false);

  // Step 2: Ledger number field (separate)
  const [ledgerInput, setLedgerInput] = useState('');

  // Step 3: Verified phone from backend
  const [confirmedMobile, setConfirmedMobile] = useState('');

  // Screen state: 'lookup' -> 'otp_screen'
  const [currentStep, setCurrentStep] = useState('lookup');

  // Screen 2: 4-digit Numeric OTP State
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    checkSavedSession();
  }, []);

  async function checkSavedSession() {
    try {
      const saved = await AsyncStorage.getItem('@dotcmc_student_session');
      if (saved) {
        setSession(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Error reading storage', e);
    } finally {
      setLoading(false);
    }
  }

  // Smooth name search with no text resets
  async function handleNameChange(text) {
    setNameInput(text);
    if (!text || text.trim().length < 2) {
      setNameSuggestions([]);
      return;
    }

    setSearchingNames(true);
    try {
      const response = await fetch(`${API_BASE}?action=get_mobile_students&search=${encodeURIComponent(text.trim())}`);
      const data = await response.json();
      setNameSuggestions(data || []);
    } catch (err) {
      console.log('Search error:', err);
    } finally {
      setSearchingNames(false);
    }
  }

  // When student taps their name from suggestions
  function handleSelectStudent(student) {
    setSelectedStudent(student);
    setNameInput(student.name);
    setNameSuggestions([]); // hide dropdown
    setLedgerInput(student.ledger_no || ''); // auto-fill or let them see
    setConfirmedMobile(student.contact || 'No phone registered');
  }

  // Proceed to Step 2: OTP Screen
  function handleProceedToOtp() {
    if (!selectedStudent) {
      Alert.alert('Selection Required', 'Please type and select your name from the suggestions.');
      return;
    }
    if (!ledgerInput.trim()) {
      Alert.alert('Ledger Required', 'Please enter your Ledger Number.');
      return;
    }

    // Verify ledger matches
    if (ledgerInput.trim().toLowerCase() !== (selectedStudent.ledger_no || '').trim().toLowerCase()) {
      Alert.alert('Ledger Mismatch', `The entered ledger number does not match ${selectedStudent.name}'s record. Please check again.`);
      return;
    }

    // Go to OTP Screen
    setCurrentStep('otp_screen');
    setOtp('');
  }

  // Verify 4-digit OTP
  async function handleVerifyOtp() {
    if (otp.length !== 4) {
      Alert.alert('4-Digit Required', 'Please enter the exact 4-digit OTP provided by center admin.');
      return;
    }

    setVerifyingOtp(true);
    try {
      const formData = new FormData();
      formData.append('student_id', selectedStudent.student_id);
      formData.append('otp', otp);

      const response = await fetch(`${API_BASE}?action=verify_student_otp`, {
        method: 'POST',
        body: formData,
      });

      const res = await response.json();

      if (res.status === 1) {
        await AsyncStorage.setItem('@dotcmc_student_session', JSON.stringify(res.student));
        setSession(res.student);
        Alert.alert('Welcome!', `Logged in successfully as ${res.student.name}`);
      } else {
        Alert.alert('Verification Failed', res.msg || 'Invalid or expired 30-second OTP.');
      }
    } catch (e) {
      Alert.alert('Server Error', 'Unable to reach center server. Make sure phone is on the same WiFi network.');
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleLogout() {
    Alert.alert('Logout', 'Log out of your student account on this phone?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('@dotcmc_student_session');
          setSession(null);
          setSelectedStudent(null);
          setNameInput('');
          setLedgerInput('');
          setConfirmedMobile('');
          setOtp('');
          setCurrentStep('lookup');
        }
      }
    ]);
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  // ==========================================
  // VIEW: LOGGED-IN DASHBOARD
  // ==========================================
  if (session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>DOT CMC STUDENT PORTAL</Text>
            <Text style={styles.headerTitle}>{session.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Roll No / ID:</Text>
              <Text style={styles.infoValue}>{session.roll_no}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ledger No:</Text>
              <Text style={styles.infoValue}>{session.ledger_no}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Course:</Text>
              <Text style={[styles.infoValue, { color: '#1e3a8a', fontWeight: 'bold' }]}>{session.course}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Registered Mobile:</Text>
              <Text style={styles.infoValue}>{session.contact || 'N/A'}</Text>
            </View>
          </View>

          <View style={[styles.card, styles.feeCard]}>
            <Text style={styles.feeCardTitle}>FEE SUMMARY</Text>
            <View style={styles.feeGrid}>
              <View style={styles.feeCol}>
                <Text style={styles.feeLabel}>Total Course Fee</Text>
                <Text style={styles.feeAmount}>₹{session.total_fee.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.feeCol}>
                <Text style={styles.feeLabel}>Total Paid</Text>
                <Text style={[styles.feeAmount, { color: '#10b981' }]}>₹{session.total_paid.toLocaleString('en-IN')}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Remaining Balance Due:</Text>
              <Text style={[styles.balanceAmount, { color: session.balance > 0 ? '#ef4444' : '#10b981' }]}>
                ₹{session.balance.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>PAYMENT RECEIPTS</Text>
          {session.payments && session.payments.length > 0 ? (
            session.payments.map((p, idx) => (
              <View key={idx} style={styles.paymentCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.receiptTitle}>Receipt #{p.receipt_no}</Text>
                  <Text style={styles.receiptDate}>{p.date} • {p.mode}</Text>
                  {p.remarks ? <Text style={styles.receiptRemarks}>Remarks: {p.remarks}</Text> : null}
                </View>
                <Text style={styles.receiptAmount}>₹{p.amount.toLocaleString('en-IN')}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No payments recorded yet.</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VIEW: STEP 2 - ENTER 4-DIGIT NUMERIC OTP
  // ==========================================
  if (currentStep === 'otp_screen') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.loginContainer} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentStep('lookup')}>
              <Text style={styles.backBtnText}>← Back to details</Text>
            </TouchableOpacity>

            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>DC</Text>
            </View>
            <Text style={styles.brandTitle}>Enter Login OTP</Text>
            <Text style={styles.brandSubtitle}>Verifying: {selectedStudent?.name}</Text>

            <View style={styles.selectedStudentBox}>
              <Text style={styles.selectedTitle}>Account Verified For:</Text>
              <Text style={styles.selectedName}>{selectedStudent?.name}</Text>
              <Text style={styles.selectedDetails}>Ledger: {ledgerInput} • Mobile: {confirmedMobile}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ENTER 4-DIGIT OTP</Text>
              <Text style={styles.otpHelper}>Ask Center Admin to click "Generate OTP" on dashboard</Text>
              
              {/* STRICTLY NUMERIC KEYPAD */}
              <TextInput
                style={styles.otpInput}
                placeholder="••••"
                placeholderTextColor="#cbd5e1"
                value={otp}
                onChangeText={(val) => setOtp(val.replace(/[^0-9]/g, ''))} // Strictly digits
                keyboardType="number-pad" // Only numbers on iOS and Android
                maxLength={4}
                textAlign="center"
                autoFocus={true}
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryBtn, verifyingOtp && { opacity: 0.6 }]} 
              onPress={handleVerifyOtp}
              disabled={verifyingOtp}
            >
              {verifyingOtp ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryBtnText}>Verify OTP & Complete Login</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              ⏱️ 30-Second Single-Use OTP Protection. Prevents any other student from accessing your account.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VIEW: STEP 1 - STUDENT NAME & LEDGER LOOKUP
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.loginContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>DC</Text>
          </View>
          <Text style={styles.brandTitle}>DOT CMC</Text>
          <Text style={styles.brandSubtitle}>Student Mobile Portal</Text>

          {/* 1. Name Input Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>1. STUDENT FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Search by your name (e.g. Suhani, Raj)..."
              placeholderTextColor="#94a3b8"
              value={nameInput}
              onChangeText={handleNameChange}
              autoCapitalize="words"
            />
            {searchingNames && <ActivityIndicator size="small" color="#1e3a8a" style={{ marginTop: 6 }} />}
          </View>

          {/* Real-time suggestions dropdown */}
          {nameSuggestions.length > 0 && (
            <View style={styles.dropdownList}>
              {nameSuggestions.map((item) => (
                <TouchableOpacity
                  key={item.student_id}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectStudent(item)}
                >
                  <Text style={styles.dropdownName}>{item.name}</Text>
                  <Text style={styles.dropdownSub}>
                    Roll: {item.roll_no} • Ledger: {item.ledger_no} • {item.course}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 2. Separate Ledger Number Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>2. LEDGER NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Ledger Number (e.g. JU22-01)"
              placeholderTextColor="#94a3b8"
              value={ledgerInput}
              onChangeText={setLedgerInput}
              autoCapitalize="characters"
            />
          </View>

          {/* 3. Confirm Mobile Number (Fetched from Backend) */}
          {selectedStudent && (
            <View style={styles.selectedStudentBox}>
              <Text style={styles.selectedTitle}>3. CONFIRM REGISTERED MOBILE (FROM RECORD):</Text>
              <Text style={styles.confirmedMobileText}>📱 {confirmedMobile}</Text>
              <Text style={styles.selectedDetails}>
                Course: {selectedStudent.course} • Roll No: {selectedStudent.roll_no}
              </Text>
            </View>
          )}

          {/* Proceed Button */}
          <TouchableOpacity 
            style={[styles.primaryBtn, !selectedStudent && { opacity: 0.6 }]} 
            onPress={handleProceedToOtp}
          >
            <Text style={styles.primaryBtnText}>Proceed to OTP Verification →</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            After selecting your Name and Ledger number, you will enter the 4-digit OTP provided by center admin.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#1e3a8a',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
  },
  feeCard: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  },
  feeCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 12,
  },
  feeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeCol: {
    flex: 1,
  },
  feeLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  feeAmount: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: '900',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  paymentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  receiptDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  receiptRemarks: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10b981',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
  },

  // Login Styles
  loginContainer: {
    padding: 24,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 6,
  },
  backBtnText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  otpHelper: {
    fontSize: 12,
    color: '#2563eb',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  dropdownList: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginTop: -8,
    marginBottom: 16,
    maxHeight: 180,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  dropdownSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  selectedStudentBox: {
    width: '100%',
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#93c5fd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  selectedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e40af',
    letterSpacing: 0.5,
  },
  confirmedMobileText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e3a8a',
    marginTop: 4,
  },
  selectedDetails: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 4,
  },
  otpInput: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 14,
    color: '#1e3a8a',
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#1e3a8a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  footerNote: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});
