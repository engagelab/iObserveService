require 'mongoid'

class Resource
  include Mongoid::Document

  belongs_to :interaction

  field :type, :type => String
end
