import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  StatusBar,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

const teamMembers = [
  {
    name: 'John Doe',
    role: 'Lead Developer',
    image: 'https://via.placeholder.com/100',
    linkedin: 'https://linkedin.com/in/johndoe',
  },
  {
    name: 'Jane Smith',
    role: 'UI/UX Designer',
    image: 'https://via.placeholder.com/100',
    linkedin: 'https://linkedin.com/in/janesmith',
  },
  {
    name: 'Mike Johnson',
    role: 'Content Manager',
    image: 'https://via.placeholder.com/100',
    linkedin: 'https://linkedin.com/in/mikejohnson',
  },
];

const features = [
  {
    title: 'Personalized Learning',
    description:
      'Adaptive learning paths tailored to your grade level and learning style',
    icon: 'school',
  },
  {
    title: 'Rich Content Library',
    description:
      'Access to a vast collection of textbooks, videos, and practice materials',
    icon: 'menu-book',
  },
  {
    title: 'Progress Tracking',
    description:
      'Monitor your learning progress with detailed analytics and insights',
    icon: 'trending-up',
  },
  {
    title: 'Offline Access',
    description:
      'Download resources for offline use and learn anywhere, anytime',
    icon: 'offline-pin',
  },
];

const AboutScreen: React.FC = () => {
  const renderFeature = (feature: typeof features[0], index: number) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.featureItem}
    >
      <View style={styles.featureIcon}>
        <MaterialIcons name={feature.icon as any} size={24} color="#4B0082" />
      </View>
      <View style={styles.featureInfo}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </Animated.View>
  );

  const renderTeamMember = (member: typeof teamMembers[0], index: number) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.teamMember}
    >
      <Image source={{ uri: member.image }} style={styles.teamMemberImage} />
      <Text style={styles.teamMemberName}>{member.name}</Text>
      <Text style={styles.teamMemberRole}>{member.role}</Text>
      <TouchableOpacity
        style={styles.linkedinButton}
        onPress={() => Linking.openURL(member.linkedin)}
      >
        <MaterialIcons name="linkedin" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>ZimLearn</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About ZimLearn</Text>
          <Text style={styles.description}>
            ZimLearn is a comprehensive learning platform designed to help
            Zimbabwean students excel in their studies. Our mission is to make
            quality education accessible to all students, regardless of their
            location or background.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          {features.map((feature, index) => renderFeature(feature, index))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Team</Text>
          <View style={styles.teamGrid}>
            {teamMembers.map((member, index) => renderTeamMember(member, index))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL('mailto:contact@zimlearn.com')}
          >
            <MaterialIcons name="email" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Email Us</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 ZimLearn</Text>
          <Text style={styles.footerText}>All rights reserved</Text>
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
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  teamMember: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
  },
  teamMemberImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  teamMemberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  teamMemberRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  linkedinButton: {
    backgroundColor: '#4B0082',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4B0082',
    padding: 15,
    borderRadius: 12,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});

export default AboutScreen; 