import path from 'path';
import { fileURLToPath } from 'url';
import withPWAInit from '@ducanh2912/next-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: false,
  register: true,
  skipWaiting: true,
  clientsClaim: true,
  publicExcludes: [
    '!models/**/*',
    '!onnx/**/*',
    '!wasm/**/*',
    '!embed/**/*',
  ],
  workboxOptions: {
    exclude: [
      /models\/.*/,
      /onnx\/.*/,
      /wasm\/.*/,
      /embed\/.*/,
      /^api\/.*/,
      /\.map$/,
    ],
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.pathname.startsWith('/tools'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'alatify-tools-pages',
          expiration: {
            maxEntries: 48,
            maxAgeSeconds: 24 * 60 * 60,
          },
        },
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-static-assets',
          expiration: {
            maxEntries: 128,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
      {
        urlPattern: ({ url }) => url.search.includes('_rsc'),
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-rsc-data',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60,
          },
        },
      },
      {
        urlPattern: /\/_next\/image\?/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-images',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@imgly/background-removal', 'onnxruntime-web', '@jsquash/oxipng'],
  async headers() {
    return [
      {
        source: '/((?!embed/).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'onnxruntime-node': false,
      };
    }

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
    };

    // 2. Module rule to treat pre-minified .min.mjs as javascript/auto (skip transformation)
    config.module.rules.push({
      test: /\.min\.mjs$/,
      type: 'javascript/auto',
    });

    // 3. Custom loader to replace import.meta.url in onnxruntime-web and background-removal
    config.module.rules.push({
      test: /[\/\\]node_modules[\/\\](onnxruntime-web|@imgly[\/\\]background-removal)[\/\\].*\.(js|mjs|cjs)$/,
      use: {
        loader: path.resolve(__dirname, 'import-meta-loader.js'),
      },
    });

    return config;
  },
};

export default withPWA(nextConfig);
