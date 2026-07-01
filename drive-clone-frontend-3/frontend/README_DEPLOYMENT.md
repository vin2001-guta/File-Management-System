# Frontend Deployment

This frontend is a Vite React app.

## Required Environment Variable

Set this to the deployed backend URL, including the `/api` context path:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

If the frontend and backend are served from the same domain behind a reverse proxy, the app can use the default `/api`.

## Build

```bash
npm ci
npm run build
```

The production output is written to `dist`.

## Render Static Site

Use the included `render.yaml` or configure:

```text
Build command: npm ci && npm run build
Publish directory: dist
Rewrite: /* -> /index.html
```
