import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How do I find learning resources?',
    answer:
      'You can find learning resources by using the search function on the home screen. You can search by subject, topic, or resource type. You can also browse resources by grade level and subject.',
  },
  {
    question: 'How do I save resources for offline use?',
    answer:
      'To save a resource for offline use, tap the download icon on the resource card. The resource will be downloaded and stored on your device. You can access offline resources in the "Downloads" section.',
  },
  {
    question: 'How do I track my learning progress?',
    answer:
      'Your learning progress is automatically tracked as you complete quizzes and practice exercises. You can view your progress in the profile section, including completed resources and quiz scores.',
  },
  {
    question: 'How do I change my grade level?',
    answer:
      'You can change your grade level in the profile settings. Go to Profile > Settings > Grade Level and select your current grade level.',
  },
  {
    question: 'How do I report an issue?',
    answer:
      "If you encounter any issues, you can report them by going to Settings > Help & Support > Report an Issue. Please provide as much detail as possible about the problem you're experiencing.",
  },
];

const supportChannels = [
  {
    title: 'Email Support',
    description: 'Get help via email',
    icon: 'email',
    action: () => Linking.openURL('mailto:support@zimlearn.com'),
  },
  {
    title: 'WhatsApp Support',
    description: 'Chat with our support team',
    icon: 'whatsapp',
    action: () => Linking.openURL('https://wa.me/263771234567'),
  },
  {
    title: 'Facebook',
    description: 'Follow us on Facebook',
    icon: 'facebook',
    action: () => Linking.openURL('https://facebook.com/zimlearn'),
  },
  {
    title: 'Twitter',
    description: 'Follow us on Twitter',
    icon: 'twitter',
    action: () => Linking.openURL('https://twitter.com/zimlearn'),
  },
];

const HelpScreen: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const renderFaqItem = (item: FAQItem, index: number) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.faqItem}
    >
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => toggleFaq(index)}
      >
        <Text style={styles.faqQuestionText}>{item.question}</Text>
        <MaterialIcons
          name={expandedFaq === index ? 'expand-less' : 'expand-more'}
          size={24}
          color="#666"
        />
      </TouchableOpacity>
      {expandedFaq === index && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </Animated.View>
  );

  const renderSupportChannel = (channel: typeof supportChannels[0], index: number) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.supportChannel}
    >
      <TouchableOpacity
        style={styles.supportChannelButton}
        onPress={channel.action}
      >
        <View style={styles.supportChannelIcon}>
          <MaterialIcons name={channel.icon as any} size={24} color="#4B0082" />
        </View>
        <View style={styles.supportChannelInfo}>
          <Text style={styles.supportChannelTitle}>{channel.title}</Text>
          <Text style={styles.supportChannelDescription}>
            {channel.description}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#666" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => renderFaqItem(faq, index))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          {supportChannels.map((channel, index) =>
            renderSupportChannel(channel, index)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>Version 1.0.0</Text>
            <Text style={styles.appInfoText}>© 2024 ZimLearn</Text>
          </View>
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
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  faqAnswer: {
    padding: 15,
    paddingTop: 0,
    backgroundColor: '#F5F5F5',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  supportChannel: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  supportChannelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  supportChannelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  supportChannelInfo: {
    flex: 1,
  },
  supportChannelTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  supportChannelDescription: {
    fontSize: 14,
    color: '#666',
  },
  appInfo: {
    padding: 15,
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default HelpScreen; 