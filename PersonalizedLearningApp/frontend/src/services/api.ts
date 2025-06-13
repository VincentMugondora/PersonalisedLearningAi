import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import authService from './auth';
import { Platform } from 'react-native';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // If no token is found, check if we're authenticated
      if (authService.isAuthenticated()) {
        // If we think we're authenticated but have no token, clear the auth state
        await authService.logout();
      }
    }
    return config;
  } catch (error) {
    console.error('Error in request interceptor:', error);
    return config;
  }
});

// Handle token expiration and unauthorized errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized errors (401)
    if (error.response?.status === 401) {
      // Clear the token and auth state
      await authService.logout();
      
      // Show alert to user
      Alert.alert(
        'Authentication Required',
        'Please log in again to continue.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Force reload the app to trigger navigation reset
              if (Platform.OS === 'web') {
                window.location.reload();
              }
            }
          }
        ]
      );
    }

    // Handle forbidden errors (403) - token expired
    if (error.response?.status === 403) {
      // Clear the token and auth state
      await authService.logout();
      
      // Show alert to user
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please log in again.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Force reload the app to trigger navigation reset
              if (Platform.OS === 'web') {
                window.location.reload();
              }
            }
          }
        ]
      );
    }

    return Promise.reject(error);
  }
);

// Resource types
export type ResourceType = 'document' | 'quiz' | 'practice' | 'video' | 'book';
export type ResourceSource = 'MoPSE' | 'CollegePress' | 'Teacha' | 'YouTube' | 'ZimLearn';
export type Grade = 'A' | 'O' | 'E';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface IResource {
  _id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  thumbnailUrl?: string;
  subject: string;
  grade: Grade;
  source: ResourceSource;
  author?: string;
  difficulty: Difficulty;
  tags: string[];
  isActive: boolean;
  metadata?: {
    isbn?: string;
    publisher?: string;
    year?: number;
    language?: string;
    format?: string;
    price?: number;
    currency?: string;
    resourceType?: string;
    fileSize?: number;
    downloadCount?: number;
    rating?: number;
    // Add YouTube-specific metadata
    duration?: string;
    channelName?: string;
    viewCount?: number;
    likes?: number;
    uploadDate?: string;
    playlistId?: string;
    videoId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ResourceSearchParams {
  subject?: string;
  grade?: Grade;
  type?: ResourceType;
  source?: ResourceSource;
  limit?: number;
  skip?: number;
}

// API service methods
export const apiService = {
  // Auth methods
  auth: {
    login: async (email: string, password: string) => {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      await AsyncStorage.setItem('token', token);
      return response.data;
    },
    register: async (userData: { email: string; password: string; name: string }) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    verifyEmail: async (data: { email: string; code: string }) => {
      const response = await api.post('/auth/verify-email', data);
      return response.data;
    },
    resendVerificationCode: async (data: { email: string }) => {
      const response = await api.post('/auth/resend-verification', data);
      return response.data;
    },
    getProfile: async () => {
      const response = await api.get('/auth/profile');
      return response.data;
    },
    logout: async () => {
      await AsyncStorage.removeItem('token');
    },
  },

  // Resource methods
  resources: {
    // Search resources
    search: async (params: ResourceSearchParams) => {
      const response = await api.get('/resources', { params });
      return response.data as IResource[];
    },

    // Get favorites
    getFavorites: async () => {
      const response = await api.get('/resources/favorites');
      return response.data as IResource[];
    },

    // Get recommendations
    getRecommendations: async (subject: string, grade: Grade) => {
      const response = await api.get('/resources/recommendations', {
        params: { subject, grade }
      });
      return response.data as IResource[];
    },

    // Admin methods
    fetchMoPSEResources: async (subject: string, grade: Grade) => {
      const response = await api.post('/resources/fetch/mopse', { subject, grade });
      return response.data;
    },

    fetchCollegePressResources: async (subject: string, grade: Grade) => {
      const response = await api.post('/resources/fetch/collegepress', { subject, grade });
      return response.data;
    },

    fetchTeachaResources: async (subject: string, grade: Grade) => {
      const response = await api.post('/resources/fetch/teacha', { subject, grade });
      return response.data;
    },

    addResource: async (resourceData: Partial<IResource>) => {
      const response = await api.post('/resources', resourceData);
      return response.data as IResource;
    },

    updateResource: async (id: string, resourceData: Partial<IResource>) => {
      const response = await api.put(`/resources/${id}`, resourceData);
      return response.data as IResource;
    },

    deleteResource: async (id: string) => {
      const response = await api.delete(`/resources/${id}`);
      return response.data;
    },

    async fetchResources(subject: string, grade: Grade, source?: 'MoPSE' | 'CollegePress' | 'Teacha') {
      const response = await api.post('/resources/fetch', {
        subject,
        grade,
        source
      });
      return response.data.resources;
    },

    async fetchSBPResources(subject: string, grade: Grade, type?: 'textbook' | 'revision-guide') {
      const response = await api.post('/resources/fetch/sbp', {
        subject,
        grade,
        type
      });
      return response.data.resources;
    },

    // Get video recommendations
    getVideoRecommendations: async (subject: string, grade: Grade) => {
      const response = await api.get('/resources/videos/recommendations', {
        params: { subject, grade }
      });
      return response.data as IResource[];
    },

    // Get video playlist
    getVideoPlaylist: async (playlistId: string) => {
      const response = await api.get(`/resources/videos/playlist/${playlistId}`);
      return response.data as IResource[];
    },

    // Search videos
    searchVideos: async (params: {
      query: string;
      subject?: string;
      grade?: Grade;
      difficulty?: Difficulty;
    }) => {
      const response = await api.get('/resources/videos/search', { params });
      return response.data as IResource[];
    },

    // Add video resource
    addVideoResource: async (videoData: {
      title: string;
      description: string;
      url: string;
      subject: string;
      grade: Grade;
      difficulty: Difficulty;
      tags: string[];
      metadata: {
        channelName: string;
        duration: string;
        videoId: string;
        playlistId?: string;
      };
    }) => {
      const response = await api.post('/resources/videos', {
        ...videoData,
        type: 'video',
        source: 'YouTube',
      });
      return response.data as IResource;
    },
  }
};

export default apiService; 