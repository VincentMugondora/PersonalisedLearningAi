import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, RootStackParamList } from '../navigation/AppNavigator';
import authService from '../services/auth';

type SettingsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Settings'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [dataSaverEnabled, setDataSaverEnabled] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

  const handleNotificationToggle = useCallback(async (value: boolean) => {
    try {
      await AsyncStorage.setItem('notificationsEnabled', value.toString());
      setNotificationsEnabled(value);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    }
  }, []);

  const handleDarkModeToggle = useCallback(async (value: boolean) => {
    try {
      await AsyncStorage.setItem('darkModeEnabled', value.toString());
      setDarkModeEnabled(value);
    } catch (error) {
      console.error('Error saving dark mode settings:', error);
      Alert.alert('Error', 'Failed to save dark mode settings');
    }
  }, []);

  const handleDataSaverToggle = useCallback(async (value: boolean) => {
    try {
      await AsyncStorage.setItem('dataSaverEnabled', value.toString());
      setDataSaverEnabled(value);
    } catch (error) {
      console.error('Error saving data saver settings:', error);
      Alert.alert('Error', 'Failed to save data saver settings');
    }
  }, []);

  const handleAutoPlayToggle = useCallback(async (value: boolean) => {
    try {
      await AsyncStorage.setItem('autoPlayEnabled', value.toString());
      setAutoPlayEnabled(value);
    } catch (error) {
      console.error('Error saving auto-play settings:', error);
      Alert.alert('Error', 'Failed to save auto-play settings');
    }
  }, []);

  const handleClearCache = useCallback(async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache? This will remove all downloaded resources.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Implement cache clearing logic here
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  }, []);

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

  const renderSettingItem = (
    icon: string,
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    index: number
  ) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.settingItem}
    >
      <View style={styles.settingIcon}>
        <MaterialIcons name={icon as any} size={24} color="#4B0082" />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#ddd', true: '#4B0082' }}
        thumbColor="#fff"
      />
    </Animated.View>
  );

  const renderActionItem = (
    icon: string,
    title: string,
    description: string,
    onPress: () => void,
    index: number,
    destructive?: boolean
  ) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.settingItem}
    >
      <View style={styles.settingIcon}>
        <MaterialIcons
          name={icon as any}
          size={24}
          color={destructive ? '#FF3B30' : '#4B0082'}
        />
      </View>
      <View style={styles.settingInfo}>
        <Text
          style={[
            styles.settingTitle,
            destructive && styles.destructiveText,
          ]}
        >
          {title}
        </Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={24}
        color={destructive ? '#FF3B30' : '#666'}
      />
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {renderSettingItem(
            'notifications',
            'Notifications',
            'Receive updates about new resources and learning progress',
            notificationsEnabled,
            handleNotificationToggle,
            0
          )}
          {renderSettingItem(
            'dark-mode',
            'Dark Mode',
            'Switch between light and dark theme',
            darkModeEnabled,
            handleDarkModeToggle,
            1
          )}
          {renderSettingItem(
            'save',
            'Data Saver',
            'Reduce data usage by limiting video quality and auto-play',
            dataSaverEnabled,
            handleDataSaverToggle,
            2
          )}
          {renderSettingItem(
            'play-circle',
            'Auto-play Videos',
            'Automatically play videos when opened',
            autoPlayEnabled,
            handleAutoPlayToggle,
            3
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          {renderActionItem(
            'delete',
            'Clear Cache',
            'Remove downloaded resources to free up space',
            handleClearCache,
            4
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderActionItem(
            'help',
            'Help & Support',
            'Get help with using the app',
            () => navigation.navigate('Help'),
            5
          )}
          {renderActionItem(
            'info',
            'About',
            'Learn more about ZimLearn',
            () => navigation.navigate('About'),
            6
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {renderActionItem(
            'logout',
            'Sign Out',
            'Sign out of your account',
            handleLogout,
            7,
            true
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 15,
    marginTop: 15,
    marginBottom: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  destructiveText: {
    color: '#FF3B30',
  },
});

export default SettingsScreen; 