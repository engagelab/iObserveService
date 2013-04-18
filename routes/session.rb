class Iobserve < Sinatra::Application
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
end
