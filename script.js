const searchInput = document.getElementById("search");
const resultList = document.getElementById("result-list");
const suggestions = document.getElementById("suggestions");
const mapContainer = document.getElementById("map-container");
const currentMarkers = [];
let lat = 54.526;
let long = 15.2551;
let view = 13;

const map = L.map(mapContainer).setView([lat, long], view);

//Esri Vector Basemap
const apiKey = "<YOUR_API_KEY>";
const authentication = arcgisRest.ApiKeyManager.fromKey(apiKey);

const basemapEnum = "e16f851bdec647edba0498e186a5329c";
L.esri.Vector.vectorBasemapLayer(basemapEnum, {
  apiKey: apiKey,
}).addTo(map);

let magicKey =
  "dHA9MCNsb2M9MjAyNjE5NTYjbG5nPTQ2I3BsPTExOTkyNTczI2xicz0xNDo4Mzk5NDAw";
geocodeStuff(magicKey);

searchInput.addEventListener("keyup", (e) => {
  const input = searchInput.value;
  view = 13;
  queryResults(input);
});

//arcGIS REST JS Auto Suggest
function queryResults(query) {
  arcgisRest
    .suggest(query, { params: { maxSuggestions: 5 }, authentication })
    .then((response) => {
      let res = response.suggestions;
      let stuff = [];
      stuff.length > 5
        ? () => {
            stuff.length = 0;
            stuff.push(res);
          }
        : stuff.push(res);
      for (const sugg of stuff[0]) {
        const sli = document.createElement("li");
        const key = sugg.magicKey;
        sli.classList.add("list-group-item", "list-group-item-action");
        sli.innerHTML = sugg.text;
        suggestions.appendChild(sli);
        if (suggestions.childElementCount > 5) {
          suggestions.removeChild(suggestions.firstChild);
        }
        sli.addEventListener("click", (event) => {
          for (const child of suggestions.children) {
            child.classList.remove("active");
          }
          event.target.classList.add("active");
          searchInput.value = sugg.text;
          geocodeStuff(key);
        });
      }
    })
    .catch((error) => {
      console.error(`ERROR! ${error}`);
    });
}

let longitude = "";
let latitude = "";

function geocodeStuff(magicKey) {
  while (suggestions.firstChild) {
    suggestions.removeChild(suggestions.firstChild);
  }
  arcgisRest
    .geocode({
      magicKey,
      authentication,
    })
    .then((res) => {
      longitude = res.candidates[0].location.x.toString();
      latitude = res.candidates[0].location.y.toString();
      long = res.candidates[0].location.x;
      lat = res.candidates[0].location.y;
    })
    .then(() => {
      arcgisRest
        .geocode({
          params: {
            category: "Post Office",
            location: `${long}, ${lat}`,
          },
          outFields: "*",
          authentication,
        })
        .then((res) => {
          console.log(res);
          showLocations(res.candidates);
        });
    });
}

function showLocations(res) {
  resultList.innerHTML = "";
  for (const marker of currentMarkers) {
    map.removeLayer(marker);
  }
  map.setView(new L.LatLng(lat, long), view);
  for (const result of res) {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "list-group-item-action");
    const latiLongi = { lat: result.location.y, lon: result.location.x };
    li.innerHTML = result.attributes.Place_addr;
    li.addEventListener("click", (event) => {
      for (const child of resultList.children) {
        child.classList.remove("active");
      }
      event.target.classList.add("active");
      const clickedData = latiLongi;
      const position = new L.LatLng(clickedData.lat, clickedData.lon);
      map.setView(position, 13);
    });
    const position = new L.LatLng(result.location.y, result.location.x);
    currentMarkers.push(
      new L.marker(position).addTo(map).bindTooltip(() => {
        return L.Util.template(
          `<b>Name: </b>${result.address}<br/><b>Address: </b>${result.attributes.Place_addr}`
        );
      })
    );
    resultList.appendChild(li);
  }
}
