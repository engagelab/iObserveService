App = Ember.Application.create();

App.store = DS.Store.create({
	revision: 12,
	//adapter: 'DS.FixtureAdapter'
	adapter: DS.RESTAdapter.create({
		url: 'http://localhost:9292'
	})
});

// Models

var attr = DS.attr;

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

// Routers

App.Router.map(function() {
	this.resource('about');
	this.resource('profile');
	this.resource('registration');
});

App.IndexRoute = Ember.Route.extend({
	model: function() {
		;
	}
});

App.ProfileRoute = Ember.Route.extend({
	model: function() {
    	return App.User.find("51a89b49069ea5a5b9000001");
 	}
});

App.RegistrationRoute = Ember.Route.extend({
	model: function() {
    	;
 	}
});

// Default controller
App.ApplicationController = Ember.Controller.extend({
	needs: "index"
});

App.ProfileController = Ember.Controller.extend({

});

App.RegistrationController = Ember.Controller.extend({
	needs: "index",
    indexBinding: "controllers.index",
  	loginFailed: false,

	register: function() {

		if(this.validate()) {
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

    	}
  	},

	validate: function() {
		return true;
  	},

  	success: function() {
        this.indexBinding.email = this.email;
        this.indexBinding.password = this.password;
    //    this.transitionToRoute('index');
  	},

  	registration: function() {
    	this.reset();
    //	this.transitionToRoute('registration');
  	},

  	failure: function() {
    	this.reset();
    	this.set("loginFailed", true);
  	}

});

App.IndexController = Ember.Controller.extend({

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