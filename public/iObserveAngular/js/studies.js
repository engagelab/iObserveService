/**
 * Created with JetBrains RubyMine.
 * User: jeremyt
 * Date: 7/1/13
 * Time: 9:15 AM
 * To change this template use File | Settings | File Templates.
 */
iObserveApp.directive('jerDraggable', function() {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            var options = scope.$eval(attrs.jerDraggable);
            elm.draggable(options);
        }
    };
});

iObserveApp.controller('StudiesCtrl', function ($scope, $dialog, iObserveStates, iObserveData, iObserveUtilities) {
    $scope.isAddStudyCollapsed = true;
    $scope.isAddRoomCollapsed = true;
    $scope.isStudyChosen = false;
    $scope.currentStudy = null;
    $scope.rooms = null;
    $scope.sessions = null;
    $scope.studyLabel = "";
    $scope.roomLabel = "";
    $scope.studyToDelete = null;
    $scope.roomToDelete = null;
    $scope.uploadResponse = "";
    $scope.isEditRoomCollapsed = true;
    $scope.roomToEdit = null;
    $scope.roomStartPoints = null;
    $scope.roomEndPoints = null;

    $scope.roomSubmited = function (content, completed) {
        if (completed) {
            $scope.uploadResponse = content;
            if ($scope.uploadResponse._id != "") {
                iObserveData.doCreateStudyRoom({spaceid: $scope.currentStudy._id, label: getRandomUUID(), uri: $scope.uploadResponse.url}).then(function (resultData) {
                    if (resultData._id != "") {
                        $scope.studies = iObserveData.doGetStudies();
                        $scope.isAddRoomCollapsed = true;
                        $scope.isStudyChosen = false;
                    }
                });
            }

        }
    };

    function getRandomUUID() {
        if ($scope.roomLabel != "") {
            return $scope.roomLabel;
        }
        else {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }
    }

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };

    iObserveData.setUserId(iObserveStates.getUserId());
    $scope.studies = iObserveData.doGetStudies();

    $scope.timeConverter = iObserveUtilities.timeConverter;
    $scope.tDiff = iObserveUtilities.tDiff;

    $scope.unfoldSessions = function ($study) {
        $scope.currentStudy = $study;
        $scope.isStudyChosen = true;

        $scope.rooms = $scope.currentStudy.rooms;
        $scope.sessions = $scope.currentStudy.sessionobs;

        iObserveData.doGetActions().then(function (resultData) {

            var actionsIds = [];
            for(var j=0; j<$scope.currentStudy.actions.length; j++) {
                actionsIds.push($scope.currentStudy.actions[j]._id);
            }

            $scope.allActions = [];
            $scope.spaceActions = [];

            for(var i=0; i<resultData.length; i++) {
                if(actionsIds.indexOf(resultData[i]._id) > -1) {
                    $scope.spaceActions.push(resultData[i]);
                }
                else {
                    $scope.allActions.push(resultData[i]);
                }
            }
        });
    };

    $scope.createNewStudy = function () {
        if ($scope.studyLabel != "") {
            var data = {label: $scope.studyLabel};
            iObserveData.doNewStudy(data).then(function (resultData) {
                $scope.studies = iObserveData.doGetStudies();
            });

            $scope.studyLabel = '';
        }
        $scope.isAddStudyCollapsed = true;
    };

    $scope.openRemoveStudy = function ($selectedStudy) {
        $scope.studyToDelete = $selectedStudy;

        var title = 'Are you sure to delete this study?';
        var msg = 'Please note that all session data for this study will be also deleted.';
        var btns = [
            {result: 'cancel', label: 'Cancel'},
            {result: 'ok', label: 'OK', cssClass: 'btn-primary'}
        ];

        $dialog.messageBox(title, msg, btns).open().then(function (result) {
            if (result == "ok") {
                iObserveData.doDeleteStudy($selectedStudy._id).then(function (resultData) {
                    $scope.studies = iObserveData.doGetStudies();
                    $scope.isStudyChosen = false;
                });
            }
            else {
                //operation cancelled
            }
        });
    };

    $scope.openRemoveRoom = function ($selectedRoom) {
        $scope.roomToDelete = $selectedRoom;

        var title = 'Are you sure to delete this room?';
        var msg = 'Please note that sessions will not be using this room to map anymore.';
        var btns = [
            {result: 'cancel', label: 'Cancel'},
            {result: 'ok', label: 'OK', cssClass: 'btn-primary'}
        ];

        $dialog.messageBox(title, msg, btns).open().then(function (result) {
            if (result == "ok") {
                iObserveData.doDeleteRoom($selectedRoom._id).then(function (resultData) {
                    console.log(resultData);
                    $scope.studies = iObserveData.doGetStudies();
                    $scope.isStudyChosen = false;
                    $scope.roomToDelete = null;
                });
            }
            else {
                $scope.roomToDelete = null;
            }
        });
    };

    $scope.openEditRoom = function ($selectedRoom) {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        $scope.roomToEdit = $selectedRoom;
        $scope.roomStartPoints = $scope.roomToEdit.start_points;
        $scope.roomEndPoints = $scope.roomToEdit.end_points;
    };

    $scope.showhideEditMode = function () {

        if($scope.roomStartPoints.length > 0 && $scope.roomEndPoints.length > 0) {
            var newSPoints = new Array();

            var look = angular.element.find('.startPoint');
            for(var i=0; i<look.length; i++) {
                newSPoints.push({uuid: look[i].id, rotation: getStartObjectRotation(look[i].id), xpos: Number((look[i].style.left).replace("px","")), ypos: Number((look[i].style.top.replace("px","")))});
            }
            $scope.roomToEdit.start_points = newSPoints;

            var data = {_id: $scope.roomToEdit._id, start_points: $scope.roomToEdit.start_points };
            iObserveData.doUpdateRoomStartCoordinates(data).then(function (resultData) {
                var newEPoints = new Array();

                var look = angular.element.find('.endPoint');
                for(var i=0; i<look.length; i++) {
                    newEPoints.push({uuid: look[i].id, rotation: getEndObjectRotation(look[i].id), xpos: Number((look[i].style.left).replace("px","")), ypos: Number((look[i].style.top.replace("px","")))});
                }
                $scope.roomToEdit.end_points = newEPoints;

                var data = {_id: $scope.roomToEdit._id, end_points: $scope.roomToEdit.end_points};
                iObserveData.doUpdateRoomEndCoordinates(data).then(function (resultData) {
                    $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
                });

            });
        }
        else {

            var title = 'Missing start or end coordinates';
            var msg = 'Please make sure to add at least one start point (green arrow) and one end point (red arrow), before saving.';
            var btns = [
                {result: 'ok', label: 'OK', cssClass: 'btn-primary'}
            ];

            $dialog.messageBox(title, msg, btns).open();
        }
    }

    function getStartObjectRotation(uid) {

        for(var i in $scope.roomToEdit.start_points){
            if($scope.roomToEdit.start_points[i].uuid == uid){
                return $scope.roomToEdit.start_points[i].rotation;
                break;
            }
        }
    };

    function getEndObjectRotation(uid) {

        for(var i in $scope.roomToEdit.end_points){
            if($scope.roomToEdit.end_points[i].uuid == uid){
                return $scope.roomToEdit.end_points[i].rotation;
                break;
            }
        }
    };

    $scope.addStartPoint = function () {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        $scope.roomToEdit.start_points.push({uuid: getRandomUUID(),xpos: 1024/2, ypos: 768/2, rotation: 0});
        $scope.openEditRoom($scope.roomToEdit);
    };

    $scope.addEndPoint = function () {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        $scope.roomToEdit.end_points.push({uuid: getRandomUUID(),xpos: 1024/2, ypos: 768/2, rotation: 0});
        $scope.openEditRoom($scope.roomToEdit);
    };

    $scope.removeStartPoint = function ($uid) {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        for(var i in $scope.roomToEdit.start_points){
            if($scope.roomToEdit.start_points[i].uuid == $uid){
                $scope.roomToEdit.start_points.splice(i,1);
                break;
            }
        }
        $scope.openEditRoom($scope.roomToEdit);
    };

    $scope.removeEndPoint = function ($uid) {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        for(var i in $scope.roomToEdit.end_points){
            if($scope.roomToEdit.end_points[i].uuid == $uid){
                $scope.roomToEdit.end_points.splice(i,1);
                break;
            }
        }
        $scope.openEditRoom($scope.roomToEdit);
    };

    $scope.rotateStartPoint = function ($uid) {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        for(var i in $scope.roomToEdit.start_points){
            if($scope.roomToEdit.start_points[i].uuid == $uid){
                $scope.roomToEdit.start_points[i].rotation = $scope.roomToEdit.start_points[i].rotation + 90;
                if($scope.roomToEdit.start_points[i].rotation >= 360) {
                    $scope.roomToEdit.start_points[i].rotation = 0;
                }
                break;
            }
        }
        $scope.openEditRoom($scope.roomToEdit);
    };

    $scope.rotateEndPoint = function ($uid) {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        for(var i in $scope.roomToEdit.end_points){
            if($scope.roomToEdit.end_points[i].uuid == $uid){
                $scope.roomToEdit.end_points[i].rotation = $scope.roomToEdit.end_points[i].rotation + 90;
                if($scope.roomToEdit.end_points[i].rotation >= 360) {
                    $scope.roomToEdit.end_points[i].rotation = 0;
                }
                break;
            }
        }
        $scope.openEditRoom($scope.roomToEdit);
    };

    $scope.showActionSelector = function() {
        $scope.showSpaceActions = true;
    };

    $scope.closeSpaceActions = function() {
        $scope.showSpaceActions = false;
    };

    $scope.closeAndSaveSpaceActions = function() {
        var data = {_id: $scope.currentStudy._id, actions: $scope.spaceActions};
        iObserveData.doUpdateSpaceActions(data).then(function (resultData) {
            $scope.showSpaceActions = false;
        });
    };
});