require 'sinatra'
require 'mongoid'
require 'digest'
require 'uri'
require 'json'
require 'fileutils'
require 'aws/s3'
require 'securerandom'
require 'logger'
#require 'carrierwave'
#require 'mini_magick'


class Iobserve < Sinatra::Application
  #$log = Logger.new('./logs/output.log')

  #set :environment, :development
  set :environment, :production

  #set :sessions, true
  #set :session_secret, 'super secret'
  #use Rack::Session::Pool, :expire_after => 2592000

  configure do
    set :app_file, __FILE__
    Mongoid.load! "#{File.dirname(__FILE__)}/config/mongoid.yml"
    #$log.level = Logger::DEBUG
  end

  configure :development do
    enable :logging, :dump_errors, :raise_errors
  end

  configure :qa do
    enable :logging, :dump_errors, :raise_errors
  end

  configure :production do
    set :raise_errors, false #false will show nicer error page
    set :show_exceptions, false #true will ignore raise_errors and display backtrace in browser
  end
end


#CarrierWave.configure do |config|
#  config.fog_credentials = {
#      :provider               => 'AWS',                        # required
#      :aws_access_key_id      => ENV['AWS_ACCESS_KEY_ID'],                        # required
#      :aws_secret_access_key  => ENV['AWS_SECRET_ACCESS_KEY'],                        # required
#      :region                 => 'us-west-2'
#  }
#  config.fog_directory  = 'net.engagelab.iobserveservice'                     # required
#  config.fog_public     = :public_read
#end
#
#class AvatarUploader < CarrierWave::Uploader::Base
#  include CarrierWave::MiniMagick
#
#  process :resize_to_fit => [1024, 723]
#  storage :fog
#end

require_relative 'routes/init'
require_relative 'models/init'




















=begin
get '/' do
  $log.debug "Session: #{session['iObserveSession']}"
  session['iObserveSession'] = nil
  if session['iObserveSession'].nil?
    send_file File.join('public', 'login.html')
  else
    send_file File.join('public', 'index.html')
  end
end


post '/login' do
  if @params['login'].include?("jeremy") && @params['password'].include?("system")
    session['iObserveSession'] =  SecureRandom.uuid
    redirect '/'
  else
    "WRONG LOGIN"
  end
end
=end

# post a note
=begin
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
=end


# post an image
=begin
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
=end


#get '/image' do
#  @ui = UploadedImage.all()
#  return @ui.to_json
#end