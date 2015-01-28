(function (angular, moment) {
    'use strict';

    angular
        .module('vacify')
        .filter('moment', momentFilter);


    function momentFilter() {
        return function (obj, format) {
            return moment.isMoment(obj) ? obj.format(format) : '';
        }
    }

})(window.angular, window.moment);