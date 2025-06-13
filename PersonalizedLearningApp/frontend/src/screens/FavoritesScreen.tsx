import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight } from 'react-native-reanimated';
import apiService from '../services/api';
import { IResource } from '../services/api';

const FavoritesScreen: React.FC = () => {
  const [favorites, setFavorites] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      const data = await apiService.resources.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  }, [fetchFavorites]);

  const handleRemoveFavorite = useCallback(async (resourceId: string) => {
    try {
      await apiService.resources.removeFavorite(resourceId);
      setFavorites((prev) => prev.filter((item) => item._id !== resourceId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }, []);

  const renderResourceItem = ({ item, index }: { item: IResource; index: number }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify()}
      style={styles.resourceCard}
    >
      <View style={styles.resourceHeader}>
        <MaterialIcons
          name={
            item.type === 'video'
              ? 'play-circle'
              : item.type === 'document'
              ? 'description'
              : 'menu-book'
          }
          size={24}
          color="#4B0082"
        />
        <View style={styles.resourceInfo}>
          <Text style={styles.resourceTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.resourceSubject}>{item.subject}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleRemoveFavorite(item._id)}
          style={styles.removeButton}
        >
          <MaterialIcons name="favorite" size={24} color="#4B0082" />
        </TouchableOpacity>
      </View>
      <Text style={styles.resourceDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.resourceFooter}>
        <View style={styles.resourceMeta}>
          <MaterialIcons name="school" size={16} color="#666" />
          <Text style={styles.resourceMetaText}>{item.grade} Level</Text>
        </View>
        <View style={styles.resourceMeta}>
          <MaterialIcons name="source" size={16} color="#666" />
          <Text style={styles.resourceMetaText}>{item.source}</Text>
        </View>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B0082" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <Text style={styles.headerSubtitle}>
          {favorites.length} saved resources
        </Text>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderResourceItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="favorite-border" size={48} color="#666" />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>
              Save your favorite resources here for quick access
            </Text>
          </View>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 15,
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  resourceInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resourceSubject: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 4,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default FavoritesScreen; 