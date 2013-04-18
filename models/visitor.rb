require 'mongoid'

class Visitor
  include Mongoid::Document

  belongs_to :visitorgroup

  field :created_on, :type => Time
  field :age, :type => Integer
  field :sex, :type => String
  field :nationality, :type => String
  field :comment, :type => String
  field :consent, :type => String
end