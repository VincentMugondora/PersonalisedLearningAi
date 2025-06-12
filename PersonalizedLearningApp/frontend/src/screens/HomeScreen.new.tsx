import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiService from '../services/api';
import { IResource } from '../services/api';

type Subject = {
  id: string;
  name: string;
  icon: string;
};

const subjects: Subject[] = [
  { id: 'mathematics', name: 'Mathematics', icon: 'calculate' },
  { id: 'english', name: 'English', icon: 'menu-book' },
  { id: 'science', name: 'Science', icon: 'science' },
  { id: 'history', name: 'History', icon: 'history' },
  { id: 'geography', name: 'Geography', icon: 'public' },
  { id: 'biology', name: 'Biology', icon: 'biotech' },
  { id: 'chemistry', name: 'Chemistry', icon: 'science' },
  { id: 'physics', name: 'Physics', icon: 'speed' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [resources, setResources] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResources = useCallback(async (subject: string) => {
    try {
      setLoading(true);
      // First try to get personalized recommendations
      const recommendations = await apiService.resources.getRecommendations({
        subject,
      });

      if (recommendations && recommendations.length > 0) {
        setResources(recommendations);
      } else {
        // If no recommendations, fall back to searching for resources
        const searchResults = await apiService.resources.search({
          subject,
          limit: 20,
        });
        setResources(searchResults);
      }
    } catch (error: any) {
      console.error('Error fetching resources:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to fetch resources. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedSubject) {
      await fetchResources(selectedSubject);
    }
    setRefreshing(false);
  }, [selectedSubject, fetchResources]);

  useEffect(() => {
    if (selectedSubject) {
      fetchResources(selectedSubject);
    }
  }, [selectedSubject, fetchResources]);

  const handleSubjectPress = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };

  const handleResourcePress = (resource: IResource) => {
    if (resource.type === 'book' || resource.type === 'document') {
      // Handle PDF or document viewing
      Alert.alert(
        'Coming Soon',
        'Document viewing will be available in the next update.'
      );
    } else if (resource.type === 'video') {
      // Handle video playback
      Alert.alert(
        'Coming Soon',
        'Video playback will be available in the next update.'
      );
    } else {
      Alert.alert(
        'Not Supported',
        'This resource type is not supported yet.'
      );
    }
  };

  const renderSubjectCard = (subject: Subject) => (
    <TouchableOpacity
      key={subject.id}
      style={[
        styles.subjectCard,
        selectedSubject === subject.id && styles.selectedSubjectCard,
      ]}
      onPress={() => handleSubjectPress(subject.id)}
    >
      <Icon
        name={subject.icon as any}
        size={32}
        color={selectedSubject === subject.id ? '#fff' : '#4B0082'}
      />
      <Text
        style={[
          styles.subjectName,
          selectedSubject === subject.id && styles.selectedSubjectName,
        ]}
      >
        {subject.name}
      </Text>
    </TouchableOpacity>
  );

  const renderResourceCard = (resource: IResource) => (
    <TouchableOpacity
      key={resource._id}
      style={styles.resourceCard}
      onPress={() => handleResourcePress(resource)}
    >
      {resource.thumbnailUrl ? (
        <Image
          source={{ uri: resource.thumbnailUrl }}
          style={styles.resourceThumbnail}
        />
      ) : (
        <View style={styles.resourceThumbnailPlaceholder}>
          <Icon
            name={
              resource.type === 'book'
                ? 'menu-book'
                : resource.type === 'video'
                ? 'play-circle'
                : 'description'
            }
            size={32}
            color="#666"
          />
        </View>
      )}
      <View style={styles.resourceInfo}>
        <Text style={styles.resourceTitle} numberOfLines={2}>
          {resource.title}
        </Text>
        <Text style={styles.resourceDescription} numberOfLines={2}>
          {resource.description}
        </Text>
        <View style={styles.resourceMetadata}>
          <View style={styles.metadataItem}>
            <Icon name="school" size={16} color="#666" />
            <Text style={styles.metadataText}>{resource.grade}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Icon name="star" size={16} color="#666" />
            <Text style={styles.metadataText}>{resource.difficulty}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Icon name="source" size={16} color="#666" />
            <Text style={styles.metadataText}>{resource.source}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.subjectsContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {subjects.map(renderSubjectCard)}
      </ScrollView>

      <ScrollView
        style={styles.resourcesContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4B0082" />
          </View>
        ) : resources.length > 0 ? (
          resources.map(renderResourceCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={48} color="#666" />
            <Text style={styles.emptyText}>
              {selectedSubject
                ? 'No resources found for this subject'
                : 'Select a subject to view resources'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  subjectsContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  subjectCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginRight: 15,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    width: 100,
    height: 100,
  },
  selectedSubjectCard: {
    backgroundColor: '#4B0082',
  },
  subjectName: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  selectedSubjectName: {
    color: '#fff',
  },
  resourcesContainer: {
    flex: 1,
    padding: 15,
  },
  resourceCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  resourceThumbnailPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resourceMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default HomeScreen; 