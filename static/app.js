const API = "https://nicolasapp.azurewebsites.net";

function getToken(){
return localStorage.getItem("token");
}

function cargarTours(){

document.getElementById("titulo").innerText = "Tours disponibles";

fetch(API + "/tours",{
headers:{
"Authorization":"Bearer " + getToken()
}
})

.then(res => res.json())

.then(data => {

mostrarTarjetas(data, "tour");

});

}

function cargarClientes(){

document.getElementById("titulo").innerText = "Clientes";

fetch(API + "/clientes",{
headers:{
"Authorization":"Bearer " + getToken()
}
}
)

.then(res => res.json())

.then(data => {

mostrarTarjetas(data, "cliente");

});

}

function cargarReservas(){

document.getElementById("titulo").innerText = "Reservas";

fetch(API + "/reservas",{
headers:{
"Authorization":"Bearer " + getToken()
}
})

.then(res => res.json())

.then(data => {

mostrarTarjetas(data, "reserva");

});

}

function mostrarTarjetas(data,tipo){

let contenedor = document.getElementById("contenedor");

contenedor.innerHTML = "";

data.forEach(item => {

let card = document.createElement("div");

card.className = "card";

if(tipo === "tour"){

card.innerHTML = `
<h3>${item.nombre}</h3>
<p>Ciudad: ${item.ciudad}</p>
<p>Precio: $${item.precio}</p>
`;

}

if(tipo === "cliente"){

card.innerHTML = `
<h3>${item.nombre}</h3>
<p>Email: ${item.email}</p>
`;

}

if(tipo === "reserva"){

card.innerHTML = `
<h3>Reserva</h3>
<p>Cliente ID: ${item.cliente_id}</p>
<p>Tour ID: ${item.tour_id}</p>
`;

}

contenedor.appendChild(card);

});

}az webapp stop \
  --name $NOMBRE_APP \
  --resource-group "${NOMBRE_APP}-rg"
