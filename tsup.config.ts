import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'index.ts',
    'lib/auth': 'lib/auth/index.tsx',
    'lib/authorization': 'lib/authorization.tsx',
    'lib/brand': 'lib/brand.ts',
    'lib/theme': 'lib/theme.tsx',
    'lib/config': 'lib/config.ts',
    'lib/api': 'lib/api.ts',
    'lib/server-auth': 'lib/server-auth/index.ts',
    'components/Footer': 'components/Footer.tsx',
    'components/ErrorBoundary': 'components/ErrorBoundary.tsx',
    'components/Toast': 'components/Toast.tsx',
    'components/Spinner': 'components/Spinner.tsx',
    'components/EmptyState': 'components/EmptyState.tsx',
    'lib/timeAgo': 'lib/timeAgo.ts',
    'lib/middleware': 'lib/middleware.ts',
    'lib/r2': 'lib/r2.ts',
    'lib/ratelimit': 'lib/ratelimit.ts',
    'components/Navbar': 'components/Navbar.tsx',
    'components/ThemeToggle': 'components/ThemeToggle.tsx',
    'components/SkipToContent': 'components/SkipToContent.tsx',
    'components/ErrorPage': 'components/ErrorPage.tsx',
    'components/NotFoundPage': 'components/NotFoundPage.tsx',
    'components/FavoriteButton': 'components/FavoriteButton.tsx',
    'components/AuthPageLayout': 'components/AuthPageLayout.tsx',
  },
  format: ['esm', 'cjs'],
  dts: false,
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.cjs' };
  },
  splitting: false,
  sourcemap: false,
  clean: true,
  external: ['react', 'react-dom', 'next', '@supabase/supabase-js', '@supabase/ssr', '@aws-sdk/client-s3', '@upstash/ratelimit', '@upstash/redis'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
