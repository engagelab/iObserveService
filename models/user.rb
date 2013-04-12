require 'mongoid'

class User
  include Mongoid::Document
  
  field :lastName, :type => String
  field :firstName, :type => String
  field :email, :type => String
  field :loginId, :type => String
  field :password, :type => String
  field :createdOn, :type => Time
  field :spaces, :type => Array
end
