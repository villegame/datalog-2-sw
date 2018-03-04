// public/core.js
var datalogUi = angular.module('datalogUi', []);

//function mainController($scope, $http) {
datalogUi.controller('mainController', function mainController($scope, $http) {
    $scope.formData = {};

    // when landing on the page, get all todos and show them
    $scope.todos = [{_id:1, text:'moro'}, {_id:2, text:'tere'}];

    $scope.view = 'home';

    $scope.changeView = function(newView) {
	$scope.view = newView;
    };

    $http({
	method: 'GET', 
	url: '/values'
	}).then(function(data) {
            console.log("got data:", data);
        }, function (err) {
            console.log('Error: ' + data);
	});
    // when submitting the add form, send the text to the node API
    $scope.createTodo = function() {
	console.log('create');
/*
        $http.post('/api/todos', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.todos = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
*/
    };

    // delete a todo after checking it
    $scope.deleteTodo = function(id) {
	console.log('delete');
/*
        $http.delete('/api/todos/' + id)
            .success(function(data) {
                $scope.todos = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
*/
    };

});


