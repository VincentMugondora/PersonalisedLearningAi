import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const ProfileSetupScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Button title="Finish" onPress={() => {}} color="#6A5ACD" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#EDE7F6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4B0082',
  },
});

export default ProfileSetupScreen;