import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { useAuth } from '../../contexts/useAuth';

const exchangePromiseCache = new Map();
const finalizePromiseWithTimeout = (promise, timeoutMs = 20000) => Promise.race([
  promise,
  new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Social sign in is taking too long. Please try again.'));
    }, timeoutMs);
  }),
]);

export default function SocialCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeSocialAuth } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const provider = searchParams.get('provider');
  const providerLabel = provider === 'google' ? 'Google' : 'GitHub';
  const hardRedirectTimerRef = useRef(null);

  useEffect(() => {
    let active = true;
    hardRedirectTimerRef.current = setTimeout(() => {
      if (!active) return;
      setErrorMessage('Could not complete social login. Redirecting to login...');
      window.location.replace('/login');
    }, 25000);

    const hashParams = new URLSearchParams(
      window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
    );
    const queryParams = new URLSearchParams(window.location.search);
    const resolvedProvider = (queryParams.get('provider') || '').trim().toLowerCase();

    console.log('[social-callback] mounted', {
      provider: resolvedProvider || provider,
      fullUrl: window.location.href,
      tokenPresent: !!(queryParams.get('token') || hashParams.get('token')),
      rtCodePresent: !!queryParams.get('rtCode'),
      error: queryParams.get('error'),
    });

    const finalize = async () => {
      const token = queryParams.get('token') || hashParams.get('token');
      const rtCode = queryParams.get('rtCode');
      const error = queryParams.get('error');

      if (error) {
        console.log('[social-callback] provider returned error', { provider: resolvedProvider || provider, error });
        setErrorMessage(error);
        setTimeout(() => window.location.replace('/login'), 1200);
        return;
      }

      if (!token || !rtCode) {
        console.log('[social-callback] missing callback data', {
          provider: resolvedProvider || provider,
          tokenPresent: !!token,
          rtCodePresent: !!rtCode,
        });
        setErrorMessage('Missing social auth callback data.');
        setTimeout(() => window.location.replace('/login'), 1200);
        return;
      }

      try {
        let exchangePromise = exchangePromiseCache.get(rtCode);
        if (!exchangePromise) {
          console.log('[social-callback] exchanging rtCode', { provider: resolvedProvider || provider, rtCode });
          exchangePromise = authApi.exchangeSocialAuth({ token, rtCode })
            .finally(() => {
              exchangePromiseCache.delete(rtCode);
            });
          exchangePromiseCache.set(rtCode, exchangePromise);
        } else {
          console.log('[social-callback] reusing in-flight rtCode exchange', { provider: resolvedProvider || provider, rtCode });
        }

        const payload = await finalizePromiseWithTimeout(exchangePromise);
        const refreshToken = payload?.data?.refreshToken;
        console.log('[social-callback] exchange response', {
          provider: resolvedProvider || provider,
          success: payload?.success,
          refreshTokenPresent: !!refreshToken,
          message: payload?.message,
        });

        if (!refreshToken) {
          throw new Error(payload?.message || 'Could not complete social login.');
        }

        if (!active) return;

        console.log('[social-callback] calling completeSocialAuth', { provider: resolvedProvider || provider });
        await finalizePromiseWithTimeout(
          completeSocialAuth({ accessToken: token, refreshToken })
        );
        clearTimeout(hardRedirectTimerRef.current);
        console.log('[social-callback] completeSocialAuth resolved, navigating home', { provider: resolvedProvider || provider });
        navigate('/', { replace: true });
      } catch (err) {
        if (!active) return;
        console.error('[social-callback] finalize failed', {
          provider: resolvedProvider || provider,
          message: err?.response?.data?.message || err?.message,
          response: err?.response?.data,
        });
        setErrorMessage(err.response?.data?.message || err.message || 'Could not complete social login.');
        setTimeout(() => window.location.replace('/login'), 1200);
      }
    };

    finalize();

    return () => {
      active = false;
      clearTimeout(hardRedirectTimerRef.current);
      console.log('[social-callback] unmounted', { provider: resolvedProvider || provider });
    };
  }, [completeSocialAuth, navigate, provider]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 p-8 text-center">
        <div className="mb-5 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Completing {providerLabel} sign in</h1>
        <p className="text-gray-500">
          {errorMessage || 'Finishing the secure token exchange and loading your account.'}
        </p>
      </div>
    </div>
  );
}
