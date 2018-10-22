var datalogUi = angular.module('datalogUi', []);

datalogUi.controller('mainController', ['$scope', '$http', '$interval', function mainController($scope, $http, $interval) {

    $scope.view = 'live';

    $scope.changePassword = {
        showDialog: null,
        currentPassword: '',
        newPassword: '',
        newPasswordAgain: '',
        error: null
    };

    $scope.initSuperUserData = {
        initSuperUser: null,
        password: '',
        passwordAgain: '',
        error: null
    };

    $scope.loginData = {
        password: null,
        error: null,
        logged: false
    };

    $scope.sensorData = {
        fetched: false,
        unregisteredSensors: [],
        registeredSensors: [],
        removedSensors: []
    };

    $scope.dialogs = {
        deleteConfirm: false,
        deleteSensor: null,
        clearConfirm: false,
        clearSensor: null
    };

    $scope.batteryVoltage = null;

    // set battery value in precentages
    var setVoltage = function (voltage) {
        var value = voltage - 2.42;
        value = (value / 0.58)*100;
        if(value > 100) value = 100.00;
        if(value < 0) value = 0.00;
        $scope.batteryVoltage = parseInt(value,10);
    };

    // get battery voltage
    var getBattery = function () {
        $http({
            method: 'GET',
            url: '/battery'
        }).then(function (res) {
            var voltage = parseFloat(JSON.parse(res.data));
            setVoltage(voltage);
        }, function (err) {
            $scope.batteryVoltage = null;
        });
    };

    getBattery();

    // get battery value every 30 seconds
    $interval(getBattery, 30000);

    // Get login status for displaying logout button
    $http({
        method: 'GET',
        url: '/login'
    }).then(function (res) {
        $scope.initSuperUserData.initSuperUser = res.data.initSuperUser;
        $scope.loginData.logged = res.data.logged;
    }, function (err) {
    });

    $scope.initSuperUser = function (data) {

        if (data.password != data.passwordAgain) {
            $scope.initSuperUserData.error = "Passwords do not match!";
            return;
        }

        if (data.password.length < 5) {
            $scope.initSuperUserData.error = "Password should be 5 or more characters long.";
            return;
        }

        $http({
            method: 'POST',
            url: '/initsuperuser',
            data: { password: data.password }
        }).then(function (res) {
            $scope.initSuperUserData.initSuperUser = false;
        }, function (err) {
            $scope.initSuperUserData.error = err.data.msg;
        });
    };

    $scope.changePassword = function (data) {

        if (!data.currentPassword) {
            $scope.changePassword.error = "Give current password.";
            return;
        }

        if (data.newPassword != data.newPasswordAgain) {
            $scope.changePassword.error = "New passwords do not match!";
            return;
        }

        if (data.newPassword.length < 5) {
            $scope.changePassword.error = "New password should be 5 or more characters long.";
            return;
        }

        $http({
            method: 'POST',
            url: '/changepassword',
            data: { currentPassword: data.currentPassword,
                    newPassword: data.newPassword
                }
        }).then(function (res) {
            $scope.changePassword.currentPassword = '';
            $scope.changePassword.newPassword = '';
            $scope.changePassword.newPasswordAgain = '';
            $scope.changePassword.showDialog = false;
        }, function (err) {
            $scope.changePassword.error = err.data.msg;
        });
    };

    $scope.changePasswordClose = function () {
        $scope.changePassword.currentPassword = '';
        $scope.changePassword.newPassword = '';
        $scope.changePassword.newPasswordAgain = '';
        $scope.changePassword.showDialog = false;
    };

    $scope.changePasswordBtn = function () {
        $scope.changePassword.showDialog = true;
    };

    var prepareSensorList = function (sensors) {
        sensors.forEach(function (sensor, i, array) {
            if(!sensor.hasOwnProperty("devices_color")) {
                // set default color for unregistered sensor
                array[i].color = 'red';
            }
            array[i].devices_temp_offset = parseFloat(sensor.devices_temp_offset);
            array[i].devices_hum_offset = parseFloat(sensor.devices_hum_offset);
            array[i].devices_pres_offset = parseFloat(sensor.devices_pres_offset);
        });
        return sensors;
    }

    var updateSensorLists = function (sensorLists) {
        $scope.sensorData.unregisteredSensors = prepareSensorList(sensorLists.unregisteredSensors);
        $scope.sensorData.registeredSensors = prepareSensorList(sensorLists.registeredSensors);
        $scope.sensorData.removedSensors = prepareSensorList(sensorLists.removedSensors);
        $scope.sensorData.fetched = true;
    };

    var getSensorData = function () {
        $http({
            method: 'GET',
            url: '/sensors'
        }).then(function (res) {
            updateSensorLists(res.data);
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
            updateSensorLists(res.data);
        }, function (err) {
            console.log("nope", err);
        });
    };

    $scope.updateSensor = function (sensor) {
        $scope.sensorData.fetched = false;
        $http({
            method: 'PUT',
            url: '/sensors',
            data: sensor
        }).then(function (res) {
            updateSensorLists(res.data);
        }, function (err) {
            $scope.sensorData.fetched = true;
            $scope.sensorData.registeredSensors.forEach(function (registered_sensor, i, array) {
                if(registered_sensor.devices_id == sensor.devices_id) {
                    array[i]['error'] = err.data;
                }
            });
        });
    };

    $scope.sensorClearConfirm = function (sensor) {
        $scope.dialogs.clearConfirm = true;
        $scope.dialogs.clearSensor = sensor;
    };

    $scope.sensorCancelClear = function () {
        $scope.dialogs.clearConfirm = false;
        $scope.dialogs.clearSensor = null;
    };

    $scope.clearSensor = function () {
        $scope.dialogs.clearConfirm = false;
        $scope.sensorData.fetched = false;
        $http({
            method: 'PUT',
            url: '/sensors/clear',
            data: { devices_id: $scope.dialogs.clearSensor.devices_id }
        }).then(function (res) {
            updateSensorLists(res.data);
        }, function (err) {
        });
    };

    $scope.sensorDeleteConfirm = function (sensor) {
        $scope.dialogs.deleteConfirm = true;
        $scope.dialogs.deleteSensor = sensor;
    };

    $scope.sensorCancelDelete = function () {
        $scope.dialogs.deleteConfirm = false;
        $scope.dialogs.deleteId = null;
    };

    $scope.deleteSensor = function () {
        console.log("DELETING SENSOR:");
        console.log($scope.dialogs.deleteSensor);
        $scope.dialogs.deleteConfirm = false;

        $scope.sensorData.fetched = false;
        $http({
            method: 'DELETE',
            url: '/sensors/' + $scope.dialogs.deleteSensor.devices_id,
        }).then(function (res) {
            updateSensorLists(res.data);
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

    $scope.updateTime = function () {
        console.log("update");
        $http({
            method: 'POST',
            url: '/tools/sys',
            data: { operation: "setDate", params: parseInt(Date.now()/1000) }
        }).then(function (res) {
            console.log("RES", res);
        }, function (err) {
            console.log("ERR", err);
        });
    };

    $scope.reboot = function () {
        console.log("reboot");
        $http({
            method: 'POST',
            url: '/tools/sys',
            data: { operation: 'reboot' }
        }).then(function (res) {
            console.log("RES", res);
        }, function (err) {
            console.log("ERR", err);
        });
    };

    $scope.shutdown = function () {
        console.log("shutdown");
        $http({
            method: 'POST',
            url: '/tools/sys',
            data: { operation: 'shutdown' }
        }).then(function (res) {
            console.log("RES", res);
        }, function (err) {
            console.log("ERR", err);
        });
    };

}]);


