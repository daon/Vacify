(function (angular) {
    'use strict';

    angular
        .module('vacify')
        .factory('vacationRequest', vacationRequest);

    vacationRequest.$inject = ['$http', '$q'];

    function vacationRequest($http, $q) {
        var service = {
            get: get,
            save: save
        };

        return service;

        function get() {
            return $http.get('Home/GetVacationRequests');
        }

        function save(vacationRequests) {
            return $http.post('Home/SaveVacationRequests', vacationRequests);
        }
    }

})(window.angular);