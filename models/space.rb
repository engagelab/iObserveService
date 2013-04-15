require 'mongoid'

class Space
  include Mongoid::Document

  belongs_to :user

  field :label, :type => String
  field :createdOn, :type => Time
  #field :rooms, :type => Array
  #field :sessions, :type => Array
end
