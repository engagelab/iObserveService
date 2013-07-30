//var iObserveApp = angular.module('iObserveApp', ['ngResource', 'ngSanitize', 'ui.bootstrap', 'ngUpload', 'ngDragDrop']);
var iObserveApp = angular.module('iObserveApp', ['ngResource', 'ngSanitize', 'ui.bootstrap', 'ngUpload']);

// var routePrePath = "http://observe.uio.im";
var routePrePath = "";

var postConfiguration = {
    type: "POST",
    contentType: 'application/json',
    dataType: "json",
    async: true,
    processData: false
}
var putConfiguration = {
    type: "PUT",
    contentType: 'application/json',
    dataType: "json",
    async: true,
    processData: false
}
var getConfiguration = {
    type: "GET",
    contentType: 'application/json',
    dataType: "json",
    async: true,
    processData: false
}
var deleteConfiguration = {
    type: "DELETE",
    contentType: 'application/json',
    dataType: "json",
    async: true,
    processData: false
}

iObserveApp.factory('iObserveData', function ($http, $q) {

    var currentUserId = null;
    var spaceListObject = null;
    var selectedSpace = null;
    var sessionListObject = null;
    var selectedSession = null;
    var chartDataObject = null;
    var studyIdToDelete = null;

    var requestSessionListObject = function() {
            var deferred = $q.defer();
            var route = routePrePath + "/space/" + spaceListObject.space_id + "/session";

            $http.get(route, getConfiguration).success(function(data) {
                deferred.resolve(data);
            }).error(function(data, status){
                    alert( "Request failed: " + data.message  );
                    deferred.reject();
                });
            return deferred.promise;
    };

    var requestStudyListObject = function() {
        var deferred = $q.defer();

        $http.get(routePrePath + "/user/" + currentUserId + "/space", getConfiguration).success(function(data) {
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestNewStudyObject = function(data) {
        var deferred = $q.defer();

        $http.post(routePrePath + "/user/" + currentUserId + "/space", data, getConfiguration).success(function(data) {
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestDeleteStudyObject = function(data) {
        var deferred = $q.defer();

        $http.delete(routePrePath + "/space/"+data, deleteConfiguration).success(function(data) {
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestDeleteRoomObject = function(data) {
        var deferred = $q.defer();

        $http.delete(routePrePath + "/room/"+data, deleteConfiguration).success(function(data) {
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestAddStudyRoomObject = function(data) {
        var deferred = $q.defer();

        $http.post(routePrePath + "/space/"+data.spaceid+"/room", data, postConfiguration).success(function(data) {
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    return {

        setUserId: function(id) {
            currentUserId = id;
        },

        sessionListObject : sessionListObject,

        setSessionListObject: function() {
            if(spaceListObject != null) {
                requestSessionListObject().then(function(resultData) {
                    sessionListObject = resultData;
                    selectedSession = sessionListObject[0];
                });
            }
            else
                alert( "A space must be selected before sessions can be shown");
        },

        selectedSession: selectedSession,

        spaceListObject: spaceListObject,

        /*doGetSpaces: function(userId) {
            requestSpaceListObject(userId).then(function(resultData) {
                spaceListObject = resultData;
                selectedSpace = spaceListObject[0];
            });
        },   */

        doGetStudies: requestStudyListObject,
        doNewStudy: requestNewStudyObject,
        doDeleteStudy: requestDeleteStudyObject,
        doCreateStudyRoom: requestAddStudyRoomObject,
        doDeleteRoom: requestDeleteRoomObject,
        selectedSpace: selectedSpace
    }
});

iObserveApp.factory('iObserveStates', function ($http, $q) {

    var navigationState= "iObserve";
    var loginState = false;
    var loginToken = "";
    var userId = "";

    var userLogout = function() {
        navigationState= "iObserve";
        userId = "";
        loginToken = "";
        loginState = false;
    }

    var userLogin = function(data) {
        var deferred = $q.defer();

        $http.post(routePrePath + '/login', data, postConfiguration).success(function(data) {
            loginState = true;
            loginToken = data.token;
            userId = data.userId;
            navigationState = "iObserve";
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
          });

        return deferred.promise;
    }

    var userRegistration = function(data) {
        var deferred = $q.defer();

        $http.post(routePrePath + '/user', data, postConfiguration).success(function(data) {
            userLogin(data);
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message );
                deferred.reject();
          });

        return deferred.promise;
    }

    var getProfile = function() {

        if(loginState) {
            var deferred = $q.defer();

            $http.get(routePrePath + '/user/'+userId, getConfiguration).success(function(data) {
                deferred.resolve(data);
            }).error(function(data, status){
                    alert( "Request failed: " + data.message  );
                    deferred.reject();
              });

            return deferred.promise;
        }
        else
            return null;
    }

    var updateProfile = function(data) {
        var deferred = $q.defer();

        $http.put(routePrePath + '/user', data, postConfiguration).success(function(data) {
            userLogin(data);
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message );
                deferred.reject();
            });

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
        getSessionObject: function() {
            return sessionObject;
        },
        setSessionObject: function(so) {
            sessionObject = so;
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
        doUpdateProfile : updateProfile,
        doGetProfile : getProfile,
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

iObserveApp.controller('NavCtrl', function($scope, iObserveStates) {

    showHideNavTabs(false);

    function showHideNavTabs(loginState) {
        if(loginState) {
            $scope.panes = [
                { title:"iObserve", content:"", active: true },
                { title:"Profile", content:"" },
                { title:"Studies", content:"" },
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

    $scope.loginState =  iObserveStates.getLoginState;
    $scope.$watch('loginState()', function(loginState) {
        showHideNavTabs(loginState);
    }, true);

    $scope.$watch('active()', function(navState) {
        if(navState == "Logout") {
            iObserveStates.doUserLogout();
            $scope.componentState = "iObserve";
        }
        else {
            iObserveStates.setNavigationState(navState);
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


iObserveApp.controller('RegisterCtrl', function($scope, iObserveStates) {

    $scope.registerMe = function($event) {
        if(registrationValidated()) {
            var data = {last_name : $scope.user.lastName, first_name: $scope.user.firstName, email: $scope.user.email, password : $scope.user.password};
            iObserveStates.doUserRegistration(data).then(function(resultData) {
                $scope.resultData = resultData;
            });
        }
    }

    function registrationValidated() {
        return true;
    }

})//.$inject = ['$scope'];


iObserveApp.controller('AboutCtrl', function($scope, iObserveStates) {


})//.$inject = ['$scope'];


iObserveApp.controller('LoginCtrl', function($scope, iObserveStates) {

$scope.logMeIn = function($event) {
    if(loginValidated()) {
        var data = {login_id : $scope.email, password: $scope.password};
        iObserveStates.doUserLogin(data).then(function(resultData) {
            $scope.resultData = resultData;
        });
    }
}

function loginValidated() {
    return true;
}

})//.$inject = ['$scope'];

iObserveApp.controller('ProfileCtrl', function($scope, iObserveStates) {

    $scope.userEdit = [{key:"first_name", name: "First Name", value:""},{key:"last_name", name: "Last Name", value:""},{key:"email", name: "Email", value:""},{key:"login_id", name: "Login ID", value:""},{key:"password", name: "Password", value:""}]

    function getProfile() {
        iObserveStates.doGetProfile().then(function(resultData) {
            $scope.user = resultData;
            $scope.userEdit[0].value = $scope.user.first_name;
            $scope.userEdit[1].value = $scope.user.last_name;
            $scope.userEdit[2].value = $scope.user.email;
            $scope.userEdit[3].value = $scope.user.login_id;
            $scope.userEdit[4].value = $scope.user.password;
        });
    }

    $scope.updateProfile = function($event) {
            var data = {_id : iObserveStates.getUserId(), first_name: $scope.user.first_name, last_name: $scope.user.last_name, email: $scope.user.email, login_id: $scope.user.login_id, password: $scope.user.password};
            iObserveStates.doUpdateProfile(data).then(function(resultData) {
                $scope.user = resultData.user;
            });
    }


    if($scope.user == null) {
        getProfile();
    }

})//.$inject = ['$scope'];

iObserveApp.controller('UserEditorController', function($scope) {

    $scope.isCollapsed = true;
    $scope.isNotCollapsed = false;

    // Some code taken from the 'todos' AngularJS example
    $scope.editorEnabled = true;

    $scope.enableEditor = function() {
   //     $scope.editorEnabled = true;
        $scope.editValue = $scope.itemToEdit.value;
        $scope.isCollapsed = !$scope.isCollapsed;
        $scope.isNotCollapsed = !$scope.isCollapsed;
    }

    $scope.disableEditor = function() {
  //    $scope.editorEnabled = false;
        $scope.isCollapsed = !$scope.isCollapsed;
        $scope.isNotCollapsed = !$scope.isCollapsed;
    }

    $scope.retain = function() {
        if ($scope.editValue == "") {
            return false;
        }
        $scope.itemToEdit.value = $scope.editValue;
      //  angular.element("updateBtn").$setValidity(true);
      //  $scope.updateBtn.$setValidity('updateBtn', true);

        $scope.disableEditor();
    }
});

iObserveApp.controller('StatisticsCtrl', function($scope, iObserveStates, iObserveData) {


})//.$inject = ['$scope'];

iObserveApp.controller('StatisticsSessionSelectCtrl', function($scope, iObserveData) {
    $scope.sessions = iObserveData.sessionListObject;
    $scope.selectedSession = iObserveData.selectedSession;

    // expose the itemstore service to the dom
    $scope.store = iObserveData;

    $scope.getItem = function(){
        return(iObserveData.selectedSession);
    }
});