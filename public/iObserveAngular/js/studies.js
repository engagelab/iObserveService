/**
 * Created with JetBrains RubyMine.
 * User: jeremyt
 * Date: 7/1/13
 * Time: 9:15 AM
 * To change this template use File | Settings | File Templates.
 */
iObserveApp.controller('StudiesCtrl', function($scope, $dialog, iObserveStates, iObserveData, iObserveUtilities) {
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
    $scope.uploadResponse = "nothing";
    $scope.isEditRoomCollapsed = true;
    $scope.roomToEdit = null;

    $scope.roomSubmited = function(content, completed) {
        if(completed) {
            $scope.uploadResponse = content;
            if($scope.uploadResponse._id != "") {
                iObserveData.doCreateStudyRoom({spaceid: $scope.currentStudy._id, label: getRoomLabel(), uri: $scope.uploadResponse.url}).then(function(resultData) {
                    if(resultData._id != "") {
                        $scope.studies = iObserveData.doGetStudies();
                        $scope.isAddRoomCollapsed = true;
                        $scope.isStudyChosen = false;
                    }
                });
            }

        }
    };

    function getRoomLabel() {
        if($scope.roomLabel != "") {
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

    $scope.unfoldSessions = function($study) {
        $scope.currentStudy = $study;
        $scope.isStudyChosen = true;

        $scope.rooms = $scope.currentStudy.rooms;
        $scope.sessions = $scope.currentStudy.sessionobs;
    };

    $scope.createNewStudy = function() {
        if($scope.studyLabel != "") {
            var data = {label : $scope.studyLabel};
            iObserveData.doNewStudy(data).then(function(resultData) {
                $scope.studies = iObserveData.doGetStudies();
            });

            $scope.studyLabel = '';
        }
        $scope.isAddStudyCollapsed = true;
    };

    $scope.openRemoveStudy = function($selectedStudy){
        $scope.studyToDelete = $selectedStudy;

        var title = 'Are you sure to delete this study?';
        var msg = 'Please note that all session data for this study will be also deleted.';
        var btns = [{result:'cancel', label: 'Cancel'}, {result:'ok', label: 'OK', cssClass: 'btn-primary'}];

        $dialog.messageBox(title, msg, btns).open().then(function(result) {
            if(result == "ok") {
                iObserveData.doDeleteStudy($selectedStudy._id).then(function(resultData) {
                    $scope.studies = iObserveData.doGetStudies();
                    $scope.isStudyChosen = false;
                });
            }
            else {
                //operation cancelled
            }
        });
    };

    $scope.openRemoveRoom = function($selectedRoom){
        $scope.roomToDelete = $selectedRoom;

        var title = 'Are you sure to delete this room?';
        var msg = 'Please note that sessions will not be using this room to map anymore.';
        var btns = [{result:'cancel', label: 'Cancel'}, {result:'ok', label: 'OK', cssClass: 'btn-primary'}];

        $dialog.messageBox(title, msg, btns).open().then(function(result) {
            if(result == "ok") {
                iObserveData.doDeleteRoom($selectedRoom._id).then(function(resultData) {
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

    $scope.openEditRoom = function($selectedRoom) {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        $scope.roomToEdit = $selectedRoom;
    };

    $scope.list1 = {'emage': 'pin.png'};
    $scope.list2 = {};

    $scope.startCallback = function(event, ui) {
        console.log('You started draggin');
    };

    $scope.stopCallback = function(event, ui) {
        console.log('Why did you stop draggin me?');
    };

    $scope.dragCallback = function(event, ui) {
        console.log('hey, look I`m flying');
    };

    $scope.dropCallback = function(event, ui) {
        console.log('hey, you dumped me :-(');
    };

    $scope.overCallback = function(event, ui) {
        console.log('Look, I`m over you');
    };

    $scope.outCallback = function(event, ui) {
        console.log('I`m not, hehe');
    };

});