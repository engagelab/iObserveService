require 'mongoid'

class Interaction
  include Mongoid::Document

  belongs_to :eventob

  has_and_belongs_to_many :visitors
  field :visitors, :type => Array, :default => []

  has_and_belongs_to_many :actions, class_name: "Action"
  has_and_belongs_to_many :resources, class_name: "Resource"

  field :created_on, :type => Time
end
