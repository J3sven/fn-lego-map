document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('mapid', {
        minZoom: 1,
        maxZoom: 4,
        center: [0, 0],
        zoom: 2,
        crs: L.CRS.Simple
    });

    // Dimensions of the image
    var w = 12000, // width of the image
        h = 12856; // height of the image

    // Calculate the edges of the image, in coordinates
    var southWest = map.unproject([0, h], map.getMaxZoom()-1);
    var northEast = map.unproject([w, 0], map.getMaxZoom()-1);
    var bounds = new L.LatLngBounds(southWest, northEast);

    // Add the image to the map
    L.imageOverlay('./lego-map.webp', bounds).addTo(map);

    // Set the view to the center of the image
    map.fitBounds(bounds);

    var iconOptions = L.divIcon({
        className: 'custom-icon', // Custom class name to target the div
        html: '<img src="./icon.png" style="width:24px; height:24px;">',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
    
    // Add custom CSS
    var style = document.createElement('style');
    style.innerHTML = '.custom-icon { border: none !important; background: none !important; }';
    document.getElementsByTagName('head')[0].appendChild(style);
    

    // Array of marker data
    var markers = [
        { imgCoords: [5793, 5596], tooltip: "J 3 3 3's village 1" },
        { imgCoords: [5611, 5552], tooltip: "Hwajun's village 1" },
        { imgCoords: [5393, 5527], tooltip: "Hwajun's village 2" },
        { imgCoords: [2749, 3706], tooltip: "Hwajun's village 3" },
        { imgCoords: [5610, 5289], tooltip: "loaep's village 1" },
        { imgCoords: [5583, 5463], tooltip: "River bridge" },
        { imgCoords: [6384, 6474], tooltip: "Great Desert bridge start point" },
        { imgCoords: [6780.5, 6692.5], tooltip: "Great Desert bridge continued" },
        { imgCoords: [7825, 7418.5], tooltip: "Desert safehouse" },
        { imgCoords: [6976, 9113], tooltip: "J 3 3 3's village 2" },
        
    ];

    // Loop over the array to create markers
    markers.forEach(function(marker) {
        var coords = map.unproject(marker.imgCoords, map.getMaxZoom()-1);
        L.marker(coords, {icon: iconOptions})
            .addTo(map)
            .bindPopup(marker.tooltip);
    });

    map.on('click', function(e) {
        var clickedPoint = map.project(e.latlng, map.getMaxZoom()-1);
        console.log(clickedPoint.x+',', clickedPoint.y);
    });
    
});
