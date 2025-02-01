# -*- encoding: utf-8 -*-
# stub: database_cleaner-mongoid 2.0.1 ruby lib

Gem::Specification.new do |s|
  s.name = "database_cleaner-mongoid".freeze
  s.version = "2.0.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Ernesto Tagwerker".freeze, "Micah Geisel".freeze]
  s.bindir = "exe".freeze
  s.date = "2021-01-31"
  s.description = "Strategies for cleaning databases using Mongoid. Can be used to ensure a clean state for testing.".freeze
  s.email = ["ernesto@ombulabs.com".freeze]
  s.homepage = "https://github.com/DatabaseCleaner/database_cleaner-mongoid".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.0.3".freeze
  s.summary = "Strategies for cleaning databases using Mongoid. Can be used to ensure a clean state for testing.".freeze

  s.installed_by_version = "3.5.23".freeze

  s.specification_version = 4

  s.add_runtime_dependency(%q<database_cleaner-core>.freeze, ["~> 2.0.0".freeze])
  s.add_runtime_dependency(%q<mongoid>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<appraisal>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, [">= 0".freeze])
end
