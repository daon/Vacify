(function (angular) {
    'use strict';

    angular
        .module('vacify')
        .controller('Calendar', Calendar);

    Calendar.$inject = ['uiCalendarConfig', 'dataService', '$timeout'];

    function Calendar(uiCalendarConfig, dataService, $timeout) {
        var vm = this;
        vm.events = [];
        vm.savedEvents = [];
        vm.removedEvents = [];
        vm.eventSources = [vm.events, vm.savedEvents];
        vm.requestVacation = requestVacation;

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

        function getVacationRequests() {
            dataService.getVacationRequests()
                .then(requestComplete, requestFailed);

            function requestComplete(response) {
                if (response.data) {
                    for (var i = 0; i < response.data.length; i++) {
                        vm.savedEvents.push({
                            id: response.data[i].ID,
                            title: "Pending Request",
                            start: response.data[i].StartDate,
                            end: response.data[i].EndDate,
                            allDay: true,
                            status: "Pending",
                            color: statusToColor("Pending"),
                            isSavedEvent: true
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

        function requestVacation() {
            var vacationRequests = [];
            for (var i = 0; i < vm.events.length; i++) {
                vacationRequests.push({
                    RequestBy: "Test",
                    StartDate: vm.events[i].start,
                    EndDate: vm.events[i].end,
                    Status: "Pending"
                });
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
            var eventData = {
                title: "New Request",
                start: start,
                end: end,
                allDay: true
            };

            vm.events.push(eventData);

            if (uiCalendarConfig.calendars['vacationRequest']) {
                uiCalendarConfig.calendars['vacationRequest'].fullCalendar('unselect');
            }
        }

        function onMouseOverEvent(event, jsEvent, view) {
            event.color = statusToHoverColor(event.status);
            if (uiCalendarConfig.calendars['vacationRequest']) {
                uiCalendarConfig.calendars['vacationRequest'].fullCalendar('updateEvent', event);
            }
        }

        function onMouseOutEvent(event, jsEvent, view) {
            event.color = statusToColor(event.status);
            if (uiCalendarConfig.calendars['vacationRequest']) {
                uiCalendarConfig.calendars['vacationRequest'].fullCalendar('updateEvent', event);
            }
        }

        function onClickEvent(event, jsEvent, view) {
            if (event.isSavedEvent) {
                vm.removedEvents.push(event);
            }
            if (uiCalendarConfig.calendars['vacationRequest']) {
                uiCalendarConfig.calendars['vacationRequest'].fullCalendar('removeEvents', event._id);
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