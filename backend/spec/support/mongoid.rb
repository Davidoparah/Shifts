RSpec.configure do |config|
  config.before(:suite) do
    Mongoid.purge!
    Mongoid::Tasks::Database.create_indexes
  end

  config.before(:each) do
    Mongoid.purge!
  end

  config.after(:each) do
    Mongoid.purge!
  end
end

# Helper methods for testing Mongoid models
module MongoidHelper
  def self.valid_object_id
    BSON::ObjectId.new
  end

  def self.invalid_object_id
    'invalid_id'
  end
end

RSpec::Matchers.define :be_mongoid_document do
  match do |actual|
    actual.class.included_modules.include?(Mongoid::Document)
  end
end

RSpec::Matchers.define :have_mongoid_field do |field|
  match do |actual|
    actual.class.fields.keys.include?(field.to_s)
  end
end

RSpec::Matchers.define :have_mongoid_index_for do |field|
  match do |actual|
    actual.class.index_specifications.any? { |spec| spec.key == field.to_s }
  end
end 