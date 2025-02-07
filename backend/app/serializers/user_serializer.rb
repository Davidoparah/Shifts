class UserSerializer
  def initialize(user)
    @user = user
  end

  def as_json
    {
      id: @user.id.to_s,
      email: @user.email,
      name: @user.name,
      role: @user.role,
      phone: @user.phone,
      address: @user.address,
      created_at: @user.created_at,
      updated_at: @user.updated_at
    }
  end
end 