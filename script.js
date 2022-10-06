const resultList = document.getElementById("result-list");
const mapContainer = document.getElementById("map-container");
let lat = 37.7749;
let long = -122.4194;
let view = 13;

//create Leaflet map container
const map = L.map(mapContainer).setView([lat, long], view);

const apiKey = "<YOUR_API_KEY>";
//custom vector basemap layer
const basemapEnum = "e16f851bdec647edba0498e186a5329c";
L.esri.Vector.vectorBasemapLayer(basemapEnum, {
  apiKey: apiKey,
}).addTo(map);

const searchControl = L.esri.Geocoding.geosearch({
  position: "topright",
  placeholder: "Enter an address, city, or zip code",
  useMapBounds: false,
  providers: [
    L.esri.Geocoding.arcgisOnlineProvider({
      apikey: apiKey,
      nearby: {
        lat: 37.7749,
        lng: -122.4194,
      },
    }),
  ],
}).addTo(map);

const results = L.layerGroup().addTo(map);
searchControl.on("results", (data) => {
  results.clearLayers();
  for (let i = data.results.length - 1; i >= 0; i--) {
    const marker = L.marker(data.results[i].latlng);
    const lat = data.results[i].latlng.lat;
    const long = data.results[i].latlng.lng;
    map.setView(new L.LatLng(lat, long), 10);
    console.log(data.results);
  }
  while (resultList.firstChild) {
    resultList.removeChild(resultList.firstChild);
  }
  showPlaces();
});

const layerGroup = L.layerGroup().addTo(map);

function showPlaces() {
  L.esri.Geocoding.geocode({
    apikey: apiKey,
  })
    .category("Post Office")
    .nearby(map.getCenter(), 10)
    .run(function (err, response) {
      layerGroup.clearLayers();
      response.results.forEach((searchResult) => {
        const li = document.createElement("li");
        li.classList.add("list-group-item", "list-group-item-action");
        li.innerHTML = searchResult.properties.Place_addr;
        console.log(searchResult.properties.X);
        const latiLongi = {
          lat: searchResult.properties.Y,
          lon: searchResult.properties.X,
        };
        resultList.appendChild(li);
        li.addEventListener("click", (event) => {
          for (const child of resultList.children) {
            child.classList.remove("active");
          }
          event.target.classList.add("active");
          const clickedData = latiLongi;
          const position = new L.LatLng(clickedData.lat, clickedData.lon);
          map.setView(position, 13);
        });

        L.marker(searchResult.latlng)
          .addTo(layerGroup)
          .bindPopup(
            `<b>${searchResult.properties.PlaceName}</b></br>${searchResult.properties.Place_addr}`
          );
      });
    });
}
showPlaces();
