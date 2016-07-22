angular.module('smartmeetApp.directives')
    //Factory Serice for getting all API list data.
    .factory('APIServiceFactory', ['$http', 'ENV', '$cacheFactory', function($http, ENV, $cacheFactory) {
        var serviceResult = {};
        serviceResult.getAPIResult = function(_url){
            $cacheFactory.get('$http').removeAll();
            return $http({  
                url: _url,
                cache: false,
                headers: { "Accept": "application/json;odata=verbose" },
                timeout: 20000
            });  
        };
        return serviceResult;
    }])
    //Factory to use underscore js functions
    .factory('underscore', function() {
      return window._;
    });