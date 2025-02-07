export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  apiVersion: 'v1',
  cloudinaryConfig: {
    cloudName: 'dpokmjhlc',
    uploadPreset: 'ml_default',
    apiKey: '513817313565726'
  },
  googleMaps: {
    apiKey: 'your_google_maps_api_key'
  },
  defaultPagination: {
    pageSize: 20,
    maxPageSize: 100
  },
  refreshTokenInterval: 1800000, // 30 minutes
  toastDuration: 3000
}; 