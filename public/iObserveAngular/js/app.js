var iObserveApp = angular.module('iObserveApp', ['ngResource', 'ngSanitize', 'ui.bootstrap']);


iObserveApp.factory('iObserveResources', function ($http, $q) {

    var navigationState= "iObserve";
    var loginState = false;
    var loginToken = "";
    var userId = "";

    var postConfiguration = {
        type: "POST",
        contentType: 'application/json',
        dataType: "json",
        async: true,
        processData: false
    }

    var userLogout = function() {
        navigationState= "iObserve";
        userId = "";
        loginToken = "";
        loginState = false;
    }

    var userLogin = function(data) {
        //create our deferred object.
        var deferred = $q.defer();

        $http.post('/login', data, postConfiguration).success(function(data) {
            loginState = true;
            loginToken = data.token;
            userId = data.userId;
            navigationState = "iObserve";
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });

        //return the promise that work will be done.
        return deferred.promise;
    }

    var userRegistration = function(data) {
        //create our deferred object.
        var deferred = $q.defer();

        $http.post('/users', data, postConfiguration).success(function(data) {
            userLogin(data.users);
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });

        //return the promise that work will be done.
        return deferred.promise;
    }

    return {
        getNavigationState: function() {
            return navigationState;
        },
        setNavigationState: function(divKey) {
            navigationState = divKey;
        },
        getLoginState: function() {
            return loginState;
        },
        setLoginState: function(state) {
            loginState = state;
        },
        getLoginToken: function() {
            return loginToken;
        },
        setLoginToken: function(token) {
            loginToken = token;
        },
        getUserId: function() {
            return userId;
        },
        setUserId: function(id) {
            userId = id;
        },
        doUserRegistration: userRegistration,
        doUserLogin: userLogin,
        doUserLogout: userLogout

    };
});


/*
 Receive emitted message and broadcast it.
 Event names must be distinct or browser will blow up!   http://jsfiddle.net/VxafF/
 */
/*
iObserveApp.run(function($rootScope) {
    $rootScope.$on('handleEmit', function(event, args) {
        $rootScope.$broadcast('handleBroadcast', args);
    });
});
  */

iObserveApp.controller('NavCtrl', function($scope, iObserveResources) {

    showHideNavTabs(false);

    function showHideNavTabs(loginState) {
        if(loginState) {
            $scope.panes = [
                { title:"iObserve", content:"", active: true },
                { title:"Profile", content:"" },
                { title:"Spaces", content:"" },
                { title:"Statistics", content:"" },
                { title:"About", content:"" },
                { title:"Logout", content:"" }
            ];
        }
        else {
            $scope.panes = [
                { title:"iObserve", content:"", active: true },
                { title:"About", content:"" },
                { title:"Login", content:"" },
                { title:"Register", content:""}
            ];
        }
    }

    $scope.active = function() {
        var navState =   $scope.panes.filter(function(pane){
            return pane.active;
        })[0].title;
        return navState;
    }

    $scope.loginState =  iObserveResources.getLoginState;
    $scope.$watch('loginState()', function(loginState) {
        showHideNavTabs(loginState);
    }, true);

    $scope.$watch('active()', function(navState) {
        if(navState == "Logout") {
            iObserveResources.doUserLogout();
            $scope.componentState = "iObserve";
        }
        else {
            iObserveResources.setNavigationState(navState);
            $scope.componentState = navState;
        }
    });
})
 /*
    $scope.$on('handleBroadcast', function(event, args) {
        $scope.message = 'ONE: ' + args.message;
    });
  */
//.$inject = ['$scope'];


iObserveApp.controller('RegisterCtrl', function($scope, iObserveResources) {

    $scope.registerMe = function($event) {
        if(registrationValidated()) {
            var data = {last_name : $scope.user.lastName, first_name: $scope.user.firstName, email: $scope.user.email, password : $scope.user.password};
            iObserveResources.doUserRegistration(data).then(function(resultData) {
                $scope.resultData = resultData;
            });
        }
    }

    function registrationValidated() {
        return true;
    }

})//.$inject = ['$scope'];


iObserveApp.controller('AboutCtrl', function($scope, iObserveResources) {


})//.$inject = ['$scope'];


iObserveApp.controller('LoginCtrl', function($scope, iObserveResources) {

    $scope.logMeIn = function($event) {
        if(loginValidated()) {
            var data = {login_id : $scope.email, password: $scope.password};
            iObserveResources.doUserLogin(data).then(function(resultData) {
                $scope.resultData = resultData;
            });
        }
    }

    function loginValidated() {
        return true;
    }

})//.$inject = ['$scope'];
