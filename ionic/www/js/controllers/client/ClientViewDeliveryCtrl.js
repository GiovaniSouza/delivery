angular.module('starter.controllers')
    .controller('ClientViewDeliveryCtrl',[
        '$scope', '$stateParams', 'ClientOrderService', '$ionicLoading','$ionicPopup','UserData','$pusher','$window',
        function ($scope, $stateParams, ClientOrderService, $ionicLoading,$ionicPopup, UserData, $pusher, $window) {
            $scope.order = {};
            $scope.markers = [];
            $scope.map = {
                center:{
                    latitude:  0,
                    longitude: 0
                },
                zoom: 14
            };

            $ionicLoading.show({
                template: 'Carregando...'
            });

            ClientOrderService.get({id: $stateParams.id, include: "items, cupom"},function (data) {
                $scope.order = data.data;
                $ionicLoading.hide();
                if(parseInt($scope.order.status,10) == 1){
                    initMarkers($scope.order);
                }else{
                    $ionicPopup.alert({
                        title: "Alerta",
                        template: "Pedido não está em entrega"
                    });
                }
            },function (error) {
                $ionicLoading.hide();
            });

            $scope.$watch('markers.lenght',function (value) {
                if(value == 2){
                    createBounds();
                }
            });

            function initMarkers(order) {
                var client  = UserData.get().client.data;
                var address = client.zipcode + ', ' +
                              client.address + ', ' +
                              client.city    + '- ' +
                              client.state;
                createMarkerClient(address);
                watchPositionDeliveryman(order.hash);
            }
            
            function createMarkerClient(address) {
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({
                    address: address
                },function (results, status) {
                    if(status == google.maps.GeocoderStatus.OK){
                        var lat  = results[0].geometry.location.lat();
                        var long = results[0].geometry.location.lng();

                        $scope.markers.push({
                            id: 'client',
                            coords: {
                                latitude: lat,
                                longitude: long
                            },
                            options:{
                                title: "local de entrega"
                            }
                        });
                    }else{
                        $ionicPopup.alert({
                            title: "Alerta",
                            template: "Não foi possível localizar seu endereço"
                        });
                    }
                });

            }

            function watchPositionDeliveryman(channel) {
                var pusher = $pusher(window.client);
                var channel = pusher.subscribe(channel);

                channel.bind('Delivery\\Events\\GetLocationDeliveryman',function (data){
                    var lat = data.geo.lat, long = data.geo.long;

                    if($scope.markers.length == 1 || $scope.markers.length == 0){
                        $scope.markers.push({
                            id: 'entregador',
                            coords: {
                                latitude: lat,
                                longitude: long
                            },
                            options:{
                                title: "entregador"
                            }
                        });
                        return;
                    }

                    for(var key in $scope.markers){
                        if($scope.markers[key].id == "entregador"){
                            $scope.markers[key].coords = {
                                latitude: lat,
                                longitude: long
                            };
                        }
                    }
                });
            }

            function createBounds(){
                var bounds = new google.maps.LatLngBounds();
                var latlng;
                angular.forEach($scope.markers, function (value) {
                    latlng = new google.maps.LatLng(Number(value.coords.latitude),Number(value.coords.longitude));
                    bounds.extend(latlng);
                });
                $scope.map.bounds = {
                    northeast:{
                        latitude: bounds.getNorthEast().lat(),
                        longitude: bounds.getNorthEast().lng()
                    },
                    southwest: {
                        latitude: bounds.getSouthWest().lat(),
                        longitude: bounds.getSouthWest().lng()
                    }
                }
            }
    }]);