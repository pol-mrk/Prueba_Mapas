var db;
var grupoActual = JSON.parse(localStorage.getItem("grupoActivo"));

// Cargamos la base de datos JSON
fetch("db.json")
.then(response => response.json())
.then(data => {
    db = data;
    console.log("Base de datos cargada:", db);
});

// Nos unimos a un grupo
function unirseAGrupo() {

    // Pillamos el codigo ingresado,y lo comparamos con el de la bbdd json
    var codigoIngresado = document.getElementById("codigoGrupo").value;
    var grupo = db.grupos.find(g => g.codigo === codigoIngresado);
    var mensaje = document.getElementById("mensaje");

    // Si está bien, añadimos el jugador al grupo (con la llave "grupoActivo") con el nombre que queramos
    if (grupo) {

        grupo.miembros.push("Jugador21");
        localStorage.setItem("grupoActivo", JSON.stringify(grupo));
        mensaje.innerHTML = "¡Juego iniciado!";
        iniciarJuego();


    } else {

        mensaje.innerHTML = "Código incorrecto.";
        
    }
}

// Iniciamos el juego con el mapa
function iniciarJuego() {

    // Inicializamos el mapa sin vista fija
    var map = L.map('map');

    // Obtenemos la ubicación actual del usuario y centramos el mapa
    navigator.geolocation.getCurrentPosition(pos => {

        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        
        // Cargamos el siguiente sitio
        var sitioDisponible = db.sitios.find(s => !grupoActual.progreso.includes(s.id));

        map.setView([lat, lng], 21);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        // Añadimos un icono de navegación para nuestra ubicación actual
        var miUbicacion = L.marker([lat, lng], {
            icon: L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/3699/3699532.png", iconSize: [30, 30] })
        }).addTo(map);

        cargarSitios();

        // Verificamos el progreso
        function verificarProgreso(sitio, marcador) {

            var progreso = grupoActual ? grupoActual.progreso : [];

            if (!progreso.includes(sitio.id)) {

                var distancia = calcularDistancia(miUbicacion.getLatLng().lat, miUbicacion.getLatLng().lng, sitio.lat, sitio.lng);

                if (distancia < 20) {

                    alert("¡Pista desbloqueada en " + sitio.nombre + "!");
                    grupoActual.progreso.push(sitio.id);
                    localStorage.setItem("grupoActivo", JSON.stringify(grupoActual));

                    // Solo eliminamos el marcador cuando el sitio ha sido desbloqueado
                    map.removeLayer(marcador);

                    // Cargamos el siguiente sitio
                    cargarSitios();

                }

            }
        }

        // Aquí cargaremos los sitios
        function cargarSitios() {

            // Si el siguiente sitio ha cargado, carga el nuevo marcador y su icono del nuevo sitio y vuelve a verificar el progreso
            if (sitioDisponible) {
            // db.sitios.forEach(sitio => {

                var icono = L.icon({
                    iconUrl: sitioDisponible.icon,
                    iconSize: [40, 40]
                });
                // var icono = L.icon({
                //     iconUrl: sitio.icon,
                //     iconSize: [40, 40]
                // });

                var marcador = L.marker([sitioDisponible.lat, sitioDisponible.lng], { icon: icono }).addTo(map).bindPopup("<strong>" + sitioDisponible.nombre + "</strong><br>" + sitioDisponible.pista);
                // var marcador = L.marker([sitio.lat, sitio.lng], { icon: icono }).addTo(map).bindPopup("<strong>" + sitio.nombre + "</strong><br>" + sitio.pista);

                verificarProgreso(sitioDisponible, marcador);
            // });
            }
        }

        // Aquí comprobaremos los cambios de ubicación
        navigator.geolocation.watchPosition(pos => {
            var lat = pos.coords.latitude;
            var lng = pos.coords.longitude;
            miUbicacion.setLatLng([lat, lng]);
        });

    }, error => {
        alert("No se pudo obtener la ubicación.");
    },
    {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
}

// Aquí calcularemos la distancia que hay entre mi ubicación actual y el sitio donde queremos ir
function calcularDistancia(lat1, lon1, lat2, lon2) {
    var rad = Math.PI / 180;
    var R = 6371;
    var dLat = (lat2 - lat1) * rad;
    var dLon = (lon2 - lon1) * rad;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
}
