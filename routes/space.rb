class Iobserve < Sinatra::Application
  ######################## Space ##################################
  ### list all spaces
  get '/space' do
      content_type :json
      @space = Space.all()
      return @space.to_json
  end

  ### list all spaces by user id
  get '/user/:user_id/space' do
    content_type :json
    user = User.without(:password).find(params[:user_id])
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
      user = User.without(:password).find(params[:user_id])
      space = Space.create(:label => data['label'], :created_on => Time.now.to_i)

      startAction = Action.without(:interaction_ids).where(type: "START").first
      space.actions << {:_id => startAction._id, :type => startAction.type }
      stopAction = Action.without(:interaction_ids).where(type: "STOP").first
      space.actions << {:_id => stopAction._id, :type => stopAction.type }

      noneResource = Resource.without(:interaction_ids).where(type: "NONE").first
      space.resources << {:_id => noneResource._id, :type => noneResource.type }

      user.spaces << space
      user.save
      return user.to_json
    end
  end

  ### add exisiting space to user by id
  post '/user/:user_id/space/:space_id' do
    content_type :json

    user = User.without(:password).find(params[:user_id])
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

  ### add space's available actions
  put '/space/action' do
    request.body.rewind  # in case someone already read it
    content_type :json;
    data = JSON.parse request.body.read

    unless data.nil? or (data['_id'].nil? and data['actions'].nil?) then
      space = Space.find(data['_id'])

      unless space.nil? then
        actionsArray = data['actions']

        if actionsArray.kind_of?(Array)
          space.actions = actionsArray
          space.save
        end
      end

      return space.to_json
    else
      status 404
      return {"message" => "Provide _id and actions"}.to_json
    end
  end

  ### add space's available resources
  put '/space/resource' do
    request.body.rewind  # in case someone already read it
    content_type :json;
    data = JSON.parse request.body.read

    unless data.nil? or (data['_id'].nil? and data['resources'].nil?) then
      space = Space.find(data['_id'])

      unless space.nil? then
        resourcesArray = data['resources']

        if resourcesArray.kind_of?(Array)
          space.resources = resourcesArray
          space.save
        end
      end

      return space.to_json
    else
      status 404
      return {"message" => "Provide _id and actions"}.to_json
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
      space.sessionobs.each do|session|
        sessionob = Sessionob.find(session._id)

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

        sessionob.destroy

      end

      if space.destroy then
        status 200
        return {"message" => "Space deleted"}.to_json
      else
        status 500
      end
    end
  end
end
