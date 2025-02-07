module RequestHelpers
  def json_response
    JSON.parse(response.body)
  end

  def auth_headers(token)
    {
      'Authorization' => "Bearer #{token}",
      'Content-Type' => 'application/json'
    }
  end

  def mock_current_user(user_attributes = {})
    default_attributes = {
      id: SecureRandom.uuid,
      email: 'test@example.com',
      role: 'worker',
      status: 'active'
    }
    
    user = OpenStruct.new(default_attributes.merge(user_attributes))
    allow_any_instance_of(ApplicationController).to receive(:current_user).and_return(user)
    user
  end

  def mock_auth_service_response(user_attributes = {})
    default_attributes = {
      id: SecureRandom.uuid,
      email: 'test@example.com',
      role: 'worker',
      status: 'active'
    }
    
    response_body = { user: default_attributes.merge(user_attributes) }
    
    stub_request(:get, %r{#{ENV['AUTH_SERVICE_URL']}/api/v1/users/.*})
      .to_return(
        status: 200,
        body: response_body.to_json,
        headers: { 'Content-Type' => 'application/json' }
      )
  end
end

RSpec.configure do |config|
  config.include RequestHelpers, type: :request
end 