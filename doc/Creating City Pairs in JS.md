
Below is the original code when developing the lines that connect city pairs.  Even though the city pair connections layer is not visible when the page loads, the calculation is so intensive that the browser would not be able to run new javascript commands simultaneously.  It was must noticeable when clicking the sidebar icon - the sidebar javascript would not execute until the map javascript was complete which took about three seconds from the start of the page loading.  

```
// // Original path of data
// d3.json("./static/data/city_locations_records.json").then(data => {

// Updated path of data
d3.json("/api/v1.0/population/2022").then(data =>   {    
    
    let city_list = data.map(i => i.City);

    let pairs_list=[];
    let distance;
    let point1;
    let point2;

    city_list.forEach(element1 => { 
        city_list.forEach(element2 => {
            if(element1 == element2){
                //skip
            }
            else {
                let loc1 = data.filter(i => i.City == element1)[0];
                let loc2 = data.filter(i => i.City == element2)[0];
                let population1 = loc1['2022']
                let population2 = loc2['2022']

                distance = haversine(loc1, loc2)
                point1 = [loc1.lat, loc1.long]
                point2 = [loc2.lat, loc2.long]
                pairs_list.push({"city1":element1, "city2":element2, "distance":distance, "point1": point1, "point2":point2, 'population1':population1, 'population2':population2})
            }
        })
        
    });
    console.log(pairs_list)

    let initMaxDist = 200;
    let initMinPop = 400000;
    let initComPop = 600000;

    d3.select('#mdist').attr("value", initMaxDist);
    d3.select('#mpop').attr("value", initMinPop);
    d3.select('#cpop').attr("value", initComPop);
    

    connectCities(pairs_list, 200, 400000, 600000)

    inputSelect = d3.select('#input')
    inputSelect.on('change', updateParams)


    function connectCities(cities, dist, pop, combined){
        cities.forEach(elem =>{
            if( (elem.distance < dist) && (elem.population1 > pop) && ((elem.population1 + elem.population2)>combined) ){
                L.polyline([elem.point1, elem.point2],{color:'blue'}).addTo(layers.QUERY)
            }
        })
    }

})

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

function updateParams(){
    let maxDistance = d3.select('#mdist').property("value");
    let combinedPopulation= d3.select('#cpop').property("value");
    let minPopulation= d3.select('#mpop').property("value");

    layers.QUERY.clearLayers()
    connectCities(pairs_list, maxDistance, minPopulation, combinedPopulation)
    }
```