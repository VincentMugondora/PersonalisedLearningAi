import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Linking,
  Alert,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService, { IResource, Grade } from '../services/api';

// Define the navigation type
type RootStackParamList = {
  ResourceDetail: { resource: IResource };
};

type NavigationProp = {
  navigate: (screen: keyof RootStackParamList, params: any) => void;
};

// Subject categories with icons and colors
const subjects = [
  {
    id: 'Mathematics',
    name: 'Mathematics',
    icon: 'calculator',
    color: '#FF6B6B',
    description: 'Algebra, Calculus, Statistics'
  },
  {
    id: 'Physics',
    name: 'Physics',
    icon: 'flash',
    color: '#4ECDC4',
    description: 'Mechanics, Electricity, Waves'
  },
  {
    id: 'Chemistry',
    name: 'Chemistry',
    icon: 'flask',
    color: '#45B7D1',
    description: 'Organic, Inorganic, Physical'
  },
  {
    id: 'Biology',
    name: 'Biology',
    icon: 'leaf',
    color: '#96CEB4',
    description: 'Anatomy, Genetics, Ecology'
  },
  {
    id: 'English',
    name: 'English',
    icon: 'book',
    color: '#FFEEAD',
    description: 'Literature, Grammar, Composition'
  },
  {
    id: 'History',
    name: 'History',
    icon: 'time',
    color: '#D4A5A5',
    description: 'Zimbabwe History, World History'
  }
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [resources, setResources] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch resources based on selected subject
  const fetchResources = useCallback(async (subject: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching resources for subject:', subject);
      
      // First try to get recommendations
      const recommendations = await apiService.resources.getRecommendations(subject, 'O');
      console.log('Fetched recommendations:', recommendations);
      
      if (recommendations.length === 0) {
        // If no recommendations, search for resources
        const searchResults = await apiService.resources.search({
          subject,
          grade: 'O',
          limit: 20
        });
        console.log('Fetched search results:', searchResults);
        setResources(searchResults);
      } else {
        setResources(recommendations);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle subject selection
  const handleSubjectSelect = (subjectId: string) => {
    console.log('Selected subject:', subjectId);
    setSelectedSubject(subjectId);
    fetchResources(subjectId);
  };

  // Handle resource selection
  const handleResourceSelect = async (resource: IResource) => {
    try {
      if (resource.type === 'video' && resource.url) {
        const supported = await Linking.canOpenURL(resource.url);
        if (supported) {
          await Linking.openURL(resource.url);
        } else {
          Alert.alert('Error', 'Cannot open this video URL');
        }
      } else if (resource.type === 'book' && resource.url) {
        // For books, we might want to open in a PDF viewer or browser
        const supported = await Linking.canOpenURL(resource.url);
        if (supported) {
          await Linking.openURL(resource.url);
        } else {
          Alert.alert('Error', 'Cannot open this book URL');
        }
      } else {
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
  const renderResourceCard = (resource: IResource) => (
    <TouchableOpacity
      key={resource._id}
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
          <Text style={styles.resourceSource}>{resource.source}</Text>
        </View>
        <View style={styles.resourceFooter}>
          {resource.author && (
            <Text style={styles.resourceAuthor}>{resource.author}</Text>
          )}
          {resource.metadata?.downloadCount && (
            <Text style={styles.resourceViews}>
              {resource.metadata.downloadCount.toLocaleString()} downloads
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Personalized Learning</Text>
          <Text style={styles.subtitle}>Choose a subject to get started</Text>
        </View>

        <View style={styles.subjectsContainer}>
          {subjects.map(renderSubjectCard)}
        </View>

        {selectedSubject && (
          <View style={styles.resourcesContainer}>
            <Text style={styles.sectionTitle}>
              {subjects.find(s => s.id === selectedSubject)?.name} Resources
            </Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading resources...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => selectedSubject && fetchResources(selectedSubject)}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : resources.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No resources found for this subject yet
                </Text>
                <Text style={styles.emptySubtext}>
                  Check back later for new content
                </Text>
              </View>
            ) : (
              resources.map(renderResourceCard)
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  subjectCard: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
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
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subjectDescription: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    opacity: 0.9,
  },
  resourcesContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  resourceThumbnail: {
    width: '100%',
    height: 200,
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
  resourceSource: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    color: '#2e7d32',
    marginLeft: 8,
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HomeScreen; 