import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs'; // Make sure path is correct
import OnboardingScreen from './screens/OnboardingScreen';
import UserTypeScreen from './screens/UserTypeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import VerificationScreen from './screens/VerificationScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const isComplete = await AsyncStorage.getItem('onboardingComplete');
      setIsOnboardingComplete(!!isComplete);
    };
    checkOnboarding();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isOnboardingComplete ? 'UserType' : 'Onboarding'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="UserType" component={UserTypeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
