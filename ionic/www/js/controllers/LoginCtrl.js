angular.module('starter.controllers')
    .controller('LoginCtrl',[
        '$scope','OAuth','OAuthToken','$state','$ionicPopup','UserService','UserData',
        function ($scope, OAuth, OAuthToken, $state, $ionicPopup, UserService,UserData) {

            $scope.user = {
                username: '',
                password: ''
            };

            $scope.login = function () {
                var promise = OAuth.getAccessToken($scope.user);
                promise
                    .then(function (data) {
                        return UserService.authenticated({include: 'client'}).$promise;
                    })
                    .then(function (data) {
                        UserData.set(data.data);
                        $state.go('client.checkout');
                    },function (responseError) {
                        UserData.set(null);
                        OAuthToken.removeToken();
                        $ionicPopup.alert({
                            title:   'Alert',
                            template: 'Login e/ou senha inválidos'
                        });
                        console.debug(responseError);
                    });
            }
        }]);