class Iobserve < Sinatra::Application
  ######################## Session ##################################
  ### create a session by space id
  post '/space/:space_id/session' do
    request.body.rewind  # in case someone already read it
    content_type :json

    begin
      space = Space.find(params[:space_id])
    end

    unless space.nil? then
      sessionob = Sessionob.create(:created_on => Time.now.to_i)
      visitorgroup = Visitorgroup.create(:created_on => Time.now.to_i)
      sessionob.visitorgroup = visitorgroup
      space.sessionobs << sessionob
      space.save
      return sessionob.to_json
    else
      status 404
      return {"message" => "Space not found"}.to_json
    end
  end


  ### list all sessions
  get '/session' do
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
  put '/session/:session_id/:map_id/close' do
    content_type :json
    sessionob = Sessionob.find(params[:session_id])

    unless sessionob.nil? then
      status 200

      storage = Storage.find(params[:map_id])

      unless storage.nil?
        sessionob.update_attributes(:finished_on => Time.now.to_i, :storage => storage)
      end

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
      unless sessionob.visitorgroup.nil? then
        visitorgroup = Visitorgroup.find(sessionob.visitorgroup._id)

        unless visitorgroup.visitors.nil? then
          visitorgroup.visitors.each do|visitor|
            visitor = Visitor.find(visitor._id)
            visitor.destroy
          end
        end

        visitorgroup.destroy
      end

      unless sessionob.storage.nil? then
        storage = Storage.find(sessionob.storage._id)
        storage.destroy
      end

      unless sessionob.eventob_ids.nil? then
        sessionob.eventob_ids.each do|evt|
          eventob = Eventob.find(evt)

          unless eventob.interactions.nil? then
            eventob.interactions.each do|inter|
              interaction = Interaction.find(inter._id)
              interaction.destroy
            end
          end

          eventob.destroy
        end
      end

      if sessionob.destroy then
        status 200
        return {"message" => "Session deleted"}.to_json
      else
        status 500
      end
    end
  end
end
