(function (angular) {
    'use strict';

    angular
        .module('vacify')
        .controller('AddModalInstance', AddModalInstance);

    AddModalInstance.$inject = ['$modalInstance']

    function AddModalInstance($modalInstance) {
        var vm = this;
        
        vm.todayStartDate = todayStartDate;
        vm.clearStartDate = clearStartDate;
        vm.openStartDate = openStartDate;
        vm.todayEndDate = todayEndDate;
        vm.clearEndDate = clearEndDAte;
        vm.openEndDate = openEndDate;

        function todayStartDate() {
            vm.startDate = new Date();
        }

        function todayEndDate() {
            vm.endDate = new Date();
        }

        function clearStartDate() {
            vm.startDate = null;
        }

        function clearEndDate() {
            vm.endDate = null;
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
    }


    angular
        .module('template/vacify.add-modal.html', [])
        .run(["$templateCache", function ($templateCache) {
            $templateCache.put('template/vacify.add-modal.html',
                "<div class=\"modal-header\">\n" +
                "   <h3 class=\"modal-title\">Add Vacation Request</h3>\n" +
                "</div>\n" +
                "<div class=\"modal-body\">\n" +
                "   <p class=\"input-group\">\n" +
                "       <input type=\"text\" class=\"form-control\" datepicker-popup=\"{{format}}\" ng-model=\"vm.startDate\" is-open=\"vm.startDateOpened\" ng-required=\"true\" close-text=\"Close\" />\n" +
                "       <span class=\"input-group-btn\">\n" +
                "           <button type=\"button\" class=\"btn btn-default\" ng-click=\"vm.openStartDate($event)\"><i class=\"glyphicon glyphicon-calendar\"></i></button>\n" +
                "       </span>\n" +
                "   </p>\n" +
                "</div>" +
                "<div class=\"modal-footer\">\n" +
                "   <button class=\"btn btn-primary\" ng-click=\"ok()\">OK</button>\n" +
                "   <button class=\"btn btn-warning\" ng-click=\"cancel()\">Cancel</button>\n" +
                "</div>"
            );
        }]);

})(window.angular);