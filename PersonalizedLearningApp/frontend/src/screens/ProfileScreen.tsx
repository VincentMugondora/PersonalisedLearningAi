import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import apiService from '../services/api';
import authService from '../services/auth';
import { MainTabParamList } from '../navigation/AppNavigator';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainTabParamList>>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiService.auth.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert(
        'Error',
        'Failed to load profile. Please try again later.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              // Navigation will be handled by AppNavigator based on auth state
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderProfileHeader = () => (
    <LinearGradient
      colors={['#4B0082', '#8A2BE2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{profile?.name || 'Loading...'}</Text>
        <Text style={styles.email}>{profile?.email || ''}</Text>
      </View>
    </LinearGradient>
  );

  const renderProfileSection = (title: string, icon: string, content: React.ReactNode) => (
    <Animated.View
      entering={FadeInUp.delay(200).springify()}
      style={styles.section}
    >
      <View style={styles.sectionHeader}>
        <MaterialIcons name={icon as any} size={24} color="#4B0082" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {content}
      </View>
    </Animated.View>
  );

  const renderMenuItem = (
    icon: string,
    title: string,
    value?: string,
    onPress?: () => void,
    showArrow = true
  ) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.menuItemLeft}>
        <MaterialIcons name={icon as any} size={24} color="#666" />
        <Text style={styles.menuItemTitle}>{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {value && <Text style={styles.menuItemValue}>{value}</Text>}
        {showArrow && <MaterialIcons name="chevron-right" size={24} color="#666" />}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B0082" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchProfile} />
        }
      >
        {renderProfileHeader()}

        {renderProfileSection(
          'Account Information',
          'account-circle',
          <>
            {renderMenuItem('email', 'Email', profile?.email)}
            {renderMenuItem('person', 'Role', profile?.role)}
            {renderMenuItem('calendar-today', 'Member Since', new Date(profile?.createdAt || '').toLocaleDateString())}
            {profile?.lastLogin && renderMenuItem('access-time', 'Last Login', new Date(profile.lastLogin).toLocaleString())}
          </>
        )}

        {renderProfileSection(
          'Preferences',
          'settings',
          <>
            {renderMenuItem(
              'notifications',
              'Notifications',
              profile?.preferences?.notifications ? 'Enabled' : 'Disabled',
              () => Alert.alert('Coming Soon', 'This feature will be available soon!')
            )}
            {renderMenuItem(
              'dark-mode',
              'Dark Mode',
              profile?.preferences?.darkMode ? 'Enabled' : 'Disabled',
              () => Alert.alert('Coming Soon', 'This feature will be available soon!')
            )}
            {renderMenuItem(
              'language',
              'Language',
              profile?.preferences?.language || 'English',
              () => Alert.alert('Coming Soon', 'This feature will be available soon!')
            )}
          </>
        )}

        {renderProfileSection(
          'Support',
          'help',
          <>
            {renderMenuItem(
              'help',
              'Help Center',
              undefined,
              () => Alert.alert('Coming Soon', 'Help center will be available soon!')
            )}
            {renderMenuItem(
              'feedback',
              'Send Feedback',
              undefined,
              () => Alert.alert('Coming Soon', 'Feedback feature will be available soon!')
            )}
            {renderMenuItem(
              'info',
              'About',
              undefined,
              () => Alert.alert('About', 'ZimLearn v1.0.0\nYour personalized learning journey')
            )}
          </>
        )}

        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.logoutContainer}
        >
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={24} color="#fff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15,
    marginTop: 20,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  sectionContent: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  menuItemValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  logoutContainer: {
    marginTop: 30,
    marginHorizontal: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default ProfileScreen; 