// public/core.js
var datalogUi = angular.module('datalogUi', []);

//function mainController($scope, $http) {
datalogUi.controller('mainController', function mainController($scope, $http) {
    //$scope.formData = {};

    $scope.view = 'live';
    $scope.sensorData = {
	fetched : false,
	unregisteredSensors : [],
	registeredSensors : []
    };
    

    $scope.changeView = function(newView) {
	if(newView == 'config') {
	    $scope.sensorData.fetched = false;
	    $http({
		method: 'GET', 
	        url: '/sensors'
	    }).then(function (res) {
		$scope.sensorData.unregisteredSensors = res.data.unregisteredSensors;
		$scope.sensorData.registeredSensors = res.data.registeredSensors;
		$scope.sensorData.fetched = true;
	    }, function (err) {
		console.log("Error fetching sensors ", err);
	    });
	}
	$scope.view = newView;
    };

    // when submitting the add form, send the text to the node API
    $scope.registerSensor = function(sensor) {
	//$scope.sensorData.fetched = false;
	$http({
	    method: 'POST', 
	    url: '/sensors',
    	    data: sensor
        }).then(function (res) {
	    $scope.sensorData.unregisteredSensors = res.data.unregisteredSensors;
            $scope.sensorData.registeredSensors = res.data.registeredSensors;
            $scope.sensorData.fetched = true;
	}, function (err) {
	    console.log("Error registering sensor ", err);
	});
    };

    $scope.updateSensor = function (sensor) {
	$scope.sensorData.fetched = false;
	$http({
	    method: 'PUT', 
	    url: '/sensors', 
	    data: sensor
        }).then(function (res) {
	    $scope.sensorData.unregisteredSensors = res.data.unregisteredSensors;
	    $scope.sensorData.registeredSensors = res.data.registeredSensors;
	    $scope.sensorData.fetched = true;
	}, function (err) {
	    console.log("Error updating sensor ", err);
	});
    };

    // delete a todo after checking it
    $scope.deleteSensor = function(sensor) {
	//$scope.sensorData.fetched = false;
	$http({
	    method: 'DELETE', 
	    url: '/sensors/' + sensor.devices_id,
	}).then(function (res) {
	    $scope.sensorData.unregisteredSensors = res.data.unregisteredSensors;
            $scope.sensorData.registeredSensors = res.data.registeredSensors;
            $scope.sensorData.fetched = true;
	}, function (err) {
	    console.log("Error deleting sensor ", err);
	});
    };

});


