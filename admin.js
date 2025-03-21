fetch("db.json")
    .then(res => res.json())
    .then(db => {

        var ranking = document.getElementById("ranking");

        var formSitios = document.getElementById("form-sitios");
        var sitiosPorTag = document.getElementById("tag-filter");

        // Mostramos grupos ordenados por progreso de mayor a menor
        db.grupos.sort((a, b) => b.progreso.length - a.progreso.length).forEach(g => {
            ranking.innerHTML += "<p>" + g.id + " - " + g.progreso.length + " grupo/s encontrado/s</p>";
        });

        // Mostramos los sitios filtrados por tag
        sitiosPorTag.onchange = () => {
            var selectedTag = sitiosPorTag.value;
            var sitiosFiltrados = filtrarPorTag(selectedTag, db);
            mostrarSitios(sitiosFiltrados);
        };

        // Agregamos un nuevo sitio
        formSitios.onsubmit = (e) => {

            e.preventDefault();

            var sitio = {
                nombre: document.getElementById("name").value,
                lat: parseFloat(document.getElementById("lat").value),
                lng: parseFloat(document.getElementById("lng").value),
                tags: Array.from(document.getElementById("tags").selectedOptions).map(option => option.value),
                icon: document.getElementById("selector-iconos").value,
                pista: "Pista aquí"
            };

            nuevoSitio(sitio);
            mostrarSitios(db.sitios);
        };

        // Cargamos la tabla con todos los sitios
        mostrarSitios(db.sitios);
    });

// Función para agregar un nuevo sitio en el almacenamiento local
function nuevoSitio(sitio) {

    var db = JSON.parse(localStorage.getItem('db')) || { sitios: [] };
    
    // Agregar el nuevo sitio al arreglo de sitios
    db.sitios.push(sitio);

    // Guardar la base de datos actualizada
    localStorage.setItem('db', JSON.stringify(db));
}

// Filtrar sitios por Tag (si hemos seleccionado alguno)
function filtrarPorTag(tag, db) {

    if (tag) {
        return db.sitios.filter(sitio => sitio.tags.includes(tag));
    } else {
        return db.sitios;
    }

}

function mostrarSitios(sitios) {
    var tablaSitios = document.getElementById("sitios");
    tablaSitios.innerHTML = '';  // Limpiar la tabla antes de mostrar los sitios

    // Mostrar cada sitio en una fila de la tabla
    sitios.forEach(sitio => {
        tablaSitios.innerHTML += "<tr>" +
            "<td>" + sitio.nombre + "</td>" +
            "<td>" + sitio.lat + "</td>" +
            "<td>" + sitio.lng + "</td>" +
            "<td>" + sitio.tags.join(', ') + "</td>" +
            "<td><img src='" + sitio.icon + "' alt='Icono' width='30'></td>" +
        "</tr>";
    });
}