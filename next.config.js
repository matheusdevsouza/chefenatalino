const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Configuração para evitar problemas com Edge Runtime
  webpack: (config, { isServer, webpack }) => {
    // Excluir módulos incompatíveis com Edge Runtime do middleware
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Ignorar módulos que não funcionam no Edge Runtime quando usado no middleware
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource(resource, context) {
          // Ignorar pg-native quando usado no contexto do middleware ou edge-runtime
          if (context && (context.includes('middleware') || context.includes('edge-runtime'))) {
            return /^(pg-native|pg\/lib\/native)$/.test(resource)
          }
          return false
        },
      })
    )
    
    return config
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()'
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
