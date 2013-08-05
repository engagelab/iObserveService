require 'mongoid'

class Room
  include Mongoid::Document

  has_and_belongs_to_many :spaces

  belongs_to :sessionob

  field :label, :type => String
  field :uri, :type => String
  field :position, :type => String
  field :created_on, :type => Bignum
  field :start_points, :type => Array, :default => []
  field :end_points, :type => Array, :default => []
end
