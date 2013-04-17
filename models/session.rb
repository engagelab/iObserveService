require 'mongoid'

class Sessionob
  include Mongoid::Document

  has_and_belongs_to_many :spaces

  field :label, :type => String
  field :created_on, :type => Time
  field :finished_on, :type => Time
end
