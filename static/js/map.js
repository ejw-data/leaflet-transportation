let layers = {
    AMTRAK: new L.LayerGroup(),
    PLANES: new L.LayerGroup(),
    TRAINS: new L.LayerGroup(),
    CITIES: new L.LayerGroup(),
    QUERY: new L.LayerGroup()
}

let openstreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	});

let topographMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	});


const map = L.map('map',{
    center: [39.81118194836357, -98.55296954848511],
    zoom: 5,
    zoomControl: false,
    layers: [
        layers.PLANES,
        layers.TRAINS,
        layers.CITIES, 
        topographMap
    ]
})

let basemaps = {'TOPOGRAPHY': topographMap, 'STREET': openstreetMap}
    

let overlays = {
    "PLANES": layers.PLANES,
    "TRAINS": layers.TRAINS,
    "CITIES": layers.CITIES,
    "AMTRAK": layers.AMTRAK,
    "QUERY": layers.QUERY
}

L.control.layers(
            basemaps, 
            overlays, 
            {collapsed:false})
         .addTo(map);

L.control.zoom({
            position: 'bottomright'})
         .addTo(map);

// Updated file path - original was './static/data/city_locations_records.json'
d3.json("/api/v1.0/population/2022").then(data => {
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
        // console.log('Pairs ',data)
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


var amtrakRoutes= "static/data/amtrak-track-simple.json";
  d3.json(amtrakRoutes).then(function(amtrak) {
    var tracks = L.geoJSON(amtrak.features,{
      style: function(){
        return {
          color: "black",
          weight: 1.5,
          opacity: 0.8
        };
      }
    }).addTo(layers.AMTRAK);
  });