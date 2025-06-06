# GoToFuture - Deployment Guide

## Development Setup

### Prerequisites
- **Node.js**: 16.0 or higher
- **npm**: 7.0 or higher (or yarn/pnpm)
- **Git**: For version control
- **Modern Browser**: Chrome 67+, Firefox 68+, Safari 14+, Edge 79+

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd gotofuturereact

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Development Scripts
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
npm run type-check # TypeScript type checking
```

## Production Build

### Build Process
```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Output directory: dist/
# - Minified JavaScript and CSS
# - Optimized assets
# - Source maps (optional)
```

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          store: ['zustand']
        }
      }
    }
  }
});
```

## Static Hosting

### Netlify Deployment
```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables (optional)
VITE_APP_VERSION=1.0.0
VITE_ANALYTICS_ID=your-analytics-id
```

### Vercel Deployment
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### GitHub Pages
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy
```

```json
// firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## Docker Deployment

### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip compression
        gzip on;
        gzip_types text/css application/javascript application/json;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  gotofuture:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## Environment Configuration

### Environment Variables
```bash
# .env.production
VITE_APP_NAME=GoToFuture
VITE_APP_VERSION=1.0.0
VITE_API_URL=https://api.gotofuture.com
VITE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=https://your-sentry-dsn
```

### Build-time Configuration
```typescript
// src/config.ts
export const config = {
  appName: import.meta.env.VITE_APP_NAME || 'GoToFuture',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  apiUrl: import.meta.env.VITE_API_URL || '',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};
```

## Performance Optimization

### Bundle Analysis
```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true
    })
  ]
});
```

### Code Splitting
```typescript
// Lazy load components
const MinigamesTab = lazy(() => import('./components/tabs/MinigamesTab'));
const AchievementsTab = lazy(() => import('./components/tabs/AchievementsTab'));

// Usage with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <MinigamesTab />
</Suspense>
```

### Asset Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  }
});
```

## Monitoring & Analytics

### Error Tracking (Sentry)
```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production'
  });
}
```

### Performance Monitoring
```typescript
// src/utils/performance.ts
export const trackPerformance = () => {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      console.log('Page load time:', navigation.loadEventEnd - navigation.loadEventStart);
    });
  }
};
```

### Analytics Integration
```typescript
// src/utils/analytics.ts
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  if (import.meta.env.VITE_ANALYTICS_ID) {
    // Google Analytics 4
    gtag('event', event, properties);
  }
};
```

## Security Considerations

### Content Security Policy
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data:;">
```

### Security Headers
```nginx
# nginx.conf additions
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Backup & Recovery

### Save Data Backup
```typescript
// Backup user save data
export const exportSaveData = () => {
  const saveData = localStorage.getItem('gotofuture-game-state');
  if (saveData) {
    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gotofuture-save-${Date.now()}.json`;
    a.click();
  }
};

// Import save data
export const importSaveData = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const saveData = e.target?.result as string;
      localStorage.setItem('gotofuture-game-state', saveData);
      window.location.reload();
    } catch (error) {
      console.error('Invalid save file:', error);
    }
  };
  reader.readAsText(file);
};
```

## Troubleshooting

### Common Issues
1. **Build Fails**: Check Node.js version and dependencies
2. **BigInt Errors**: Ensure target browsers support BigInt
3. **Storage Issues**: Check localStorage availability and size limits
4. **Performance**: Monitor bundle size and render performance

### Debug Mode
```typescript
// Enable debug mode in development
if (import.meta.env.DEV) {
  window.gameDebug = {
    store: useGameStore,
    addResource: (id: string, amount: number) => {
      // Debug helper functions
    }
  };
}
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Supported Platforms**: Web (All modern browsers)  
**Deployment Status**: Production Ready
