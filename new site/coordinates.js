var map = L.map('map')

function semap(gl){
	console.log([gl.coords.latitude,gl.coords.longitude])
	xcords = [gl.coords.latitude,gl.coords.longitude]
	xcords = [38.234853,21.7243963]
	window.map.setView(xcords, 16);
	}

navigator.geolocation.getCurrentPosition(semap);

var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/streets-v11',
		tileSize: 512,
		zoomOffset: -1
	}).addTo(map);

	