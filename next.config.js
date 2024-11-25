module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.dealpropertysourcing.co.uk/api/:path*',
      },
    ];
  },
}; 