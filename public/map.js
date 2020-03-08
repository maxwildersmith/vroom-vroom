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

var controlUI2 = document.createElement('div');
controlUI2.style.backgroundColor = '#fff';
controlUI2.style.border = '2px solid #fff';
controlUI2.style.borderRadius = '2px';
controlUI2.style.boxShadow = 'rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;';
controlUI2.style.marginTop = '10px';
controlUI2.style.textAlign = 'center';
controlUI2.title = 'Get directions';
controlUI2.style.height = '40px';
buttonDiv.appendChild(controlUI2);

var controlText2 = document.createElement('div');
controlText2.style.color = 'rgb(25,25,25)';
controlText2.style.fontFamily = 'Roboto,Arial,sans-serif';
controlText2.style.fontSize = '30px';
controlText2.style.paddingLeft = '17px';
controlText2.style.paddingRight = '17px';
controlText2.style.verticalAlign = 'middle';
controlText2.innerHTML = '<i class="fas fa-search-location"></i>';
controlUI2.appendChild(controlText2);

controlUI.addEventListener('click', function() {
    alert("You clicked the settings button");
});

controlUI2.addEventListener('click', function() {
    getDirections();
});

var infoWindow = {};
var directionService, directionRenderer;
window.initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 14,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        fullscreenControl: false,
        streetViewControl: false
    });
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(buttonDiv);
    getUserLocation();
    carIcon = {url: 'car.png', scaledSize: new google.maps.Size(73/1.5,38/1.5)};
    gasIcon = {url: 'gasPump.png',scaledSize:new google.maps.Size(40,46)};

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    infoWindow = new google.maps.InfoWindow({});
    $.get('/getCars', function(res) {
        car = res[0];
        console.log("Setting car to ",car);
    });
    plotGas();
};

function getDirections(){
    var location = prompt("Where do you want to get directions to?", "Las Vegas");
    if(location==""){
        setMarkers(markers,map);
        return;
    }
    directionsRenderer.set('directions', null);
    directionsRenderer.setMap(map);
    var request = {
        origin: carMarker.position?carMarker.position:map.getCenter(),
        destination: location,
        travelMode: 'DRIVING'
    };
    directionsService.route(request, (res, stat)=>{
        if(stat=="OK"){
            directionsRenderer.setDirections(res);
            getGasStationsForRoute(res.routes[0].overview_path,res)
            console.log(res);
        }
    });
}

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
var car = null;
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
                mark.data = station;
                mark.addListener('click', ()=>{
                    infoWindow.setContent('<h3>'+station.Name+
                        '</h3><p>Regular: $'+station.RegularPrice.toFixed(2)+
                        '<p>Plus: $'+station.PlusPrice.toFixed(2)+
                        '</p><p>Premium: $'+station.PremiumPrice.toFixed(2)+'</p>');
                    infoWindow.open(map,mark);
                });
            markers.push(mark);
        });
    });
}



function setMarkers(mArr, val){
    mArr.forEach((marker)=>{marker.setMap(val);});
}

function getDistance(a,b){
    console.log(a,b);
    return Math.hypot(a.lat()-b.lat(),a.lng()-b.lng());
}

function inRangeOfPolyLine(point, line, range){
    return line.some(val=>{return getDistance(point,val)<=range;});
}

function getGasStationsForRoute(line, direction){
        var nearbyGas = markers.filter(marker=>{
            return inRangeOfPolyLine(marker.position, line, .1)
        });
        if(car!=null){
            var range = car.Highway*car.TankCap;
            console.log(range);
            if(range>=direction.routes[0].legs[0].distance.value/1609){
                alert("Your selected vehicle can make the trip in one go! Here are the recommended stations to fill up at along the way.")
            } else {
                var places = [line[0]];
                nearbyGas.forEach((marker) => {
                    places.push(marker.position);
                });
                places.push(line[line.length - 1]);
                console.log(places);
                var disMat = new google.maps.DistanceMatrixService();
                disMat.getDistanceMatrix({
                    origins: places,
                    destinations: places,
                    travelMode: 'DRIVING',

                }, (res) => {
                    console.log(res);
                    var distances = res.rows.map((row, ri)=>{return row.elements.map((el, ci)=>{return {distance: el.distance.value,from:ri,to:ci}});}).flat().filter((x)=>{return x.to>x.from});
                    distances.sort((a,b)=>{return a.distance-b.distance;}).sort((a, b) => a.from-b.from);
                    //Now have array of distances from various points sorted, do math to check range against the distances in these

                });
            }
        }
        setMarkers(markers.filter((gas)=>{return !nearbyGas.includes(gas)}),null);
        nearbyGas.sort((a,b)=>{return a.data.RegularPrice-b.data.RegularPrice});
        nearbyGas.forEach((gas,index)=>{
            var tmp = {url: 'gasPump.png',scaledSize:new google.maps.Size(40/(1+index/nearbyGas.length),46/(1+index/nearbyGas.length))};
            console.log(index);
            gas.setIcon(tmp);
        })
}