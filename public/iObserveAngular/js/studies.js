/**
 * Created with JetBrains RubyMine.
 * User: jeremyt
 * Date: 7/1/13
 * Time: 9:15 AM
 * To change this template use File | Settings | File Templates.
 */
iObserveApp.controller('StudiesCtrl', function($scope, $dialog, iObserveStates, iObserveData) {
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
    $scope.roomStartPoints = null;

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

    $scope.timeConverter = function($ts){
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
    };

    $scope.tDiff = function($a,$b) {
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

        /*var roomStartPoints = $scope.roomToEdit.start_points;
        var roomEndPoints = $scope.roomToEdit.end_points;

        $('#roomToEditLocs').empty();

        roomStartPoints.forEach(function(entry) {
           $('#roomToEditLocs').append("<div style='position: absolute; top: "+entry.ypos+"px; left: "+entry.xpos+"px'><img src='img/walkin.png'></div>");
        }); */

        $scope.roomStartPoints = $scope.roomToEdit.start_points;
    };

    $scope.showhideEditMode = function() {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
    }




});