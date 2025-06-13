import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';

const TOKEN_KEY = 'token';
const ONBOARDING_KEY = 'onboarding_completed';
const USER_TYPE_KEY = 'user_type';

type UserType = 'student' | 'teacher';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userType: UserType | null;
  onboardingCompleted: boolean;
}

// Simple event emitter implementation
class EventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data?: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }
}

class AuthService {
  private static instance: AuthService | null = null;
  private authState: AuthState = {
    isAuthenticated: false,
    token: null,
    userType: null,
    onboardingCompleted: false,
  };
  private eventEmitter: EventEmitter;

  private constructor() {
    this.eventEmitter = new EventEmitter();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Subscribe to auth state changes
  subscribe(callback: (state: AuthState) => void) {
    this.eventEmitter.on('authStateChanged', callback);
    return () => this.eventEmitter.off('authStateChanged', callback);
  }

  // Notify subscribers of auth state changes
  private notifySubscribers() {
    this.eventEmitter.emit('authStateChanged', this.authState);
  }

  async initialize(): Promise<AuthState> {
    try {
      const [token, onboardingCompleted, userType] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
        AsyncStorage.getItem(USER_TYPE_KEY),
      ]);

      this.authState = {
        isAuthenticated: !!token,
        token,
        userType: userType as UserType | null,
        onboardingCompleted: onboardingCompleted === 'true',
      };

      this.notifySubscribers();
      return this.authState;
    } catch (error) {
      console.error('Error initializing auth state:', error);
      return this.authState;
    }
  }

  async login(email: string, password: string): Promise<AuthState> {
    try {
      // Use the actual API service for login
      const response = await apiService.auth.login(email, password);
      const { token } = response;
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, token);
      
      // Update auth state
      this.authState = {
        ...this.authState,
        isAuthenticated: true,
        token,
      };

      this.notifySubscribers();
      return this.authState;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<AuthState> {
    try {
      // Clear all auth-related storage
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_TYPE_KEY),
      ]);
      
      // Update auth state
      this.authState = {
        isAuthenticated: false,
        token: null,
        userType: null,
        onboardingCompleted: this.authState.onboardingCompleted, // Preserve onboarding state
      };

      // Notify subscribers
      this.notifySubscribers();
      
      // Force a small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return this.authState;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async setUserType(userType: UserType): Promise<AuthState> {
    try {
      await AsyncStorage.setItem(USER_TYPE_KEY, userType);
      
      this.authState = {
        ...this.authState,
        userType,
      };

      this.notifySubscribers();
      return this.authState;
    } catch (error) {
      console.error('Error setting user type:', error);
      throw error;
    }
  }

  async completeOnboarding(): Promise<AuthState> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      
      this.authState = {
        ...this.authState,
        onboardingCompleted: true,
      };

      this.notifySubscribers();
      return this.authState;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  getCurrentState(): AuthState {
    return { ...this.authState };
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  getToken(): string | null {
    return this.authState.token;
  }

  getUserType(): UserType | null {
    return this.authState.userType;
  }

  isOnboardingCompleted(): boolean {
    return this.authState.onboardingCompleted;
  }
}

const authService = AuthService.getInstance();

export default authService;
export type { AuthState, UserType }; 