Rails.application.routes.draw do
  namespace :api do
    # Authentication routes
    post 'auth/login', to: 'auth#login'
    post 'auth/register', to: 'auth#register'
    post 'auth/logout', to: 'auth#logout'
    post 'auth/forgot-password', to: 'auth#forgot_password'
    post 'auth/reset-password', to: 'auth#reset_password'

    # Worker profile routes
    resources :worker_profiles, only: [:show, :create, :update] do
      member do
        patch :update_availability
        post :add_photo
      end
    end

    # Shift routes
    resources :shifts do
      member do
        post :apply
        post :start
        post :complete
        post :cancel
      end

      # Chat routes nested under shifts
      resources :chat_messages, only: [:index, :create]

      # Incident report routes nested under shifts
      resources :incident_reports do
        member do
          post :add_photo
        end
      end
    end
  end
end 