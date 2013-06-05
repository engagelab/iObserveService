var iObserveApp = angular.module('iObserveApp', ['ngResource', 'ui.bootstrap']);

iObserveApp.controller('AppCtrl', function($scope) {

    var items = [
        {text: '<a href="/photos/1">Happy Kittens</a>', done: false},
        {text: '<a href="/photos/2">Profile</a>', done: true}
    ]

    $scope.items = items;



})