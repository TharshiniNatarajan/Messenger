import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { EventBusProvider } from './EventBus';
import { ErrorBoundary } from 'react-error-boundary'; // ✅ Import ErrorBoundary

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(
      `./Pages/${name}.jsx`,
      import.meta.glob('./Pages/**/*.jsx')
    ),
  setup({ el, App, props }) {
    createRoot(el).render(
      <ErrorBoundary fallback={<div className="text-white p-4">Something went wrong.</div>}>
        <EventBusProvider>
          <App {...props} />
        </EventBusProvider>
      </ErrorBoundary>
    );
  },
  progress: {
    color: '#4B5563',
  },
});
