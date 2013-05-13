require 'mongoid'

class Action
  include Mongoid::Document

  has_and_belongs_to_many :interaction

  field :type, :type => String
end