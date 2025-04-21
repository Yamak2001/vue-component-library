export interface User {
    id: string | number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    active: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
    avatar?: string;
    preferences?: UserPreferences;
    permissions?: string[];
  }
  
  export interface UserPreferences {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    timezone?: string;
    dateFormat?: string;
  }
  
  export interface UserLoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
  }
  
  export interface UserLoginResponse {
    user: User;
    token: string;
    refreshToken?: string;
    expiresIn?: number;
  }
  
  export interface UserRegistrationRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    role?: 'editor' | 'viewer';
  }
  
  export interface UserUpdateRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    active?: boolean;
    role?: 'admin' | 'editor' | 'viewer';
    preferences?: Partial<UserPreferences>;
  }
  
  export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirmation: string;
  }
  
  export interface PasswordResetRequest {
    email: string;
  }
  
  export interface PasswordResetConfirmRequest {
    token: string;
    newPassword: string;
    newPasswordConfirmation: string;
  }
  
  // User search and filter options
  export interface UserFilterOptions {
    role?: 'admin' | 'editor' | 'viewer';
    active?: boolean;
    search?: string;
    sortBy?: keyof User;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }