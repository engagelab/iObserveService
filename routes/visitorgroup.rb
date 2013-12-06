class Iobserve < Sinatra::Application
  ######################## Visitorgroup ##################################
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
  get '/visitorgroup' do
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

      unless data['consent'].nil?
        visitorgroup.update_attributes(:consent => data['consent'])
      end

      visitorgroup.save;
      return visitorgroup.to_json;
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
end
