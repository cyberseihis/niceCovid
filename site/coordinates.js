let myLocation;
var map = L.map("map").setView([38.246242, 21.7350847], 16);
var tiles = L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
  {
    maxZoom: 18,
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
  }
).addTo(map);

function addMarker(poi) {
  mrk = L.marker(Object.values(poi.coordinates));
  mrk.addTo(map);
}

function updateMap(pois) {
  pois.forEach((poi) => {
    addMarker(poi);
  });
}

document
  .getElementById("searchForm")
  .addEventListener("submit", async function (ev) {
    var type = document.getElementById("searchBar").value;
    ev.preventDefault();
    console.log(type);
    var poiz = await fetch(`http://localhost:4545/api/pois?type=${type}`)
      .then((res) => res.json())
      .catch((er) => console.error(er));
    console.log("pois:", poiz);
    updateMap(poiz);
  });

navigator.geolocation
  ? navigator.geolocation.getCurrentPosition((geo) => {
      myLocation = [geo.coords.latitude, geo.coords.longitude];
    })
  : alert("cant get postition");
