require 'mongoid'

class Sessionob
  include Mongoid::Document

  has_and_belongs_to_many :spaces

  has_many :medias
  field :media_ids, :type => Array, :default => []

  field :label, :type => String
  field :created_on, :type => Time
  field :finished_on, :type => Time
  field :surveys, :type => Array, :default => []
  field :stats, :type => Array, :default => []
  field :usergroups, :type => Array, :default => []
  field :events, :type => Array, :default => []
end
