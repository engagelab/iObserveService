App = Ember.Application.create();

App.store = DS.Store.create({
	revision: 12,
	//adapter: 'DS.FixtureAdapter'
	adapter: DS.RESTAdapter.create({
		url: 'http://localhost:9292'
	})
});



// *************   Models   ********************

var attr = DS.attr;
var currentUserID = "";
/*
App.Profile = DS.Model.extend({
	lastName: DS.attr('string'),
	firstName: DS.attr('string'),
	email: DS.attr('string'),
	password: DS.attr('string'),
	createdOn: DS.attr('date'),
});
*/
/*
App.Profile.FIXTURES = [{
	"id": 1,
	"firstname": "John",
	"lastname": "Daily",
	"email": "jd@dot.com"
},{
	id: 2,
	"firstname": "Rich",
	"lastname": "Nesnass",
	"email": "nesnass@gmail.com"
}];
*/
App.User = DS.Model.extend({
	lastName: DS.attr('string'),
	firstName: DS.attr('string'),
	email: DS.attr('string'),
	password: DS.attr('string'),
	createdOn: DS.attr('date')
});

App.Login = DS.Model.extend({
    login_id: DS.attr('string'),
    password: DS.attr('string')
});



// ******************   Routers   *******************

App.Router.map(function() {
	this.resource('about');
	this.resource('profile');
	this.resource('registration');
});

App.ApplicationRoute = Ember.Route.extend({

});

App.AboutRoute = Ember.Route.extend({

});

App.ProfileRoute = Ember.Route.extend({
	model: function() {
    	return App.User.find(currentUserID);
 	}
});

App.RegistrationRoute = Ember.Route.extend({

});




// ****************   Controllers   ******************


// Default controller
App.ApplicationController = Ember.Controller.extend({
    needs: "login"
});

App.ProfileController = Ember.Controller.extend({

});

App.RegistrationController = Ember.Controller.extend({
	needs: "index",
    indexBinding: "controllers.index",
  	loginFailed: false,

    register: function() {

        if(this.validate()) {
            var newUser = {
                "last_name" : this.lastName,
                "first_name" : this.firstName,
                "email" : this.email
            };
            /*
             var myPromise;
             var transaction = App.store.transaction();
             var newUser = transaction.createRecord(App.User, {
             lastName: this.lastName,
             firstName: this.firstName,
             email: this.email,
             password: this.password,
             createdOn: new Date()
             });
             newUser.on('didLoad', function() {

             this.success();
             });
             newUser.on('becameError', function() {
             // Console.log(myPromise.rejectedReason.toString());
             this.failure();
             });
             myPromise = transaction.commit(); //.then(this.success.bind(this), this.failure.bind(this));
             */
            /*
             var request = $.ajax({
             url: "http://localhost:9292/users",
             type: "GET",
             //data: { "user" : { last_name : "nesnass", first_name : "rich", email : "test"}},
             dataType: "json",
             async: true
             });
             */
            var request = $.ajax({
                url: "http://localhost:9292/users",
                type: "POST",
                contentType: 'application/json',
                dataType: "json",
                data: JSON.stringify(newUser),
                async: true,
                processData: false
            });
            var doneClosure = function(data) {
                //var result = JSON.parse(data);
                //    for (var i=0; i<data.users.length; i++) {
                //        console.log(data.users[i].first_name + data.users[i].last_name);
                //    }
                alert("Created User: " + data.users.first_name + data.users.last_name);
                currentUserID = data.users._id;
                App.get('router').transitionTo('index')
                // alert( result.users. );
            };
            request.done(doneClosure);

            request.fail(function(jqXHR, textStatus) {
                alert( "Request failed: " + jqXHR.responseText );
            });


        }
    },

	validate: function() {
		return true;
  	},

  	success: function() {
        this.indexBinding.email = this.email;
        this.indexBinding.password = this.password;
        this.transitionToRoute('index');
  	},

  	registration: function() {
    //	this.reset();
    //	this.transitionToRoute('registration');
  	},

  	failure: function() {
    //	this.reset();
   // 	this.set("loginFailed", true);
  	}

});

App.LoginController = Ember.Controller.extend({

  loginFailed: false,
  userLoggedIn: false,
  isProcessing: false,
  isSlowConnection: false,
  timeout: null,
  loginToken: null,

  login: function() {
    this.setProperties({
      loginFailed: false,
      isProcessing: true
    });

    this.set("timeout", setTimeout(this.slowConnection.bind(this), 1));

   // var request = $.post("/login", this.getProperties("email", "password"));
   // request.then(this.success.bind(this), this.failure.bind(this));
  	
  	// Temporary to simulate a successful login
	//this.success();


    //this.loginToken = App.Login.find({ login_id: this.email, password: this.password }).then(this.success.bind(this), this.failure.bind(this));
     /*
      var menuId = $("ul.nav").first().attr("id");
      var request = $.ajax({
          url: "script.php",
          type: "POST",
          data: {id : menuId},
          dataType: "html"
      });

      request.done(function(msg) {
          $("#log").html( msg );
      });

      request.fail(function(jqXHR, textStatus) {
          alert( "Request failed: " + textStatus );
      });
      */
  },

  logout: function() {
  	this.reset();
  	this.setProperties({
      loginFailed: false,
      userLoggedIn: false
    });
  },

  success: function() {
    this.reset();
    this.setProperties({
	    userLoggedIn: true
	});
    // sign in logic
   // this.transitionToRoute('profile');
  },

  registration: function() {
    this.reset();
  //  this.transitionToRoute('registration');
  },

  failure: function() {
    this.reset();
    this.set("loginFailed", true);
  },

  slowConnection: function() {
    this.set("isSlowConnection", true);
  },

  reset: function() {
    clearTimeout(this.get("timeout"));
    this.setProperties({
      isProcessing: false,
      isSlowConnection: false
    });
  }

});