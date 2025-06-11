import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

const OnboardingScreen = ({ navigation }) => {
  return (
    <Onboarding
      onSkip={() => navigation.replace('Login')} // Redirect to Login
      onDone={() => navigation.replace('Login')} // Redirect to Login
      bottomBarHighlight={false}
      titleStyles={styles.title}
      subTitleStyles={styles.subtitle}
      pages={[
        {
          backgroundColor: '#a6e4d0',
          image: <Image style={styles.image} source={require('../assets/slide1.jpg')} />,
          title: 'Welcome to LearnApp',
          subtitle: 'Your journey to knowledge starts here.',
        },
        {
          backgroundColor: '#fdeb93',
          image: <Image style={styles.image} source={require('../assets/slide2.jpg')} />,
          title: 'Track Progress',
          subtitle: 'Stay motivated by tracking your learning milestones.',
        },
        {
          backgroundColor: '#e9bcbe',
          image: <Image style={styles.image} source={require('../assets/slide3.jpg')} />,
          title: 'Explore Courses',
          subtitle: 'Discover a variety of engaging, hands-on courses.',
        },
        {
          backgroundColor: '#d0e7f9',
          image: <Image style={styles.image} source={require('../assets/slide4.jpg')} />,
          title: 'Join a Community',
          subtitle: 'Connect, share, and grow with fellow learners.',
        },
        {
          backgroundColor: '#c3aed6',
          image: <Image style={styles.image} source={require('../assets/slide5.jpg')} />,
          title: 'Achieve Your Goals',
          subtitle: 'Take the next step in your education and career.',
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 280,
    height: 280,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    paddingHorizontal: 24,
    textAlign: 'center',
  },
});

export default OnboardingScreen;