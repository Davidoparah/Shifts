# -*- encoding: utf-8 -*-
# stub: mongoid-compatibility 1.0.0 ruby lib

Gem::Specification.new do |s|
  s.name = "mongoid-compatibility".freeze
  s.version = "1.0.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 1.3.6".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Daniel Doubrovkine".freeze]
  s.date = "2024-06-25"
  s.email = "dblock@dblock.org".freeze
  s.homepage = "http://github.com/mongoid/mongoid-compatibility".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.5.10".freeze
  s.summary = "Compatibility helpers for Mongoid.".freeze

  s.installed_by_version = "3.5.23".freeze

  s.specification_version = 4

  s.add_runtime_dependency(%q<activesupport>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<mongoid>.freeze, [">= 2.0".freeze])
  s.add_development_dependency(%q<appraisal>.freeze, ["~> 2.0".freeze])
  s.add_development_dependency(%q<mongoid-danger>.freeze, ["~> 0.2".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["< 12".freeze])
  s.add_development_dependency(%q<rspec>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["~> 1.36.0".freeze])
end
