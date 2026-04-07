const API = "https://nicolasapp.azurewebsites.net";

let token = "";

// LOGIN
async function login() {

    const form = new URLSearchParams();
    form.append("username", document.getElementById("usuario").value);
    form.append("password", document.getElementById("password").value);

    const res = await fetch(API + "/token", {
        method: "POST",
        body: form
    });

    const data = await res.json();

    if (data.access_token) {

        token = data.access_token;

        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "block";

        cargarTours();

    } else {
        alert("Error en login");
    }
}


// LISTAR TOURS
async function cargarTours() {

    document.getElementById("titulo").innerText = "Tours disponibles";

    const res = await fetch(API + "/tours", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    if(res.status === 401){
        alert("Token inválido");
        return;
    }

    const data = await res.json();

    const container = document.getElementById("contenedor");
    container.innerHTML = "";

    data.forEach(t => {
        container.innerHTML += `
            <div style="margin-bottom:10px;">
                <strong>${t.nombre}</strong><br>
                ${t.ciudad} - $${t.precio}
            </div>
        `;
    });
}


// CLIENTES
async function cargarClientes(){

    document.getElementById("titulo").innerText = "Clientes";

    const res = await fetch(API + "/clientes", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const data = await res.json();

    const container = document.getElementById("contenedor");
    container.innerHTML = "";

    data.forEach(c => {
        container.innerHTML += `
            <div style="margin-bottom:10px;">
                <strong>${c.nombre}</strong><br>
                ${c.email}
            </div>
        `;
    });
}


// RESERVAS
async function cargarReservas(){

    document.getElementById("titulo").innerText = "Reservas";

    const res = await fetch(API + "/reservas", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const data = await res.json();

    const container = document.getElementById("contenedor");
    container.innerHTML = "";

    data.forEach(r => {
        container.innerHTML += `
            <div style="margin-bottom:10px;">
                Reserva #${r.id}<br>
                Cliente: ${r.cliente_id} | Tour: ${r.tour_id}
            </div>
        `;
    });
}


// CREAR TOUR
async function crearTour() {

    const tour = {
        id: Math.floor(Math.random() * 10000),
        nombre: "Nuevo Tour",
        ciudad: "Bogotá",
        precio: 50
    };

    await fetch(API + "/tours/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(tour)
    });

    cargarTours();
}