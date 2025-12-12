# EPIC.analytics

Repository to have analytics related components for EPIC System

## Installation

### Install from GitHub

Add to your application's `package.json`:

```json
{
  "dependencies": {
    "@epic/centre-analytics": "git+https://github.com/bcgov/EPIC.analytics.git#main"
  }
}
```

Then run:
```bash
npm install
```

## Usage

### Basic Usage

```typescript
import { trackAnalytics } from '@epic/centre-analytics';

function RouterProviderWithAuthContext() {
  const { isAuthenticated } = useAuth();
  
  trackAnalytics({
    appName: 'epic_submit',
    centreApiUrl: 'https://centre-api.example.com',
  });
  
  // ... rest of component
}
```

### With Configuration

```typescript
trackAnalytics({
  appName: 'epic_submit',
  centreApiUrl: process.env.VITE_CENTRE_API_URL,
  enabled: isAuthenticated,
  onSuccess: () => {
    console.log('Analytics recorded successfully');
  },
  onError: (error) => {
    console.error('Analytics recording failed:', error);
  },
});
```

## API

### `trackAnalytics(options: CentreAnalyticsOptions)`

#### Options

- `appName` (required): The application name (`'epic_submit'`, `'condition_repository'`, `'epic_compliance'`, `'epic_engage'`, `'epic_public'`)
- `centreApiUrl` (required): Base URL of EPIC.centre API
- `enabled` (optional): Enable/disable analytics recording (default: `true`)
- `onSuccess` (optional): Callback on successful recording
- `onError` (optional): Callback on recording error

#### Returns

- `isRecording`: Boolean indicating if analytics recording is in progress
- `error`: Error object if recording failed

## Features

- Automatically extracts user info from OIDC token
- Maps application name to app_id
- Debounces analytics recording (max once per 5 seconds per session)
- Silent error handling (won't break your app)
- TypeScript support

## Environment Variables

Add to your application's environment configuration:

```env
VITE_CENTRE_API_URL=https://centre-api.example.com
```

## Application Names

- `epic_submit` - EPIC.submit
- `condition_repository` - EPIC.conditions
- `epic_compliance` - EPIC.compliance
- `epic_engage` - epic-engage
- `epic_public` - epic-public

