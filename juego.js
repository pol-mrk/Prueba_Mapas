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
        // var sitioDisponible = db.sitios.find(s => !grupoActual.progreso.includes(s.id));

        map.setView([lat, lng], 21);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        // Añadimos un icono de navegación para nuestra ubicación actual
        var miUbicacion = L.marker([lat, lng], {
            icon: L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/3699/3699532.png", iconSize: [30, 30] })
        }).addTo(map);

        cargarSitios();

        // Añadir un círculo con un radio de 20 metros desde la ubicación actual
        var radioSeguridad = L.circle([lat, lng], {
            color: 'blue',       // Color del borde
            fillColor: 'blue',   // Color de relleno
            fillOpacity: 0.3,    // Opacidad del relleno
            radius: 85           // Radio en metros
        }).addTo(map);

        // Verificamos el progreso
        function verificarProgreso(sitio, marcador) {

            var progreso = grupoActual ? grupoActual.progreso : [];

            if (!progreso.includes(sitio.id)) {

                var distancia = calcularDistancia(miUbicacion.getLatLng().lat, miUbicacion.getLatLng().lng, sitio.lat, sitio.lng);

                if (distancia < 85) {

                    alert("¡Pista desbloqueada en " + sitio.nombre + "!");
                    grupoActual.progreso.push(sitio.id);
                    localStorage.setItem("grupoActivo", JSON.stringify(grupoActual));

                    // Solo eliminamos el marcador cuando el sitio ha sido desbloqueado
                    // map.removeLayer(marcador);

                    // Cargamos el siguiente sitio
                    cargarSitios();

                }

            }
        }

        // Aquí cargaremos los sitios
        function cargarSitios() {

            // Si el siguiente sitio ha cargado, carga el nuevo marcador y su icono del nuevo sitio y vuelve a verificar el progreso
            // if (sitioDisponible) {
            db.sitios.forEach(sitio => {

                // var icono = L.icon({
                    // iconUrl: sitioDisponible.icon,
                    // iconSize: [40, 40]
                // });
                var icono = L.icon({
                    iconUrl: sitio.icon,
                    iconSize: [40, 40]
                });

                // var marcador = L.marker([sitioDisponible.lat, sitioDisponible.lng], { icon: icono }).addTo(map).bindPopup("<strong>" + sitioDisponible.nombre + "</strong><br>" + sitioDisponible.pista);
                var marcador = L.marker([sitio.lat, sitio.lng], { icon: icono }).addTo(map).bindPopup("<strong>" + sitio.nombre + "</strong><br>" + sitio.pista);

                // verificarProgreso(sitioDisponible, marcador);
                verificarProgreso(sitio, marcador);
            });
            // }
        }

        // Aquí comprobaremos los cambios de ubicación
        navigator.geolocation.watchPosition(pos => {

            var lat = pos.coords.latitude;
            var lng = pos.coords.longitude;
            var precision = pos.coords.accuracy;

            if (precision > 100) {
                console.log("Ubicación ignorada por baja precisión:", precision, "metros");
                return;
            }

            console.log("Ubicación aceptada:", lat, lng, "Precisión:", precision, "metros");
            miUbicacion.setLatLng([lat, lng]);
            radioSeguridad.setLatLng([lat, lng]);

            // Verificar si está lo suficientemente cerca del sitio para desbloquearlo
            if (sitioDisponible && !grupoActual.progreso.includes(sitioDisponible.id)) {
                var distancia = calcularDistancia(lat, lng, sitioDisponible.lat, sitioDisponible.lng);
                
                if (distancia < 90) {
                    alert("¡Pista desbloqueada en " + sitioDisponible.nombre + "!");
                    
                    // Agregar sitio a progreso y actualizar en `localStorage`
                    grupoActual.progreso.push(sitioDisponible.id);
                    localStorage.setItem("grupoActivo", JSON.stringify(grupoActual));

                    // Eliminar marcador del mapa
                    map.removeLayer(sitioDisponible.marcador);

                    // Cargar el siguiente sitio
                    sitioDisponible = db.sitios.find(s => !grupoActual.progreso.includes(s.id));
                    cargarSitios();
                }
            }
            
        });

    }, error => {
        alert("No se pudo obtener la ubicación.");
    },
    {
        enableHighAccuracy: true,
        timeout: 3000,
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
