// Admin Authentication API Service
import { supabase } from './supabase';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  last_login?: string;
}

export interface LoginResult {
  success: boolean;
  user?: AdminUser;
  error?: string;
  isLocked?: boolean;
}

export class AdminAuthService {
  /**
   * Authenticate admin user with username and password
   */
  static async login(username: string, password: string): Promise<LoginResult> {
    try {
      const { data, error } = await supabase.rpc('verify_admin_login', {
        p_username: username,
        p_password: password
      });

      if (error) {
        console.error('Admin login error:', error);
        return {
          success: false,
          error: 'Authentication failed. Please try again.'
        };
      }

      // Check if we got a result
      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'Invalid username or password.'
        };
      }

      const adminData = data[0];

      // Check if account is locked
      if (adminData.is_locked) {
        return {
          success: false,
          error: 'Account is temporarily locked due to multiple failed login attempts. Please try again in 30 minutes.',
          isLocked: true
        };
      }

      // Successful login
      const user: AdminUser = {
        id: adminData.admin_id,
        username: adminData.username,
        email: adminData.email,
        full_name: adminData.full_name,
        last_login: new Date().toISOString()
      };

      console.log('Login successful, user object:', user);

      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('Admin login exception:', error);
      return {
        success: false,
        error: 'Authentication service unavailable. Please try again later.'
      };
    }
  }

  /**
   * Change admin password
   */
  static async changePassword(
    adminId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('change_admin_password', {
        p_admin_id: adminId,
        p_old_password: oldPassword,
        p_new_password: newPassword
      });

      if (error) {
        console.error('Password change error:', error);
        return {
          success: false,
          error: 'Failed to change password. Please try again.'
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Current password is incorrect.'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Password change exception:', error);
      return {
        success: false,
        error: 'Service unavailable. Please try again later.'
      };
    }
  }

  /**
   * Create new admin user (only existing admins can do this)
   */
  static async createAdminUser(
    username: string,
    password: string,
    email: string,
    fullName: string
  ): Promise<{ success: boolean; adminId?: string; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('create_admin_user', {
        p_username: username,
        p_password: password,
        p_email: email,
        p_full_name: fullName
      });

      if (error) {
        console.error('Create admin user error:', error);
        return {
          success: false,
          error: 'Failed to create admin user. Username or email may already exist.'
        };
      }

      return {
        success: true,
        adminId: data
      };
    } catch (error) {
      console.error('Create admin user exception:', error);
      return {
        success: false,
        error: 'Service unavailable. Please try again later.'
      };
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate secure password
   */
  static generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*(),.?":{}|<>';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
