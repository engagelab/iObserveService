//var iObserveApp = angular.module('iObserveApp', ['ngResource', 'ngSanitize', 'ui.bootstrap', 'ngUpload', 'ngDragDrop']);
var iObserveApp = angular.module('iObserveApp', ['ngResource', 'ngSanitize', 'ui.bootstrap', 'ngUpload'], null);

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

iObserveApp.factory('iObserveUtilities', function ($http) {

    var timeConverter = function($ts){

        return moment($ts).format("ddd Do MMM YYYY, h:mm a");

    /*
        var a = new Date($ts*1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date+','+month+' '+year+' '+hour+':'+min+':'+sec ;
        return time;

        */
    };

    var timeConverterShort = function($ts) {
        return moment.unix($ts).format("h:mm:ss a");
    };

    var tDiff = function($a,$b) {
        var a = new Date($a*1000);
        var b = new Date($b*1000);

        var nTotalDiff = b.getTime() - a.getTime();
        var oDiff = new Object();

        oDiff.days = Math.floor(nTotalDiff/1000/60/60/24);
        nTotalDiff -= oDiff.days*1000*60*60*24;

        oDiff.hours = Math.floor(nTotalDiff/1000/60/60);
        nTotalDiff -= oDiff.hours*1000*60*60;

        oDiff.minutes = Math.floor(nTotalDiff/1000/60);
        nTotalDiff -= oDiff.minutes*1000*60;

        oDiff.seconds = Math.floor(nTotalDiff/1000);

        return oDiff;
    };

    var loadJSONFile =  function(fileName) {

        var obj = {content:null};

        $http.get(fileName).success(function(data) {
            obj.content = data;
        });

        return obj;
    }
    return {
        timeConverter : timeConverter,
        timeConverterShort : timeConverterShort,
        tDiff : tDiff,
        loadJSONFile: loadJSONFile
    }
});

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

    var requestEventListObject = function(sessionID) {
        var deferred = $q.defer();

        $http.get(routePrePath + "/session/" + sessionID + "/events", getConfiguration).success(function(data) {
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

    var requestUpdateRoomStartCoordinatesObject = function(data) {
        var deferred = $q.defer();

        $http.put(routePrePath + "/room/startcoords", data, putConfiguration).success(function(data) {
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestUpdateRoomEndCoordinatesObject = function(data) {
        var deferred = $q.defer();

        $http.put(routePrePath + "/room/endcoords", data, putConfiguration).success(function(data) {
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

        doGetEvents: requestEventListObject,
        doGetStudies: requestStudyListObject,
        doNewStudy: requestNewStudyObject,
        doDeleteStudy: requestDeleteStudyObject,
        doCreateStudyRoom: requestAddStudyRoomObject,
        doDeleteRoom: requestDeleteRoomObject,
        doUpdateRoomStartCoordinates: requestUpdateRoomStartCoordinatesObject,
        doUpdateRoomEndCoordinates: requestUpdateRoomEndCoordinatesObject,
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




//  Place a tag called <markdown></markdown> in a html file and this directive will convert any contained plain text to markup.
iObserveApp.directive('markdown', function () {
    var converter = new Showdown.converter();
    return {
        restrict: 'E',
        link:function(scope,element,attrs) {
            var htmlText = converter.makeHtml(element.text());
            element.html(htmlText)
        }
    }
})