require 'mongoid'

class Sessionob
  include Mongoid::Document

  has_and_belongs_to_many :spaces

  has_one :visitorgroup
  field :visitorgroup, :type => Object, :default => nil

  has_many :medias
  field :media_ids, :type => Array, :default => []

  has_many :eventobs
  field :eventob_ids, :type => Array, :default => []

  field :label, :type => String
  field :created_on, :type => Bignum
  field :finished_on, :type => Time
  field :surveys, :type => Array, :default => []
  field :stats, :type => Array, :default => []
end
