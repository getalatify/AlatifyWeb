import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@imgly/background-removal', 'onnxruntime-web'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/tools/bg-remover',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
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

    // 1. asyncWebAssembly experiment for WASM support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
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

export default nextConfig;
