var datalogUi = angular.module('datalogUi', []);

datalogUi.controller('mainController', function mainController($scope, $http) {

    $scope.view = 'live';
    $scope.loginData = {
	password: null,
	error: null,
	logged: false
    };

    $scope.sensorData = {
	fetched : false,
	unregisteredSensors : [],
	registeredSensors : []
    };   

    // Get login status for displaying logout button
    $http({
        method: 'GET', 
        url: '/login'
    }).then(function (res) {
	$scope.loginData.logged = res.data.logged;
    }, function (err) {
    });

    var getSensorData = function () {
        $http({
            method: 'GET',
            url: '/sensors'
        }).then(function (res) {
            $scope.sensorData.unregisteredSensors = res.data.unregisteredSensors;
            $scope.sensorData.registeredSensors = res.data.registeredSensors;
            $scope.sensorData.fetched = true;
        }, function (err) {
        });
    };

    $scope.changeView = function (newView) {
	if(newView == 'config') {
	    $scope.sensorData.fetched = false;
	    getSensorData();
	}
	$scope.view = newView;
    };

    $scope.registerSensor = function (sensor) {
	$scope.sensorData.fetched = false;
	$http({
	    method: 'POST', 
	    url: '/sensors',
    	    data: sensor
        }).then(function (res) {
	    $scope.sensorData.unregisteredSensors = res.data.unregisteredSensors;
            $scope.sensorData.registeredSensors = res.data.registeredSensors;
            $scope.sensorData.fetched = true;
	}, function (err) {
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
	});
    };

    // delete a todo after checking it
    $scope.deleteSensor = function (sensor) {
	$scope.sensorData.fetched = false;
	$http({
	    method: 'DELETE', 
	    url: '/sensors/' + sensor.devices_id,
	}).then(function (res) {
	    $scope.sensorData.unregisteredSensors = res.data.unregisteredSensors;
            $scope.sensorData.registeredSensors = res.data.registeredSensors;
            $scope.sensorData.fetched = true;
	}, function (err) {
	});
    };

    $scope.login = function () {
	$http({
	    method: 'POST', 
	    url: '/login',
	    data: { password: $scope.loginData.password }
        }).then(function (res) {
 	    if(res.status == 202) {
		//$scope.loginData.showWindow = false;
		$scope.loginData.error = null;
	        $scope.loginData.password = null;
		$scope.loginData.logged = true;
	        getSensorData();
	    }
            else $scope.loginData.error = "Something went wrong.";
	}, function (err) {
	    if(err.status == 401) $scope.loginData.error = "Incorrect password.";
	});
    };

    $scope.logout = function () {
	$http({
	    method: 'POST',
	    url: '/logout'
	}).then(function (res) {
	    $scope.loginData.logged = false;
	    $scope.view = 'live';
        }, function (err) {
	    console.log("error logging out ", err);
        });
    };

});


