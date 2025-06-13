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

class AuthService {
  private static instance: AuthService | null = null;
  private authState: AuthState = {
    isAuthenticated: false,
    token: null,
    userType: null,
    onboardingCompleted: false,
  };

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
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
      
      // Update auth state
      this.authState = {
        ...this.authState,
        isAuthenticated: true,
        token,
      };

      return this.authState;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<AuthState> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      
      this.authState = {
        ...this.authState,
        isAuthenticated: false,
        token: null,
      };

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