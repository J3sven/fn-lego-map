const fs = require('fs');
const userLocationsFilePath = 'userLocations.json';

function readUserLocations() {
    if (!fs.existsSync(userLocationsFilePath)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(userLocationsFilePath, 'utf8'));
}

function updateUserLocation(userId, location, profileImageUrl) {
    const userLocations = readUserLocations();
    userLocations[userId] = {
        location: location,
        timestamp: new Date().toISOString(),
        profileImageUrl: profileImageUrl // Store the profile image URL
    };
    writeUserLocations(userLocations);
}

function writeUserLocations(userLocations) {
    try {
        fs.writeFileSync(userLocationsFilePath, JSON.stringify(userLocations, null, 2), 'utf8');
    } catch (error) {
        console.error("Failed to write user locations:", error);
    }
}

module.exports = {
    readUserLocations,
    updateUserLocation,
    writeUserLocations
};
