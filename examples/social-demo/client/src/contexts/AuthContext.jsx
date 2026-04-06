import { useState } from 'react';
import { authApi, clearAuthStorage, dataApi, storeTokens } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AuthContext from './auth-context';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const queryClient = useQueryClient();

  const syncProfile = async (userData) => {
    try {
      console.log('[auth] syncProfile start', {
        userId: userData?._id,
        username: userData?.username,
      });
      await dataApi.syncProfileFromUser(userData);
      console.log('[auth] syncProfile success', {
        userId: userData?._id,
      });
    } catch (profileSyncError) {
      console.error('⚠️ Profile sync failed:', profileSyncError);
    }
  };

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      console.log('[auth] useQuery(me) start', { tokenPresent: !!token });
      const response = await authApi.getMe();
      // Save to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(response.data));
      await syncProfile(response.data);
      console.log('[auth] useQuery(me) success', {
        userId: response.data?._id,
        email: response.data?.email,
      });
      return response.data;
    },
    enabled: !!token,
    retry: 1,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (response) => {
      const nextToken = response.data?.accessToken || response.data?.token;
      setToken(nextToken);
      localStorage.setItem('token', nextToken);
      // Trigger user fetch
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: async (response) => {
      const nextToken = response.data?.accessToken || response.data?.token;
      setToken(nextToken);
      localStorage.setItem('token', nextToken);
      // Trigger user fetch
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  // Logout
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (logoutError) {
      console.error('Logout request failed:', logoutError);
      clearAuthStorage();
    } finally {
      setToken(null);
      queryClient.clear();
    }
  };

  const completeSocialAuth = async ({ accessToken, refreshToken }) => {
    console.log('[auth] completeSocialAuth start', {
      accessTokenPresent: !!accessToken,
      refreshTokenPresent: !!refreshToken,
    });
    storeTokens({ accessToken, refreshToken });
    setToken(accessToken);
    console.log('[auth] tokens stored, fetching /me');
    const response = await authApi.getMe();
    console.log('[auth] /me response received in completeSocialAuth', {
      userId: response.data?._id,
      email: response.data?.email,
    });
    localStorage.setItem('user', JSON.stringify(response.data));
    queryClient.setQueryData(['me'], response.data);
    console.log('[auth] query cache seeded for me');
    syncProfile(response.data).catch((profileSyncError) => {
      console.error('⚠️ Profile sync failed after social auth:', profileSyncError);
    });
    console.log('[auth] completeSocialAuth finished');
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
    isLoginLoading: loginMutation.isPending,
    isSignupLoading: signupMutation.isPending,
    completeSocialAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
