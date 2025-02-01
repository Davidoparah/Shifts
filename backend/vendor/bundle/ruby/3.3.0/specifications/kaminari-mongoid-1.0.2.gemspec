# -*- encoding: utf-8 -*-
# stub: kaminari-mongoid 1.0.2 ruby lib

Gem::Specification.new do |s|
  s.name = "kaminari-mongoid".freeze
  s.version = "1.0.2".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Akira Matsuda".freeze]
  s.bindir = "exe".freeze
  s.date = "2021-12-25"
  s.description = "kaminari-mongoid lets your Mongoid models be paginatable".freeze
  s.email = ["ronnie@dio.jp".freeze]
  s.homepage = "https://github.com/kaminari/kaminari-mongoid".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.3.0.dev".freeze
  s.summary = "Kaminari Mongoid adapter".freeze

  s.installed_by_version = "3.5.23".freeze

  s.specification_version = 4

  s.add_runtime_dependency(%q<kaminari-core>.freeze, ["~> 1.0".freeze])
  s.add_runtime_dependency(%q<mongoid>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rails>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<test-unit-rails>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<capybara>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rr>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<byebug>.freeze, [">= 0".freeze])
end
