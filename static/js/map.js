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
// Original file path
// d3.json("./static/data/city_locations_records.json").then(data => {

// Updated file path
d3.json("/api/v1.0/population/2022").then(data => {

    console.log(data)

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

// Original path of data
// d3.json("./static/data/city_locations_records.json").then(data => {

// // Updated path of data
// d3.json("/api/v1.0/population/2022").then(data => {    
    
//     let city_list = data.map(i => i.City);

//     let pairs_list=[];
//     let distance;
//     let point1;
//     let point2;

//     city_list.forEach(element1 => { 
//         city_list.forEach(element2 => {
//             if(element1 == element2){
//                 //skip
//             }
//             else {
//                 let loc1 = data.filter(i => i.City == element1)[0];
//                 let loc2 = data.filter(i => i.City == element2)[0];
//                 let population1 = loc1['2022']
//                 let population2 = loc2['2022']

//                 distance = haversine(loc1, loc2)
//                 point1 = [loc1.lat, loc1.long]
//                 point2 = [loc2.lat, loc2.long]
//                 pairs_list.push({"city1":element1, "city2":element2, "distance":distance, "point1": point1, "point2":point2, 'population1':population1, 'population2':population2})
//             }
//         })
        
//     });
//     console.log(pairs_list)

    let initMaxDist = 200;
    let initMinPop = 400000;
    let initComPop = 600000;

    d3.select('#mdist').attr("value", initMaxDist);
    d3.select('#mpop').attr("value", initMinPop);
    d3.select('#cpop').attr("value", initComPop);
    

    // connectCities(pairs_list, 200, 400000, 600000)
    connectCities(200, 400000, 600000)

    inputSelect = d3.select('#input')
    inputSelect.on('change', updateParams)


    // function connectCities(cities, dist, pop, combined){
    //     cities.forEach(elem =>{
    //         if( (elem.distance < dist) && (elem.population1 > pop) && ((elem.population1 + elem.population2)>combined) ){
    //             L.polyline([elem.point1, elem.point2],{color:'blue'}).addTo(layers.QUERY)
    //         }
    //     })
    // }

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
        // connectCities(pairs_list, maxDistance, minPopulation, combinedPopulation)
        connectCities(maxDistance, minPopulation, combinedPopulation)
    }
    



// Functions

function haversine(dest1, dest2){
    let R = 3961  // miles
    let lat1 = dest1.lat*Math.PI/180
    let lat2 = dest2.lat*Math.PI/180

    let deltaLat = lat1 - lat2
    let deltaLon = (dest1.long - dest2.long)*Math.PI/180

    let a = Math.sin(deltaLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(deltaLon/2)**2
    let c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
    let d = R*c

    return d
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