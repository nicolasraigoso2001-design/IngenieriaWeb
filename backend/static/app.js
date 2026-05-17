const API = "https://nicolasapp.azurewebsites.net";
let token = "";
let favoritos = [];


     



// LOGOUT

async function logout(){

    // eliminar sesión
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    token = "";

    // volver a login
    document.getElementById("app").style.display = "none";
    document.getElementById("login").style.display = "flex";

    // limpiar campos
    document.getElementById("usuario").value = "";
    document.getElementById("password").value = "";
}

// TOURS
async function cargarTours(){

    document.getElementById("titulo").innerText = "Tours";

    const res = await fetch(API + "/tours", {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();
    pintarTours(data);
}

// CLIENTES
async function cargarClientes(){

    document.getElementById("titulo").innerText = "Clientes";

    const res = await fetch(API + "/clientes", {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();

    const container = document.getElementById("contenedor");
    container.innerHTML = "";

    data.forEach(c => {
        container.innerHTML += `
        <div class="card">
            <div class="card-body">
                <h3>${c.nombre}</h3>
                <p>${c.email}</p>
            </div>
        </div>
        `;
    });
}

// RESERVAS
async function cargarReservas(){

    document.getElementById("titulo").innerText = "Reservas";

    const res = await fetch(API + "/reservas", {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();

    const container = document.getElementById("contenedor");
    container.innerHTML = "";

    data.forEach(r => {
        container.innerHTML += `
        <div class="card">
            <div class="card-body">
                <h3>Reserva #${r.id}</h3>
                <p>Cliente: ${r.cliente_id}</p>
                <p>Tour: ${r.tour_id}</p>
            </div>
        </div>
        `;
    });
}

// PERFIL


async function verPerfil(){

    const res = await fetch(API + "/perfil", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const data = await res.json();

    document.getElementById("titulo").innerText = "Perfil";

    document.getElementById("contenedor").innerHTML = `
        <div class="card">
            <div class="card-body">
                <h3>${data.username}</h3>
                <p>Rol: ${data.rol}</p>
                <p>Estado: ${data.estado}</p>
            </div>
        </div>
    `;
}

// TOURS CARD
function pintarTours(data){

    const container = document.getElementById("contenedor");
    container.innerHTML = "";

    data.forEach(t => {
        container.innerHTML += `
        <div class="card">
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e">
            <div class="card-body">
                <h3>${t.nombre}</h3>
                <p>${t.ciudad}</p>
                <strong>$${t.precio}</strong>
                <br>
                <button class="btn" onclick='agregarFavorito(${JSON.stringify(t)})'>
                    ❤️
                </button>
            </div>
        </div>
        `;
    });
}

//ver detakles 

function verDetalle(tour){

    document.getElementById("titulo").innerText = tour.nombre;

    document.getElementById("contenedor").innerHTML = `
        <div style="max-width:600px; margin:auto;">

            <img src="${tour.imagen}" style="width:100%; border-radius:15px;">

            <h2>${tour.nombre}</h2>
            <p><strong>Ciudad:</strong> ${tour.ciudad}</p>
            <p><strong>Precio:</strong> $${tour.precio}</p>

            <textarea id="desc" placeholder="Descripción">${tour.descripcion || ""}</textarea>

            <input type="text" id="img" placeholder="URL Imagen" value="${tour.imagen || ""}">

            <button onclick='guardarTour(${tour.id})'>Guardar</button>

        </div>
    `;
}



// FILTRO
async function filtrar(){

    const ciudad = document.getElementById("buscar").value;
    const precio = document.getElementById("precio").value;

    const res = await fetch(API + `/tours/buscar?ciudad=${ciudad}&precio_max=${precio}`, {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();
    pintarTours(data);
}

// FAVORITOS
function agregarFavorito(tour){
    if(!favoritos.find(f => f.id === tour.id)){
        favoritos.push(tour);
    }
}

function cargarFavoritos(){
    document.getElementById("titulo").innerText = "Favoritos";
    pintarTours(favoritos);
}

// MOSTRAR REGISTRO

function mostrarRegistro(){
    document.getElementById("login-box").style.display = "none";
    document.getElementById("registro").style.display = "block";
}

function cerrarRegistro(){
    document.getElementById("login-box").style.display = "block";
    document.getElementById("registro").style.display = "none";
}

// REGISTRAR
async function registrar(){

    try{

        const user = document.getElementById("newUser").value;
        const pass = document.getElementById("newPass").value;

        if(!user || !pass){
            alert("Completa todos los campos");
            return;
        }

        const res = await fetch(API + "/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username: user,
                password: pass
            })
        });

        const data = await res.json();

        if(res.ok){
            alert("Usuario creado correctamente");
            cerrarRegistro();
        }else{
            alert(data.detail);
        }

    }catch(error){
        console.error(error);
        alert("Error en registro");
    }
}


function olvidarPassword(){
    alert("Contacta al administrador para restablecer la contraseña");
}
//login

async function login(){

    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    if(!usuario || !password){
        alert("Completa usuario y contraseña");
        return;
    }

    try{

        const form = new URLSearchParams();
        form.append("username", usuario);
        form.append("password", password);

        const res = await fetch(API + "/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: form
        });

        console.log("STATUS:", res.status);

        if(!res.ok){
            const errorText = await res.text();
            console.log("ERROR:", errorText);
            alert("Usuario o contraseña incorrectos");
            return;
        }

        const data = await res.json();
        console.log("DATA:", data);

        token = data.access_token;

        localStorage.setItem("token", token);
        localStorage.setItem("username", usuario);

        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "block";

        document.getElementById("username-display").innerText = usuario;

        cargarTours();

    }catch(error){
        console.error("ERROR FETCH:", error);
        alert("Error conectando con el servidor");
    }
}


//guardar tour
async function guardarTour(id){

    const descripcion = document.getElementById("desc").value;
    const imagen = document.getElementById("img").value;

    const res = await fetch(API + "/tours/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            id: id,
            nombre: "",
            ciudad: "",
            precio: 0,
            descripcion: descripcion,
            imagen: imagen
        })
    });

    const data = await res.json();
    alert("Tour actualizado");

    cargarTours();
}



window.onload = function(){

    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("username");

    if(savedToken){

        token = savedToken;

       
        document.getElementById("app").style.display = "block";
        document.getElementById("login").style.display = "none";

        document.getElementById("username-display").innerText = savedUser;

        cargarTours();
    }
}