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
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import apiService from '../services/api';
import { IResource, Grade } from '../services/api';
import { MainTabParamList, RootStackParamList } from '../navigation/AppNavigator';
import { CompositeNavigationProp } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const subjects = [
  { id: 'Mathematics', name: 'Mathematics', icon: 'calculate', color: '#4B0082' },
  { id: 'English', name: 'English', icon: 'menu-book', color: '#2E8B57' },
  { id: 'Physics', name: 'Physics', icon: 'science', color: '#8A2BE2' },
  { id: 'Chemistry', name: 'Chemistry', icon: 'science', color: '#FF6B6B' },
  { id: 'Biology', name: 'Biology', icon: 'biotech', color: '#20B2AA' },
  { id: 'History', name: 'History', icon: 'history', color: '#CD853F' },
  { id: 'Geography', name: 'Geography', icon: 'public', color: '#4682B4' },
  { id: 'Computer Science', name: 'Computer Science', icon: 'computer', color: '#FF8C00' },
];

type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade>('O');
  const [resources, setResources] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingSBP, setIsFetchingSBP] = useState(false);

  const fetchResources = useCallback(async (subject: string) => {
    try {
      setLoading(true);
      // First try to get personalized recommendations
      const recommendations = await apiService.resources.getRecommendations(
        subject,
        selectedGrade
      );

      if (recommendations && recommendations.length > 0) {
        setResources(recommendations);
      } else {
        // If no recommendations, fall back to searching for resources
        const searchResults = await apiService.resources.search({
          subject,
          grade: selectedGrade,
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
  }, [selectedGrade]);

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
    navigation.navigate('ResourceDetail', { resource });
  };

  const handleFetchResources = async () => {
    if (!selectedSubject) {
      Alert.alert('Error', 'Please select a subject first');
      return;
    }

    try {
      setIsFetching(true);
      const fetchedResources = await apiService.resources.fetchResources(
        selectedSubject,
        selectedGrade
      );
      
      if (fetchedResources.length > 0) {
        // Refresh the resources list
        await fetchResources(selectedSubject);
        Alert.alert('Success', `Fetched ${fetchedResources.length} new resources`);
      } else {
        Alert.alert('Info', 'No new resources found');
      }
    } catch (error: any) {
      console.error('Error fetching resources:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to fetch resources. Please try again.'
      );
    } finally {
      setIsFetching(false);
    }
  };

  const handleFetchSBPResources = async () => {
    if (!selectedSubject) {
      Alert.alert('Error', 'Please select a subject first');
      return;
    }

    try {
      setIsFetchingSBP(true);
      const fetchedResources = await apiService.resources.fetchSBPResources(
        selectedSubject,
        selectedGrade
      );
      
      if (fetchedResources.length > 0) {
        // Refresh the resources list
        await fetchResources(selectedSubject);
        Alert.alert('Success', `Fetched ${fetchedResources.length} new resources from Secondary Book Press`);
      } else {
        Alert.alert('Info', 'No new resources found from Secondary Book Press');
      }
    } catch (error: any) {
      console.error('Error fetching SBP resources:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to fetch resources from Secondary Book Press. Please try again.'
      );
    } finally {
      setIsFetchingSBP(false);
    }
  };

  const renderSubjectCard = (subject: typeof subjects[0], index: number) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.subjectCardContainer}
      key={subject.id}
    >
      <TouchableOpacity
        style={[
          styles.subjectCard,
          { backgroundColor: subject.color },
          selectedSubject === subject.id && styles.selectedSubjectCard,
        ]}
        onPress={() => handleSubjectPress(subject.id)}
      >
        <MaterialIcons name={subject.icon as any} size={32} color="#fff" />
        <Text style={styles.subjectName}>{subject.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderResourceCard = (resource: IResource, index: number) => (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify()}
      key={resource._id}
      style={styles.resourceCardContainer}
    >
      <TouchableOpacity
        style={styles.resourceCard}
        onPress={() => handleResourcePress(resource)}
      >
        {resource.thumbnailUrl ? (
          <Image
            source={{ uri: resource.thumbnailUrl }}
            style={styles.resourceThumbnail}
          />
        ) : (
          <View style={[styles.resourceThumbnail, styles.placeholderThumbnail]}>
            <MaterialIcons
              name={
                resource.type === 'video'
                  ? 'play-circle'
                  : resource.type === 'document'
                  ? 'description'
                  : 'quiz'
              }
              size={40}
              color="#666"
            />
          </View>
        )}
        <View style={styles.resourceContent}>
          <View style={styles.resourceHeader}>
            <Text style={styles.resourceTitle} numberOfLines={2}>
              {resource.title}
            </Text>
            <View style={styles.resourceTypeBadge}>
              <MaterialIcons
                name={
                  resource.type === 'video'
                    ? 'play-circle'
                    : resource.type === 'document'
                    ? 'description'
                    : 'quiz'
                }
                size={16}
                color="#fff"
              />
              <Text style={styles.resourceTypeText}>
                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.resourceSubject}>{resource.subject}</Text>
          <Text style={styles.resourceDescription} numberOfLines={2}>
            {resource.description}
          </Text>
          <View style={styles.resourceFooter}>
            <View style={styles.resourceMeta}>
              <MaterialIcons name="school" size={16} color="#666" />
              <Text style={styles.resourceMetaText}>{resource.grade} Level</Text>
            </View>
            <View style={styles.resourceMeta}>
              <MaterialIcons name="source" size={16} color="#666" />
              <Text style={styles.resourceMetaText}>{resource.source}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#4B0082', '#8A2BE2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>ZimLearn</Text>
          <Text style={styles.subtitle}>Your personalized learning journey</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subjects</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectsContainer}
          >
            {subjects.map(renderSubjectCard)}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Learning Resources</Text>
            {selectedSubject && (
              <TouchableOpacity
                style={styles.gradeSelector}
                onPress={() => {
                  setSelectedGrade(selectedGrade === 'O' ? 'A' : 'O');
                }}
              >
                <Text style={styles.gradeText}>{selectedGrade} Level</Text>
                <MaterialIcons name="swap-horiz" size={20} color="#4B0082" />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4B0082" />
            </View>
          ) : resources.length > 0 ? (
            resources.map(renderResourceCard)
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={48} color="#666" />
              <Text style={styles.emptyText}>
                {selectedSubject
                  ? 'No resources found for this subject'
                  : 'Select a subject to view resources'}
              </Text>
            </View>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 20,
  },
  headerContent: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 5,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  subjectsContainer: {
    paddingHorizontal: 15,
  },
  subjectCardContainer: {
    marginRight: 15,
  },
  subjectCard: {
    width: 120,
    height: 120,
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedSubjectCard: {
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
  gradeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  gradeText: {
    color: '#4B0082',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  resourceCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 20,
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
  placeholderThumbnail: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceContent: {
    padding: 15,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  resourceTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B0082',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resourceTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  resourceSubject: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  resourceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  resourceCardContainer: {
    marginBottom: 15,
  },
});

export default HomeScreen; 