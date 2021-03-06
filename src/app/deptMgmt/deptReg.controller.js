(function() {
	'use strict';

	angular
		.module('snsoftHr')
		.controller('DeptRegController', DeptRegController);

	/** @ngInject */
	function DeptRegController($log, $window, $cookies, $state, $stateParams, deptServ, userServ, toastr, AuthService, mongoServ) {
		var vm = this;
		var id = 4;

		var dynTemplate = {
      "name": {
        "fieldName": "Department",
        "type": "text",
        "inputType": "textbox",
        "glyphClass": "glyphicon glyphicon-user",
        "placeholder": "Enter a department name",
        "value": "test",
        "forEdit": "false"
      },
      "head": {
        "fieldName": "Head",
        "type": "text",
        "inputType": "selectUser",
        "glyphClass": "glyphicon glyphicon-user",
        "placeholder": "",
        "value": "test",
        "forEdit": "true"
      }
    };

		// var hiddenFields = ['position'];
    var hiddenFields = ['position', 'lastModified','_id','status'];

		vm.dynFields = dynTemplate;
		vm.editMode = false;
		vm.inputs = [];
		vm.title = "New Department Registration"

		vm.newDept = newDept;
		vm.newField = newField;
		vm.checkViewPermission = checkViewPermission;

		// Edit Mode
		if (angular.isObject($stateParams.myParam)) {
      var objDept = $stateParams.myParam;
      var i = 0;

      vm.editMode = true;
      vm.title = "Edit Department Information";

      for (var field in objDept) {
        if(vm.dynFields.hasOwnProperty(field)) {
          vm.inputs[field] = objDept[field];
        } else {
          if (hiddenFields.indexOf(field) < 0) {
            vm.dynFields[field] = {
              "fieldName": field,
              "type": "text",
              "inputType": "textbox",
              "glyphClass": "glyphicon glyphicon-list-alt"
            };

            vm.inputs[field] = objDept[field];
          }
        }

        i++;
      }
    }

		// Load users as select options
		userServ.getAllUsers().then(function(users){
			vm.users = users;
		});

		function newDept () {
			var i = 0;
      var fields = {};

      // Get dynamic fields
      for (var field in vm.dynFields) {
        fields[field] = vm.inputs[field];
        i++;
      }

      if (vm.editMode)
      {
        deptServ.editDept(fields).then(function(response){
          toastr.success('Sucessfully edit department', 'Success');
          $state.go('deptMgmt');
        })
       .then(function(){
          mongoServ.editDept(fields);
        })
      } else {
        deptServ.addDept(fields).then(function(response){
          toastr.success('Sucessfully added department', 'Success');
					$state.go('deptMgmt');
        })


      }
		}

		function newField() {
      vm.dynFields[angular.lowercase(vm.newName)] = {
        "fieldName": vm.newName,
        "type": "text",
        "inputType": "textbox",
        "glyphClass": "glyphicon glyphicon-list-alt"
      };
     }

    function checkViewPermission()
    {

      if($cookies.getObject('loggedInUser')){
        var username = $cookies.getObject('loggedInUser').username;

        AuthService.checkPermission(username,id).then(
          function(data){
            vm.isAllowed = data;
          },
          function(err) {
            $log.info(err);
          }
        );
      }
      else
        $log.info("cookies not exist");
    }
    checkViewPermission();
	}
})();
