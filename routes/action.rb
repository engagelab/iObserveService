class Iobserve < Sinatra::Application
  ######################## Action ##################################
  ### create an action
  post '/action' do
    request.body.rewind  # in case someone already read it
    content_type :json

    bdy = request.body.read

    if bdy.length > 2 then
      data = JSON.parse bdy
    else
      halt 404
      return {"message" => "Error: provide a valid JSON"}.to_json
    end

    unless data.nil? or data['type'].nil? then

      if Action.where({ :type => data['type'] }).count  == 0 then
        status 200
        action = Action.create(:type => data['type'])
        return  action.to_json
      else
        status 202
        return Action.where({ :type => data['type'] }).to_json
      end
    else
      status 404
      return {"message" => "Error: provide a valid type"}.to_json
    end
  end


  ### list all actions
  get '/action' do
    content_type :json
    @action = Action.all()
    return @action.to_json
  end

  ###  get a action by id
  get '/action/:action_id' do
    content_type :json
    action = Action.find(params[:action_id])
    return action.to_json
  end


  ### update action's properties
  put '/action' do
    request.body.rewind  # in case someone already read it
    content_type :json;
    bdy = request.body.read

    if bdy.length > 2 then
      data = JSON.parse bdy
    else
      halt 404
      return {"message" => "Error: provide a valid JSON"}.to_json
    end

    unless data.nil? or data['type'].nil? or Action.where({ :type => data['type'] }).count > 0 then
      status 200

      action = Action.find(data['_id'])
      action.update_attributes(:type => data['type'])

      return action.to_json
    else
      status 404
      return {"message" => "Provide a new type"}.to_json
    end
  end

  ### delete a media by id
  delete '/action/:action_id' do
    request.body.rewind  # in case someone already read it
    content_type :json

    action = Action.find(params[:action_id])

    if action.nil? then
      status 404
    else
      if action.destroy then
        status 200
        return {"message" => "Action deleted"}.to_json
      else
        status 500
      end
    end
  end
end
