 (function() {
  'use strict';

  angular
      .module('snsoftHr')
      .service('leaveServ', leaveServ);

  /** @ngInject */
  function leaveServ($q, $log, $cookies, localdb, mongoServ) {
    //// Function Declaration
    this.addLeave = addLeave;
    this.getLeaveByUsername = getLeaveByUsername;
    this.getPendingApprovalLeaveByUsername = getPendingApprovalLeaveByUsername;
    this.approveLeave = approveLeave;
    this.getPendingApprovalLeaveByDepartment = getPendingApprovalLeaveByDepartment;

    //// Local Variable Declaration
    var DB_STORENAME = 'leave';

    // Get Leaves By Username
    // Param    - Username
    // Resolve  - Users object
    function getLeaveByUsername(username) {
      var deferred = $q.defer();

      var singleKeyRange = IDBKeyRange.only(username);

      var request =
        localdb.getObjectStore(DB_STORENAME, 'readonly')
        .index('user')
        .getAll(singleKeyRange);

      request.onerror = function() {
        $log.info("Open ObjectStore Error!");
      };
      // Do something when all the data is added to the database.
      request.onsuccess = function(event) {
        var value = event.target.result;
        console.log('leaveServ run 1 times');
        if (value) {
          // logic-> update data without objectid,
          // then fetch the latest data into it.
          
          // mongoServ.addLeaves(leaveData)
          // .success(function(data){
          // });
          mongoServ.syncLeaveByUsername([], value)
          .then(function(data){
 
              var indexDBNotExist = data.indexDBNotExist;
              var mongoDBtimeNotMatch = data.mongoDBtimeNotMatch;

              for(var idb in indexDBNotExist){
                // insert no exist record(from mongo) to indexDB
                addLeave(indexDBNotExist[idb]);
              }

              for(var tnm in mongoDBtimeNotMatch){
                //update indexDB data, because the lastmodified date is different(compared to mongodb)
                editLeave(mongoDBtimeNotMatch[tnm]);
              }

            });
          deferred.resolve(value);
        } else {
          deferred.reject("Leave not exist!");
        }
      };

      return deferred.promise;
    }

    // Add New Leave
    // Param    - New Leave JSON object
    // Resolve  - Success Message
    function addLeave(objLeave) {
      var deferred = $q.defer();

      // Set Leave as Pending
      objLeave.status = "Pending";
      var username = $cookies.getObject('loggedInUser').username;
      objLeave.indexID = username+"-"+new Date().getTime();

      var request =
        localdb.getObjectStore(DB_STORENAME, 'readwrite')
        .add(objLeave);

      request.onerror = function(event) {
        // Add leave trasaction - Error
        $log.debug("Transaction error: ", event);
        deferred.reject();
      };
      request.onsuccess = function() {
        deferred.resolve("Leave applied.")
        // Add leave to mongodb
        // mongoServ.addLeave(objLeave)
        // .success(function(data){
        //   objLeave.objectID = data.objectID;
        // });
      };

      return deferred.promise;
    }

    function editLeave(objLeave){
      var deferred = $q.defer();
      var indexID = objLeave.indexID;

      var request = localdb.getObjectStore(DB_STORENAME, 'readwrite')
        .put(objLeave);

      request.onerror = function(event) {
        // Add leave trasaction - Error
        $log.debug("Transaction error: ", event);
        deferred.reject();
      };
      request.onsuccess = function() {
        deferred.resolve("Leave applied.")
        // Add leave to mongodb
        // mongoServ.addLeave(objLeave)
        // .success(function(data){
        //   objLeave.objectID = data.objectID;
        // });
      };
      return deferred.promise; 
    }



    // get pending approval leave by username
    // Param    - username
    // Resolve  - leave objects array
    function getPendingApprovalLeaveByUsername(username) {
      var deferred = $q.defer();

      var singleKeyRange = IDBKeyRange.only(username);
      var request = 

        localdb.getObjectStore(DB_STORENAME, 'readonly')
        .index('approvalBy')
        .getAll(singleKeyRange);

      request.onerror = function() {
        $log.info("Open ObjectStore Error!");
      };
      request.onsuccess = function(event) {
        var value = event.target.result;
        if (value) {
          // mongoServ.getPendingApprovalLeaveByUsername(username)
          deferred.resolve(value);
        } else {
          deferred.reject("Leave not exist!");
        }
      };

      return deferred.promise;
    }

    // get pending approval leave by department
    // Param    - department
    // Resolve  - leave objects array
    function getPendingApprovalLeaveByDepartment(dept) {
      return new Promise(function(resolve, reject) {
        var singleKeyRange = IDBKeyRange.only(dept);

        var request =
          localdb.getObjectStore(DB_STORENAME, 'readonly')
            .index('department')
            .getAll(singleKeyRange);

        request.onerror = function() {
          $log.info("Open ObjectStore Error!");
        };

        request.onsuccess = function(event) {
          var value = event.target.result;

          if (value) {
            resolve(value);
          } else {
            reject("Leave not exist!");
          }
        };
      });
    }

    // approve
    // Param    - username
    // Resolve  - leave objects array
    function approveLeave(leaveId) {
      //var deferred = $q.defer();
      $log.info("leaveId", leaveId)
      // var singleKeyRange = IDBKeyRange.only(username);

      // var request =
      //   localdb.getObjectStore(DB_STORENAME, 'readonly')
      //   .index('approvalBy')
      //   .getAll(singleKeyRange);

      // request.onerror = function() {
      //   $log.info("Open ObjectStore Error!");
      // };
      // request.onsuccess = function(event) {
      //   var value = event.target.result;

      //   if (value) {
      //     deferred.resolve(value);
      //   } else {
      //     deferred.reject("Leave not exist!");
      //   }
      // };

      //return deferred.promise;
    }
  }
})();
