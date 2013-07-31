class Iobserve < Sinatra::Application
  ######################## Room ##################################
  ### create a room by space id
  post '/space/:space_id/room' do
    request.body.rewind  # in case someone already read it
    content_type :json
    data = JSON.parse request.body.read

    unless data.nil? or data['label'].nil? then
      status 200
      space = Space.find(params[:space_id])
      unless data['uri'].nil? then
        room = Room.create(:label => data['label'], :created_on => Time.now.to_i, :uri => data['uri'])
     else
        room = Room.create(:label => data['label'], :created_on => Time.now.to_i)
      end
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
  get '/room' do
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

      unless data['uri'].nil?
        room.update_attributes(:uri => data['uri'])
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
        pointsArray = data['end_points']

        if pointsArray.kind_of?(Array)
          room.end_points = pointsArray
          room.save
        end


        #unless room.end_points.any?{|h| h["xpos"] == data['xpos'] and h["ypos"] == data['ypos']} then
        #  room.end_points.push(:coord_id => SecureRandom.uuid ,:xpos => data['xpos'], :ypos => data['ypos'])
        #  room.save
        #end
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
        pointsArray = data['start_points']

        if pointsArray.kind_of?(Array)
          room.start_points = pointsArray
          room.save
        end

        #unless room.start_points.any?{|h| h["xpos"] == data['xpos'] and h["ypos"] == data['ypos']} then
        #  room.start_points.push(:uuid => data['uuid'] ,:xpos => data['xpos'], :ypos => data['ypos'])
        #  room.save
        #end
      end

      return room.to_json
    else
      status 404
      return {"message" => "Provide _id, xpos, and ypos"}.to_json
    end
  end

  ### delete room's end coordinates
#  put '/room/endcoords/delete' do
#    request.body.rewind  # in case someone already read it
#    content_type :json;
#    data = JSON.parse request.body.read
#
#    unless data.nil? or (data['_id'].nil? and data['xpos'].nil? and data['ypos'].nil?) then
#      room = Room.find(data['_id'])
#
#      unless room.nil? then
#        room.end_points.delete({'xpos' => data['xpos'], 'ypos' => data['ypos']})
#        room.save
#      end
#
#      return room.to_json
#    else
#      status 404
#      return {"message" => "Provide _id, xpos, and ypos"}.to_json
#    end
#  end

  ### delete room's start coordinates
#  put '/room/startcoords/delete' do
#    request.body.rewind  # in case someone already read it
#    content_type :json;
#    data = JSON.parse request.body.read
#
#    unless data.nil? or (data['_id'].nil? and data['xpos'].nil? and data['ypos'].nil?) then
#      room = Room.find(data['_id'])
#
#      unless room.nil? then
#        room.start_points.delete({'xpos' => data['xpos'], 'ypos' => data['ypos']})
#        room.save
#      end
#
#      return room.to_json
#    else
#      status 404
#      return {"message" => "Provide _id, xpos, and ypos"}.to_json
#    end
#  end

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
end
