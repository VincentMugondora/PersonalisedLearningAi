import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { MainTabParamList } from '../navigation/AppNavigator';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { IResource } from '../services/api';

type ResourceDetailRouteProp = RouteProp<MainTabParamList, 'ResourceDetail'>;

const ResourceDetailScreen: React.FC = () => {
  const route = useRoute<ResourceDetailRouteProp>();
  const navigation = useNavigation();
  const { resource } = route.params;
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleOpenResource = async () => {
    try {
      const supported = await Linking.canOpenURL(resource.url);
      
      if (supported) {
        await Linking.openURL(resource.url);
      } else {
        Alert.alert(
          'Error',
          `Cannot open this resource URL: ${resource.url}`
        );
      }
    } catch (error) {
      console.error('Error opening resource:', error);
      Alert.alert(
        'Error',
        'Failed to open resource. Please try again.'
      );
    }
  };

  const handleDownload = async () => {
    if (!resource.url) {
      Alert.alert('Error', 'No download URL available for this resource');
      return;
    }

    try {
      setIsDownloading(true);

      // For web platform, trigger browser download
      if (Platform.OS === 'web') {
        window.open(resource.url, '_blank');
        return;
      }

      // For mobile platforms
      const filename = resource.url.split('/').pop() || 'resource';
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(
        resource.url,
        fileUri
      );

      if (downloadResult.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri);
        } else {
          Alert.alert(
            'Success',
            'File downloaded successfully. You can find it in your downloads folder.'
          );
        }
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      Alert.alert(
        'Error',
        'Failed to download resource. Please try again.'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const getResourceIcon = () => {
    switch (resource.type) {
      case 'book':
        return 'menu-book';
      case 'video':
        return 'videocam';
      case 'document':
        return 'description';
      case 'practice':
        return 'assignment';
      case 'quiz':
        return 'quiz';
      default:
        return 'school';
    }
  };

  const getSourceIcon = () => {
    switch (resource.source) {
      case 'MoPSE':
        return 'school';
      case 'CollegePress':
        return 'business';
      case 'Teacha':
        return 'people';
      case 'YouTube':
        return 'smart-display';
      case 'ZIMSEC':
        return 'verified';
      default:
        return 'link';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name={getResourceIcon()} size={48} color="#4B0082" />
        <Text style={styles.title}>{resource.title}</Text>
        <Text style={styles.source}>
          <MaterialIcons name={getSourceIcon()} size={16} color="#666" />{' '}
          {resource.source}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>{resource.description}</Text>

        <View style={styles.metadataContainer}>
          <View style={styles.metadataItem}>
            <MaterialIcons name="category" size={20} color="#4B0082" />
            <Text style={styles.metadataText}>{resource.subject}</Text>
          </View>
          <View style={styles.metadataItem}>
            <MaterialIcons name="grade" size={20} color="#4B0082" />
            <Text style={styles.metadataText}>{resource.grade} Level</Text>
          </View>
          <View style={styles.metadataItem}>
            <MaterialIcons name="speed" size={20} color="#4B0082" />
            <Text style={styles.metadataText}>{resource.difficulty}</Text>
          </View>
        </View>

        {resource.metadata && (
          <View style={styles.additionalInfo}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            {resource.metadata.publisher && (
              <Text style={styles.infoText}>
                Publisher: {resource.metadata.publisher}
              </Text>
            )}
            {resource.metadata.year && (
              <Text style={styles.infoText}>
                Year: {resource.metadata.year}
              </Text>
            )}
            {resource.metadata.language && (
              <Text style={styles.infoText}>
                Language: {resource.metadata.language}
              </Text>
            )}
            {resource.metadata.format && (
              <Text style={styles.infoText}>
                Format: {resource.metadata.format}
              </Text>
            )}
          </View>
        )}

        <View style={styles.tagsContainer}>
          {resource.tags.map((tag: string, index: number) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.openButton]}
            onPress={handleOpenResource}
          >
            <MaterialIcons name="open-in-new" size={24} color="#fff" />
            <Text style={styles.buttonText}>Open Resource</Text>
          </TouchableOpacity>

          {resource.type !== 'video' && (
            <TouchableOpacity
              style={[styles.button, styles.downloadButton]}
              onPress={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialIcons name="download" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Download</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  source: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 20,
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  metadataItem: {
    alignItems: 'center',
  },
  metadataText: {
    marginTop: 5,
    color: '#666',
  },
  additionalInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#e6e6fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#4B0082',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    gap: 8,
  },
  openButton: {
    backgroundColor: '#4B0082',
  },
  downloadButton: {
    backgroundColor: '#2E8B57',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResourceDetailScreen; 