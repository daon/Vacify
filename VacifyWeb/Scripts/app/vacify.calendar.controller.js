(function (angular) {
    'use strict';

    angular
        .module('vacify')
        .controller('Calendar', calendar);

    calendar.$inject = ['uiCalendarConfig', 'dataService'];

    function calendar(uiCalendarConfig, dataService) {
        var vm = this;
        vm.events = [];
        vm.eventSources = [vm.events];
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
                        vm.events.push({
                            title: "Vacation Request",
                            start: response.data[i].StartDate,
                            end: response.data[i].EndDate
                        })
                    }
                }
            }

            function requestFailed(error) {
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
                console.log(data);
            }

            function requestFailed(error) {
                console.log(error);
            }
        }

        function select(start, end) {
            var eventData = {
                title: "vacation request",
                start: start,
                end: end
            };

            vm.events.push(eventData);

            if (uiCalendarConfig.calendars['vacationRequest']) {
                uiCalendarConfig.calendars['vacationRequest'].fullCalendar('unselect');
            }
        }

        function onMouseOverEvent(event, jsEvent, view) {
            event.color = "#296579";
            if (uiCalendarConfig.calendars['vacationRequest']) {
                uiCalendarConfig.calendars['vacationRequest'].fullCalendar('updateEvent', event);
            }
        }

        function onMouseOutEvent(event, jsEvent, view) {
            event.color = "#3b91ad";
            if (uiCalendarConfig.calendars['vacationRequest']) {
                uiCalendarConfig.calendars['vacationRequest'].fullCalendar('updateEvent', event);
            }
        }

        function onClickEvent(event, jsEvent, view) {
            if (uiCalendarConfig.calendars['vacationRequest']) {
                uiCalendarConfig.calendars['vacationRequest'].fullCalendar('removeEvents', event._id);
            }
        }
        
    }

})(window.angular);