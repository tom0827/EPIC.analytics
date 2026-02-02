import { useEffect, useRef, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { extractUserInfo } from './utils/tokenExtractor';
import { trackLogin } from './utils/apiClient';
import { EaoAnalyticsOptions } from './types';

const DEBOUNCE_MS = 5000;
const STORAGE_KEY = 'epic_eao_analytics_last_recorded';

function useAuthState(authState?: EaoAnalyticsOptions['authState']) {
  if (authState) {
    return {
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
    };
  }
  const auth = useAuth();
  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
  };
}

function isIdirUser(user: { profile?: Record<string, unknown> } | null | undefined): boolean {
  return (user?.profile as { identity_provider?: string } | undefined)?.identity_provider === 'idir';
}

function wasRecentlyRecorded(appName: string): boolean {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return false;
  try {
    const { lastRecorded, appName: storedApp } = JSON.parse(stored);
    const elapsed = Date.now() - lastRecorded;
    return storedApp === appName && elapsed < DEBOUNCE_MS;
  } catch {
    return false;
  }
}

function saveRecordedTimestamp(appName: string): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ lastRecorded: Date.now(), appName }));
  }
}

/** Options for recordAnalytics when using authState (no React hooks). */
export type RecordAnalyticsOptions = EaoAnalyticsOptions & {
  authState: NonNullable<EaoAnalyticsOptions['authState']>;
};

/**
 * Record analytics once without using React hooks. Use when the app provides
 * authState (e.g. Redux apps like Engage, Track) to avoid duplicate React issues.
 */
export async function recordAnalytics(options: RecordAnalyticsOptions): Promise<void> {
  const { appName, centreApiUrl, enabled = true, onSuccess, onError, authState } = options;
  const { user, isAuthenticated } = authState;

  if (!enabled || !isAuthenticated || !user) return;
  if (wasRecentlyRecorded(appName)) return;

  const userInfo = extractUserInfo(user);
  if (!userInfo) {
    console.warn('EAO Analytics: Could not extract user info');
    return;
  }

  const rawToken = user.access_token;
  if (!rawToken) {
    console.warn('EAO Analytics: No access token available');
    return;
  }

  try {
    await trackLogin(centreApiUrl, rawToken, {
      user_auth_guid: userInfo.user_auth_guid,
      app_name: appName,
    });
    saveRecordedTimestamp(appName);
    onSuccess?.();
  } catch (err) {
    const e = err instanceof Error ? err : new Error('Unknown error');
    onError?.(e);
    throw e;
  }
}

export function trackAnalytics(options: EaoAnalyticsOptions) {
  const { appName, centreApiUrl, enabled = true, onSuccess, onError, authState } = options;
  const { user, isAuthenticated } = useAuthState(authState);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasRecorded = useRef(false);

  useEffect(() => {
    if (!enabled || !isAuthenticated || !user || hasRecorded.current) return;
    if (wasRecentlyRecorded(appName)) return;
    if (!authState && !isIdirUser(user)) return;

    const userInfo = extractUserInfo(user);
    if (!userInfo) {
      console.warn('EAO Analytics: Could not extract user info');
      return;
    }

    const rawToken = user.access_token;
    if (!rawToken) {
      console.warn('EAO Analytics: No access token available');
      return;
    }

    const token: string = rawToken;
    const payloadUserGuid = userInfo.user_auth_guid;
    const payloadAppName = appName;

    async function recordAnalytics() {
      hasRecorded.current = true;
      setIsRecording(true);
      setError(null);
      try {
        await trackLogin(centreApiUrl, token, {
          user_auth_guid: payloadUserGuid,
          app_name: payloadAppName,
        });
        saveRecordedTimestamp(payloadAppName);
        onSuccess?.();
      } catch (err) {
        const e = err instanceof Error ? err : new Error('Unknown error');
        setError(e);
        onError?.(e);
      } finally {
        setIsRecording(false);
        hasRecorded.current = false;
      }
    }

    recordAnalytics();
  }, [isAuthenticated, user, appName, centreApiUrl, enabled, onSuccess, onError, authState]);

  return { isRecording, error };
}
