require 'mongoid'

class UploadedImage
  include Mongoid::Document

  field :name, :type => String
  field :url, :type => String
end
