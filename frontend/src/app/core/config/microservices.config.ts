import { environment } from '../../../environments/environment';

const apiPrefix = `/api/${environment.apiVersion}`;

export const microservicesConfig = {
  gateway: {
    baseUrl: `${environment.apiUrl}${apiPrefix}`,
    timeout: 30000,
  },
  auth: {
    baseUrl: `${environment.apiUrl}${apiPrefix}/auth`,
    endpoints: {
      login: '/login',
      register: '/register',
      refreshToken: '/refresh-token',
      forgotPassword: '/forgot-password',
      resetPassword: '/reset-password',
      me: '/me',
      ensureWorkerProfile: '/ensure-worker-profile'
    }
  },
  shift: {
    baseUrl: `${environment.apiUrl}${apiPrefix}/shifts`,
    endpoints: {
      list: '/',
      create: '/',
      update: '/:id',
      delete: '/:id',
      available: '/available',
      apply: '/:id/apply',
      applications: '/:id/applications',
      start: '/:id/start',
      complete: '/:id/complete',
      cancel: '/:id/cancel',
      'worker-shifts': '/'
    }
  },
  worker: {
    baseUrl: `${environment.apiUrl}${apiPrefix}`,
    endpoints: {
      profile: '/worker_profile',
      shifts: '/workers/shifts',
      earnings: '/workers/earnings',
      availability: '/worker_profile/availability',
      ratings: '/workers/ratings',
    }
  },
  business: {
    baseUrl: `${environment.apiUrl}${apiPrefix}/businesses`,
    endpoints: {
      profile: '/profile',
      shifts: '/shifts',
      workers: '/workers',
      locations: '/locations',
      analytics: '/analytics',
    }
  },
  notification: {
    baseUrl: `${environment.apiUrl}${apiPrefix}/notifications`,
    endpoints: {
      list: '',
      markRead: '/:id/read',
      markAllRead: '/read-all',
      preferences: '/preferences',
    }
  },
  payment: {
    baseUrl: `${environment.apiUrl}${apiPrefix}/payments`,
    endpoints: {
      methods: '/methods',
      transactions: '/transactions',
      withdraw: '/withdraw',
      balance: '/balance',
      earnings: '/earnings',
    }
  },
  chat: {
    baseUrl: `${environment.apiUrl}${apiPrefix}/chat`,
    endpoints: {
      conversations: '/conversations',
      messages: '/messages',
      send: '/send',
      typing: '/typing',
    }
  }
}; 