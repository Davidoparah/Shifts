import { environment } from '../../../environments/environment';

export const microservicesConfig = {
  gateway: {
    baseUrl: `${environment.apiUrl}`,
    timeout: 30000,
  },
  auth: {
    baseUrl: `${environment.apiUrl}/auth`,
    endpoints: {
      login: '/login',
      register: '/register',
      refreshToken: '/refresh-token',
      forgotPassword: '/forgot-password',
      resetPassword: '/reset-password',
      me: '/me'
    }
  },
  shift: {
    baseUrl: `${environment.apiUrl}/shifts`,
    endpoints: {
      list: '/',
      create: '/',
      update: '/:id',
      delete: '/:id',
      available: '/available',
      apply: '/:id/apply',
      start: '/:id/start',
      complete: '/:id/complete',
      cancel: '/:id/cancel',
      'worker-shifts': '/worker/shifts'
    }
  },
  worker: {
    baseUrl: `${environment.apiUrl}/workers`,
    endpoints: {
      profile: '/profile',
      shifts: '/shifts',
      earnings: '/earnings',
      availability: '/availability',
      ratings: '/ratings',
    }
  },
  business: {
    baseUrl: `${environment.apiUrl}/businesses`,
    endpoints: {
      profile: '/profile',
      shifts: '/shifts',
      workers: '/workers',
      locations: '/locations',
      analytics: '/analytics',
    }
  },
  notification: {
    baseUrl: `${environment.apiUrl}/notifications`,
    endpoints: {
      list: '',
      markRead: '/:id/read',
      markAllRead: '/read-all',
      preferences: '/preferences',
    }
  },
  payment: {
    baseUrl: `${environment.apiUrl}/payments`,
    endpoints: {
      methods: '/methods',
      transactions: '/transactions',
      withdraw: '/withdraw',
      balance: '/balance',
      earnings: '/earnings',
    }
  },
  chat: {
    baseUrl: `${environment.apiUrl}/chat`,
    endpoints: {
      conversations: '/conversations',
      messages: '/messages',
      send: '/send',
      typing: '/typing',
    }
  }
}; 