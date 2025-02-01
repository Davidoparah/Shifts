# Clear existing data
puts "Clearing existing data..."
User.delete_all
Business.delete_all
Shift.delete_all

# Create a business owner
puts "Creating business owner..."
business_owner = User.create!(
  email: 'owner@example.com',
  password: 'password123',
  role: 'business_owner',
  first_name: 'John',
  last_name: 'Owner',
  phone: '+1234567890',
  status: 'active'
)

# Create a worker
puts "Creating worker..."
worker = User.create!(
  email: 'worker@example.com',
  password: 'password123',
  role: 'worker',
  first_name: 'Jane',
  last_name: 'Worker',
  phone: '+1234567891',
  status: 'active'
)

# Create worker profile
puts "Creating worker profile..."
worker_profile = worker.create_worker_profile!(
  phone: worker.phone,
  address: '123 Worker St, City, State 12345',
  bio: 'Experienced security professional',
  hourly_rate: 25.0,
  skills: ['Security', 'First Aid', 'Surveillance']
)

# Create an admin
puts "Creating admin..."
admin = User.create!(
  email: 'admin@example.com',
  password: 'password123',
  role: 'admin',
  first_name: 'Admin',
  last_name: 'User',
  phone: '+1234567892',
  status: 'active'
)

# Create a business
puts "Creating business..."
business = Business.create!(
  name: 'Security Corp',
  owner: business_owner,
  business_type: 'Security Services',
  address: '456 Business Ave, City, State 12345',
  phone: '+1234567893',
  email: 'contact@securitycorp.com',
  website: 'www.securitycorp.com',
  description: 'Professional security services'
)

# Create shifts
puts "Creating shifts..."
shift1 = Shift.create!(
  business: business,
  title: 'Night Security Guard',
  start_time: 1.day.from_now.change(hour: 20),
  end_time: 1.day.from_now.change(hour: 4) + 1.day,
  rate: 25.0,
  location: '789 Client St, City, State 12345',
  requirements: ['Security License', 'First Aid Certification'],
  dress_code: 'Black uniform, safety shoes',
  notes: 'Please arrive 15 minutes early for briefing'
)

shift2 = Shift.create!(
  business: business,
  worker: worker,
  title: 'Event Security',
  start_time: 2.days.from_now.change(hour: 14),
  end_time: 2.days.from_now.change(hour: 22),
  rate: 30.0,
  location: '321 Event Center, City, State 12345',
  status: 'assigned',
  requirements: ['Security License', 'Event Security Experience'],
  dress_code: 'Black suit, tie',
  notes: 'VIP event, formal attire required'
)

puts "Seed data created successfully!" 