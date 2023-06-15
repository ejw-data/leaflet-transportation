let layers = {
    PLANES: new L.LayerGroup(),
    TRAINS: new L.LayerGroup()
}

const map = L.map('map',{
    center: [41.8755616, -87.6244212],
    zoom: 5,
    layers: [
        layers.PLANES,
        layers.TRAINS
    ]
})

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);


setIcons()
map.on('zoomend', setIcons)

let overlays = {
  "PLANES": layers.PLANES,
  "TRAINS": layers.TRAINS
}

L.control.layers(null, overlays).addTo(map);


d3.json("./static/data/city_locations_records.json").then(data => {
    console.log(data)

    for (let i = 0; i < data.length; i++ ){

    

      message = `<h3>City: ${data[i].City}</h3>
                 <h3>Population: ${data[i]['2022']}</h3>`

      new L.CircleMarker([data[i].lat, data[i].long], {
                radius: data[i]['2022']/75000,
                fillOpacity: 0.85,
                color:'white',
                fillColor: 'red',
                fillOpacity: 0.5,
                weight: 1.5
            })
            .bindPopup(message)
            .openPopup()
            .addTo(map)
    }
});




// Functions
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
            trainCorrection= 40;
            planeCorrection = 20;
        }        
        else if(currentZoom >= 5){   //good
            trainCorrection= 30;
            planeCorrection = 15;
        }
        else if(currentZoom >= 3){   //good
            trainCorrection= 20;
            planeCorrection = 13;
        }
        else{
             trainCorrection = 15;
             planeCorrection = 10;
        }

        let trainIcon = L.icon({
                iconUrl: './static/icons/train.png',
                iconSize:     [currentZoom/trainCorrection*195, currentZoom/trainCorrection*195],
                iconAnchor:   [currentZoom/trainCorrection*22, currentZoom/trainCorrection*94],
                popupAnchor:  [currentZoom/trainCorrection*120,currentZoom/trainCorrection*-30]
                }
            );

        let planeIcon = L.icon({
                iconUrl: './static/icons/plane.png',
                iconSize:     [currentZoom/planeCorrection*125, currentZoom/planeCorrection*125],
                iconAnchor:   [currentZoom/planeCorrection*-22, currentZoom/planeCorrection*194],
                popupAnchor:  [currentZoom/planeCorrection*45, currentZoom/planeCorrection*-160]
            }
        );
        L.marker([41.8255616, -87.6844212], {icon: trainIcon})
                    .bindPopup('Train in progress')
                    .addTo(layers.TRAINS);

        L.marker([41.8755616, -87.6244212], {icon: planeIcon})
                    .bindPopup('Plane in flight')
                    .addTo(layers.PLANES);

        
    };