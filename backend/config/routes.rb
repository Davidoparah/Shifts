Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Auth Service Routes
      scope :auth do
        post 'login', to: 'auth#login'
        post 'register', to: 'auth#register'
        post 'refresh-token', to: 'auth#refresh_token'
        post 'forgot-password', to: 'auth#forgot_password'
        post 'reset-password', to: 'auth#reset_password'
        get 'me', to: 'auth#me'
        delete 'logout', to: 'auth#logout'
        post 'ensure-worker-profile', to: 'auth#ensure_worker_profile'
      end

      # Worker profile routes
      resource :worker_profile, only: [:show, :create, :update] do
        put 'availability', to: 'worker_profiles#update_availability'
      end

      # Shifts routes
      resources :shifts do
        collection do
          get 'available'
          get 'worker'
          get 'history'
        end
        member do
          post 'apply'
          post 'cancel'
          post 'start'
          post 'complete'
        end
      end

      # Business routes
      resources :businesses, only: [:show, :update] do
        resources :shifts, only: [:index, :create]
      end

      # Admin routes
      namespace :admin do
        resources :users, only: [:index, :show, :update] do
          member do
            post 'toggle_status'
          end
        end
        resources :businesses, only: [:index, :show, :update] do
          member do
            post 'toggle_status'
          end
        end
        get 'analytics', to: 'dashboard#analytics'
      end

      resources :incidents do
        collection do
          post :upload_photo
        end
      end
    end
  end
end 