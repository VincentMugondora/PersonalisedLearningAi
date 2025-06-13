import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import apiService from '../services/api';
import { IResource, Grade, ResourceType, ResourceSource, Difficulty } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// Define the search resource type for this screen
type SearchResourceType = 'course' | 'video' | 'article' | 'book' | 'document' | 'quiz' | 'practice';
type SearchResourceLevel = 'beginner' | 'intermediate' | 'advanced';

interface SearchResource {
  id: string;
  title: string;
  description: string;
  type: SearchResourceType;
  level: SearchResourceLevel;
  tags: string[];
  url: string;
  thumbnailUrl: string;
}

// Map search resource types to API resource types
const typeMap: Record<SearchResourceType, ResourceType> = {
  course: 'book', // fallback to 'book' for demo
  video: 'video',
  article: 'document', // fallback to 'document' for demo
  book: 'book',
  document: 'document',
  quiz: 'quiz',
  practice: 'practice',
};

// Map search resource levels to API difficulty levels
const levelMap: Record<SearchResourceLevel, Difficulty> = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
};

const source: ResourceSource = 'Custom';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock data for demonstration
const MOCK_RESOURCES: SearchResource[] = [
  {
    id: '1',
    title: 'Introduction to Mathematics',
    description: 'Basic concepts of algebra and arithmetic',
    type: 'course',
    level: 'beginner',
    tags: ['math', 'algebra', 'arithmetic'],
    url: 'https://example.com/math-intro',
    thumbnailUrl: 'https://example.com/math-thumb.jpg',
  },
  {
    id: '2',
    title: 'Advanced Physics',
    description: 'Deep dive into quantum mechanics',
    type: 'course',
    level: 'advanced',
    tags: ['physics', 'quantum', 'science'],
    url: 'https://example.com/physics-adv',
    thumbnailUrl: 'https://example.com/physics-thumb.jpg',
  },
];

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<Grade>('O');
  const [selectedType, setSelectedType] = useState<SearchResourceType | null>(null);
  const [results, setResults] = useState<SearchResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const resourceTypes: { type: SearchResourceType; icon: string; label: string }[] = [
    { type: 'book', icon: 'menu-book', label: 'Books' },
    { type: 'video', icon: 'play-circle', label: 'Videos' },
    { type: 'document', icon: 'description', label: 'Documents' },
    { type: 'quiz', icon: 'quiz', label: 'Quizzes' },
    { type: 'practice', icon: 'assignment', label: 'Practice' },
  ];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'courses', label: 'Courses' },
    { id: 'videos', label: 'Videos' },
    { id: 'articles', label: 'Articles' },
    { id: 'books', label: 'Books' },
    { id: 'documents', label: 'Documents' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'practice', label: 'Practice' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
  ] as const;

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock data based on search query and selected filter
      let filtered = MOCK_RESOURCES.filter(resource =>
        resource.title.toLowerCase().includes(query.toLowerCase()) ||
        resource.description.toLowerCase().includes(query.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

      // Apply filter if selected
      if (selectedFilter && selectedFilter !== 'all') {
        if (['courses', 'videos', 'articles', 'books', 'documents', 'quizzes', 'practice'].includes(selectedFilter)) {
          filtered = filtered.filter(resource => resource.type === selectedFilter);
        } else if (['beginner', 'intermediate', 'advanced'].includes(selectedFilter)) {
          filtered = filtered.filter(resource => resource.level === selectedFilter);
        }
      }
      
      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  }, [selectedFilter]);

  const handleFilterSelect = useCallback((filterId: string) => {
    setSelectedFilter(filterId === selectedFilter ? null : filterId);
    // Re-run search with new filter
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [selectedFilter, searchQuery, handleSearch]);

  const handleResourcePress = useCallback((resource: SearchResource) => {
    // Convert SearchResource to IResource for navigation
    const navigationResource: IResource = {
      _id: resource.id,
      title: resource.title,
      description: resource.description,
      type: typeMap[resource.type],
      subject: resource.tags[0] || 'General',
      grade: 'O',
      tags: resource.tags,
      url: resource.url,
      thumbnailUrl: resource.thumbnailUrl,
      source,
      difficulty: levelMap[resource.level],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    navigation.navigate('ResourceDetail', { resource: navigationResource });
  }, [navigation]);

  const renderResourceType = ({ item, index }: { item: typeof resourceTypes[0]; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.typeContainer}
    >
      <TouchableOpacity
        style={[
          styles.typeButton,
          selectedType === item.type && styles.selectedTypeButton,
        ]}
        onPress={() => setSelectedType(selectedType === item.type ? null : item.type)}
      >
        <MaterialIcons
          name={item.icon as any}
          size={24}
          color={selectedType === item.type ? '#fff' : '#4B0082'}
        />
        <Text
          style={[
            styles.typeLabel,
            selectedType === item.type && styles.selectedTypeLabel,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderResourceItem = useCallback(({ item }: { item: SearchResource }) => (
    <TouchableOpacity
      style={styles.resourceItem}
      onPress={() => handleResourcePress(item)}
    >
      <View style={styles.resourceContent}>
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <Text style={styles.resourceDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.resourceMeta}>
          <View style={styles.tagContainer}>
            {item.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.resourceLevel}>{item.level}</Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  ), [handleResourcePress]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
            onSubmitEditing={() => handleSearch(searchQuery)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setResults([]);
              }}
              style={styles.clearButton}
            >
              <MaterialIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.gradeButton}
          onPress={() => setSelectedGrade(selectedGrade === 'O' ? 'A' : 'O')}
        >
          <Text style={styles.gradeButtonText}>{selectedGrade} Level</Text>
          <MaterialIcons name="swap-horiz" size={20} color="#4B0082" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={resourceTypes}
        renderItem={renderResourceType}
        keyExtractor={(item) => item.type}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typesList}
        contentContainerStyle={styles.typesListContent}
      />

      <View style={styles.filtersContainer}>
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item.id && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterSelect(item.id)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === item.id && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B0082" />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderResourceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      ) : searchQuery.length > 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="search-off" size={48} color="#666" />
          <Text style={styles.emptyText}>No resources found</Text>
          <Text style={styles.emptySubtext}>Try different keywords or filters</Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="search" size={48} color="#666" />
          <Text style={styles.emptyText}>Search for resources</Text>
          <Text style={styles.emptySubtext}>Enter keywords to find learning materials</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  gradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  gradeButtonText: {
    color: '#4B0082',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  typesList: {
    maxHeight: 80,
  },
  typesListContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  typeContainer: {
    marginRight: 10,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4B0082',
  },
  selectedTypeButton: {
    backgroundColor: '#4B0082',
  },
  typeLabel: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4B0082',
    fontWeight: '500',
  },
  selectedTypeLabel: {
    color: '#fff',
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  filtersList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#4B0082',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  resultsList: {
    padding: 15,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  resourceContent: {
    flex: 1,
    marginRight: 12,
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
  resourceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  resourceLevel: {
    fontSize: 12,
    color: '#4B0082',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default SearchScreen; 