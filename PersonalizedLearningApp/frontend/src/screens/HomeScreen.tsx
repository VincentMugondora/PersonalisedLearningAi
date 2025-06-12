import React, { useState, useEffect, useCallback } from 'react';
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
  Linking,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { resourceService, type Resource } from '../services/api';

// Define the navigation type
type RootStackParamList = {
  ResourceDetail: { resource: Resource };
};

type NavigationProp = {
  navigate: (screen: keyof RootStackParamList, params: RootStackParamList[keyof RootStackParamList]) => void;
};

// Define types for our data
type Subject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
};

const subjects: Subject[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: 'calculator',
    color: '#FF6B6B',
    description: 'Algebra, Calculus, Statistics'
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: 'flash',
    color: '#4ECDC4',
    description: 'Mechanics, Electricity, Waves'
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: 'flask',
    color: '#45B7D1',
    description: 'Organic, Inorganic, Physical'
  },
  {
    id: 'biology',
    name: 'Biology',
    icon: 'leaf',
    color: '#96CEB4',
    description: 'Anatomy, Genetics, Ecology'
  },
  {
    id: 'english',
    name: 'English',
    icon: 'book',
    color: '#FFEEAD',
    description: 'Literature, Grammar, Composition'
  },
  {
    id: 'history',
    name: 'History',
    icon: 'time',
    color: '#D4A5A5',
    description: 'Zimbabwe History, World History'
  }
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch resources based on selected subject
  const fetchResources = useCallback(async (subject: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getResourcesBySubject(subject, 'O');
      setResources(data);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle subject selection
  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    fetchResources(subjectId);
  };

  // Handle resource selection
  const handleResourceSelect = async (resource: Resource) => {
    try {
      // For YouTube videos, open in the YouTube app or browser
      if (resource.type === 'video' && resource.source === 'YouTube' && resource.url) {
        const supported = await Linking.canOpenURL(resource.url);
        if (supported) {
          await Linking.openURL(resource.url);
        } else {
          Alert.alert('Error', 'Cannot open this video URL');
        }
      } else {
        // For other resources, navigate to a detail view
        navigation.navigate('ResourceDetail', { resource });
      }
    } catch (err) {
      console.error('Error opening resource:', err);
      Alert.alert('Error', 'Failed to open resource');
    }
  };

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedSubject) {
      await fetchResources(selectedSubject);
    }
    setRefreshing(false);
  }, [selectedSubject, fetchResources]);

  // Render subject card
  const renderSubjectCard = (subject: typeof subjects[0]) => (
    <TouchableOpacity
      key={subject.id}
      style={[
        styles.subjectCard,
        { backgroundColor: subject.color },
        selectedSubject === subject.id && styles.selectedSubjectCard
      ]}
      onPress={() => handleSubjectSelect(subject.id)}
    >
      <Ionicons name={subject.icon as any} size={32} color="white" />
      <Text style={styles.subjectName}>{subject.name}</Text>
      <Text style={styles.subjectDescription}>{subject.description}</Text>
    </TouchableOpacity>
  );

  // Render resource card
  const renderResourceCard = (resource: Resource) => (
    <TouchableOpacity
      key={resource.id}
      style={styles.resourceCard}
      onPress={() => handleResourceSelect(resource)}
    >
      {resource.thumbnailUrl && (
        <Image
          source={{ uri: resource.thumbnailUrl }}
          style={styles.resourceThumbnail}
          resizeMode="cover"
        />
      )}
      <View style={styles.resourceContent}>
        <Text style={styles.resourceTitle}>{resource.title}</Text>
        <Text style={styles.resourceDescription} numberOfLines={2}>
          {resource.description}
        </Text>
        <View style={styles.resourceMeta}>
          <Text style={styles.resourceType}>{resource.type}</Text>
          <Text style={styles.resourceDifficulty}>{resource.difficulty}</Text>
        </View>
        <View style={styles.resourceFooter}>
          <Text style={styles.resourceAuthor}>{resource.author}</Text>
          {resource.metadata?.viewCount && (
            <Text style={styles.resourceViews}>
              {resource.metadata.viewCount.toLocaleString()} views
            </Text>
          )}
        </View>
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

        {selectedSubject && (
          <View style={styles.resourcesContainer}>
            <Text style={styles.sectionTitle}>Learning Resources</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : resources.length === 0 ? (
              <Text style={styles.noResourcesText}>
                No resources found for this subject
              </Text>
            ) : (
              resources.map(renderResourceCard)
            )}
          </View>
        )}
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
  selectedSubjectCard: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  subjectName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  subjectDescription: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    opacity: 0.9,
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
  resourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  resourceMeta: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  resourceType: {
    backgroundColor: '#e1f5fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    color: '#0288d1',
    marginRight: 8,
  },
  resourceDifficulty: {
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    color: '#7b1fa2',
  },
  resourceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resourceAuthor: {
    fontSize: 12,
    color: '#666',
  },
  resourceViews: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  noResourcesText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HomeScreen; 