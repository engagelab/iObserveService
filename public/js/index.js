iObserveApp.controller('NavCtrl', function($scope, iObserveStates, iObserveConfig) {

    $scope.showingSplashScreen = {showing: false};

    $scope.showHideNavTabs = function(loginState) {
        if(loginState) {
            $scope.tabs = [
                { title:"Profile", content:"", page: 'partial/profile.html' },
                { title:"Studies", content:"", page: 'partial/studies.html' },
                { title:"Statistics", content:"", page: 'partial/statistics.html' },
                { title:"About", content:"", page: 'partial/about.html', active: true },
                { title:"Logout", content:"", page: '' }
            ];
        }
        else {
            $scope.tabs = [
                { title:"About", content:"", page: 'partial/about.html', active: true },
                { title:"Login", content:"", page: 'partial/login.html' },
                { title:"Register", content:"", page: 'partial/register.html'}
            ];
        }
    }

    $scope.checkSelectedTab = function(title) {
        $scope.showingSplashScreen = false;
        if(title == "Logout") {
            $scope.logout();
        }
    };

    $scope.activeTab = function() {
        if($scope.showingSplashScreen.showing)
            return { title:"VisiTracker", content:"", page: 'partial/splash.html', active: true };
        else {
            return $scope.tabs.filter(function(tab){
                return tab.active;
            })[0];
        }
    };
    $scope.logout = function() {
        iObserveStates.doUserLogout();
        $scope.showHideNavTabs(false);
    }

    function init() {
        iObserveConfig.updateToken();
        iObserveStates.setShowHideNavTabsFn($scope.showHideNavTabs);
        if(iObserveStates.doGetLoginState())
            $scope.showHideNavTabs(true);
        else
            $scope.showHideNavTabs(false);
    }
    init();

});


iObserveApp.controller('RegisterCtrl', function($scope, iObserveStates) {

    $scope.registerMe = function($event) {
        if(registrationValidated()) {
            var data = {last_name : $scope.user.lastName, first_name: $scope.user.firstName, email: $scope.user.email, password : $scope.user.password};
            iObserveStates.doUserRegistration(data).then(function(resultData) {
                $scope.resultData = resultData;
                var data = {email : $scope.resultData.email, password: $scope.resultData.password};
                iObserveStates.doUserLogin(data, null).then(function(resultData) {
                    if(iObserveStates.getLoginState()) {
                        $scope.showHideNavTabs(true);
                    }
                });
            });
        }
    }

    function registrationValidated() {
        return true;
    }

});


iObserveApp.controller('AboutCtrl', function($scope, iObserveStates) {

    $scope.getLoginState = function () {
        return iObserveStates.doGetLoginState();
    }

});


iObserveApp.controller('LoginCtrl', function($scope, iObserveStates, iObserveUtilities) {

    $scope.logMeIn = function() {

        if(loginValidated()) {
            var data = {email : $scope.email, password: $scope.password};
            iObserveStates.doUserLogin(data, null).then(function(resultData) {
                if(iObserveStates.getLoginState()) {
                    $scope.showHideNavTabs(true);
                }
            });
        }
    }

    function loginValidated() {
        return true;
    }

});

iObserveApp.controller('ProfileCtrl', function($scope, iObserveStates) {

    $scope.userEdit = [{key:"first_name", name: "First Name", value:""},{key:"last_name", name: "Last Name", value:""},{key:"email", name: "Email", value:""},{key:"password", name: "Password", value:""}]

    function getProfile() {
        iObserveStates.doGetProfile().then(function(resultData) {
            $scope.user = resultData;
            $scope.userEdit[0].value = $scope.user.first_name;
            $scope.userEdit[1].value = $scope.user.last_name;
            $scope.userEdit[2].value = $scope.user.email;
            $scope.userEdit[3].value = $scope.user.password;
        });
    }

    $scope.updateProfile = function($event) {
            var data = {_id : iObserveStates.getUserId(), first_name: $scope.user.first_name, last_name: $scope.user.last_name, email: $scope.user.email, password: $scope.user.password};
            iObserveStates.doUpdateProfile(data).then(function(resultData) {
                $scope.user = resultData.user;
            });
    }


    if($scope.user == null) {
        getProfile();
    }

});

iObserveApp.controller('ModalCtrl', function($scope, $modal, $log, iObserveStates) {

    $scope.counter = "";

    $scope.open = function() {

        var modalInstance = $modal.open({
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                'counter': function() {
                    return $scope.counter;
                }
            }
        });

        modalInstance.result.then(function(command) {  // Run on close:
            }, function(command) {  // Run on dismissal:
            if(command == "logout")
                $scope.logout();
            else if(command == "extend")
                iObserveStates.doUserRenewLogin();
        });
    };

    iObserveStates.setShowTimerModal($scope.open);
});

iObserveApp.controller('ModalInstanceCtrl', function($scope, $timeout, $modalInstance, counter) {

    var timeCounter = 10;
    $scope.counter = counter;
    var countDownTimer;

    $scope.logout = function() {
        $modalInstance.dismiss('logout');
    };

    $scope.extend = function() {
        $modalInstance.dismiss('extend');
    };

    function onCDTimeout() {
        timeCounter--;
        $scope.counter = timeCounter.toString();
        if(timeCounter == 0) {
            $timeout.cancel(countDownTimer);
            $modalInstance.close('logout');
        }
        else
            startCDTimer();
    }

    function startCDTimer() {
        countDownTimer = $timeout(onCDTimeout, 1000);
    }
    startCDTimer();
});

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