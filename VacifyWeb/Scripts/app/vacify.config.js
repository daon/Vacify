(function (angular) {
    'use strict';

    angular
        .module('vacify')
        .config(httpConfig);
    
    httpConfig.$inject = ['$httpProvider', 'spHostUrl'];

    function httpConfig($httpProvider, spHostUrl) {
        $httpProvider.interceptors.push(requestInterceptor);
    }

    requestInterceptor.$inject = ['$q', '$templateCache', 'spHostUrl'];

    function requestInterceptor($q, $templateCache, spHostUrl) {
        return {
            'request': function (request) {
                if (angular.isUndefined($templateCache.get(request.url))) {
                    request.url = request.url + '?SPHostUrl=' + encodeURIComponent(spHostUrl);
                }
                return request || $q.when(request);
            }
        }
    }

})(window.angular);