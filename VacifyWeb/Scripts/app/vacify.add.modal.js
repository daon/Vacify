﻿(function (angular, moment) {
    'use strict';

    angular
        .module('vacify')
        .controller('AddModalInstance', AddModalInstance);

    AddModalInstance.$inject = ['$scope','$modalInstance']

    function AddModalInstance($scope, $modalInstance) {
        var vm = this;
        vm.format = 'yyyy-MM-dd';
        vm.openStartDate = openStartDate;
        vm.openEndDate = openEndDate;
        vm.ok = ok;
        vm.cancel = cancel;

        $scope.$watch('vm.startDate', function (newValue, oldValue) {
            if (newValue != oldValue) {
                vm.minDate = newValue > vm.today ? newValue : vm.today;
            }
        });

        init();

        function init() {
            vm.today = new Date().getTime();
            vm.startDate = vm.today;
            vm.minDate = vm.today;
        }

        function openStartDate($event) {
            $event.preventDefault();
            $event.stopPropagation();

            vm.startDateOpened = true;
        }

        function openEndDate($event) {
            $event.preventDefault();
            $event.stopPropagation();

            vm.endDateOpened = true;
        }

        function ok() {
            var request = {
                title: "New Request",
                start: moment(vm.startDate),
                end: moment.isDate(vm.endDate) ? moment(vm.endDate) : null,
                status: "New",
                allDay: true
            }
            $modalInstance.close(request);
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }
    }
})(window.angular, window.moment);