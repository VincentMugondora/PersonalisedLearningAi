import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import VideoPlayer from '../components/VideoPlayer';
import apiService from '../services/api';
import { IResource } from '../services/api';

type VideoCourseScreenRouteProp = RouteProp<RootStackParamList, 'VideoCourse'>;
type VideoCourseScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VideoCourse'>;

const VideoCourseScreen: React.FC = () => {
  const route = useRoute<VideoCourseScreenRouteProp>();
  const navigation = useNavigation<VideoCourseScreenNavigationProp>();
  const { resource } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [relatedResources, setRelatedResources] = useState<IResource[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRelatedResources();
  }, [resource.subject, resource.grade]);

  const fetchRelatedResources = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const resources = await apiService.resources.getRecommendations(
        resource.subject,
        resource.grade
      );
      // Filter out the current resource and limit to 3 related resources
      setRelatedResources(
        resources
          .filter(r => r._id !== resource._id)
          .slice(0, 3)
      );
    } catch (err) {
      console.error('Error fetching related resources:', err);
      setError('Failed to load related resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResourcePress = (relatedResource: IResource) => {
    navigation.navigate('ResourceDetail', { resource: relatedResource });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{resource.title}</Text>
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <MaterialIcons name="subject" size={16} color="#666" />
              <Text style={styles.metaText}>{resource.subject}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="school" size={16} color="#666" />
              <Text style={styles.metaText}>{resource.grade}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={16} color="#666" />
              <Text style={styles.metaText}>
                {resource.metadata?.duration || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.videoContainer}>
          <VideoPlayer
            videoId={resource.url.split('v=')[1] || resource.url}
            title={resource.title}
            onError={(err) => {
              console.error('Video player error:', err);
              setError('Failed to load video');
            }}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>{resource.description}</Text>

          {resource.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {resource.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={24} color="#ff3b30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Related Resources</Text>
            {isLoading ? (
              <ActivityIndicator size="small" color="#4B0082" />
            ) : (
              relatedResources.map((relatedResource) => (
                <TouchableOpacity
                  key={relatedResource._id}
                  style={styles.relatedItem}
                  onPress={() => handleResourcePress(relatedResource)}
                >
                  <View style={styles.relatedItemContent}>
                    <Text style={styles.relatedItemTitle}>
                      {relatedResource.title}
                    </Text>
                    <Text style={styles.relatedItemDescription} numberOfLines={2}>
                      {relatedResource.description}
                    </Text>
                    <View style={styles.relatedItemMeta}>
                      <Text style={styles.relatedItemMetaText}>
                        {relatedResource.type}
                      </Text>
                      <Text style={styles.relatedItemMetaText}>
                        {relatedResource.difficulty}
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    flex: 1,
  },
  relatedSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  relatedItemContent: {
    flex: 1,
    marginRight: 12,
  },
  relatedItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  relatedItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  relatedItemMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  relatedItemMetaText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default VideoCourseScreen; 