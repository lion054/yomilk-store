import { UserSession, RegisterPayload, BusinessPartner } from '../models/user';
import { ApiResponse } from '../api/responses';

export interface AuthContextValue {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<ApiResponse<UserSession>>;
  register: (userData: RegisterPayload) => Promise<ApiResponse<any>>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<ApiResponse<any>>;
  resetPassword: (
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<ApiResponse<any>>;
  isAuthenticated: boolean;
  isVisitor: boolean;

  // Profile switcher fields
  businessPartners: BusinessPartner[];
  loadingBusinessPartners: boolean;
  switchingProfile: boolean;
  switchProfile: (cardCode: string) => Promise<ApiResponse<UserSession>>;
  refreshBusinessPartners: () => Promise<void>;

  // Error handling
  handleProfileFetchError: () => void;
}
