require 'sinatra'
require 'mongoid'
require 'digest'
require 'uri'
require 'json'
require 'fileutils'
require 'aws/s3'
require 'securerandom'
require 'logger'

Dir['./models/*.rb'].each { |file| require file }
$log = Logger.new('./logs/output.log')


set :environment, :development
#set :environment, :production

#set :sessions, true
#set :session_secret, 'super secret'
#use Rack::Session::Pool, :expire_after => 2592000

configure do
  Mongoid.load! "#{File.dirname(__FILE__)}/config/mongoid.yml"
  $log.level = Logger::DEBUG
end

######################## User ##################################
### get all users
get '/users' do
  content_type :json
  @user = User.without(:password).all()
  return @user.to_json
end

### get user by id
get '/user/:id' do
  request.body.rewind  # in case someone already read it
  content_type :json

  user = User.without(:password).find(params[:id])

  if user.nil? then
    status 404
  else
    status 200
    return user.to_json
  end
end

### create a user
post '/user' do
  request.body.rewind  # in case someone already read it
  content_type :json
  data = JSON.parse request.body.read

  if data.nil? or (data['lastName'] and data['firstName'] and data['email']) then
    status 200
    loginId = data['email']

    unless data['loginId'].nil?
      loginId = data['loginId']
    end

    user = User.create(
      :lastName => data['lastName'],
      :firstName => data['firstName'],
      :email => data['email'],
      :loginId => loginId,
      :password => SecureRandom.uuid,
      :createdOn => Time.now.iso8601)

    return user.to_json
  else
    status 404
    return {"errorMessage" => "Provide lastName, firstName and email"}.to_json
  end
end

### update user's properties
put '/user' do
  request.body.rewind  # in case someone already read it
  content_type :json;
  data = JSON.parse request.body.read

  if data.nil? or data['_id'] then
    status 200

    user = User.find(data['_id'])

    unless data['lastName'].nil?
      user.update_attributes(:lastName => data['lastName'])
    end

    unless data['firstName'].nil?
      user.update_attributes(:firstName => data['firstName'])
    end

    unless data['loginId'].nil?
      user.update_attributes(:loginId => data['loginId'])
    end

    unless data['email'].nil?
      user.update_attributes(:email => data['email'])
    end

    unless data['password'].nil?
      user.update_attributes(:password => data['password'])
    end

    return user.to_json
  else
    status 404
    return {"errorMessage" => "Provide _id, lastName, firstName, email and password"}.to_json
  end
end

### delete a user by id
delete '/user/:id' do
  request.body.rewind  # in case someone already read it
  content_type :json

  user = User.find(params[:id])

  if user.nil? then
    status 404
  else
    if user.destroy then
      status 200
      return {"message" => "User deleted"}.to_json
    else
      status 500
    end
  end
end



######################## Space ##################################
### list all spaces
get '/spaces' do
  content_type :json
  @space = Space.all()
  return @space.to_json
end

### list all spaces by user id
get '/user/:userId/spaces' do
  content_type :json
  user = User.find(params[:userId])
  return user.spaces.to_json
end

###  get a space by id
get '/space/:spaceId' do
  content_type :json
  space = Space.find(params[:spaceId])
  return space.to_json
end

### create a space by user id
post '/user/:userId/space' do
  request.body.rewind  # in case someone already read it
  content_type :json
  data = JSON.parse request.body.read

  if data.nil? or data['label'] then
    user = User.find(params[:userId])
    user.spaces.create(:label => data['label'], :createdOn => Time.now.iso8601)
    return user.to_json
  end
end

### delete a space by id
delete '/space/:spaceId' do
  request.body.rewind  # in case someone already read it
  content_type :json

  space = Space.find(params[:spaceId])

  if space.nil? then
    status 404
  else
    if space.destroy then
      status 200
      return {"message" => "Space deleted"}.to_json
    else
      status 500
    end
  end
end

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