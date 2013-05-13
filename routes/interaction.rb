class Iobserve < Sinatra::Application
  ######################## Action ##################################
  ### create an action
  post '/interaction' do
    request.body.rewind  # in case someone already read it
    content_type :json

    bdy = request.body.read

    if bdy.length > 2 then
      data = JSON.parse bdy
    else
      halt 404
      return {"message" => "Error: provide a valid JSON"}.to_json
    end

    unless (data.nil? and data['visitors'].nil? and data['action'].nil?) or (data.nil? and data['visitors'].nil? and data['resource'].nil?) then
        interaction = Interaction.create(:created_on => Time.now.iso8601)
        visitorArray = data['visitors']

        if visitorArray.kind_of?(Array)
          visitorArray.each do |visitor_id|
            begin
              visitor = Visitor.find(visitor_id)
            rescue
              return {"message" => "Error: the visitor id provided does not exist"}.to_json
              halt 404
            end

            if visitor
              interaction.visitors << visitor
            end
          end

          begin
            action = Action.find(data['action'])
          rescue
            return {"message" => "Error: the action id provided does not exist"}.to_json
            halt 404
          end

          unless action.nil? then
            interaction.action = action
          end


          begin
            resource = Resource.find(data['resource'])
          rescue
            return {"message" => "Error: the resource id provided does not exist"}.to_json
            halt 404
          end

          unless resource.nil? then
            interaction.resource = resource
          end

          interaction.save
          return interaction.to_json
        else
          halt 404
        end
    else
      status 404
      return {"message" => "Error: provide a valid behavior id and an array of visitor id(s)"}.to_json
    end
  end


  ### list all interactions
  get '/interaction' do
    content_type :json
    @interaction = Interaction.all()
    return @interaction.to_json
  end

  ###  get an interaction by id
  get '/interaction/:interaction_id' do
    content_type :json
    interaction = Interaction.find(params[:interaction_id])
    return interaction.to_json
  end


  ### update interaction's properties
  put '/interaction' do

  end

  ### delete an interaction by id
  delete '/interaction/:interaction_id' do
    request.body.rewind  # in case someone already read it
    content_type :json

    interaction = Interaction.find(params[:interaction_id])

    if interaction.nil? then
      status 404
    else
      if interaction.destroy then
        status 200
        return {"message" => "Action deleted"}.to_json
      else
        status 500
      end
    end
  end
end
