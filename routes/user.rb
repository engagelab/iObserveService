class Iobserve < Sinatra::Application
  ######################## User ##################################
  ### get all users
  get '/user' do
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

      existingEmail = User.where(:email => data['email']).first()
      existingLoginId = User.where(:login_id => login_id).first()

      if existingEmail.nil? and existingLoginId.nil? then
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
        return {"errorMessage" => "User(email) and/or login id already exist"}.to_json
      end

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
        existingUser = User.where(:login_id => data['login_id']).first()
        if existingUser.nil? then
          user.update_attributes(:login_id => data['login_id'])
        else
          status 404
          return {"message" => "Login id already exists"}.to_json
        end
      end

      unless data['email'].nil?
        existingUser = User.where(:email => data['email']).first()
        if existingUser.nil? then
          user.update_attributes(:email => data['email'])
        else
          status 404
          return {"message" => "Email id already exists"}.to_json
        end
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
