# -*- encoding: utf-8 -*-
# stub: google_maps_service 0.4.2 ruby lib

Gem::Specification.new do |s|
  s.name = "google_maps_service".freeze
  s.version = "0.4.2".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Edward Samuel Pasaribu".freeze]
  s.date = "2016-08-26"
  s.email = ["edwardsamuel92@gmail.com".freeze]
  s.homepage = "https://github.com/edwardsamuel/google-maps-services-ruby".freeze
  s.licenses = ["Apache-2.0".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.0.0".freeze)
  s.rubygems_version = "2.4.5".freeze
  s.summary = "Ruby gem for Google Maps Web Service APIs".freeze

  s.installed_by_version = "3.5.23".freeze

  s.specification_version = 4

  s.add_runtime_dependency(%q<multi_json>.freeze, ["~> 1.11".freeze])
  s.add_runtime_dependency(%q<hurley>.freeze, ["~> 0.1".freeze])
  s.add_runtime_dependency(%q<retriable>.freeze, ["~> 2.0".freeze])
end
