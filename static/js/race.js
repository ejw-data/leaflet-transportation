// setIcons()
// map.on('zoomend', setIcons)

// function setIcons() {
//     let currentZoom = map.getZoom();
//     // console.log(currentZoom)

//     layers.TRAINS.clearLayers()
//     layers.PLANES.clearLayers()

//     let trainCorrection;
//     let planeCorrection

//     if(currentZoom >= 12){
//         trainCorrection = 45;
//         planeCorrection = 25;
//     }
//     else if(currentZoom >= 7){
//         trainCorrection= 43;
//         planeCorrection = 25;
//     }        
//     else if(currentZoom >= 5){  
//         trainCorrection= 30;
//         planeCorrection = 14;
//     }
//     else if(currentZoom >= 3){ 
//         trainCorrection= 18;
//         planeCorrection = 10;
//     }
//     else{
//             trainCorrection = 14;
//             planeCorrection = 8;
//     }

//     let trainIcon = L.icon({
//             iconUrl: './static/icons/train.png',
//             iconSize:     [currentZoom/trainCorrection*195, currentZoom/trainCorrection*195],
//             iconAnchor:   [currentZoom/planeCorrection*100, currentZoom/planeCorrection*100],
//             popupAnchor:  [currentZoom/trainCorrection*120,currentZoom/trainCorrection*-30]
//             }
//         );

//     let planeIcon = L.icon({
//             iconUrl: './static/icons/plane.png',
//             iconSize:     [currentZoom/planeCorrection*125, currentZoom/planeCorrection*125],
//             iconAnchor:   [currentZoom/planeCorrection*100, currentZoom/planeCorrection*100],
//             popupAnchor:  [currentZoom/planeCorrection*25, currentZoom/planeCorrection*-30]
//         }
//     );
// }
let trainIcon = L.icon({
        iconUrl: './static/icons/train.png',
        iconSize:     [19.5, 19.5],
        iconAnchor:   [10.0, 10.0],
        popupAnchor:  [12.0, -3.0]
        }
    );

let planeIcon = L.icon({
        iconUrl: './static/icons/plane.png',
        iconSize:     [25, 25],
        iconAnchor:   [20, 20],
        popupAnchor:  [6, -6]
        }
    )


function race(){
    let startState = d3.select("#startState").property("value")
    let startCity = d3.select('#startCity').property('value')

    let endState = d3.select("#endState").property("value")
    let endCity = d3.select('#endCity').property('value')

    if(startState == ""){
        startState = 'Alabama'
    }
    if(startCity == ""){
        startCity = 'Huntsville'
    }
    if(endState == ""){
        endState = 'Illinois'
    }
    if(endCity == ""){
        endCity = 'Chicago'
    }


   d3.json(`/api/v1.0/city/${startCity}/${startState}/${endCity}/${endState}`).then(data => {
        let start = [data.point1[0], data.point1[1]];
        let end = [data.point2[0], data.point2[1]];

        let airportWait = 2    // 2 hour boarding wait
        let conversion = 3000;  // 1 real hr = 3000 millisecond simulated = 3 second simulated
        let trainSpeed = 200;  // 200 mph
        let planeSpeed = 560;  // 560 mph
        let travelDistance = data.distance; 

        let breakEvenTime = trainSpeed*airportWait/(planeSpeed - trainSpeed)
        let breakEvenDistance = breakEvenTime*planeSpeed  // in miles
        let BEDistanceMeters = breakEvenDistance*1609     // in meters

        let trainTime = travelDistance/trainSpeed*conversion
        let planeTime = travelDistance/planeSpeed*conversion

        layers.TRAINS.clearLayers()
        layers.PLANES.clearLayers()

        L.circle(L.latLng(start), BEDistanceMeters,{'color':'blue',
                                            'opacity':0.25,
                                            'fillColor':'blue',
                                            'fillOpacity':0.25}).addTo(layers.TRAINS);
        L.circle(L.latLng(start), BEDistanceMeters,{'color':'blue',
                                            'opacity':0.25,
                                            'fillColor':'blue',
                                            'fillOpacity':0.25}).addTo(layers.PLANES);

        let markerTrain = L.Marker.movingMarker([start,end],[trainTime], {icon: trainIcon})
            .bindPopup('Train in progress')
            .addTo(layers.TRAINS);

        let markerPlane = L.Marker.movingMarker([start,end],[planeTime], {icon: planeIcon})
                .bindPopup('Plane in flight')
                .addTo(layers.PLANES);

        markerTrain.start(); 
        setTimeout(function(){markerPlane.start()},airportWait*conversion);   // 2 hour airpoint checkin time 
    })  

}
