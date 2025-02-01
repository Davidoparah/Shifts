FactoryBot.define do
  factory :incident_report do
    title { Faker::Lorem.sentence }
    description { Faker::Lorem.paragraph }
    severity { %w[low medium high critical].sample }
    status { 'pending' }
    photo_urls { [] }
    association :shift
    association :reporter, factory: :user

    trait :with_photos do
      photo_urls { [Faker::Internet.url(host: 'example.com', path: '/photos/1.jpg')] }
    end

    trait :investigating do
      status { 'investigating' }
    end

    trait :resolved do
      status { 'resolved' }
    end

    trait :critical do
      severity { 'critical' }
    end
  end
end 