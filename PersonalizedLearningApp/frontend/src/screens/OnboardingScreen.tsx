import React from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../navigation/AppNavigator';
import authService from '../services/auth';

const { width, height } = Dimensions.get('window');

type OnboardingScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();

  const handleDone = async () => {
    try {
      await authService.completeOnboarding();
      console.log('Onboarding completed, navigating to Login');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Onboarding
        onSkip={handleDone}
        onDone={handleDone}
        pages={[
          {
            backgroundColor: '#4B0082',
            image: (
              <View style={styles.imageContainer}>
                <MaterialIcons name="school" size={width * 0.4} color="#fff" />
              </View>
            ),
            title: 'Welcome to ZimLearn',
            subtitle: 'Your personalized learning journey starts here',
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
          {
            backgroundColor: '#2E8B57',
            image: (
              <View style={styles.imageContainer}>
                <MaterialIcons name="menu-book" size={width * 0.4} color="#fff" />
              </View>
            ),
            title: 'Comprehensive Resources',
            subtitle: 'Access textbooks, videos, and practice materials from trusted sources like MoPSE and CollegePress',
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
          {
            backgroundColor: '#8A2BE2',
            image: (
              <View style={styles.imageContainer}>
                <MaterialIcons name="psychology" size={width * 0.4} color="#fff" />
              </View>
            ),
            title: 'Smart Learning',
            subtitle: 'Get personalized recommendations based on your learning style and progress',
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
          {
            backgroundColor: '#FF6B6B',
            image: (
              <View style={styles.imageContainer}>
                <MaterialIcons name="trending-up" size={width * 0.4} color="#fff" />
              </View>
            ),
            title: 'Track Progress',
            subtitle: 'Monitor your learning journey and improve your grades with our adaptive learning system',
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
        ]}
        containerStyles={styles.onboardingContainer}
        imageContainerStyles={styles.onboardingImageContainer}
        titleStyles={styles.onboardingTitle}
        subTitleStyles={styles.onboardingSubtitle}
        skipLabel="Skip"
        nextLabel="Next"
        doneLabel="Get Started"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  onboardingContainer: {
    flex: 1,
  },
  onboardingImageContainer: {
    paddingBottom: 20,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  onboardingSubtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  imageContainer: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
});

export default OnboardingScreen; 