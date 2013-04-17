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

  unless data.nil? or (data['lastname'].nil? and data['firstname'].nil? and data['email'].nil?) then
    status 200
    login_id = data['email']

    unless data['login_id'].nil?
      login_id = data['login_id']
    end

    user = User.create(
      :lastname => data['lastname'],
      :firstname => data['firstname'],
      :email => data['email'],
      :login_id => login_id,
      :password => SecureRandom.uuid,
      :created_on => Time.now.iso8601)

    return user.to_json
  else
    status 404
    return {"errorMessage" => "Provide lastname, firstname and email"}.to_json
  end
end

### update user's properties
put '/user' do
  request.body.rewind  # in case someone already read it
  content_type :json;
  data = JSON.parse request.body.read

  unless data.nil? or data['_id'].nil? then
    status 200

    user = User.find(data['_id'])

    unless data['lastname'].nil?
      user.update_attributes(:lastname => data['lastname'])
    end

    unless data['firstname'].nil?
      user.update_attributes(:firstname => data['firstname'])
    end

    unless data['login_id'].nil?
      user.update_attributes(:login_id => data['login_id'])
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
    return {"message" => "Provide _id, lastname, firstname, email and password"}.to_json
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
get '/user/:user_id/spaces' do
  content_type :json
  user = User.find(params[:user_id])
  return user.spaces.to_json
end

###  get a space by id
get '/space/:space_id' do
  content_type :json
  space = Space.find(params[:space_id])
  return space.to_json
end

### create a space by user id
post '/user/:user_id/space' do
  request.body.rewind  # in case someone already read it
  content_type :json
  data = JSON.parse request.body.read

  unless data.nil? or data['label'].nil? then
    user = User.find(params[:user_id])
    space = Space.create(:label => data['label'], :created_on => Time.now.iso8601)
    user.spaces << space
    user.save
    return user.to_json
  end
end

### add exisiting space to user by id
post '/user/:user_id/space/:space_id' do
  content_type :json

  user = User.find(params[:user_id])
  space = Space.find(params[:space_id])

  unless user.nil? or space.nil? then
    status 200
    unless space.user_ids.include?(params[:user_id]) then
      space.user_ids << params[:user_id]
      space.save
    end

    return user.to_json
  else
    status 404
    return {"message" => "Error: provide a valid space_id and user_id"}.to_json
  end
end


### update space's properties
put '/space' do
  request.body.rewind  # in case someone already read it
  content_type :json;
  data = JSON.parse request.body.read

  unless data.nil? or data['_id'].nil? then
    status 200

    space = Space.find(data['_id'])

    unless data['label'].nil?
      space.update_attributes(:label => data['label'])
    end

    return space.to_json
  else
    status 404
    return {"message" => "Provide a new label"}.to_json
  end
end

### delete a space by id
delete '/space/:space_id' do
  request.body.rewind  # in case someone already read it
  content_type :json

  space = Space.find(params[:space_id])

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


######################## Room ##################################
### create a room by space id
post '/space/:space_id/room' do
  request.body.rewind  # in case someone already read it
  content_type :json
  data = JSON.parse request.body.read

  unless data.nil? or data['label'].nil? then
    status 200
    space = Space.find(params[:space_id])
    room = Room.create(:label => data['label'], :created_on => Time.now.iso8601)
    space.rooms << room
    space.save
    return space.to_json
  else
    status 404
    return {"message" => "Error: provide a valid label"}.to_json
  end
end

### add exisiting room to space by id
post '/space/:space_id/room/:room_id' do
  content_type :json

  room = Room.find(params[:room_id])
  space = Space.find(params[:space_id])

  unless room.nil? or space.nil? then
    status 200
    unless space.room_ids.include?(params[:room_id]) then
      space.room_ids << params[:room_id]
      space.save
    end

    return space.to_json
  else
    status 404
    return {"message" => "Error: provide a valid space_id and room_id"}.to_json
  end
end

### list all rooms by space id
get '/space/:space_id/rooms' do
  content_type :json
  space = Space.find(params[:space_id])
  return space.rooms.to_json
end

### list all rooms
get '/rooms' do
  content_type :json
  @room = Room.all()
  return @room.to_json
end

###  get a room by id
get '/room/:room_id' do
  content_type :json
  room = Room.find(params[:room_id])
  return room.to_json
end

### update room's properties
put '/room' do
  request.body.rewind  # in case someone already read it
  content_type :json;
  data = JSON.parse request.body.read

  unless data.nil? or data['_id'].nil? then
    status 200

    room = Room.find(data['_id'])

    unless data['position'].nil?
      room.update_attributes(:position => data['position'])
    end

    unless data['representation'].nil?
      room.update_attributes(:representation => data['representation'])
    end

    unless data['label'].nil?
      room.update_attributes(:label => data['label'])
    end

    unless data['end_points'].nil?
      room.update_attributes(:end_points => data['end_points'])
    end

    unless data['start_points'].nil?
      room.update_attributes(:start_points => data['start_points'])
    end

    return room.to_json
  else
    status 404
    return {"message" => "Provide _id, position, representation, label, end_points and start_points"}.to_json
  end
end

### delete a room by id
delete '/room/:room_id' do
  request.body.rewind  # in case someone already read it
  content_type :json

  room = Room.find(params[:room_id])

  if room.nil? then
    status 404
  else
    if room.destroy then
      status 200
      return {"message" => "Room deleted"}.to_json
    else
      status 500
    end
  end
end


######################## Session ##################################
### create a session by space id
post '/space/:space_id/session' do
  request.body.rewind  # in case someone already read it
  content_type :json
  data = JSON.parse request.body.read

  unless data.nil? or data['label'].nil? then
    status 200
    space = Space.find(params[:space_id])
    sessionob = Sessionob.create(:label => data['label'], :created_on => Time.now.iso8601)
    space.sessionobs << sessionob
    space.save
    return space.to_json
  else
    status 404
    return {"message" => "Error: provide a valid label"}.to_json
  end
end


### list all sessions
get '/sessions' do
  content_type :json
  @sessionob = Sessionob.all()
  return @sessionob.to_json
end


### list all sessions by space id
get '/space/:space_id/sessions' do
  content_type :json
  space = Space.find(params[:space_id])
  return space.sessionobs.to_json
end

###  get a session by id
get '/session/:session_id' do
  content_type :json
  sessionob = Sessionob.find(params[:session_id])
  return sessionob.to_json
end

### update session's properties
put '/session' do
  request.body.rewind  # in case someone already read it
  content_type :json;
  data = JSON.parse request.body.read

  unless data.nil? or data['_id'].nil? then
    status 200

    sessionob = Sessionob.find(data['_id'])

    unless data['label'].nil?
      sessionob.update_attributes(:label => data['label'])
    end

    return sessionob.to_json
  else
    status 404
    return {"message" => "Provide label"}.to_json
  end
end


### update session's properties
put '/session/:session_id/close' do
  content_type :json
  sessionob = Sessionob.find(params[:session_id])

  unless sessionob.nil? then
    status 200
    sessionob.update_attributes(:finished_on => Time.now.iso8601)

    return sessionob.to_json
  else
    status 404
    return {"message" => "Provide label"}.to_json
  end
end

### delete a session by id
delete '/session/:session_id' do
  request.body.rewind  # in case someone already read it
  content_type :json

  sessionob = Sessionob.find(params[:session_id])

  if sessionob.nil? then
    status 404
  else
    if sessionob.destroy then
      status 200
      return {"message" => "Session deleted"}.to_json
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