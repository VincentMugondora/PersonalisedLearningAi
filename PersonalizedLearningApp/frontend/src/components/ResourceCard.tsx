import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { IResource } from '../services/api';

interface ResourceCardProps {
  resource: IResource;
  onPress: (resource: IResource) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onPress }) => {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'book':
        return 'menu-book';
      case 'video':
        return 'play-circle';
      default:
        return 'description';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(resource)}
    >
      {resource.thumbnailUrl ? (
        <Image
          source={{ uri: resource.thumbnailUrl }}
          style={styles.thumbnail}
        />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Icon
            name={getResourceIcon(resource.type)}
            size={32}
            color="#666"
          />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {resource.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {resource.description}
        </Text>
        <View style={styles.metadata}>
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
};

const styles = StyleSheet.create({
  card: {
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
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metadata: {
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
});

export default ResourceCard; 