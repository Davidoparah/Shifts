source 'http://rubygems.org'

case version = ENV['MONGOID_VERSION'] || '7'
when 'HEAD'
  gem 'mongoid', github: 'mongodb/mongoid'
when /^7/
  gem 'mongoid', '~> 7.0.0'
when /^6/
  gem 'mongoid', '~> 6.0.0'
when /^5/
  gem 'mongoid', '~> 5.0'
else
  gem 'mongoid', version
end

gemspec

group :development, :test do
  gem 'fuubar'
  gem 'guard'
  gem 'guard-rspec'
  gem 'guard-rubocop'
  gem 'pry'
  gem 'rake'
  gem 'yard'
end

group :test do
  gem 'coveralls', require: false if ENV['CI']
  gem 'dbf'
  gem 'georuby'
  gem 'mongoid-danger', '~> 0.1.0', require: false
  gem 'nokogiri'
  gem 'rgeo'
  gem 'rspec'
  gem 'rubocop', '0.60.0'
end
