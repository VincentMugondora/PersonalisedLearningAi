import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer, useRoute, RouteProp, CommonActions, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { IResource } from '../services/api';
import authService, { AuthState } from '../services/auth';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ResourceDetailScreen from '../screens/ResourceDetailScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SplashScreen from '../screens/SplashScreen';
import UserTypeScreen from '../screens/UserTypeScreen';
import PasswordSetupScreen from '../screens/PasswordSetupScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import AboutScreen from '../screens/AboutScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import VideoCourseScreen from '../screens/VideoCourseScreen';

// Types
export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  UserType: undefined;
  Login: undefined;
  Register: { userType: 'student' | 'teacher' };
  PasswordSetup: { email: string };
  VerifyEmail: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Favorites: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: { onboardingCompleted?: boolean };
  Main: undefined;
  About: undefined;
  Help: undefined;
  Notifications: undefined;
  ResourceDetail: { resource: IResource };
  VideoCourse: { resource: IResource };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

type AuthNavigatorRouteProp = RouteProp<RootStackParamList, 'Auth'>;

const AuthNavigator = () => {
  const route = useRoute<AuthNavigatorRouteProp>();
  const onboardingCompleted = route.params?.onboardingCompleted ?? false;

  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={onboardingCompleted ? 'Login' : 'Onboarding'}
    >
      <AuthStack.Screen name="Splash" component={SplashScreen} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="UserType" component={UserTypeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="PasswordSetup" component={PasswordSetupScreen} />
      <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    </AuthStack.Navigator>
  );
};

const MainNavigator = () => (
  <MainTab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#4B0082',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 5,
        paddingBottom: Platform.OS === 'ios' ? 20 : 5,
        height: Platform.OS === 'ios' ? 85 : 60,
      },
    }}
  >
    <MainTab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color }) => (
          <Icon name="home" size={24} color={color} />
        ),
      }}
    />
    <MainTab.Screen
      name="Search"
      component={SearchScreen}
      options={{
        tabBarLabel: 'Search',
        tabBarIcon: ({ color }) => (
          <Icon name="search" size={24} color={color} />
        ),
      }}
    />
    <MainTab.Screen
      name="Favorites"
      component={FavoritesScreen}
      options={{
        tabBarLabel: 'Favorites',
        tabBarIcon: ({ color }) => (
          <Icon name="favorite" size={24} color={color} />
        ),
      }}
    />
    <MainTab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color }) => (
          <Icon name="person" size={24} color={color} />
        ),
      }}
    />
    <MainTab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarLabel: 'Settings',
        tabBarIcon: ({ color }) => (
          <Icon name="settings" size={24} color={color} />
        ),
      }}
    />
  </MainTab.Navigator>
);

const AppNavigator = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    userType: null,
    onboardingCompleted: false,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        const state = await authService.initialize();
        console.log('Auth state initialized:', {
          isAuthenticated: state.isAuthenticated,
          hasToken: !!state.token,
          userType: state.userType,
          onboardingCompleted: state.onboardingCompleted,
        });
        setAuthState(state);
      } catch (error) {
        console.error('Error during app initialization:', error);
        setAuthState({
          isAuthenticated: false,
          token: null,
          userType: null,
          onboardingCompleted: false,
        });
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();

    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((state) => {
      console.log('Auth state changed:', {
        isAuthenticated: state.isAuthenticated,
        hasToken: !!state.token,
        userType: state.userType,
        onboardingCompleted: state.onboardingCompleted,
      });
      
      // Update local state
      setAuthState(state);

      // Reset navigation if logged out
      if (!state.isAuthenticated && navigationRef.current) {
        navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          })
        );
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  if (!isInitialized) {
    console.log('App is initializing...');
    return <SplashScreen />;
  }

  console.log('App initialized with auth state:', {
    isAuthenticated: authState.isAuthenticated,
    hasToken: !!authState.token,
    userType: authState.userType,
    onboardingCompleted: authState.onboardingCompleted,
  });

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!authState.isAuthenticated ? (
          <RootStack.Screen 
            name="Auth" 
            component={AuthNavigator} 
            initialParams={{ onboardingCompleted: authState.onboardingCompleted }}
          />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainNavigator} />
            <RootStack.Screen 
              name="About" 
              component={AboutScreen} 
              options={{ 
                headerShown: true, 
                headerTitle: 'About',
                headerStyle: { backgroundColor: '#fff' },
                headerTintColor: '#333'
              }} 
            />
            <RootStack.Screen 
              name="Help" 
              component={HelpScreen} 
              options={{ 
                headerShown: true, 
                headerTitle: 'Help & Support',
                headerStyle: { backgroundColor: '#fff' },
                headerTintColor: '#333'
              }} 
            />
            <RootStack.Screen 
              name="Notifications" 
              component={NotificationsScreen} 
              options={{ 
                headerShown: true, 
                headerTitle: 'Notifications',
                headerStyle: { backgroundColor: '#fff' },
                headerTintColor: '#333'
              }} 
            />
            <RootStack.Screen 
              name="ResourceDetail" 
              component={ResourceDetailScreen} 
              options={{ 
                headerShown: true, 
                headerTitle: 'Resource Details',
                headerStyle: { backgroundColor: '#fff' },
                headerTintColor: '#333'
              }} 
            />
            <RootStack.Screen 
              name="VideoCourse" 
              component={VideoCourseScreen} 
              options={{ 
                headerShown: true, 
                headerTitle: 'Video Course',
                headerStyle: { backgroundColor: '#fff' },
                headerTintColor: '#333'
              }} 
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 