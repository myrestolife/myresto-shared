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
    'components/Footer': 'components/Footer.tsx',
    'components/ErrorBoundary': 'components/ErrorBoundary.tsx',
  },
  format: ['esm', 'cjs'],
  dts: false,
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.cjs' };
  },
  splitting: false,
  sourcemap: false,
  clean: true,
  external: ['react', 'react-dom', 'next', '@supabase/supabase-js', '@supabase/ssr'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
