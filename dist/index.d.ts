type EpicAppName = 'epic_submit' | 'condition_repository' | 'epic_compliance' | 'epic_engage' | 'epic_public' | 'epic_track';
interface EaoAnalyticsOptions {
    appName: EpicAppName;
    centreApiUrl: string;
    enabled?: boolean;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    authState?: {
        user: {
            access_token?: string;
            profile?: {
                preferred_username?: string;
                sub?: string;
                identity_provider?: string;
            };
        };
        isAuthenticated: boolean;
    };
}
interface UserInfo {
    user_auth_guid: string;
}
interface EaoAnalyticsPayload {
    user_auth_guid: string;
    app_name: EpicAppName;
}

/** Options for recordAnalytics when using authState (no React hooks). */
type RecordAnalyticsOptions = EaoAnalyticsOptions & {
    authState: NonNullable<EaoAnalyticsOptions['authState']>;
};
/**
 * Record analytics once without using React hooks. Use when the app provides
 * authState (e.g. Redux apps like Engage, Track) to avoid duplicate React issues.
 */
declare function recordAnalytics(options: RecordAnalyticsOptions): Promise<void>;
declare function trackAnalytics(options: EaoAnalyticsOptions): {
    isRecording: boolean;
    error: Error | null;
};

export { type EaoAnalyticsOptions, type EaoAnalyticsPayload, type EpicAppName, type RecordAnalyticsOptions, type UserInfo, recordAnalytics, trackAnalytics };
