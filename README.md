# EPIC.analytics

React hook to record IDIR user login analytics across EPIC applications.

## Installation

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

Set the EPIC.centre API URL in your environment (e.g. `.env`):

```env
VITE_CENTRE_API_URL=https://your-centre-api.example.com
```

## Usage

### Apps using react-oidc-context (Submit, Compliance, Conditions)

```tsx
import { trackAnalytics } from '@epic/centre-analytics';

function App() {
  trackAnalytics({
    appName: process.env.VITE_APP_NAME,
    centreApiUrl: process.env.VITE_CENTRE_API_URL,
  });
  return <div>...</div>;
}
```

### Apps using Redux (Engage, Track)

```tsx
import { trackAnalytics } from '@epic/centre-analytics';
import { useAppSelector } from './hooks';

function App() {
  const bearerToken = useAppSelector((state) => state.user.bearerToken);
  const isAuthenticated = useAppSelector((state) => state.user.authentication.authenticated);
  const userDetail = useAppSelector((state) => state.user.userDetail);

  trackAnalytics({
    appName: process.env.VITE_APP_NAME,
    centreApiUrl: process.env.VITE_CENTRE_API_URL,
    authState: {
      user: {
        access_token: bearerToken,
        profile: { preferred_username: userDetail.preferred_username },
      },
      isAuthenticated,
    },
  });

  return <div>...</div>;
}
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_CENTRE_API_URL` | Base URL of the EPIC.centre API (used as `centreApiUrl`). |

## Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `appName` | `EpicAppName` | Yes | App identifier |
| `centreApiUrl` | `string` | Yes | EPIC.centre API base URL (e.g. `import.meta.env.VITE_CENTRE_API_URL`) |
| `enabled` | `boolean` | No | Enable/disable recording (default: `true`) |
| `authState` | `object` | No | Injected auth for apps without react-oidc-context |
| `onSuccess` | `() => void` | No | Callback on success |
| `onError` | `(error: Error) => void` | No | Callback on error |

## App names

- `epic_submit`
- `epic_compliance`
- `condition_repository`
- `epic_engage`
- `epic_track`
- `epic_public`

## Returns

- `isRecording`: `boolean` — whether a request is in progress
- `error`: `Error | null` — last recording error, if any
