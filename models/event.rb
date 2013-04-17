require 'mongoid'

class Eventob
  include Mongoid::Document

  has_many :medias

  field :created_on, :type => Time
end
