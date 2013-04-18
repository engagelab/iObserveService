class Iobserve < Sinatra::Application
  ######################## User ##################################
  ### get all users
  get '/users' do
    content_type :json
    @user = User.without(:password).all()
    return @user.to_json
  end

  ### get user by id
  get '/user/:id' do
    request.body.rewind  # in case someone already read it
    content_type :json

    user = User.without(:password).find(params[:id])

    if user.nil? then
      status 404
    else
      status 200
      return user.to_json
    end
  end

  ### create a user
  post '/user' do
    request.body.rewind  # in case someone already read it
    content_type :json
    data = JSON.parse request.body.read

    unless data.nil? or (data['lastname'].nil? and data['firstname'].nil? and data['email'].nil?) then
      status 200
      login_id = data['email']

      unless data['login_id'].nil?
        login_id = data['login_id']
      end

      user = User.create(
          :lastname => data['lastname'],
          :firstname => data['firstname'],
          :email => data['email'],
          :login_id => login_id,
          :password => SecureRandom.uuid,
          :created_on => Time.now.iso8601)

      return user.to_json
    else
      status 404
      return {"errorMessage" => "Provide lastname, firstname and email"}.to_json
    end
  end

  ### update user's properties
  put '/user' do
    request.body.rewind  # in case someone already read it
    content_type :json;
    data = JSON.parse request.body.read

    unless data.nil? or data['_id'].nil? then
      status 200

      user = User.find(data['_id'])

      unless data['lastname'].nil?
        user.update_attributes(:lastname => data['lastname'])
      end

      unless data['firstname'].nil?
        user.update_attributes(:firstname => data['firstname'])
      end

      unless data['login_id'].nil?
        user.update_attributes(:login_id => data['login_id'])
      end

      unless data['email'].nil?
        user.update_attributes(:email => data['email'])
      end

      unless data['password'].nil?
        user.update_attributes(:password => data['password'])
      end

      return user.to_json
    else
      status 404
      return {"message" => "Provide _id, lastname, firstname, email and password"}.to_json
    end
  end

  ### delete a user by id
  delete '/user/:id' do
    request.body.rewind  # in case someone already read it
    content_type :json

    user = User.find(params[:id])

    if user.nil? then
      status 404
    else
      if user.destroy then
        status 200
        return {"message" => "User deleted"}.to_json
      else
        status 500
      end
    end
  end
end
