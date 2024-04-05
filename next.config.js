const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

module.exports = withNextra({
  i18n: {
    locales: ['en', 'es', 'pt'],
    defaultLocale: 'en'
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/overview/introduction',
        permanent: true,
      },
    ]
  },
})
