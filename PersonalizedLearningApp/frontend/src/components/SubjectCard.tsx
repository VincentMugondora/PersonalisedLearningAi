import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SubjectCardProps {
  subject: {
    id: string;
    name: string;
    icon: string;
  };
  isSelected: boolean;
  onPress: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={onPress}
    >
      <Icon
        name={subject.icon as any}
        size={32}
        color={isSelected ? '#fff' : '#4B0082'}
      />
      <Text style={[styles.name, isSelected && styles.selectedName]}>
        {subject.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginRight: 15,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    width: 100,
    height: 100,
  },
  selectedCard: {
    backgroundColor: '#4B0082',
  },
  name: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  selectedName: {
    color: '#fff',
  },
});

export default SubjectCard; 