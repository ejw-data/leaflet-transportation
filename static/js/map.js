let layers = {
    PLANES: new L.LayerGroup(),
    TRAINS: new L.LayerGroup(),
    CITIES: new L.LayerGroup(),
    QUERY: new L.LayerGroup()
}

const map = L.map('map',{
    center: [39.81118194836357, -98.55296954848511],
    zoom: 5,
    zoomControl: false,
    layers: [
        layers.PLANES,
        layers.TRAINS,
        layers.CITIES
    ]
})

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);


setIcons()
map.on('zoomend', setIcons)

let overlays = {
  "PLANES": layers.PLANES,
  "TRAINS": layers.TRAINS,
  "CITIES": layers.CITIES,
  "QUERY": layers.QUERY
}

L.control.layers(
        null, 
        overlays, 
        {collapsed:false}
    ).addTo(map);

L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// Updated file path - original was './static/data/city_locations_records.json'
d3.json("/api/v1.0/population/2022").then(data => {

    // console.log(data)

    for (let i = 0; i < data.length; i++ ){

      message = `<h3>City: ${data[i].City}</h3>
                 <h3>Population: ${data[i]['2022']}</h3>`

       new L.circle([data[i].lat, data[i].long], data[i]['2022']/25, {
                color:'red',
                fillColor: 'red',
                fillOpacity: 0.5,
            })
            .bindPopup(message)
            .openPopup()
            .addTo(layers.CITIES) 

    }
});

let initMaxDist = 200;
let initMinPop = 400000;
let initComPop = 600000;

d3.select('#mdist').attr("value", initMaxDist);
d3.select('#mpop').attr("value", initMinPop);
d3.select('#cpop').attr("value", initComPop);

connectCities(200, 400000, 600000)

let inputSelect = d3.select('#input')
inputSelect.on('change', updateParams)


function connectCities(dist, pop, combined){
    d3.json(`/api/v1.0/${dist}/${pop}/${combined}`).then(data => {  
        console.log('Pairs ',data)
        data.forEach(elem => {

            if(elem != null){
                L.polyline([elem.point1, elem.point2],{color:'blue'}).addTo(layers.QUERY)
            }
        })
    })
}
    

function updateParams(){
    let maxDistance = d3.select('#mdist').property("value");
    let combinedPopulation= d3.select('#cpop').property("value");
    let minPopulation= d3.select('#mpop').property("value");

    layers.QUERY.clearLayers()
    connectCities(maxDistance, minPopulation, combinedPopulation)
}
    

function setIcons() {
    let currentZoom = map.getZoom();
    console.log(currentZoom)

    layers.TRAINS.clearLayers()
    layers.PLANES.clearLayers()

    let trainCorrection;
    let planeCorrection

    if(currentZoom >= 12){
        trainCorrection = 45;
        planeCorrection = 25;
    }
    else if(currentZoom >= 7){
        trainCorrection= 43;
        planeCorrection = 25;
    }        
    else if(currentZoom >= 5){  
        trainCorrection= 30;
        planeCorrection = 14;
    }
    else if(currentZoom >= 3){ 
        trainCorrection= 18;
        planeCorrection = 10;
    }
    else{
            trainCorrection = 14;
            planeCorrection = 8;
    }

    let trainIcon = L.icon({
            iconUrl: './static/icons/train.png',
            iconSize:     [currentZoom/trainCorrection*195, currentZoom/trainCorrection*195],
            iconAnchor:   [currentZoom/planeCorrection*100, currentZoom/planeCorrection*100],
            popupAnchor:  [currentZoom/trainCorrection*120,currentZoom/trainCorrection*-30]
            }
        );

    let planeIcon = L.icon({
            iconUrl: './static/icons/plane.png',
            iconSize:     [currentZoom/planeCorrection*125, currentZoom/planeCorrection*125],
            iconAnchor:   [currentZoom/planeCorrection*100, currentZoom/planeCorrection*100],
            popupAnchor:  [currentZoom/planeCorrection*25, currentZoom/planeCorrection*-30]
        }
    );
    L.marker([41.8255616, -87.6844212], {icon: trainIcon})
                .bindPopup('Train in progress')
                .addTo(layers.TRAINS);

    L.marker([41.8755616, -87.6244212], {icon: planeIcon})
                .bindPopup('Plane in flight')
                .addTo(layers.PLANES);

    
};