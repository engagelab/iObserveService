iObserveApp.controller('NavCtrl', function($scope, iObserveStates) {

    showHideNavTabs(false);

    function showHideNavTabs(loginState) {
        if(loginState) {
            $scope.tabs = [
                { title:"iObserve", content:"", active: true },
                { title:"Profile", content:"" },
                { title:"Studies", content:"" },
                { title:"Statistics", content:"" },
                { title:"About", content:"" },
                { title:"Logout", content:"" }
            ];
        }
        else {
            $scope.tabs = [
                { title:"iObserve", content:"", active: true },
                { title:"About", content:"" },
                { title:"Login", content:"" },
                { title:"Register", content:""}
            ];
        }
    }

    $scope.activateTab = function() {
        var navState = $scope.tabs.filter(function(tab){
            return tab.active;
        })[0].title;
        return navState;
    }

    $scope.loginState = iObserveStates.getLoginState;
    $scope.$watch('loginState()', function(loginState) {
        showHideNavTabs(loginState);
    }, true);

    $scope.$watch('activateTab()', function(navState) {
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
