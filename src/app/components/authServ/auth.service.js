(function(){

  angular
    .module('snsoftHr')
    .service('AuthService',AuthService);

  function AuthService($q,localdb,ProfileService,PermissionService){
    var allowPermission = [];
    var vm = this;
    this.getAllowPermission=function(username)
    {
      return ProfileService.getUser(username)
        .then(function(data){
          return PermissionService.getPermission(data.userGroup)
            .then (function(result){
              if(result){
                allowPermission = result.permissionList;
                return Promise.resolve(allowPermission);
              }
              else
                return Promise.reject("Invalid permission group!");
              
            },function(err) {
              return Promise.reject("Invalid permission group!");
            });
        }, function(err) {
          return Promise.reject("Invalid user!");
        });
    }

    this.checkPermission=function(username, id)
    {
      var deferred = $q.defer();

      //if(allowPermission.length == 0)
      //{
      vm.getAllowPermission(username).then(function(data){
        if(data.indexOf(id) !== -1) {
          deferred.resolve(true);
        }
        else {
          deferred.resolve(false);
        }
      }, function(err) {
        deferred.reject();
      });
      /* }
       else
       {
       if(allowPermission.indexOf(id) !== -1)
       deferred.resolve(true);
       else
       deferred.resolve(false);
       }*/

      return deferred.promise;
    }

    this.clearList=function()
    {
      allowPermission = [];
    }
  }
})();
