import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const VerificationScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Ref for hidden TextInput
  const inputRef = useRef(null);

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-digit verification code.');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Your email has been verified!');
        navigation.navigate('Home');
      } else {
        Alert.alert('Verification Failed', data.message || 'Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Verification code resent to your email.');
      } else {
        Alert.alert('Failed', data.message || 'Could not resend code. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  // Focus the hidden input when user taps the code boxes
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to{' '}
        <Text style={styles.email}>{email}</Text>
      </Text>

      <TouchableWithoutFeedback onPress={focusInput}>
        <View style={styles.codeContainer}>
          {Array(6)
            .fill()
            .map((_, i) => (
              <View key={i} style={styles.codeBox}>
                <Text style={styles.codeText}>{code[i] || ''}</Text>
              </View>
            ))}
        </View>
      </TouchableWithoutFeedback>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        autoFocus
      />

      <TouchableOpacity
        style={[styles.button, isVerifying && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={isVerifying}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {isVerifying ? 'Verifying...' : 'Verify'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.resendButton, isResending && styles.buttonDisabled]}
        onPress={handleResendCode}
        disabled={isResending}
        activeOpacity={0.8}
      >
        <Text style={styles.resendButtonText}>
          {isResending ? 'Resending...' : 'Resend Code'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const BOX_SIZE = 50;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4B0082',
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 40,
    textAlign: 'center',
  },
  email: {
    fontWeight: '600',
    color: '#FFD700',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  codeBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6A5ACD',
  },
  codeText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#4B0082',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resendButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  resendButtonText: {
    color: '#4B0082',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VerificationScreen;
