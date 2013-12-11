class Iobserve < Sinatra::Application
  ######################## Session ##################################
  ### create an event by session id
  post '/session/:session_id/event' do
    if authorized?
      content_type :json

      sessionob = Sessionob.unscoped.find(params[:session_id])

      unless sessionob.nil? then
        status 200
        eventob = Eventob.create(:created_on => Time.now.to_i)

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

          unless data['label'].nil?
            eventob.update_attributes(:label => data['label'])
          end
        end

        sessionob.eventobs << eventob
        eventob.save
        return eventob.to_json
      else
        status 404
        return {"message" => "Error: provide a valid session id"}.to_json
      end
    else
      status 401
    end
  end


  ### list all events
  get '/event' do
    if authorized?
      content_type :json
      @eventob = Eventob.order_by(:created_on.asc).all()
      return @eventob.to_json
    else
      status 401
    end
  end


  ### list all events by session id
  get '/session/:session_id/events' do
    if authorized?
      content_type :json
      sessionob = Sessionob.unscoped.find(params[:session_id])
      unless sessionob.nil? then
        return sessionob.eventobs.to_json
      end
    else
      status 401
    end
  end

  ### list all events from all sessions by space id and room id
  get '/space/:space_id/:room_id/events' do
    if authorized?
      content_type :json
      space = Space.find(params[:space_id])

      unless space.nil? then

        @allSessionsForSpaceAndRoom = [];

        space.sessionobs.each do |session|
          if String(session.room_id).include?(params[:room_id]) then
            @allSessionsForSpaceAndRoom.push(session)
          end
        end
      end

      unless @allSessionsForSpaceAndRoom.nil? then

        @allEventsForSessions = [];
        @allSessionsForSpaceAndRoom.each do |session|
            sessionob = Sessionob.find(session._id)
            events = sessionob.eventobs
            @allEventsForSessions.push(events)
        end
      end
      result = '{"sessions" : ' + @allSessionsForSpaceAndRoom.to_json + ', "events" : ' + @allEventsForSessions.to_json + '}'
      return result
    else
      status 401
    end
  end

  ###  get an event by id
  get '/event/:event_id' do
    if authorized?
      content_type :json
      eventob = Eventob.find(params[:event_id])
      return eventob.to_json
    else
      status 401
    end
  end

  ### update event's properties
  put '/event' do
    if authorized?
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

        unless data['label'].nil?
          eventob.update_attributes(:label => data['label'])
        end

        unless data['interaction_id'].nil? then
            begin
              interaction = Interaction.find(data['interaction_id'])
            end

            if interaction
              eventob.interactions << interaction
            end
        end

        eventob.save
        return eventob.to_json
      else
        status 404
        return {"message" => "Provide comment"}.to_json
      end
    else
      status 401
    end
  end

  ### delete an event by id
  delete '/event/:event_id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      eventob = Eventob.find(params[:event_id])

      if eventob.nil? then
        status 404
      else

        unless eventob.interactions.nil? then
          eventob.interactions.each do|inter|
            interaction = Interaction.find(inter._id)
            interaction.destroy
          end
        end

        sessionob = Sessionob.unscoped.find(eventob.sessionob_id)
        sessionob.eventobs.delete(eventob)

        if eventob.destroy then
          status 200
          return {"message" => "Event deleted"}.to_json
        else
          status 500
        end
      end
    else
      status 401
    end
  end
end
