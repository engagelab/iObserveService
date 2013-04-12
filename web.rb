require 'sinatra'
require 'mongoid'
require 'digest'
require 'uri'
require 'json'
require 'fileutils'
require 'aws/s3'
require 'securerandom'

Dir['./models/*.rb'].each {|file| require file }

configure do
  Mongoid.load! "#{File.dirname(__FILE__)}/config/mongoid.yml"
end

get '/' do
  send_file File.join('public', 'index.html')
end

# post a note
post '/notes' do
  request.body.rewind
  content_type :json
  data = JSON.parse request.body.read

  note = Note.create(:content => data['content'])
  return note.to_json
end

get '/notes' do
  @notes = Note.all()
  return @notes.to_json
end


# post an image
post '/image' do
	awskey     = ENV['AWS_ACCESS_KEY_ID']
	awssecret  = ENV['AWS_SECRET_ACCESS_KEY']
	bucket     = 'net.engagelab.iobserveservice'
	file       = params[:file][:tempfile]
	filename   = params[:file][:filename]
  imageuid   = SecureRandom.uuid+'.jpg'
	
	AWS::S3::DEFAULT_HOST.replace 's3-us-west-2.amazonaws.com'
	AWS::S3::Base.establish_connection!(
		:access_key_id     => awskey,
		:secret_access_key => awssecret
	)
	
	AWS::S3::S3Object.store(
    imageuid,
		open(file.path),
		bucket,
		:access => :public_read
	)
	
	if AWS::S3::Service.response.success?
      ui = UploadedImage.create(:name => filename, :url => "http://#{bucket}.s3.amazonaws.com/#{imageuid}")
    	return ui.to_json
	else
		error 404
	end
end


get '/image' do
  @ui = UploadedImage.all()
  return @ui.to_json
end