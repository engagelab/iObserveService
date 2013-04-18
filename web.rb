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

    return room.to_json
  else
    status 404
    return {"message" => "Provide _id and position, representation, or label"}.to_json
  end
end


### add room's end coordinates
put '/room/endcoords' do
  request.body.rewind  # in case someone already read it
  content_type :json;
  data = JSON.parse request.body.read

  unless data.nil? or (data['_id'].nil? and data['xpos'].nil? and data['ypos'].nil?) then
    room = Room.find(data['_id'])

    unless room.nil? then
      unless room.end_points.any?{|h| h["xpos"] == data['xpos'] and h["ypos"] == data['ypos']} then
        room.end_points.push(:xpos => data['xpos'], :ypos => data['ypos'])
        room.save
      end
    end

    return room.to_json
  else
    status 404
    return {"message" => "Provide _id, xpos, and ypos"}.to_json
  end
end

### add room's start coordinates
put '/room/startcoords' do
  request.body.rewind  # in case someone already read it
  content_type :json;
  data = JSON.parse request.body.read

  unless data.nil? or (data['_id'].nil? and data['xpos'].nil? and data['ypos'].nil?) then
    room = Room.find(data['_id'])

    unless room.nil? then
      unless room.start_points.any?{|h| h["xpos"] == data['xpos'] and h["ypos"] == data['ypos']} then
        room.start_points.push(:xpos => data['xpos'], :ypos => data['ypos'])
        room.save
      end
    end

    return room.to_json
  else
    status 404
    return {"message" => "Provide _id, xpos, and ypos"}.to_json
  end
end

### delete room's end coordinates
put '/room/endcoords/delete' do
  request.body.rewind  # in case someone already read it
  content_type :json;
  data = JSON.parse request.body.read

  unless data.nil? or (data['_id'].nil? and data['xpos'].nil? and data['ypos'].nil?) then
    room = Room.find(data['_id'])

    unless room.nil? then
      room.end_points.delete({'xpos' => data['xpos'], 'ypos' => data['ypos']})
      room.save
    end

    return room.to_json
  else
    status 404
    return {"message" => "Provide _id, xpos, and ypos"}.to_json
  end
end

### delete room's start coordinates
put '/room/startcoords/delete' do
  request.body.rewind  # in case someone already read it
  content_type :json;
  data = JSON.parse request.body.read

  unless data.nil? or (data['_id'].nil? and data['xpos'].nil? and data['ypos'].nil?) then
    room = Room.find(data['_id'])

    unless room.nil? then
      room.start_points.delete({'xpos' => data['xpos'], 'ypos' => data['ypos']})
      room.save
    end

    return room.to_json
  else
    status 404
    return {"message" => "Provide _id, xpos, and ypos"}.to_json
  end
end

### update room's start coordinates
put '/room/startcoords' do
  unless data['end_points'].nil?
    room.update_attributes(:end_points => data['end_points'])
  end

  unless data['start_points'].nil?
    room.update_attributes(:start_points => data['start_points'])
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

######################## Media ##################################
### create a media by session id
post '/session/:session_id/media' do
  request.body.rewind  # in case someone already read it
  content_type :json
  data = JSON.parse request.body.read

  unless data.nil? or (data['uri'].nil? and data['content_type']) then
    sessionob = Sessionob.find(params[:session_id])
    unless sessionob.nil? then
      status 200
      media = Media.create(:uri => data['uri'], :content_type => data['content_type'], :created_on => Time.now.iso8601)
      sessionob.medias << media
      sessionob.save
      return sessionob.medias.to_json
    else
      status 404
      return {"message" => "Error: session not found"}.to_json
    end
  else
    status 404
    return {"message" => "Error: provide a valid label"}.to_json
  end
end


### list all medias by session id
get '/session/:session_id/media' do
  content_type :json

  sessionob = Sessionob.find(params[:session_id])
  unless sessionob.nil? then
    status 200
    return sessionob.medias.to_json
  else
    status 404
    return {"message" => "Error: session not found"}.to_json
  end
end


### list all medias
get '/medias' do
  content_type :json
  @media = Media.all()
  return @media.to_json
end

###  get a media by id
get '/media/:media_id' do
  content_type :json
  media = Media.find(params[:media_id])
  return media.to_json
end


### update media's properties
put '/media' do
  request.body.rewind  # in case someone already read it
  content_type :json;
  data = JSON.parse request.body.read

  unless data.nil? or data['_id'].nil? then
    status 200

    media = Media.find(data['_id'])

    unless data['uri'].nil?
      media.update_attributes(:uri => data['uri'])
    end

    unless data['content_type'].nil?
      media.update_attributes(:content_type => data['content_type'])
    end

    return media.to_json
  else
    status 404
    return {"message" => "Provide uri and/or content_type"}.to_json
  end
end

### delete a media by id
delete '/media/:media_id' do
  request.body.rewind  # in case someone already read it
  content_type :json

  media = Media.find(params[:media_id])

  if media.nil? then
    status 404
  else
    if media.destroy then
      status 200
      return {"message" => "Media deleted"}.to_json
    else
      status 500
    end
  end
end


