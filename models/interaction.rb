require 'mongoid'

class Interaction
  include Mongoid::Document

  belongs_to :event

  has_many :visitors
  field :visitors, :type => Array, :default => []

  has_one :action, class_name: "Action"
  field :action

  has_one :resource, class_name: "Resource"
  field :resource

  field :created_on, :type => Time
end
