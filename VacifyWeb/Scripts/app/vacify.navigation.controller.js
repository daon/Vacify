(function (angular) {
    'use strict';

    angular
        .module('vacify')
        .controller('Navigation', Navigation);

    Navigation.$inject = ['spHostUrl'];

    function Navigation(spHostUrl) {
        var vm = this;

        vm.spHostUrl = spHostUrl;
        vm.test = "Test";
    }

})(window.angular);