######################## Visitorgroup ##################################
### create a visitor group by session id
post '/session/:session_id/visitorgroup' do
  content_type :json

  sessionob = Sessionob.find(params[:session_id])
  unless sessionob.nil? then
    status 200

    if sessionob.visitorgroup.nil? then
      visitorgroup = Visitorgroup.create(:created_on => Time.now.iso8601)
      sessionob.visitorgroup = visitorgroup
      sessionob.save
    end

    return sessionob.visitorgroup.to_json
  else
    status 404
    return {"message" => "Error: session not found"}.to_json
  end
end

### list all visitorgroups by session id
get '/session/:session_id/visitorgroup' do
  content_type :json

  sessionob = Sessionob.find(params[:session_id])
  unless sessionob.nil? then
    status 200
    return sessionob.visitorgroup.to_json
  else
    status 404
    return {"message" => "Error: session not found"}.to_json
  end
end

### list all visitorgroups
get '/visitorgroups' do
  content_type :json
  @visitorgroup = Visitorgroup.all()
  return @visitorgroup.to_json
end

###  get a visitorgroup by id
get '/visitorgroup/:visitorgroup_id' do
  content_type :json
  visitorgroup = Visitorgroup.find(params[:visitorgroup_id])
  return visitorgroup.to_json
end


### update visitorgroup's properties
put '/visitorgroup' do
  request.body.rewind  # in case someone already read it
  content_type :json;
  data = JSON.parse request.body.read

  unless data.nil? or data['_id'].nil? then
    status 200

    visitorgroup = Visitorgroup.find(data['_id'])

    unless data['comment'].nil?
      visitorgroup.update_attributes(:comment => data['comment'])
    end

    return visitorgroup.to_json
  else
    status 404
    return {"message" => "Provide comment"}.to_json
  end
end

### delete a visitorgroup by id
delete '/visitorgroup/:visitorgroup_id' do
  request.body.rewind  # in case someone already read it
  content_type :json

  visitorgroup = Visitorgroup.find(params[:visitorgroup_id])

  if visitorgroup.nil? then
    status 404
  else
    if visitorgroup.destroy then
      status 200
      return {"message" => "Visitorgroup deleted"}.to_json
    else
      status 500
    end
  end
end


######################## Visitor ##################################
### create a visitor group by visitorgroup id
post '/visitorgroup/:visitorgroup_id/visitor' do
  content_type :json
  request.body.rewind  # in case someone already read it
  content_type :json

  bdy = request.body.read

  if bdy.length > 2 then
    data = JSON.parse bdy
  end

  visitorgroup = Visitorgroup.find(params[:visitorgroup_id])
  unless visitorgroup.nil? then
    status 200

    if visitorgroup.visitors.size < 4 then
      visitor = Visitor.create(:created_on => Time.now.iso8601)
      visitorgroup.visitors << visitor
      visitorgroup.save
    end

    unless data.nil? then
      unless data['age'].nil? then
        visitor.update_attributes(:age => data['age'])
      end

      unless data['sex'].nil? then
        visitor.update_attributes(:sex => data['sex'])
      end

      unless data['nationality'].nil? then
        visitor.update_attributes(:nationality => data['nationality'])
      end

      unless data['comment'].nil? then
        visitor.update_attributes(:comment => data['comment'])
      end
    end

    return visitorgroup.visitors.to_json
  else
    status 404
    return {"message" => "Error: visitorgroup not found"}.to_json
  end
end

### list all visitorgroups by session id
get '/visitorgroup/:visitorgroup_id/visitor' do
  content_type :json

  visitorgroup = Visitorgroup.find(params[:visitorgroup_id])
  unless visitorgroup.nil? then
    status 200
    return visitorgroup.visitors.to_json
  else
    status 404
    return {"message" => "Error: visitorgroup not found"}.to_json
  end
end

### list all visitors
get '/visitors' do
  content_type :json
  @visitor = Visitor.all()
  return @visitor.to_json
end

###  get a visitor by id
get '/visitor/:visitor_id' do
  content_type :json
  visitor = Visitor.find(params[:visitor_id])
  return visitor.to_json
end


### update visitor's properties
put '/visitor' do
  request.body.rewind  # in case someone already read it
  content_type :json;

  begin
    data = JSON.parse request.body.read
  end

  unless data.nil? or data['_id'].nil? then
    status 200

    visitor = Visitor.find(data['_id'])

    unless data['age'].nil? then
      visitor.update_attributes(:age => data['age'])
    end

    unless data['sex'].nil? then
      visitor.update_attributes(:sex => data['sex'])
    end

    unless data['nationality'].nil? then
      visitor.update_attributes(:nationality => data['nationality'])
    end

    unless data['comment'].nil? then
      visitor.update_attributes(:comment => data['comment'])
    end

    return visitor.to_json
  else
    status 404
    return {"message" => "Provide age, sex, nationality or comment"}.to_json
  end
end

### delete a visitor by id
delete '/visitor/:visitor_id' do
  request.body.rewind  # in case someone already read it
  content_type :json

  visitor = Visitor.find(params[:visitor_id])

  if visitor.nil? then
    status 404
  else
    if visitor.destroy then
      status 200
      return {"message" => "Visitor deleted"}.to_json
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