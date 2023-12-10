
var socket;

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
        { imgCoords: [5743.5, 6705], tooltip: "Hwajun's village 3" },
        { imgCoords: [5610, 5289], tooltip: "loaep's village 1" },
        { imgCoords: [5583, 5463], tooltip: "River bridge" },
        { imgCoords: [6384, 6474], tooltip: "Great Desert bridge start point" },
        { imgCoords: [6780.5, 6692.5], tooltip: "Great Desert bridge continued" },
        { imgCoords: [7825, 7418.5], tooltip: "Desert safehouse" },
        { imgCoords: [6976, 9113], tooltip: "J 3 3 3's village 2" },
        { imgCoords: [4264, 7183], tooltip: "🗿" },
        { imgCoords: [3810, 6824], tooltip: "most southern known point of snow biome" },
        
    ];

    // Loop over the array to create markers
    markers.forEach(function(marker) {
        var coords = map.unproject(marker.imgCoords, map.getMaxZoom()-1);
        L.marker(coords, {icon: iconOptions})
            .addTo(map)
            .bindPopup(marker.tooltip);
    });

    let userMarkers = {};
    let isSettingLocation = false;
    let discordUserId = 'userId';
    let discordUserName = 'userName';
    let localUserMarker = null;

    function initializeWebSocket() {
        // Replace 'ws://your-websocket-server-url' with your actual WebSocket server URL
        socket = new WebSocket('ws://map.j3.gg');

        socket.onopen = function(event) {
            console.log("WebSocket is open now.");
        };

        socket.onerror = function(event) {
            console.error("WebSocket error observed:", event);
        };

        socket.onmessage = function(event) {
            // Check if the data is a Blob
            if (event.data instanceof Blob) {
                // Create a FileReader to read the Blob
                var reader = new FileReader();
                reader.onload = function() {
                    // This event will trigger once the Blob has been read as text
                    try {
                        var data = JSON.parse(reader.result);
                        processWebSocketData(data);
                    } catch (e) {
                        console.error("Error parsing JSON from Blob:", e);
                    }
                };
                reader.onerror = function(e) {
                    console.error("Error reading Blob:", e);
                };
                // Read the Blob as text
                reader.readAsText(event.data);
            } else {
                // Assume event.data is a JSON string
                try {
                    var data = JSON.parse(event.data);
                    processWebSocketData(data);
                } catch (e) {
                    console.error("Error parsing JSON:", e);
                }
            }
        }
    }

    function processWebSocketData(data) {
        if (data.type === 'locationUpdate') {
            if (data.userId === discordUserId) {
                updateLocalUserMarker(data.location, data.profileImageUrl, data.userId, data.discordName);
            } else {
                addUserMarker(data.userId, data.location, data.profileImageUrl, data.discordName);
            }
        } else if (data.type === 'initialLocations') {
            Object.keys(data.userLocations).forEach(userId => {
                const location = data.userLocations[userId].location;
                const profileImageUrl = data.userLocations[userId].profileImageUrl;
                const discordName = data.userLocations[userId].discordName;
                addUserMarker(userId, location, profileImageUrl, discordName);
            });
        }
    }

    map.on('click', function(e) {
        if (isSettingLocation) {
            isSettingLocation = false;
            var latLng = [e.latlng.lat, e.latlng.lng];
    
            // Update local user's marker
            updateLocalUserMarker(latLng, discordProfileImageUrl, discordUserId, discordUserName);
    
            // Send location update to server
            sendLocationUpdate(discordUserId, latLng, discordProfileImageUrl, discordUserName);
        }
        var clickedPoint = map.project(e.latlng, map.getMaxZoom()-1);
        console.log(clickedPoint.x+',', clickedPoint.y);
    });

    function sendLocationUpdate(userId, location, profileImageUrl, discordName) {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'locationUpdate',
                userId,
                location,
                profileImageUrl,
                discordName
            }));
        } else {
            console.log("WebSocket is not open. Cannot send data.");
        }
    }

 
    function addUserMarker(userId, location, profileImageUrl, discordName) {
        var latLng = new L.LatLng(location[0], location[1]);
        var userIcon = L.icon({
            iconUrl: profileImageUrl,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            className: 'user-marker-icon'
        });
    
        var markerTooltip = discordName || userId; // Use Discord name if available, else use userId
    
        // Check if it's the local user or another user
        if (userId === discordUserId) {
            if (localUserMarker) {
                localUserMarker.setLatLng(latLng).setIcon(userIcon).bindPopup(markerTooltip);
            } else {
                localUserMarker = L.marker(latLng, {icon: userIcon}).addTo(map).bindPopup(markerTooltip);
            }
        } else {
            if (userMarkers[userId]) {
                userMarkers[userId].setLatLng(latLng).setIcon(userIcon).bindPopup(markerTooltip);
            } else {
                userMarkers[userId] = L.marker(latLng, {icon: userIcon}).addTo(map).bindPopup(markerTooltip);
            }
        }
    }

    fetch('/api/user')
        .then(response => response.json())
        .then(userData => {
            if (userData.authenticated) {
                discordUserId = userData.userInfo.id;
                discordUserName = userData.userInfo.global_name;
                discordProfileImageUrl = `https://cdn.discordapp.com/avatars/${userData.userInfo.id}/${userData.userInfo.avatar}.png`;

                initializeWebSocket();
                fetchAndInitializeLocations();            
                addSetLocationButton()
            } else {
                addLoginButton();
                initializeWebSocket();
                fetchAndInitializeLocations();
            }
        });

    function fetchAndInitializeLocations() {
        fetch('/api/user-locations')
            .then(response => response.json())
            .then(userLocations => {
                Object.keys(userLocations).forEach(userId => {
                    const location = userLocations[userId].location;
                    const profileImageUrl = userLocations[userId].profileImageUrl;
                    const discordName = userLocations[userId].discordName;

                    if (userId === discordUserId) {
                        updateLocalUserMarker(location, profileImageUrl, userId, discordName);
                    } else {
                        addUserMarker(userId, location, profileImageUrl, discordName);
                    }
                });
            });
    }
        
    function updateLocalUserMarker(location, profileImageUrl, userId, discordName) {
        var latLng = new L.LatLng(location[0], location[1]);
        var userIcon = L.icon({
            iconUrl: profileImageUrl,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            className: 'user-marker-icon'
        });
    
        if (userId === discordUserId) {
            if (localUserMarker) {
                localUserMarker.setLatLng(latLng).setIcon(userIcon);
            } else {
                localUserMarker = L.marker(latLng, {icon: userIcon}).addTo(map).bindPopup(discordName);
            }
        }
    }
    
    function addSetLocationButton() {
        var setLocationButton = L.control({position: 'topright'});
        setLocationButton.onAdd = function(map) {
            var div = L.DomUtil.create('div', 'set-location-button');
            div.innerHTML = '<button id="set-location-btn">Set Location</button>'; 
            return div;
        };
        setLocationButton.addTo(map);
    
        document.getElementById('set-location-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            isSettingLocation = true;
        });
    }
    
    function addLoginButton() {
        var loginButton = L.control({position: 'topright'});
        loginButton.onAdd = function(map) {
            var div = L.DomUtil.create('div', 'login-button');
            div.innerHTML = '<button onclick="window.location.href=\'/auth/discord\'">Login with Discord</button>';
            return div;
        };
        loginButton.addTo(map);
    }
});