import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator';
import Animated, { FadeInDown } from 'react-native-reanimated';

type UserTypeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'UserType'>;

const UserTypeScreen: React.FC = () => {
  const navigation = useNavigation<UserTypeScreenNavigationProp>();
  const [selectedType, setSelectedType] = useState<'student' | 'teacher' | null>(null);

  const userTypes = [
    {
      id: 'student',
      title: 'Student',
      description: 'I want to learn and access educational resources',
      icon: 'school',
      color: '#4B0082',
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'I want to create and share educational resources',
      icon: 'person',
      color: '#2E8B57',
    },
  ];

  const handleContinue = () => {
    if (selectedType) {
      // Navigate to register screen with selected user type
      navigation.navigate('Register', { userType: selectedType });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.header}
        >
          <Text style={styles.title}>Welcome to ZimLearn</Text>
          <Text style={styles.subtitle}>Choose how you&apos;ll use the app</Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {userTypes.map((type, index) => (
            <Animated.View
              key={type.id}
              entering={FadeInDown.delay(400 + index * 200).springify()}
            >
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedType === type.id && styles.selectedCard,
                  { borderColor: type.color }
                ]}
                onPress={() => setSelectedType(type.id as 'student' | 'teacher')}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${type.color}20` }]}>
                  <MaterialIcons
                    name={type.icon as any}
                    size={32}
                    color={type.color}
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionTitle,
                    selectedType === type.id && { color: type.color }
                  ]}>
                    {type.title}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {type.description}
                  </Text>
                </View>
                {selectedType === type.id && (
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color={type.color}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Animated.View 
          entering={FadeInDown.delay(800).springify()}
          style={styles.footer}
        >
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedType && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedType}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  selectedCard: {
    borderWidth: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  checkIcon: {
    marginLeft: 8,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#4B0082',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(75, 0, 130, 0.2)',
      },
      default: {
        shadowColor: '#4B0082',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  disabledButton: {
    backgroundColor: '#ccc',
    ...Platform.select({
      web: {
        boxShadow: 'none',
      },
      default: {
        shadowOpacity: 0,
        elevation: 0,
      },
    }),
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666',
  },
  loginLinkTextBold: {
    color: '#4B0082',
    fontWeight: 'bold',
  },
});

export default UserTypeScreen; 