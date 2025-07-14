// Initialize map
const map = L.map('map').setView([20, 0], 2);

// Base map (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// GEBCO WMS endpoint (bathymetry)
const wmsUrl = 'https://www.gebco.net/data_and_products/gebco_web_services/web_map_service/mapserv?map=/data/gebco_2023.map';

// Overlay bathymetry layer
const bathy = L.tileLayer.wms(wmsUrl, {
  layers: 'GEBCO_LATEST',
  format: 'image/png',
  transparent: true,
  attribution: 'GEBCO Bathymetry'
}).addTo(map);

// When user clicks, fetch depth at that point
map.on('click', e => {
  const { lat, lng } = e.latlng;
  const size = map.getSize();
  const bounds = map.getBounds().toBBoxString();
  const point = map.latLngToContainerPoint(e.latlng);

  // Build GetFeatureInfo URL
  const params = {
    service: 'WMS',
    request: 'GetFeatureInfo',
    version: '1.1.1',
    layers: 'GEBCO_LATEST',
    query_layers: 'GEBCO_LATEST',
    styles: '',
    bbox: bounds,
    width: size.x,
    height: size.y,
    srs: 'EPSG:4326',
    format: 'image/png',
    info_format: 'text/plain',  // simple plain-text response
    x: Math.round(point.x),
    y: Math.round(point.y)
  };
  const url = wmsUrl + '&' + new URLSearchParams(params).toString();

  fetch(url)
    .then(r => r.text())
    .then(text => {
      const val = text.trim();
      document.getElementById('info').innerHTML =
        `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}<br>Depth: ${val} m`;
    })
    .catch(err => {
      console.error(err);
      document.getElementById('info').textContent =
        'Depth information not available at this location.';
    });
});
