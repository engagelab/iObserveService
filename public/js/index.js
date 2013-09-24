iObserveApp.controller('NavCtrl', function($scope, iObserveStates) {

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

    $scope.showHideNavTabs(false);

    $scope.checkSelectedTab = function(title) {
        $scope.showingSplashScreen = false;
        if(title == "Logout") {
            iObserveStates.doUserLogout();
            $scope.showHideNavTabs(false);
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

});


iObserveApp.controller('RegisterCtrl', function($scope, iObserveStates) {

    $scope.registerMe = function($event) {
        if(registrationValidated()) {
            var data = {last_name : $scope.user.lastName, first_name: $scope.user.firstName, email: $scope.user.email, password : $scope.user.password};
            iObserveStates.doUserRegistration(data).then(function(resultData) {
                $scope.resultData = resultData;
                var data = {login_id : $scope.resultData.login_id, password: $scope.resultData.password};
                iObserveStates.doUserLogin(data, null).then(function(resultData) {
                    $scope.resultData = resultData;
                    if($scope.resultData.token != null)
                        $scope.showHideNavTabs(true);
                });
            });
        }
    }

    function registrationValidated() {
        return true;
    }

})


iObserveApp.controller('AboutCtrl', function($scope, iObserveStates) {


})


iObserveApp.controller('LoginCtrl', function($scope, iObserveStates) {

$scope.logMeIn = function() {
    if(loginValidated()) {
        var data = {login_id : $scope.email, password: $scope.password};
        iObserveStates.doUserLogin(data, null).then(function(resultData) {
            $scope.resultData = resultData;
            if($scope.resultData.token != null)
                $scope.showHideNavTabs(true);
        });
    }
}

function loginValidated() {
    return true;
}

})

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

})

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
