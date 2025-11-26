import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  Avatar,
  CreateVideoRequest,
  LoginRequest,
  TokenResponse,
  User,
  UserCreateRequest,
  UserUpdateRequest,
  VideoDetail,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME!;
const REFRESH_COOKIE_NAME = process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME!;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = getCookie(AUTH_COOKIE_NAME);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getCookie(REFRESH_COOKIE_NAME);
        if (refreshToken) {
          const { data } = await axios.post<TokenResponse>(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          setCookie(AUTH_COOKIE_NAME, data.access_token);
          if (data.refresh_token) {
            setCookie(REFRESH_COOKIE_NAME, data.refresh_token);
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        deleteCookie(AUTH_COOKIE_NAME);
        deleteCookie(REFRESH_COOKIE_NAME);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const { data } = await axios.post<TokenResponse>(`${API_BASE_URL}/auth/login`, credentials);
    setCookie(AUTH_COOKIE_NAME, data.access_token);
    if (data.refresh_token) {
      setCookie(REFRESH_COOKIE_NAME, data.refresh_token);
    }
    return data;
  },

  logout: () => {
    deleteCookie(AUTH_COOKIE_NAME);
    deleteCookie(REFRESH_COOKIE_NAME);
  },

  isAuthenticated: (): boolean => {
    return !!getCookie(AUTH_COOKIE_NAME);
  },
};

export const usersApi = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  getUser: async (userId: string, date?: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${userId}`, {
      params: date ? { date } : undefined,
    });
    return data;
  },

  listUsers: async (date?: string): Promise<User[]> => {
    const { data } = await api.get<{ users: User[] }>('/users', {
      params: date ? { date } : undefined,
    });
    return data.users;
  },

  createUser: async (userData: UserCreateRequest): Promise<User> => {
    const apiData = {
      ...userData,
      monthly_limit: userData.monthly_limit ? userData.monthly_limit * 60 : null,
    };
    const { data } = await api.post<User>('/users', apiData);
    return data;
  },

  updateUser: async (userData: UserUpdateRequest): Promise<User> => {
    const apiData = {
      ...userData,
      monthly_limit: userData.monthly_limit ? userData.monthly_limit * 60 : null,
    };
    const { data } = await api.put<User>('/users', apiData);
    return data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};

export const avatarsApi = {
  listAvatars: async (): Promise<Avatar[]> => {
    const { data } = await api.get<{ avatars: Avatar[] }>('/avatars');
    return data.avatars;
  },

  getAvatar: async (avatarId: string): Promise<Avatar> => {
    const { data } = await api.get<Avatar>(`/avatars/${avatarId}`);
    return data;
  },

  createAvatar: async (
    avatar: Omit<Avatar, 'avatar_id'> & { avatar_id: string }
  ): Promise<Avatar> => {
    const { data } = await api.post<Avatar>('/avatars', avatar);
    return data;
  },

  updateAvatar: async (avatar: Partial<Avatar> & { avatar_id: string }): Promise<Avatar> => {
    const { data } = await api.put<Avatar>('/avatars', avatar);
    return data;
  },

  deleteAvatar: async (avatarId: string): Promise<void> => {
    await api.delete(`/avatars/${avatarId}`);
  },
};

export const videosApi = {
  listVideos: async (): Promise<VideoDetail[]> => {
    const { data } = await api.get<{ videos: VideoDetail[] }>('/videos');
    return data.videos;
  },

  getVideo: async (videoId: string): Promise<VideoDetail> => {
    const { data } = await api.get<VideoDetail>(`/videos/${videoId}`);
    return data;
  },

  createVideo: async (videoData: CreateVideoRequest): Promise<VideoDetail> => {
    const { data } = await api.post<VideoDetail>('/videos', videoData);
    return data;
  },
};

export default api;
