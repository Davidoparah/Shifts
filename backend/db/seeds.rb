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
  role: 'BUSINESS_OWNER',
  first_name: 'John',
  last_name: 'Owner',
  phone: '+1234567890',
  status: 'active'
)

# Create a business
puts "Creating business..."
business = Business.create!(
  name: 'Test Business',
  owner_id: business_owner.id,
  status: 'active',
  address: '123 Test St',
  city: 'Test City',
  state: 'TS',
  zip: '12345',
  country: 'Test Country',
  phone: '+1234567890',
  email: 'business@example.com'
)

business_owner.update!(business: business)

# Create a worker
puts "Creating worker..."
worker = User.create!(
  email: 'worker@example.com',
  password: 'password123',
  role: 'WORKER',
  first_name: 'Jane',
  last_name: 'Worker',
  phone: '+1234567891',
  status: 'active'
)

# Create some shifts
puts "Creating shifts..."
5.times do |i|
  start_time = Time.current + (i + 1).days + 9.hours # 9 AM next few days
  Shift.create!(
    business: business,
    start_time: start_time,
    end_time: start_time + 8.hours,
    rate: 20.0,
    location: '123 Test St, Test City, TS 12345',
    status: 'available',
    requirements: ['Customer Service', 'Cash Handling'],
    notes: "Shift #{i + 1} notes"
  )
end

# Create some assigned shifts
puts "Creating assigned shifts..."
3.times do |i|
  start_time = Time.current + (i + 1).days + 13.hours # 1 PM next few days
  Shift.create!(
    business: business,
    worker: worker,
    start_time: start_time,
    end_time: start_time + 4.hours,
    rate: 22.0,
    location: '123 Test St, Test City, TS 12345',
    status: 'assigned',
    requirements: ['Food Service', 'Cleaning'],
    notes: "Assigned Shift #{i + 1} notes"
  )
end

puts "Seed data created successfully!" 