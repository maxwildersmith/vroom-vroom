var map;

var buttonDiv = document.createElement('div');
buttonDiv.style.height = '40px';
buttonDiv.style.cursor = 'pointer';

buttonDiv.index = 1;

var controlUI = document.createElement('div');
controlUI.style.backgroundColor = '#fff';
controlUI.style.border = '2px solid #fff';
controlUI.style.borderRadius = '2px';
controlUI.style.boxShadow = 'rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;';
controlUI.style.marginTop = '10px';
controlUI.style.textAlign = 'center';
controlUI.title = 'Open settings';
buttonDiv.appendChild(controlUI);

var controlText = document.createElement('div');
controlText.style.color = 'rgb(25,25,25)';
controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
controlText.style.fontSize = '30px';
controlText.style.paddingLeft = '17px';
controlText.style.paddingRight = '17px';
controlText.style.verticalAlign = 'middle';
controlText.innerHTML = '<i class="fas fa-cog"></i>';
controlUI.appendChild(controlText);

controlUI.addEventListener('click', function() {
    alert("You clicked the settings button");
});
var infoWindow = {};

window.initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 14,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        scaleControl: true,
        //fullscreenControl: false,
        streetViewControl: false
    });
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(buttonDiv);
    getUserLocation();
    carIcon = {url: 'car.png', scaledSize: new google.maps.Size(73/1.5,38/1.5)};
    gasIcon = {url: 'gasPump.png',scaledSize:new google.maps.Size(40,46)};
    infoWindow = new google.maps.InfoWindow({});
    plotGas();
};

var carMarker;
var carIcon = {};
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position => {
            map.setCenter({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
            carMarker = new google.maps.Marker({
                position: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                },
                icon: carIcon, map: map
            });
            navigator.geolocation.watchPosition((position => {
                carMarker.setPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }));
        }));
    }
}

var markers = [];
var gasIcon = {};
function plotGas() {
    $.get('/getGasStations', function (res) {
        console.log(res);
        if(res)
            res.forEach((station) => {
                var mark = new google.maps.Marker({
                    position: {
                        lat: station.Coords.latitude,
                        lng: station.Coords.longitude
                    }, map: map, icon: gasIcon
                });
                mark.setTitle(station.Name);
                mark.addListener('click', ()=>{
                    infoWindow.setContent('<h3>'+station.Name+'</h3><p>Regular: $'+station.RegularPrice+'<p>Plus: $'+station.PlusPrice+'</p><p>Premium: $'+station.PremiumPrice+'</p>');
                    infoWindow.open(map,mark);
                });
            markers.push(mark);
        });
    });
}
