import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Resource types
export type ResourceType = 'book' | 'video' | 'document' | 'quiz' | 'practice';
export type ResourceSource = 'MoPSE' | 'CollegePress' | 'Teacha' | 'YouTube' | 'Custom';
export type Grade = 'O' | 'A';
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
    }
  }
};

export default apiService; 