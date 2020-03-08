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
    };


function getUserLocation(){
    if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition((position => map.setCenter({lat: position.coords.latitude,lng: position.coords.longitude})));
}