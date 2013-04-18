class Iobserve < Sinatra::Application
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
end
