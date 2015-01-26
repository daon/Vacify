(function (angular) {
    'use strict';

    angular
        .module('vacify')
        .filter('moment', momentFilter);


    function momentFilter() {
        return function (momentObj, format) {
            return momentObj.format(format);
        }
    }

})(window.angular);