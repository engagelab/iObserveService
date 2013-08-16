/**
 * Created with JetBrains RubyMine.
 * User: jeremyt
 * Date: 7/1/13
 * Time: 9:15 AM
 * To change this template use File | Settings | File Templates.
 */
iObserveApp.directive('poiDraggable', function() {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            var options = scope.$eval(attrs.poiDraggable);
            elm.draggable(options);
        }
    };
});

iObserveApp.controller('StudiesCtrl', function ($scope, $dialog, iObserveStates, iObserveData, iObserveUtilities, $modal) {
    $scope.isAddStudyCollapsed = true;
    $scope.isAddSurveyCollapsed = true;
    $scope.isAddRoomCollapsed = true;
    $scope.isStudyChosen = false;
    $scope.currentStudy = null;
    $scope.currentSurvey = null;
    $scope.rooms = null;
    $scope.surveys = null;
    $scope.sessions = null;
    $scope.studyLabel = "";
    $scope.surveyLabel = "";
    $scope.roomLabel = "";
    $scope.studyToDelete = null;
    $scope.roomToDelete = null;
    $scope.uploadResponse = "";
    $scope.isEditRoomCollapsed = true;
    $scope.roomToEdit = null;
    $scope.roomStartPoints = null;
    $scope.roomEndPoints = null;
    $scope.isAddActionCollapsed = true;
    $scope.actionLabel = "";
    $scope.isAddResourceCollapsed = true;
    $scope.resourceLabel = "";
    $scope.isWrongImageSize = true;


    $scope.file_changed = function(element, $scope) {
        var f = element.files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image;
            img.onload = function() {
                console.log(img.width + " " + img.height);
                if(img.width == 1024 && img.height == 723) {
                    console.log('image dimensions OK');
                }
                else {
                    (angular.element.find('#imageUploaderForm'))[0].reset();
                }
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(f);
    };

    function getID() {
        if ($scope.roomLabel != "") {
            return $scope.roomLabel;
        }
        else {
            return iObserveUtilities.getRandomUUID();
        }
    };

    $scope.roomSubmited = function (content, completed) {
        if (completed) {
            $scope.uploadResponse = content;
            if ($scope.uploadResponse._id != "") {
                iObserveData.doCreateStudyRoom({spaceid: $scope.currentStudy._id, label: getID(), uri: $scope.uploadResponse.url}).then(function (resultData) {
                    if (resultData._id != "") {
                        $scope.studies = iObserveData.doGetStudies();
                        $scope.isAddRoomCollapsed = true;
                        $scope.isStudyChosen = false;
                        $scope.roomLabel = "";
                        (angular.element.find('#imageUploaderForm'))[0].reset();
                    }
                });
            }

        }
    };

    iObserveData.setUserId(iObserveStates.getUserId());
    $scope.studies = iObserveData.doGetStudies();

    $scope.timeConverter = iObserveUtilities.timeConverter;
    $scope.tDiff = iObserveUtilities.tDiff;


    $scope.refreshSurveys = function() {
        $scope.survey = $scope.surveys[0];
        if($scope.surveys.length == 0) {
            (angular.element.find('#surveyEditDiv'))[0].style.visibility = "hidden";
        }
        else {
            (angular.element.find('#surveyEditDiv'))[0].style.visibility = "visible";
            $scope.editSurvey($scope.survey);
        }
    };

    $scope.unfoldSessions = function ($study) {
        $scope.currentStudy = $study;
        $scope.isStudyChosen = true;
        $scope.isSpaceActionsEmpty = true;
        $scope.isSpaceResourcesEmpty = true;
        $scope.surveys = $scope.currentStudy.surveys;

        $scope.refreshSurveys();

        $scope.rooms = $scope.currentStudy.rooms;

        $scope.sessions = $scope.currentStudy.sessionobs;

        // let's remove the unfinished sessions from the result
        for(var k=0; k<$scope.sessions.length; k++) {
            if($scope.sessions[k].finished_on == null) {
                $scope.sessions.splice(k,1);
            }
        }

        iObserveData.doGetActions().then(function (resultData) {

            var actionsIds = [];
            for(var j=0; j<$scope.currentStudy.actions.length; j++) {
                actionsIds.push($scope.currentStudy.actions[j]._id);
            }

            $scope.allActions = new Array();
            $scope.spaceActions = new Array();

            for(var i=0; i<resultData.length; i++) {
                if(actionsIds.indexOf(resultData[i]._id) > -1) {
                    $scope.spaceActions.push(resultData[i]);
                }
                else {
                    $scope.allActions.push(resultData[i]);
                }
            }

            if(actionsIds.length < 3) {
                $scope.isSpaceActionsEmpty = false;
            }
        });

        iObserveData.doGetResources().then(function (resultData) {

            var resourcesIds = [];
            for(var j=0; j<$scope.currentStudy.resources.length; j++) {
                resourcesIds.push($scope.currentStudy.resources[j]._id);
            }

            $scope.allResources = new Array();
            $scope.spaceResources = new Array();

            for(var i=0; i<resultData.length; i++) {
                if(resourcesIds.indexOf(resultData[i]._id) > -1) {
                    $scope.spaceResources.push(resultData[i]);
                }
                else {
                    $scope.allResources.push(resultData[i]);
                }
            }

            if(resourcesIds.length < 2) {
                $scope.isSpaceResourcesEmpty = false;
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

    $scope.createNewSurvey = function () {
        var data = null;
        if ($scope.surveyLabel != "") {
            data = {study_id: $scope.currentStudy._id,label: $scope.surveyLabel};
        }
        else {
            data = {study_id: $scope.currentStudy._id,label: getID()};
        }

        iObserveData.doNewSurvey(data).then(function (resultData) {
            $scope.studies = iObserveData.doGetStudies();
            $scope.isAddRoomCollapsed = true;
            $scope.isStudyChosen = false;
        });

        $scope.surveyLabel = '';
        $scope.isAddSurveyCollapsed = true;
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
        $scope.roomToEdit.start_points.push({uuid: getID(),xpos: 1024/2, ypos: 768/2, rotation: 0});
        $scope.openEditRoom($scope.roomToEdit);
    };

    $scope.addEndPoint = function () {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        $scope.roomToEdit.end_points.push({uuid: getID(),xpos: 1024/2, ypos: 768/2, rotation: 0});
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
            $scope.currentStudy.actions = $scope.spaceActions;
            $scope.showSpaceActions = false;

            if($scope.currentStudy.actions.length > 2) {
                $scope.isSpaceActionsEmpty = true;
            }
            else {
                $scope.isSpaceActionsEmpty = false;
            }
        });
    };

    $scope.removeActionFromSpace = function() {
        var selectBoxSpaceActions = angular.element.find('#spaceActionsList option:selected');

        for(var i=0; i < selectBoxSpaceActions.length; i++) {
            if(selectBoxSpaceActions[i].text != "START" && selectBoxSpaceActions[i].text != "STOP") {
                $scope.allActions.push($scope.spaceActions[selectBoxSpaceActions[i].index]);
                $scope.spaceActions.splice(selectBoxSpaceActions[i].index, 1);
            }
        }
    };

    $scope.addActionToSpace = function () {
        var selectBoxAllActions = angular.element.find('#allActionsList option:selected');

        for(var i=0; i < selectBoxAllActions.length; i++) {
            $scope.spaceActions.push($scope.allActions[selectBoxAllActions[i].index]);
            $scope.allActions.splice(selectBoxAllActions[i].index, 1);
        }
    };

    $scope.createNewAction = function() {
        if ($scope.actionLabel != "") {
            var data = {type: $scope.actionLabel};

            iObserveData.doNewAction(data).then(function(args) {
                var newAction = args[0];
                var statusCode = args[1];

                if(Number(statusCode) == 200) {
                    $scope.allActions.push(newAction);
                    $scope.currentStudy.actions.push(newAction);
                }

                $scope.actionLabel = '';
            });
        }
        $scope.isAddActionCollapsed = true;
    };

    $scope.showResourceSelector = function() {
        $scope.showSpaceResources = true;
    };

    $scope.closeSpaceResources = function() {
        $scope.showSpaceResources = false;
    };

    $scope.closeAndSaveSpaceResources = function() {
        var data = {_id: $scope.currentStudy._id, resources: $scope.spaceResources};
        iObserveData.doUpdateSpaceResources(data).then(function (resultData) {
            $scope.currentStudy.resources = $scope.spaceResources;
            $scope.showSpaceResources = false;

            if($scope.currentStudy.resources.length > 1) {
                $scope.isSpaceResourcesEmpty = true;
            }
            else {
                $scope.isSpaceResourcesEmpty = false;
            }
        });
    };

    $scope.removeResourceFromSpace = function() {
        var selectBoxSpaceResources = angular.element.find('#spaceResourcesList option:selected');

        for(var i=0; i < selectBoxSpaceResources.length; i++) {
            if(selectBoxSpaceResources[i].text != "NONE") {
                $scope.allResources.push($scope.spaceResources[selectBoxSpaceResources[i].index]);
                $scope.spaceResources.splice(selectBoxSpaceResources[i].index, 1);
            }
        }
    };

    $scope.addResourceToSpace = function () {
        var selectBoxAllResources = angular.element.find('#allResourcesList option:selected');

        for(var i=0; i < selectBoxAllResources.length; i++) {
            $scope.spaceResources.push($scope.allResources[selectBoxAllResources[i].index]);
            $scope.allResources.splice(selectBoxAllResources[i].index, 1);
        }
    };

    $scope.createNewResource = function() {
        if ($scope.resourceLabel != "") {
            var data = {type: $scope.resourceLabel};

            iObserveData.doNewResource(data).then(function(args) {
                var newResource = args[0];
                var statusCode = args[1];

                if(Number(statusCode) == 200) {
                    $scope.allResources.push(newResource);
                    $scope.currentStudy.resources.push(newResource);
                }

                $scope.resourceLabel = '';
            });
        }
        $scope.isAddResourceCollapsed = true;
    };

    /*$scope.viaService = function($survey) {
        var mscope = $scope.$new();
        mscope.salutation = $survey;
        mscope.name = 'World';

        // do something
        var modalPromise = $modal({
            template: 'partial/survey/surveyEditor.html',
            show: true,
            persist: false,
            backdrop: 'static',
            scope: mscope
        });
    };
    $scope.parentController = function(dismiss) {
        console.warn(arguments);
        // do something
        dismiss();
    };*/

    $scope.isSurveySelected = true;
    $scope.currentSelectedSurvey = undefined;


    $scope.editSurvey = function(s) {
        $scope.isSurveySelected = false;
        $scope.currentSelectedSurvey = s;
        $scope.formItemType = "";
    };

    $scope.getFormattedSurvey = function(s) {
        return 'Survey '+$scope.surveys.indexOf(s)+': '+$scope.timeConverter(s.created_on);
    };

    $scope.tfQuestion = undefined;
    $scope.taQuestion = undefined;
    $scope.rbQuestion = undefined;
    $scope.cbQuestion = undefined;
    $scope.formRadioButtonsList = new Array();
    $scope.formCheckBoxButtonsList = new Array();

    $scope.radioitem = $scope.formRadioButtonsList[0];

    $scope.formItemType = "";

    $scope.dropdown = [
        {text: 'Textfield', click: "addSelectedQuestion('tf')"},
        {text: 'Textarea', click: "addSelectedQuestion('ta')"},
        {text: 'RadioButtons', click: "addSelectedQuestion('rb')"},
        {text: 'Checkboxes', click: "addSelectedQuestion('cb')"}
    ];

    $scope.addSelectedQuestion = function(type) {
        switch(type) {
            case 'tf':
                $scope.formItemType='TextField';
                break;
            case 'ta':
                $scope.formItemType='TextArea';
                break;
            case 'rb':
                $scope.formItemType='RadioButtons';
                $scope.formRadioButtonsList = [];
                $scope.radioitem = $scope.formRadioButtonsList[0];
                break;
            case 'cb':
                $scope.formItemType='Checkboxes';
                $scope.formCheckBoxesList = [];
                break;
            default:
                $scope.formItemType='';
        }
    };

    $scope.addNewRadioButton = function(radioLabel) {
        var canAdd = true;
        for(var i=0;i<$scope.formRadioButtonsList.length;i++) {
            if(($scope.formRadioButtonsList)[i].label == radioLabel.toLowerCase()) {
                canAdd = false;
            }
        }

        if(radioLabel != "" && canAdd) {
            $scope.formRadioButtonsList.push({label: radioLabel.toLowerCase()});
            (angular.element.find('#formRadioButtonInput'))[0].text = "";
        }
    };

    $scope.addNewCheckBoxButton = function(checkboxLabel) {
        var canAdd = true;

        for(var i=0;i<$scope.formCheckBoxButtonsList.length;i++) {
            if(($scope.formCheckBoxButtonsList)[i].label == checkboxLabel.toLowerCase()) {
                canAdd = false;
            }
        }

        if(checkboxLabel != "" && canAdd) {
            $scope.formCheckBoxButtonsList.push({label: checkboxLabel.toLowerCase()});
            (angular.element.find('#formCheckBoxButtonInput'))[0].text = "";
        }
    };

    $scope.deleteRadioButton = function (selectedItem) {
        console.log(selectedItem.label);
    };


    $scope.postFormItem = function(formdata) {

        var data = {
            survey_id: $scope.currentSelectedSurvey._id,
            type: $scope.formItemType
        };

        var valid = false;
        switch($scope.formItemType) {

            case 'TextField':
                if(formdata != undefined && formdata != "") {
                    data.label = formdata;
                    valid = true;
                }

                break;
            case 'TextArea':
                if(formdata != undefined && formdata != "") {
                    data.label = formdata;
                    valid = true;
                }

                break;
            case 'RadioButtons':
                if(formdata != undefined && formdata != "" && $scope.formRadioButtonsList.length > 0) {
                    data.label = formdata;
                    data.options = $scope.formRadioButtonsList;
                    valid = true;
                }

                break;
            case 'Checkboxes':
                if(formdata != undefined && formdata != "" && $scope.formCheckBoxButtonsList.length > 0) {
                    data.label = formdata;
                    data.options = $scope.formCheckBoxButtonsList;
                    valid = true;
                }

                break;
        }

        if(valid) {
            iObserveData.doNewQuestion(data).then(function (args) {
                var acceptedQuestion = args[0];
                var statusCode = args[1];

                if(Number(statusCode) == 200) {
                    $scope.currentSelectedSurvey.questions.push(acceptedQuestion);
                    $scope.formItemType = "";
                }
            });
        }
    };

    $scope.deleteQuestion = function(quest_id) {

        iObserveData.doDeleteQuestion(quest_id).then(function (args) {
            var statusCode = args[1];

            if(Number(statusCode) == 200) {
                for(var i=0; i < ($scope.currentSelectedSurvey.questions).length; i++) {
                    if(quest_id == ($scope.currentSelectedSurvey.questions)[i]._id) {
                        $scope.currentSelectedSurvey.questions.splice(i, 1);
                    }
                }
            }
        });
    };

    $scope.deleteSurvey = function(survey_id) {

        iObserveData.doDeleteSurvey(survey_id).then(function (args) {
            var statusCode = args[1];

            if(Number(statusCode) == 200) {
                for(var i=0; i < ($scope.surveys).length; i++) {
                    if(survey_id == ($scope.surveys)[i]._id) {
                        $scope.surveys.splice(i, 1);
                    }
                }

                $scope.currentSelectedSurvey = undefined;
                $scope.refreshSurveys();

            }
        });
    };
});