class Iobserve < Sinatra::Application
  ######################## Session ##################################
  ### create an event by session id
  post '/session/:session_id/event' do
    content_type :json

    sessionob = Sessionob.find(params[:session_id])

    unless sessionob.nil? then
      status 200
      eventob = Eventob.create(:created_on => Time.now.iso8601)

      bdy = request.body.read

      if bdy.length > 2 then
        data = JSON.parse bdy
        unless data['interaction_id'].nil? then
          begin
            interaction = Interaction.find(data['interaction_id'])
            if interaction
              eventob.interactions << interaction
            end
          end
        end

        unless data['xpos'].nil?
          eventob.update_attributes(:xpos => data['xpos'])
        end

        unless data['ypos'].nil?
          eventob.update_attributes(:ypos => data['ypos'])
        end
      end

      sessionob.eventobs << eventob
      return eventob.to_json
    else
      status 404
      return {"message" => "Error: provide a valid session id"}.to_json
    end
  end


  ### list all sessions
  get '/event' do
    content_type :json
    @eventob = Eventob.all()
    return @eventob.to_json
  end


  ### list all events by session id
  get '/session/:session_id/events' do
    content_type :json
    sessionob = Sessionob.find(params[:session_id])
    return sessionob.eventobs.to_json
  end

  ###  get an event by id
  get '/event/:event_id' do
    content_type :json
    eventob = Eventob.find(params[:event_id])
    return eventob.to_json
  end

  ### update event's properties
  put '/event' do
    request.body.rewind  # in case someone already read it
    content_type :json;
    data = JSON.parse request.body.read

    unless data.nil? or data['_id'].nil? then
      status 200

      eventob = Eventob.find(data['_id'])

      unless data['comment'].nil?
        eventob.update_attributes(:comment => data['comment'])
      end

      unless data['xpos'].nil?
        eventob.update_attributes(:xpos => data['xpos'])
      end

      unless data['ypos'].nil?
        eventob.update_attributes(:ypos => data['ypos'])
      end

      unless data['interactions'].nil? then
        interactionsArray = data['interactions']
        newinteractionsArray = []
        if interactionsArray.kind_of?(Array)
          interactionsArray.each do |interaction_id|
            begin
              interaction = Interaction.find(interaction_id)
            end

            if interaction
              newinteractionsArray.push(interaction)
            end
          end

          if newinteractionsArray.length > 0 then
            eventob.interactions.clear
            newinteractionsArray.each do |interaction|
              eventob.interactions << interaction
            end
          end
        end
      end

      return eventob.to_json
    else
      status 404
      return {"message" => "Provide comment"}.to_json
    end
  end

  ### delete an event by id
  delete '/event/:event_id' do
    request.body.rewind  # in case someone already read it
    content_type :json

    eventob = Eventob.find(params[:event_id])

    if eventob.nil? then
      status 404
    else
      if eventob.destroy then
        status 200
        return {"message" => "Event deleted"}.to_json
      else
        status 500
      end
    end
  end
end
