require 'mongoid'

class User
  include Mongoid::Document

  has_and_belongs_to_many :spaces
  field :spaces, :type => Array, :default => []

  field :lastname, :type => String
  field :firstname, :type => String
  field :email, :type => String
  field :login_id, :type => String
  field :password, :type => String
  field :created_on, :type => Bignum

end
