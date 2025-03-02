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
    baseUrl: `${environment.apiUrl}${apiPrefix}`,
    endpoints: {
      list: '/shifts',
      create: '/shifts',
      update: '/shifts/:id',
      delete: '/shifts/:id',
      available: '/shifts/available',
      apply: '/shifts/:id/apply',
      applications: '/shifts/:id/applications',
      start: '/shifts/:id/start',
      complete: '/shifts/:id/complete',
      cancel: '/shifts/:id/cancel',
      unassign: '/shifts/:id/unassign',
      'worker-shifts': '/shifts'
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