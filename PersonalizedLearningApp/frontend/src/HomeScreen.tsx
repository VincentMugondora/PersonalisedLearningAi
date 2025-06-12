import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// Define types for our data
type Subject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
};

type Resource = {
  id: string;
  title: string;
  subject: string;
  type: 'video' | 'document' | 'quiz';
  thumbnail?: string;
  description: string;
};

const subjects: Subject[] = [
  {
    id: '1',
    name: 'Mathematics',
    icon: 'calculate',
    color: '#FF6B6B',
    description: 'Advanced Level Mathematics including Pure Mathematics and Statistics',
  },
  {
    id: '2',
    name: 'Physics',
    icon: 'science',
    color: '#4ECDC4',
    description: 'Mechanics, Electricity, Waves, and Modern Physics',
  },
  {
    id: '3',
    name: 'Chemistry',
    icon: 'science',
    color: '#45B7D1',
    description: 'Organic Chemistry, Physical Chemistry, and Inorganic Chemistry',
  },
  {
    id: '4',
    name: 'Biology',
    icon: 'biotech',
    color: '#96CEB4',
    description: 'Human Biology, Plant Biology, and Ecology',
  },
  {
    id: '5',
    name: 'English',
    icon: 'menu-book',
    color: '#FFD93D',
    description: 'Language and Literature Studies',
  },
  {
    id: '6',
    name: 'History',
    icon: 'history',
    color: '#6C5B7B',
    description: 'Zimbabwean and World History',
  },
];

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock function to fetch resources (replace with actual API call)
  const fetchResources = async (subjectId?: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API data
      const mockResources: Resource[] = [
        {
          id: '1',
          title: 'Introduction to Calculus',
          subject: 'Mathematics',
          type: 'video',
          thumbnail: 'https://picsum.photos/200/300',
          description: 'Learn the basics of differential calculus with practical examples',
        },
        {
          id: '2',
          title: 'Organic Chemistry Basics',
          subject: 'Chemistry',
          type: 'document',
          description: 'Comprehensive guide to organic compounds and reactions',
        },
        {
          id: '3',
          title: 'Physics Mechanics Quiz',
          subject: 'Physics',
          type: 'quiz',
          description: 'Test your knowledge of mechanics and motion',
        },
      ];

      setResources(mockResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResources(selectedSubject || undefined);
  }, [selectedSubject]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchResources(selectedSubject || undefined);
  };

  const renderSubjectCard = (subject: Subject) => (
    <TouchableOpacity
      key={subject.id}
      style={[
        styles.subjectCard,
        { backgroundColor: subject.color },
        selectedSubject === subject.id && styles.selectedSubject,
      ]}
      onPress={() => setSelectedSubject(subject.id)}
    >
      <MaterialIcons name={subject.icon as any} size={32} color="white" />
      <Text style={styles.subjectName}>{subject.name}</Text>
    </TouchableOpacity>
  );

  const renderResourceCard = (resource: Resource) => (
    <TouchableOpacity 
      key={resource.id} 
      style={styles.resourceCard}
      onPress={() => {
        // Navigate to resource detail screen
        navigation.navigate('ResourceDetail', { resource });
      }}
    >
      {resource.thumbnail && (
        <Image
          source={{ uri: resource.thumbnail }}
          style={styles.resourceThumbnail}
        />
      )}
      <View style={styles.resourceContent}>
        <View style={styles.resourceHeader}>
          <Text style={styles.resourceTitle}>{resource.title}</Text>
          <MaterialIcons
            name={
              resource.type === 'video'
                ? 'play-circle'
                : resource.type === 'document'
                ? 'description'
                : 'quiz'
            }
            size={24}
            color="#666"
          />
        </View>
        <Text style={styles.resourceSubject}>{resource.subject}</Text>
        <Text style={styles.resourceDescription} numberOfLines={2}>
          {resource.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.appName}>ZimLearn</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.subjectsContainer}>
          <Text style={styles.sectionTitle}>Subjects</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.subjectsScroll}
          >
            {subjects.map(renderSubjectCard)}
          </ScrollView>
        </View>

        <View style={styles.resourcesContainer}>
          <Text style={styles.sectionTitle}>Learning Resources</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#4B0082" style={styles.loader} />
          ) : (
            resources.map(renderResourceCard)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4B0082',
  },
  welcomeText: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  subjectsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  subjectsScroll: {
    flexDirection: 'row',
  },
  subjectCard: {
    width: 120,
    height: 120,
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedSubject: {
    transform: [{ scale: 1.05 }],
    elevation: 5,
  },
  subjectName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  resourcesContainer: {
    padding: 20,
  },
  resourceCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  resourceThumbnail: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  resourceContent: {
    padding: 15,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  resourceSubject: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loader: {
    marginTop: 20,
  },
});

export default HomeScreen;