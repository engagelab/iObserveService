require 'mongoid'

class Action
  include Mongoid::Document

  belongs_to :interaction

  field :type, :type => String
end