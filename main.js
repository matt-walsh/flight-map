(function(){
    //Initializes the map, fetches point data, plots points onto map, waits 10 seconds and begins again
    function Start(){
        fetch('https://opensky-network.org/api/states/all')
        .then( res =>{
            return res.json()
        })
        .then(json => {
            //Filter raw json by Canadian Flights
            let canadianFlights = json.states.filter( currentState => {
                return currentState[2] === "Canada";
            })
    
            //Create the GeoJSON data from the filtered json data
            let flightGeoJSON = {
                "type": "FeatureCollection",
                "features" : canadianFlights.map((currentFlight) =>{
                    return {
                        "type": "Feature",
                        "properties" : {
                            "callsign" : currentFlight[1],
                            "country" : currentFlight[2],
                            "lat" : currentFlight[6],
                            "lon" : currentFlight[5],
                            "alt" : currentFlight[7],
                            "vel" : currentFlight[9],
                            "dir" : currentFlight[10],
                            "gnd" : currentFlight[8]
                        },
                        "geometry": {
                            "type" : "Point",
                            "coordinates": [currentFlight[5], currentFlight[6]]
                        }  
                    };
                })
            }
    
            //Define the plane icon
            let planeIcon = L.icon({
                iconUrl: 'plane.png',
                iconSize:     [18, 18],
                iconAnchor:   [9, 9],
                popupAnchor:  [0, 0]
            });
            
            //Clear the map of geoJSON Point layers
            map.eachLayer(function (layer) {
                if(layer.feature !== undefined){
                    map.removeLayer(layer);
                }
            });
            console.log("Processing...");
            //Plot the GeoJSON points onto the map, adding custom icon and popups
            L.geoJSON(flightGeoJSON, {
                pointToLayer: function(flightPoint, latlng){
                    return L.marker(latlng, {
                        icon: planeIcon,
                        rotationAngle: flightPoint.properties.dir
                    });
                },
                onEachFeature: function(flightPoint, layer){
                    layer.bindPopup(GeneratePopup(flightPoint));
                }
            }).addTo(map);
            setTimeout(()=>{
                Start();
            },10000)
        })
    }


    //Takes in a GeoJSON flight point and returns a formatted string representing it's properties
    function GeneratePopup(flightPoint){
        let popup = ""
        popup += `<p><strong>Callsign:</strong> ${flightPoint.properties.callsign}</p>`;
        popup += `<p><strong>Country:</strong> ${flightPoint.properties.country}</p>`;
        popup += `<p><strong>Latitude:</strong> ${flightPoint.properties.lat}</p>`;
        popup += `<p><strong>Longitude:</strong> ${flightPoint.properties.lon}</p>`;
        if(!flightPoint.properties.gnd){
            popup += `<p><strong>Altitude:</strong> ${flightPoint.properties.alt} m\n`;
            popup += `<p><strong>Speed:</strong> ${flightPoint.properties.vel} m/s\n`;
        }
        else{
            popup += `<em>On Runway.</em>`;
        }

        return popup;
    }

    //create map in leaflet and tie it to the div called 'theMap'
    var map = L.map('theMap').setView([42, -60], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    Start();
})()