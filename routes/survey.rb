class Iobserve < Sinatra::Application
  ######################## Survey ##################################
  post '/space/:space_id/survey' do
    request.body.rewind  # in case someone already read it
    content_type :json

    begin
      space = Space.find(params[:space_id])
    end

    @survey = nil;

    unless space.nil? then
      data = JSON.parse request.body.read
      unless data.nil? then
        unless data['label'].nil? then
          @survey = Survey.create(:created_on => Time.now.to_i, :label => data['label']);
        else
          @survey = Survey.create(:created_on => Time.now.to_i)
        end
      else
        @survey = Survey.create(:created_on => Time.now.to_i)
      end

      space.surveys << @survey
      space.save
      return @survey.to_json
    else
      status 404
      return {"message" => "Space not found"}.to_json
    end
  end


  ### list all surveys
  get '/survey' do
    content_type :json
    @survey = Survey.all()
    return @survey.to_json
  end


  ### list all surveys by space id
  get '/space/:space_id/survey' do
    content_type :json
    space = Space.find(params[:space_id])
    return space.surveys.to_json
  end

  ###  get a survey by id
  get '/survey/:survey_id' do
    content_type :json
    survey = Survey.find(params[:survey_id])
    return sessionob.to_json
  end

  ### update survey's properties
  put '/survey' do
    request.body.rewind  # in case someone already read it
    content_type :json;
    data = JSON.parse request.body.read

=begin
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
=end
  end


  ### delete a survey by id
  delete '/survey/:survey_id' do
    request.body.rewind  # in case someone already read it
    content_type :json

    survey = Survey.find(params[:survey_id])

    if survey.nil? then
      status 404
    else
=begin
      unless survey.visitorgroup.nil? then
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
=end
    end
  end
end
