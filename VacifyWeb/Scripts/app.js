(function() {
	'use strict';
	
    /* Module */
	angular
        .module('vacify', [
            'ngAnimate',
            'ui.calendar',
            'ui.bootstrap',
            'toastr'
        ]);

    /////////////////////////////////////////////////////

    /* Location Provider */
	angular
        .module('vacify')
        .config(locationConfig);

	locationConfig.$inject = ['$locationProvider'];

	function locationConfig($locationProvider) {
	    $locationProvider.html5Mode(true);
	}

    /////////////////////////////////////////////////////

    /* Http Provider */
  	angular
        .module('vacify')
        .config(httpConfig);

	httpConfig.$inject = ['$httpProvider'];

	function httpConfig($httpProvider) {
	    $httpProvider.interceptors.push(requestInterceptor);
	}

	requestInterceptor.$inject = ['$q', '$templateCache', 'spContext'];
    
	function requestInterceptor($q, $templateCache, spContext) {
	    return {
	        'request': function (request) {
	            if (angular.isUndefined($templateCache.get(request.url))) {
	                request.url = request.url + '?SPHostUrl=' + spContext.getSPHostUrl();
	            }
	            return request || $q.when(request);
	        }
	    }
	}

    //////////////////////////////////////////////////////

    /* SPContext */
	angular
        .module('vacify')
        .factory('spContext', spContext);

	spContext.$inject = ['$window'];

	function spContext($window) {
	    var spHostUrl = '',
            service = {
                getSPHostUrl: getSPHostUrl
            };

	    return service;

	    function getSPHostUrl() {
	        if (!spHostUrl) {
	            var queryString = $window.location.search;
	            spHostUrl = getParamFromQueryString(queryString, "SPHostUrl");
	        }
	        return spHostUrl;
	    }

	    function getParamFromQueryString(queryString, param) {
	        if (queryString) {
	            if (queryString[0] === "?") {
	                queryString = queryString.substring(1);
	            }

	            var keyValuePairArray = queryString.split("&");

	            for (var i = 0; i < keyValuePairArray.length; i++) {
	                var currentKeyValuePair = keyValuePairArray[i].split("=");

	                if (currentKeyValuePair.length > 1 && currentKeyValuePair[0] == param) {
	                    return currentKeyValuePair[1];
	                }
	            }
	        }
	        return null;
	    }
	}


    //////////////////////////////////////////////////////

    /* Vacation Request Response Transformer */
	angular
        .module('vacify')
        .factory('vacationRequestTransformResponse', vacationRequestTransformResponse);

	function vacationRequestTransformResponse() {
	    var statusToData = {
	        'Pending': '#f0ad4e',
	        'Approved': '#5cb85c',
	        'Rejected': '#d9534f'
	    };
	    return function (data) {
	            data = JSON.parse(data);
	        if (data.length) {
	            data = _.map(data, function (vacationRequest) {
	                return {
	                    id: vacationRequest.ID,
                        title: vacationRequest.Status + ' Request',
	                    start: moment(vacationRequest.StartDate),
	                    end: moment(vacationRequest.EndDate),
	                    requestBy: vacationRequest.RequestBy,
	                    approver: vacationRequest.Approver,
                        color: statusToData[vacationRequest.Status],
                        status: vacationRequest.Status
	                }
	            })
	        }
	        return data;
	    };
	}

    //////////////////////////////////////////////////////

    /* Vacation Request Response Transformer */
	angular
        .module('vacify')
        .factory('vacationRequestTransformRequest', vacationRequestTransformRequest);

	function vacationRequestTransformRequest() {
	    return function (data) {
	        data = _.map(data, function (vacationRequest) {
	            return {
	                ID: vacationRequest.id,
	                StartDate: vacationRequest.start,
	                EndDate: vacationRequest.end,
	                RequestBy: vacationRequest.requestBy,
	                Approver: vacationRequest.approver,
	                Status: "Pending"
	            }
	        });

	        return JSON.stringify(data);
	    }
	}
    
    /////////////////////////////////////////////////////

    /* Data Service */
	angular
        .module('vacify')
        .factory('dataService', dataService);

	dataService.$inject = ['$http', 'vacationRequestTransformResponse', 'vacationRequestTransformRequest'];
        
	function dataService($http, vacationRequestTransformResponse, vacationRequestTransformRequest) {
	    var service = {
	        getMyVacationRequests: getMyVacationRequests,
	        getMyEmployeesVacationRequests: getMyEmployeesVacationRequests,
	        saveVacationRequests: saveVacationRequests,
	        approveVacationRequest: approveVacationRequest,
            rejectVacationRequest: rejectVacationRequest
	    }

	    return service;

	    function getMyVacationRequests() {
	        return $http.get('Home/GetMyVacationRequests', { transformResponse: vacationRequestTransformResponse });
	    }

	    function getMyEmployeesVacationRequests() {
	        return $http.get('Home/GetMyEmployeesVacationRequests', { transformResponse: vacationRequestTransformResponse });
	    }

	    function saveVacationRequests(vacationRequests) {
	        return $http.post('Home/SaveVacationRequests', vacationRequests, { transformRequest: vacationRequestTransformRequest, transformResponse: vacationRequestTransformResponse });
	    }

	    function approveVacationRequest(vacationRequest) {
	        return $http.post('Home/ApproveVacationRequest', vacationRequest);
	    }

	    function rejectVacationRequest(vacationRequest) {
	        return $http.post('Home/RejectVacationRequest', vacationRequest);
	    }
	}

    /////////////////////////////////////////////////////

    /* Moment filter */

	angular
        .module('vacify')
        .filter('moment', momentFilter);


	function momentFilter() {
	    return function (obj, format) {
	        return moment.isMoment(obj) ? obj.format(format) : '';
	    }
	}
        
    /////////////////////////////////////////////////////

    /* Controller */
	angular
        .module('vacify')
        .controller('VacationRequests', VacationRequests);

	VacationRequests.$inject = ['$timeout', '$modal', 'toastr', 'uiCalendarConfig', 'dataService'];

	function VacationRequests($timeout, $modal, toastr, uiCalendarConfig, dataService) {
	    var vm = this;
	    vm.vacationRequests = [];
	    vm.eventSources = [vm.vacationRequests];
	    vm.save = save;
	    vm.render = render;
	    vm.approve = approve;
	    vm.reject = reject;

	    init();

	    ////////////////////////////////////////

	    function init() {
	        vm.config = {
	            startParam: 'startDate',
	            endParam: 'endDate',
	            selectable: true,
	            select: addVacationRequest,
	            eventClick: removeVacationRequest,
	        };
	        getMyVacationRequests();
	        getMyEmployeesVacationRequests();
	    }

	    function addVacationRequest(startDate, endDate) {
	        var vacationRequest = {
	            title: 'New Request',
	            start: startDate,
	            end: endDate,
	            status: 'New',
	            allDay: true
	        };

	        vm.vacationRequests.push(vacationRequest);
	        callCalendarMethod('unselect');
	    }
         
	    function removeVacationRequest(vacationRequest) {
	        if (vacationRequest.status === 'New') {

	            for (var i = 0; i < vm.vacationRequests.length; i++) {
	                if (vm.vacationRequests[i]._id === vacationRequest._id) {
	                    vm.vacationRequests.splice(i, 1);
	                    break;
	                }
	            }
	        }
	    }

	    function getMyVacationRequests() {
	        dataService
                .getMyVacationRequests()
                .then(requestComplete, requestFailed);

	        function requestComplete(response) {
	            angular.forEach(response.data, function (vacationRequest) {
	                vm.vacationRequests.push(vacationRequest);
	            });
                callCalendarMethod('refetchEvents');
	            toastr.success('Successfully loaded vacation requests');
	        }

	        function requestFailed(reason) {
	            toastr.error('Failed to load vacation requests');
	        }
	    }

	    function getMyEmployeesVacationRequests() {
	        dataService
                .getMyEmployeesVacationRequests()
                .then(requestComplete, requestFailed);

	        function requestComplete(response) {
	            vm.employeesVacationRequests = _.groupBy(response.data, 'requestBy');
	            toastr.success('Successfully loaded employees vacation requests');
	        }

	        function requestFailed(reason) {
	            toastr.error('Failed to load employees vacation requests');
	        }
	    }

	    function save() {
	        dataService
                .saveVacationRequests(vm.vacationRequests)
                .then(requestComplete, requestFailed);

	        function requestComplete(response) {
	            for (var i = 0; i < vm.vacationRequests.length; i++) {
	                if (vm.vacationRequests[i].status === 'New') {
	                    vm.vacationRequests[i].title = 'Pending Request';
	                    vm.vacationRequests[i].color = '#f0ad4e'
	                    vm.vacationRequests[i].status = 'Pending';
	                }
	            }
	            
	            callCalendarMethod('refetchEvents');
                toastr.success('Successfully saved vacation requests')
	        }

	        function requestFailed(reason) {
                toastr.error('Failed to save vacation requests')
	        }
	    }

	    function approve(vacationRequest) {
	        dataService
                .approveVacationRequest(vacationRequest)
                .then(requestComplete, requestFailed);

	        function requestComplete(response) {
	            vacationRequest.status = 'Approved';
	        }

	        function requestFailed(reason) {
	            toastr.error('Failed to approve vacation request');
	        }
	    }

	    function reject(vacationRequest) {
	        dataService
                .rejectVacationRequest(vacationRequest)
                .then(requestComplete, requestFailed);

	        function requestComplete(response) {
	            vacationRequest.status = 'Rejected';
	        }

	        function requestFailed(reason) {
	            toastr.error('Failed to reject vacation request');
	        }
	    }

	    function render() {
	        $timeout(function () {
	            callCalendarMethod('render');
	        }, 15);
	    }

	    function callCalendarMethod(method) {
	        var calendar = uiCalendarConfig.calendars['vacationRequests'];
	        if (calendar) {
	            calendar.fullCalendar(method);
	        }
	    }
	}

})();