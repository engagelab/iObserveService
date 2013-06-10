class Iobserve < Sinatra::Application
  ######################## User ##################################
  ### get all users
  get '/users' do
    content_type :json
    @user = User.without(:password).all()
    if @user.size > 1
      return {"users" => @user}.to_json
    else
      return {"user" => @user}.to_json
    end
  end

  ### get user by id
  get '/users/:id' do
    request.body.rewind  # in case someone already read it
    content_type :json

    user = User.without(:password).find(params[:id])

    if user.nil? then
      status 404
    else
      status 200
      return {"user" => user}.to_json
    end
  end

  ### create a user
  post '/users' do
    request.body.rewind  # in case someone already read it
    content_type :json

    bdy = request.body.read

    if bdy.length > 2 then
      data = JSON.parse bdy
    end
    data = data['user']

    unless data.nil? or (data['last_name'].nil? and data['first_name'].nil? and data['email'].nil?) then
      status 200
      login_id = data['email']
      password = SecureRandom.uuid

      unless data['login_id'].nil?
        login_id = data['login_id']
      end

      unless data['password'].nil?
        password = data['password']
      end

      existingEmail = User.where(:email => data['email']).first()
      existingLoginId = User.where(:login_id => login_id).first()

      if existingEmail.nil? and existingLoginId.nil? then
        user = User.create(
            :last_name => data['last_name'],
            :first_name => data['first_name'],
            :email => data['email'],
            :login_id => login_id,
            :password => password,
            :created_on => Time.now.to_i)

        return {"user" => user}.to_json
      else
        status 401
        return {"message" => "User(email) and/or login id already exist"}.to_json
      end

    else
      status 401
      return {"message" => "Provide lastname, firstname and email"}.to_json
    end
  end

  ### update user's properties
  put '/users' do
    request.body.rewind  # in case someone already read it
    content_type :json;

    bdy = request.body.read

    if bdy.length > 2 then
      data = JSON.parse bdy
    end
    data = data['user']
    unless data.nil? or data['_id'].nil? then
      status 200

      user = User.find(data['_id'])

      unless data['last_name'].nil?
        user.update_attributes(:lastname => data['lastname'])
      end

      unless data['first_name'].nil?
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

      return {"user" => user}.to_json
    else
      status 404
      return {"message" => "Provide _id, lastname, firstname, email and password"}.to_json
    end
  end

  ### delete a user by id
  delete '/users/:id' do
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

  post '/login' do
    request.body.rewind  # in case someone already read it
    content_type :json

    bdy = request.body.read

    if bdy.length > 2 then
      data = JSON.parse bdy
    else
      halt 404
      return {"message" => "Error: provide a valid JSON"}.to_json
    end

    unless data.nil? and data['login_id'].nil? and data['password'].nil? then
      user = User.where(:login_id => data['login_id']).first()

      if user then
        if data['password'] == user.password then
          status 200
          return {"token" => SecureRandom.uuid, "userId" => user._id}.to_json
        else
          status 400
          return {"message" => "Error: wrong password"}.to_json
        end
      else
        status 404
        return {"message" => "Error: user not found"}.to_json
      end
    end
  end

end
