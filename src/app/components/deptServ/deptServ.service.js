 (function() {
  'use strict';

  angular
      .module('snsoftHr')
      .service('deptServ', deptServ);

  /** @ngInject */
  function deptServ($q, $log, localdb) {
    // Function Declaration
    this.getAllDepartments = getAllDepartments;
    this.addDept = addDept;

    var DB_STORENAME = 'department';

    function getAllDepartments() {
      var deferred = $q.defer();
      
      var departments = [];

      var request = 
        localdb.getObjectStore(DB_STORENAME, 'readonly')
        .openCursor();

      request.onerror = function() {
        $log.info("Open Cursor Error!");
        deferred.reject();
      };    
      // Do something when all the data is added to the database.
      request.onsuccess = function(event) {
        var cursor = event.target.result;

        if (cursor) {
          departments.push(cursor.value);
          cursor.continue();
        }
        else {
          deferred.resolve(departments);
        }
      };

      return deferred.promise;
    }

    // Add New Department
    // Param - New Department JSON object
    // Promise Return - Success Message
    function addDept (objDept) {
      var deferred = $q.defer();

      // Let new department be active
      objDept.status = "Active";

      var request = 
        localdb.getObjectStore(DB_STORENAME, 'readwrite')
        .add(objDept);

      request.onerror = function(event) {
        // Add department trasaction - Error
        alert("Transaction error: " + event.target.errorCode);
        deferred.reject();
      }; 

      // Do something when all the data is added to the database.
      request.onsuccess = function() {
        deferred.resolve("Successfully added department.")
      };

      return deferred.promise;
    }
  }
})();