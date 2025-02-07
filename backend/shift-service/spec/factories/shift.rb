FactoryBot.define do
  factory :shift do
    title { "Security Guard Shift" }
    description { "Event security required" }
    start_time { 1.day.from_now }
    end_time { 1.day.from_now + 8.hours }
    hourly_rate { 25.0 }
    status { 'open' }
    requirements { ['Security License', 'First Aid Certification'] }
    dress_code { 'Professional' }
    break_time { 30 }
    location_coordinates { [40.7128, -74.0060] }
    business_profile_id { SecureRandom.uuid }
    business_name { "Test Business" }
    location_id { SecureRandom.uuid }
    location_name { "Test Location" }
    location_address { "123 Test St, Test City, TS 12345" }

    trait :assigned do
      status { 'assigned' }
      worker_profile_id { SecureRandom.uuid }
      worker_name { "Test Worker" }
    end

    trait :in_progress do
      assigned
      status { 'in_progress' }
      check_in_time { Time.current }
    end

    trait :completed do
      in_progress
      status { 'completed' }
      check_out_time { Time.current + 8.hours }
      actual_hours_worked { 8.0 }
      total_earnings { 200.0 }
    end

    trait :cancelled do
      status { 'cancelled' }
      cancellation_reason { "Event cancelled" }
    end

    trait :past do
      start_time { 1.day.ago }
      end_time { 1.day.ago + 8.hours }
    end

    trait :future do
      start_time { 1.week.from_now }
      end_time { 1.week.from_now + 8.hours }
    end
  end
end 