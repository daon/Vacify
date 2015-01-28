(function (angular, moment) {
    'use strict';

    angular
        .module('vacify')
        .controller('EditModalInstance', EditModalInstance);

    EditModalInstance.$inject = ['$scope', '$modalInstance', 'request']

    function EditModalInstance($scope, $modalInstance, request) {
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
            vm.startDate = request.start.valueOf();
            vm.endDate = moment.isMoment(request.end) ? request.end.valueOf() : null;
            vm.minDate = request.start.valueOf();
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
            request.start = moment(vm.startDate);
            request.end = moment.isDate(vm.endDate) ? moment(vm.endDate) : null;
            $modalInstance.close(request);
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }
    }
})(window.angular, window.moment);