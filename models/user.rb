require 'mongoid'

class User
  include Mongoid::Document

  has_many :spaces
  field :spaces, :type => Array, :default => []

  field :lastName, :type => String
  field :firstName, :type => String
  field :email, :type => String
  field :loginId, :type => String
  field :password, :type => String
  field :createdOn, :type => Time

end
