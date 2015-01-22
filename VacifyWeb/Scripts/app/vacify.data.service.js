(function (angular) {
    'use strict';

    angular
        .module('vacify')
        .factory('dataService', dataService);

    dataService.$inject = ['$http', '$q', 'spHostUrl'];

    function dataService($http, $q, spHostUrl) {
        var service = {
            getVacationRequests: getVacationRequests,
            requestVacation: requestVacation
        };

        return service;

        function getVacationRequests() {
            return $http.get('Home/GetVacationRequests?SPHostUrl=' + encodeURIComponent(spHostUrl));
        }

        function requestVacation(vacationRequests) {
            return $http.post('Home/RequestVacation?SPHostUrl=' + encodeURIComponent(spHostUrl), vacationRequests);
        }
    }

})(window.angular);