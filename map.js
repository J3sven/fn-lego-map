document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('mapid', {
        minZoom: 1,
        maxZoom: 4,
        center: [0, 0],
        zoom: 1,
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

    // // Adding markers
    // var iconOptions = {
    //     // Define the appearance of the icon here
    // };

    // var marker = L.marker([coordinateX, coordinateY], {icon: iconOptions}).addTo(map);
    // marker.bindPopup('Your tooltip text here');
});
