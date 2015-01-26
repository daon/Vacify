(function (angular) {
    'use strict';

    angular
        .module('vacify')
        .controller('Calendar', Calendar);

    Calendar.$inject = ['uiCalendarConfig', 'dataService', '$timeout', '$modal'];

    function Calendar(uiCalendarConfig, dataService, $timeout, $modal) {
        var vm = this;
        vm.requests = [];
        vm.removedRequests = [];
        vm.eventSources = [vm.requests];
        vm.saveChanges = saveChanges;
        vm.openAddModal = openAddModal;
        vm.render = render;

        init();

        function init() {
            vm.config = {
                selectable: true,
                select: select,
                eventMouseover: onMouseOverEvent,
                eventMouseout: onMouseOutEvent,
                eventClick: onClickEvent
            };

            getVacationRequests();
        }

        function openAddModal() {
            var modalInstance = $modal.open({
                templateUrl: 'vacify.addModal.html',
                controller: 'AddModalInstance as vm',
                size: 'sm'
            });

            modalInstance.result.then(function (request) {
                vm.requests.push(request);
            });
        }

        function getVacationRequests() {
            dataService.getVacationRequests()
                .then(requestComplete, requestFailed);

            function requestComplete(response) {
                if (response.data) {
                    for (var i = 0; i < response.data.length; i++) {
                        vm.requests.push({
                            id: response.data[i].ID,
                            title: response.data[i].Title,
                            start: response.data[i].StartDate,
                            end: response.data[i].EndDate,
                            status: response.data[i].Status,
                            allDay: true,
                            color: statusToColor("Pending"),
                            isSavedRequest: true
                        })
                    }
                }
                successAlert("Successfully loaded saved requests.");
            }

            function requestFailed(error) {
                errorAlert("Failed to load saved requests.");
                console.log(error);
            }
        }

        function saveChanges() {
            var vacationRequests = [];
            for (var i = 0; i < vm.requests.length; i++) {
                if (!vm.requests[i].isSavedRequest) {
                    vacationRequests.push({
                        RequestBy: "Test",
                        StartDate: vm.requests[i].start,
                        EndDate: vm.requests[i].end,
                        Status: "Pending"
                    });
                }
            }

            dataService.requestVacation(vacationRequests)
                .then(requestComplete, requestFailed);

            function requestComplete(data) {
                successAlert("Request Complete");
                console.log(data);
            }

            function requestFailed(error) {
                errorAlert("Request Failed");
                console.log(error);
            }
        }

        function select(start, end) {
            var request = {
                title: "New Request",
                start: start,
                end: end,
                status: "New",
                allDay: true
            };

            vm.requests.push(request);

            if (uiCalendarConfig.calendars['vacationRequest']) {
                uiCalendarConfig.calendars['vacationRequest'].fullCalendar('unselect');
            }
        }

        function onMouseOverEvent(request, jsEvent, view) {
            request.color = statusToHoverColor(request.status);
            if (uiCalendarConfig.calendars['vacationRequest']) {
                uiCalendarConfig.calendars['vacationRequest'].fullCalendar('updateEvent', request);
            }
        }

        function onMouseOutEvent(request, jsEvent, view) {
            request.color = statusToColor(request.status);
            if (uiCalendarConfig.calendars['vacationRequest']) {
                uiCalendarConfig.calendars['vacationRequest'].fullCalendar('updateEvent', request);
            }
        }

        function onClickEvent(request, jsEvent, view) {
            if (request.isSavedRequest) {
                vm.removedRequest.push(request);
            }
            if (uiCalendarConfig.calendars['vacationRequest']) {
                uiCalendarConfig.calendars['vacationRequest'].fullCalendar('removeEvents', request._id);
            }
        }

        function successAlert(message) {
            alert("success", message);
        }

        function errorAlert(message) {
            alert("error", message);
        }

        function alert(type, message) {
            vm[type + "Message"] = message;
            vm[type + "Visible"] = true;

            $timeout(function () {
                vm[type + "Visible"] = false;
            }, 3000);
        }

        function render() {
            if (uiCalendarConfig.calendars['vacationRequest']) {
                $timeout(function () {
                    uiCalendarConfig.calendars['vacationRequest'].fullCalendar('render');
                }, 15);
            }
            return;
        }
        
        function statusToColor(status) {
            switch (status) {
                case "Pending":
                    return "#f0ad4e";
                default:
                    return "#3b91ad";
            }   
        }

        function statusToHoverColor(status) {
            switch (status) {
                case "Pending":
                    return "#ec871f";
                default:
                    return "#296579";
            }
        }

        
    }

})(window.angular);