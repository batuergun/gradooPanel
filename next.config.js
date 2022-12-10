const runtimeCaching = require('next-pwa/cache')
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifet.json$/]
})

module.exports = withPWA({
  reactStrictMode: true
})