import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Resource types
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'quiz' | 'practice';
  url: string;
  thumbnailUrl?: string;
  subject: string;
  grade: 'O' | 'A';
  source: 'YouTube' | 'ZIMSEC' | 'Custom';
  author: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isActive: boolean;
  metadata?: {
    publishedAt?: string;
    channelId?: string;
    videoId?: string;
    duration?: string;
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
    tags?: string[];
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ResourceSearchParams {
  subject?: string;
  grade?: 'O' | 'A';
  type?: 'video' | 'document' | 'quiz' | 'practice';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  limit?: number;
  skip?: number;
}

// API service methods
export const resourceService = {
  // Search resources
  searchResources: async (params: ResourceSearchParams) => {
    const response = await api.get<Resource[]>('/resources', { params });
    return response.data;
  },

  // Get personalized recommendations
  getRecommendations: async () => {
    const response = await api.get<Resource[]>('/resources/recommendations');
    return response.data;
  },

  // Get resource by ID
  getResource: async (id: string) => {
    const response = await api.get<Resource>(`/resources/${id}`);
    return response.data;
  },

  // Get resources by subject
  getResourcesBySubject: async (subject: string, grade: 'O' | 'A') => {
    const response = await api.get<Resource[]>('/resources', {
      params: { subject, grade }
    });
    return response.data;
  }
};

// Auth service methods
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return user;
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
    grade: 'O' | 'A';
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export default api; 