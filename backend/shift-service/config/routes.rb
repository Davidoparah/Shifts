Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :shifts do
        collection do
          get :available
        end
        
        member do
          post :apply
          post :start
          post :complete
          post :cancel
        end
      end

      # Business-specific shift routes
      get 'businesses/:business_id/shifts', to: 'shifts#index'
      post 'businesses/:business_id/shifts', to: 'shifts#create'

      # Worker-specific shift routes
      get 'workers/:worker_id/shifts', to: 'shifts#index'
      get 'workers/:worker_id/shifts/history', to: 'shifts#index', defaults: { status: 'completed' }
      get 'workers/:worker_id/shifts/upcoming', to: 'shifts#index', defaults: { status: 'assigned' }

      # Health check endpoint
      get 'health', to: 'health#show'
    end
  end
end 