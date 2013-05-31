require 'mongoid'

class Space
  include Mongoid::Document

  has_and_belongs_to_many :user

  has_and_belongs_to_many :rooms
  field :rooms, :type => Array, :default => []

  has_and_belongs_to_many :sessionobs
  field :sessionobs, :type => Array, :default => []

  field :label, :type => String
  field :created_on, :type => Bignum
end
