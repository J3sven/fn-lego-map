document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('mapid', {
        minZoom: 1,
        maxZoom: 4,
        center: [0, 0],
        zoom: 2,
        crs: L.CRS.Simple
    });

    // Dimensions of the image
    var w = 6000, // width of the image
        h = 6461; // height of the image

    // Calculate the edges of the image, in coordinates
    var southWest = map.unproject([0, h], map.getMaxZoom()-1);
    var northEast = map.unproject([w, 0], map.getMaxZoom()-1);
    var bounds = new L.LatLngBounds(southWest, northEast);

    // Add the image to the map
    L.imageOverlay('./lego-map.png', bounds).addTo(map);

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
        { imgCoords: [2794, 2594], tooltip: "J 3 3 3's village 1" },
        { imgCoords: [2394, 2533], tooltip: "Hwajun's village 2" },
        { imgCoords: [2749, 3706], tooltip: "Hwajun's village 3" },
        { imgCoords: [2603.5, 2558.5], tooltip: "Hwajun's village 1" },
        { imgCoords: [2612.5, 2286.5], tooltip: "loaep's village 1" },
        { imgCoords: [2579, 2463], tooltip: "River bridge" },
        { imgCoords: [2802, 2002], tooltip: "Hostile camp" },
        { imgCoords: [3132.5, 2325.5], tooltip: "Cows" },
        { imgCoords: [3251.5, 2394], tooltip: "Cows" },
        { imgCoords: [3618, 2764], tooltip: "Boss" },
        { imgCoords: [3284, 3484], tooltip: "Boss" },
        { imgCoords: [3821, 3572], tooltip: "Boss" },
        { imgCoords: [4658, 4292], tooltip: "Boss" },
        { imgCoords: [4724, 3965], tooltip: "Boss" },
        { imgCoords: [3385, 3478], tooltip: "Great Desert bridge start point" },
        { imgCoords: [3788, 3699], tooltip: "Great Desert bridge continued" },
        { imgCoords: [4830, 4421], tooltip: "Desert safehouse" },
        { imgCoords: [2411, 3377.5], tooltip: "Corn field" },
        { imgCoords: [2358, 2193], tooltip: "Bridge" },
        { imgCoords: [2545, 3345], tooltip: "Bridge" },
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
