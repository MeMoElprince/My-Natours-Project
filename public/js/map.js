export const setMap = (locations) => {
    var map = L.map('map',{
        scrollWheelZoom: false
    })
        
    L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    }).addTo(map);
    var bounds = new L.LatLngBounds();
    locations.forEach(el => {
    
        const x = el.coordinates[0];
        el.coordinates[0] = el.coordinates[1];
        el.coordinates[1] = x;
        bounds.extend(el.coordinates);
        L.marker(el.coordinates).addTo(map)
            .bindPopup(`<h1>Day ${el.day}: ${el.description}</h1>`)
            .openPopup();
    });
    map.fitBounds(bounds, {padding: [100, 100]});
} 

