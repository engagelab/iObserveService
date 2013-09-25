//var iObserveApp = angular.module('iObserveApp', ['ngResource', 'ngSanitize', 'ui.bootstrap', 'ngUpload', 'ngDragDrop']);
var iObserveApp = angular.module('iObserveApp', ['ngResource', 'ngSanitize', 'ui.bootstrap', 'ngUpload', '$strap.directives'], null);

// var routePrePath = "http://visitracker.uio.im";
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
        return moment.unix($ts).format("ddd Do MMM YYYY, h:mm a");
    };

    var timeConverterShort = function($ts) {
        return moment.unix($ts).format("h:mm:ss a");
    };

    var tDiffMoment = function ($a,$b) {
        var a = moment.unix($a);
        var b = moment.unix($b);
        var difference = b.diff(a);
        return moment.duration(difference, "milliseconds").humanize();
    }

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

    var getRandomUUID = function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };



    var decColor2hex = function (color){
        // input:   (String) decimal color (i.e. 16711680)
        // returns: (String) hex color (i.e. 0xFF0000)
        var colorNumber = new Number(color);
        var colArr = colorNumber.toString(16).toUpperCase().split('');
        var numChars = colArr.length;
        for(var a=0;a<(6-numChars);a++){colArr.unshift("0");}
        var result = '#' + colArr.join('');
        return result;
    }

    return {
        timeConverter : timeConverter,
        timeConverterShort : timeConverterShort,
        tDiff : tDiff,
        loadJSONFile: loadJSONFile,
        getRandomUUID: getRandomUUID,
        decColor2hex : decColor2hex,
        tDiffMoment: tDiffMoment,
        loadJSONFile: loadJSONFile
    }
});

iObserveApp.factory('iObserveData', function ($http, $q) {

    var currentUserId = null;

    var requestSurveysForSpace = function(space_id) {
        var deferred = $q.defer();
        var route = routePrePath + "/space/" + space_id + "/survey";

        $http.get(route, getConfiguration).success(function(data) {
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestEventsForSpaceAndRoom = function(space_id, room_id) {
        var deferred = $q.defer();
        var route = routePrePath + "/space/" + space_id + "/" + room_id + "/events";

        $http.get(route, getConfiguration).success(function(data) {
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestSessionsForSpaceAndRoom = function(space_id, room_id) {
        var deferred = $q.defer();
        var route = routePrePath + "/space/" + space_id + "/" + room_id + "/session";

        $http.get(route, getConfiguration).success(function(data) {
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestRoomsForSpace = function(space_id) {
        var deferred = $q.defer();
        var route = routePrePath + "/space/" + space_id + "/rooms";

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

    var requestSessionObject = function(sessionID) {
        var deferred = $q.defer();

        $http.get(routePrePath + "/session/" + sessionID, getConfiguration).success(function(data) {
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

    var requestListActionsObject = function() {
        var deferred = $q.defer();

        $http.get(routePrePath + "/action/simple", getConfiguration).success(function(data) {
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestUpdateSpaceActionsObject = function(data) {
        var deferred = $q.defer();

        $http.put(routePrePath + "/space/action", data, putConfiguration).success(function(data) {
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
        });
        return deferred.promise;
    };

    var requestNewActionObject = function(data) {
        var deferred = $q.defer();

        $http.post(routePrePath + "/action", data, getConfiguration).success(function(data, textStatus, jqXHR) {
            deferred.resolve([data, textStatus, jqXHR]);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
        });
        return deferred.promise;
    };

    var requestListResourcesObject = function() {
        var deferred = $q.defer();

        $http.get(routePrePath + "/resource/simple", getConfiguration).success(function(data) {
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestUpdateSpaceResourcesObject = function(data) {
        var deferred = $q.defer();

        $http.put(routePrePath + "/space/resource", data, putConfiguration).success(function(data) {
            deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestNewResourceObject = function(data) {
        var deferred = $q.defer();

        $http.post(routePrePath + "/resource", data, getConfiguration).success(function(data, textStatus, jqXHR) {
            deferred.resolve([data, textStatus, jqXHR]);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestNewSurveyObject = function(data) {
        var deferred = $q.defer();

        $http.post(routePrePath + "/space/" + data.study_id + "/survey", data, getConfiguration).success(function(data, textStatus, jqXHR) {
            deferred.resolve([data, textStatus, jqXHR]);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestNewQuestionObject = function(data) {
        var deferred = $q.defer();

        $http.post(routePrePath + "/survey/" + data.survey_id + "/question", data, getConfiguration).success(function(data, textStatus, jqXHR) {
            deferred.resolve([data, textStatus, jqXHR]);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestDeleteQuestionObject = function(data) {
        var deferred = $q.defer();

        $http.delete(routePrePath + "/question/"+data, deleteConfiguration).success(function(data, textStatus, jqXHR) {
            deferred.resolve([data, textStatus, jqXHR]);
        }).error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var requestDeleteSurveyObject = function(data) {
        var deferred = $q.defer();

        $http.delete(routePrePath + "/survey/"+data, deleteConfiguration).success(function(data, textStatus, jqXHR) {
            deferred.resolve([data, textStatus, jqXHR]);
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

        doGetSession:requestSessionObject,
        goGetSurveysForSpace: requestSurveysForSpace,
        doGetEvents: requestEventListObject,
        doGetSessionsForSpaceAndRoom: requestSessionsForSpaceAndRoom,
        doGetEventsForSpaceAndRoom: requestEventsForSpaceAndRoom,
        doGetStudies: requestStudyListObject,
        doGetRoomsForSpace: requestRoomsForSpace,
        doNewStudy: requestNewStudyObject,
        doDeleteStudy: requestDeleteStudyObject,
        doCreateStudyRoom: requestAddStudyRoomObject,
        doDeleteRoom: requestDeleteRoomObject,
        doUpdateRoomStartCoordinates: requestUpdateRoomStartCoordinatesObject,
        doUpdateRoomEndCoordinates: requestUpdateRoomEndCoordinatesObject,
        doGetActions: requestListActionsObject,
        doUpdateSpaceActions: requestUpdateSpaceActionsObject,
        doNewAction: requestNewActionObject,
        doGetResources: requestListResourcesObject,
        doUpdateSpaceResources: requestUpdateSpaceResourcesObject,
        doNewResource: requestNewResourceObject,
        doNewSurvey: requestNewSurveyObject,
        doNewQuestion: requestNewQuestionObject,
        doDeleteQuestion: requestDeleteQuestionObject,
        doDeleteSurvey: requestDeleteSurveyObject
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

    var userLogin = function(data, def) {
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
            userLogin(data, deferred);
        //    deferred.resolve(data);
        }).error(function(data, status){
                alert( "Request failed: " + data.message );
                deferred.reject();
            });

        return deferred.promise;
    }

    return {
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