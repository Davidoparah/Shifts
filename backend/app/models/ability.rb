class Ability
  include CanCan::Ability

  def initialize(user)
    user ||= User.new

    case user.role
    when 'admin'
      can :manage, :all
    when 'business_owner'
      can :manage, Business, owner_id: user.id
      can :manage, Shift, business_id: user.business_id
      can :read, WorkerProfile
      can :read, ShiftApplication, shift: { business_id: user.business_id }
    when 'worker'
      # Worker can read all available shifts
      can :read, Shift
      can :available, Shift
      
      # Worker can manage their own profile
      can :manage, WorkerProfile, user_id: user.id
      
      # Worker can apply for available shifts
      can :apply, Shift do |shift|
        shift.available? && !shift.past? && shift.applications.where(worker: user).empty?
      end
      
      # Worker can manage their assigned shifts
      can [:read, :start, :complete], Shift, worker_id: user.id
      
      # Worker can manage their applications
      can :manage, ShiftApplication, worker_id: user.id
    end
  end
end 