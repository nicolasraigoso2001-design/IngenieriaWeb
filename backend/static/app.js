console.log("✅ app.js cargado");

/*const API = "";*/
const API = "https://nicolasapp.azurewebsites.net";
let token = "";
let favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");


const ciudades = [

    "Bogotá",

    "Medellín",

    "Cartagena",

    "Santa Marta",

    "Armenia",

    "Pereira"

];
/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function mostrarToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerText = message;
    toast.classList.remove("toast-success","toast-error","toast-warning","show");
    if (message.includes("✅"))      toast.classList.add("toast-success");
    else if (message.includes("❌")) toast.classList.add("toast-error");
    else                             toast.classList.add("toast-warning");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3200);
}

/* ══════════════════════════════════════════
   MODALES — funciones unificadas
   El HTML usa: abrirLogin(), abrirRegistro()
   y también:   abrirLoginModal(), abrirRegistroModal()
   Todos apuntan al mismo modal.
══════════════════════════════════════════ */

// ── Abrir / cerrar LOGIN ──
function abrirLogin() {

    document.getElementById(
        "authModal"
    ).classList.remove("hidden");

    mostrarLogin();
}
function abrirLoginModal() {
    abrirLogin();
}



function cerrarLogin() {

    document.getElementById(
        "authModal"
    ).classList.add("hidden");
}
function cerrarModalLogin(e) {
    if (!e || e.target.id === "modal-login") cerrarLogin();
}

// ── Abrir / cerrar REGISTRO ──
function abrirRegistro() {
    document.getElementById("authModal").classList.remove("hidden");
    mostrarRegistro();                          // abre la pestaña registro
}
function abrirRegistroModal() { abrirRegistro(); }  // alias

function cerrarAuth() {
    document.getElementById("authModal").classList.add("hidden");
}
function cerrarModalRegistro(e) {
    if (!e || e.target.id === "modal-registro") cerrarAuth();
}

// ── Alternar entre los dos modales ──
function switchModal(tipo) {
    if (tipo === "registro") { cerrarLogin(); abrirRegistro(); }
    else                     { cerrarAuth();  abrirLogin();    }
}

// ── Pestañas dentro de #authModal ──
function mostrarLogin() {
    document.getElementById("loginForm").style.display    = "block";
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginTab").classList.add("active");
    document.getElementById("registerTab").classList.remove("active");
    document.querySelector(".auth-box").style.width = "450px";
}
function mostrarRegistro() {
    document.getElementById("loginForm").style.display    = "none";
    document.getElementById("registerForm").style.display = "block";
    document.getElementById("registerTab").classList.add("active");
    document.getElementById("loginTab").classList.remove("active");
    document.querySelector(".auth-box").style.width = "900px";
}

// ── Modal servicio ──
function mostrarServicio(tipo) {
    const info = {
        faq:       { icon:"❓", titulo:"Preguntas frecuentes",   desc:"¿Cómo reservo? ¿Puedo cancelar? ¿Cuáles son los medios de pago? Llámanos al +57 (1) 123-4567." },
        contacto:  { icon:"📞", titulo:"Contáctanos",            desc:"Llámanos al +57 (1) 123-4567 o escríbenos a info@turismor.co. Atención 24/7." },
        terminos:  { icon:"📄", titulo:"Términos y condiciones", desc:"Consulta nuestras políticas de reserva, cancelación y uso de la plataforma." },
        privacidad:{ icon:"🔒", titulo:"Política de privacidad", desc:"Tu información está protegida bajo la Ley 1581 de 2012." },
        hoteles:   { icon:"🏨", titulo:"Hoteles",                desc:"Más de 500 hoteles en los mejores destinos de Colombia." },
        tours:     { icon:"🗺️", titulo:"Tours",                  desc:"Descubre Colombia con guías expertos. Aventura, cultura, naturaleza y más." },
        transporte:{ icon:"🚐", titulo:"Transporte turístico",   desc:"Traslados aeropuerto-hotel y entre ciudades. Bus, Jeep Willys, lancha." },
        seguro:    { icon:"🛡️", titulo:"Seguro de viaje",        desc:"Cobertura médica, equipaje y cancelación. Desde $25.000 COP por persona." },
    };
    const s = info[tipo] || { icon:"ℹ️", titulo:"Información", desc:"Próximamente disponible." };
    const content = document.getElementById("modal-servicio-content");
    if (!content) return;
    content.innerHTML = `
        <div style="text-align:center;padding:10px 0 20px">
            <div style="font-size:52px;margin-bottom:14px">${s.icon}</div>
            <h2 style="margin-bottom:12px">${s.titulo}</h2>
            <p style="color:#555;line-height:1.7;margin-bottom:24px">${s.desc}</p>
            <button class="btn-modal-primary" onclick="abrirLogin();cerrarModalServicio()">Ver disponibilidad →</button>
        </div>`;
    document.getElementById("modal-servicio").classList.add("open");
    document.body.style.overflow = "hidden";
}
function mostrarAyuda(tipo) { mostrarServicio(tipo); }
function cerrarModalServicio(e) {
    if (!e || e.target.id === "modal-servicio") {
        document.getElementById("modal-servicio").classList.remove("open");
        document.body.style.overflow = "";
    }
}

/* ══════════════════════════════════════════
   LOGIN  (usa #loginUser / #loginPass del #authModal)
══════════════════════════════════════════ */
async function login() {
    const usuario  = (document.getElementById("loginUser")?.value  || "").trim();
    const password = (document.getElementById("loginPass")?.value  || "").trim();

    if (!usuario || !password) {
        mostrarToast("⚠️ Completa usuario y contraseña");
        return;
    }
    if (password.length < 6) {
        mostrarToast("⚠️ Contraseña mínimo 6 caracteres");
        return;
    }

    const btn = document.querySelector(
    "#loginForm .main-auth-btn"
);
    if (btn) { btn.disabled = true; btn.innerText = "Ingresando..."; }

    try {
        const form = new URLSearchParams();
        form.append("username", usuario);
        form.append("password", password);

        const res = await fetch(API + "/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: form
        });

        if (!res.ok) {
            mostrarToast("❌ Usuario o contraseña incorrectos");
            return;
        }

        const data = await res.json();
        token = data.access_token;

        localStorage.setItem("token", token);
        localStorage.setItem("username", data.nombres || usuario);

        cerrarAuth();
        cerrarLogin();
        mostrarApp(data.nombres || usuario);
        cargarTours();

    } catch (err) {
        mostrarToast("❌ Error conectando con el servidor");
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = "Ingresar"; }
    }
}

/* ══════════════════════════════════════════
   REGISTRO  (usa #registerNombres etc. del #authModal)
══════════════════════════════════════════ */
async function crearCuenta() {

    const nombres   = (document.getElementById("registerNombres")?.value   || "").trim();

    const apellidos = (document.getElementById("registerApellidos")?.value || "").trim();

    const correo    = (document.getElementById("registerCorreo")?.value    || "").trim();

    const telefono  = (document.getElementById("registerTelefono")?.value  || "").trim();

    const password  = (document.getElementById("registerPass")?.value      || "").trim();

    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/;

    const emailRegex  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phoneRegex  = /^[0-9]+$/;

    if (
        nombres.length < 2 ||
        !nombreRegex.test(nombres)
    ) {

        mostrarToast("⚠️ Nombre inválido");

        return;
    }

    if (
        apellidos.length < 2 ||
        !nombreRegex.test(apellidos)
    ) {

        mostrarToast("⚠️ Apellidos inválidos");

        return;
    }

    if (!emailRegex.test(correo)) {

        mostrarToast("⚠️ Correo inválido");

        return;
    }

    if (
        telefono &&
        (
            !phoneRegex.test(telefono) ||
            telefono.length < 7
        )
    ) {

        mostrarToast("⚠️ Teléfono inválido");

        return;
    }

    if (password.length < 6) {

        mostrarToast(
            "⚠️ Contraseña mínimo 6 caracteres"
        );

        return;
    }

    const btn = document.querySelector(
        "#registerForm .main-auth-btn"
    );

    if (btn) {

        btn.disabled = true;

        btn.innerText = "Creando cuenta...";
    }

    try {

        console.log("ENVIANDO REGISTER");

        const res = await fetch(
            API + "/register",
            {

                method: "POST",

                headers: {
                    "Content-Type":"application/json"
                },

                body: JSON.stringify({

                    nombres,
                    apellidos,
                    correo,
                    telefono,
                    password
                })
            }
        );

        console.log(res);

        let data = {};

        try {

            data = await res.json();

        } catch {

            data = {
                detail:"Error interno servidor"
            };
        }

        console.log(data);

        console.log(JSON.stringify(data.detail, null, 2));

        if (res.ok) {

            mostrarToast(
                "✅ Cuenta creada correctamente"
            );

            mostrarLogin();

            const lu = document.getElementById(
                "loginUser"
            );

            if (lu) {

                lu.value = correo;
            }

        } else {

            mostrarToast(
                "❌ " +
                (
                    data.detail ||
                    "Error al registrar"
                )
            );
        }

    } catch (err) {

        console.error(err);

        mostrarToast(
            "❌ Error conectando con el servidor"
        );

    } finally {

        if (btn) {

            btn.disabled = false;

            btn.innerText = "Registrarme";
        }
    }
}

/* ══════════════════════════════════════════
   LOGOUT / MOSTRAR APP
══════════════════════════════════════════ */
function mostrarApp(username) {

    const topRight = document.getElementById(
        "topRightNav"
    );

    topRight.innerHTML = `

        <div class="user-menu">

            <button class="user-btn">

                👤 Hola, ${username}

            </button>

            <div class="user-dropdown">

                <a href="#" onclick="cargarReservas()">
                    📅 Mis reservas
                </a>

                <a href="#" onclick="verPerfil()">
                    👤 Mi cuenta
                </a>

                <a href="#" onclick="cargarFavoritos()">
                    ⭐ Favoritos
                </a>

                <a href="#" onclick="logout()">
                    🚪 Cerrar sesión
                </a>

            </div>

        </div>
    `;
}

async function logout(){

    localStorage.removeItem("token");

    localStorage.removeItem("username");

    token = "";

    document.getElementById(
        "topRightNav"
    ).innerHTML = `

        <a href="javascript:void(0)"
           onclick="abrirLogin()">
            Iniciar sesión
        </a>

        <a href="javascript:void(0)"
           onclick="abrirRegistro()">
            Crear cuenta
        </a>

        <a href="javascript:void(0)"
           onclick="mostrarAyuda('faq')">
            Ayuda
        </a>
    `;

    mostrarToast(
        "👋 Sesión cerrada"
    );
}

function olvidarPassword() {
    mostrarToast("📧 Contacta al administrador: info@turismor.co");
}

function loginGoogle()    { mostrarToast("🔵 Google próximamente"); }
function loginMicrosoft() { mostrarToast("🟦 Microsoft próximamente"); }

/* ══════════════════════════════════════════
   PÁGINA PÚBLICA
══════════════════════════════════════════ */
function abrirFavoritosPublico() {
    mostrarToast("⭐ Inicia sesión para ver tus favoritos");
    abrirLogin();
}
function buscarViajes() {
    mostrarToast("🔍 Buscando las mejores ofertas...");
    setTimeout(() => abrirLogin(), 800);
}
function verDestino(ciudad) {
    mostrarServicio("hoteles");
    mostrarToast("📍 Mostrando hoteles en " + ciudad);
}
function verPromocion()     { mostrarToast("🔥 Cargando promociones..."); setTimeout(() => abrirLogin(), 600); }
function verTodosDestinos() { mostrarToast("🌍 Cargando destinos...");    setTimeout(() => abrirLogin(), 600); }
function verTodosTours()    { mostrarToast("🗺️ Cargando tours...");       setTimeout(() => abrirLogin(), 600); }
function scrollToSection(id){ document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }

/* ══════════════════════════════════════════
   VALIDACIONES EN TIEMPO REAL
══════════════════════════════════════════ */
function validarNombres() {
    const i = document.getElementById("registerNombres");
    const e = document.getElementById("errorNombres");
    const ok = i.value.trim().length >= 2 && /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(i.value);
    i.classList.toggle("input-error",   !ok);
    i.classList.toggle("input-success",  ok);
    e.textContent = ok ? "" : "Nombre inválido";
    return ok;
}
function validarApellidos() {
    const i = document.getElementById("registerApellidos");
    const e = document.getElementById("errorApellidos");
    const ok = i.value.trim().length >= 2 && /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(i.value);
    i.classList.toggle("input-error",   !ok);
    i.classList.toggle("input-success",  ok);
    e.textContent = ok ? "" : "Apellidos inválidos";
    return ok;
}
function validarCorreo() {
    const i = document.getElementById("registerCorreo");
    const e = document.getElementById("errorCorreo");
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value);
    i.classList.toggle("input-error",   !ok);
    i.classList.toggle("input-success",  ok);
    e.textContent = ok ? "" : "Correo inválido";
    return ok;
}
function validarTelefono() {
    const i = document.getElementById("registerTelefono");
    const e = document.getElementById("errorTelefono");
    const ok = /^[0-9]{7,15}$/.test(i.value);
    i.classList.toggle("input-error",   !ok);
    i.classList.toggle("input-success",  ok);
    e.textContent = ok ? "" : "Teléfono inválido";
    return ok;
}
function validarPassword() {
    const i = document.getElementById("registerPass");
    const e = document.getElementById("errorPassword");
    const ok = i.value.length >= 6;
    i.classList.toggle("input-error",   !ok);
    i.classList.toggle("input-success",  ok);
    e.textContent = ok ? "" : "Mínimo 6 caracteres";
    return ok;
}

/* ══════════════════════════════════════════
   APP — TOURS
══════════════════════════════════════════ */
async function cargarTours() {
    document.getElementById("titulo").innerText = "🌍 Destinos en Colombia";
    setNavActivo("nav-tours");
    const res = await fetchAPI("/tours");
    if (!res) return;
    const data = await res.json();
    document.getElementById("contenedor").innerHTML = `
        <div class="filtros">
            <input type="text" id="buscar" placeholder="🔍 Ciudad..." oninput="filtrar()">
            <input type="number" id="precio" placeholder="💰 Precio máx..." oninput="filtrar()">
            <button class="btn btn-primary" onclick="mostrarFormTour()">➕ Nuevo Tour</button>
        </div>
        <div id="grid-tours" class="grid"></div>`;
    pintarTours(data, "grid-tours");
}

function pintarTours(data, containerId = "contenedor") {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!data.length) { container.innerHTML = `<div class="empty-state">😔 No se encontraron tours.</div>`; return; }
    container.innerHTML = "";
    data.forEach(t => {
        const esFav = favoritos.find(f => f.id === t.id);
        container.innerHTML += `
        <div class="card" id="card-tour-${t.id}">
            <img src="${t.imagen || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400'}"
                 onerror="this.src='https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400'">
            <div class="card-body">
                <span class="badge">${t.ciudad}</span>
                <h3>${t.nombre}</h3>
                <strong class="precio">$${Number(t.precio).toLocaleString("es-CO")}</strong>
                <div class="card-actions">
                    <button class="btn btn-sm btn-primary" onclick='reservarTour(${JSON.stringify(t).replace(/'/g,"&#39;")})'>📅 Reservar</button>
                    <button class="btn btn-sm btn-outline" onclick='editarTour(${t.id},"${t.nombre}","${t.ciudad}",${t.precio})'>✏️</button>
                    <button class="btn btn-sm btn-danger"  onclick='eliminarTour(${t.id})'>🗑️</button>
                    <button class="btn btn-sm ${esFav ? "btn-fav-active" : "btn-fav"}"
                            onclick='toggleFavorito(${JSON.stringify(t).replace(/'/g,"&#39;")})'
                            id="fav-btn-${t.id}">${esFav ? "❤️" : "🤍"}</button>
                </div>
            </div>
        </div>`;
    });
}




async function filtrar() {
    const ciudad = document.getElementById("buscar")?.value || "";
    const precio = document.getElementById("precio")?.value || "";
    let url = "/tours/buscar?";
    if (ciudad) url += `ciudad=${ciudad}&`;
    if (precio) url += `precio_max=${precio}`;
    const res = await fetchAPI(url);
    if (!res) return;
    pintarTours(await res.json(), "grid-tours");
}

function mostrarFormTour(tour = null) {
    document.getElementById("titulo").innerText = tour ? "✏️ Editar Tour" : "➕ Nuevo Tour";
    document.getElementById("contenedor").innerHTML = `
        <div class="form-container">
            <h2>${tour ? "Editar Tour" : "Crear Nuevo Tour"}</h2>
            <div class="form-group"><label>Nombre *</label>
                <input type="text" id="f-nombre" placeholder="Ej: Ciudad Amurallada" value="${tour?.nombre||""}" maxlength="100">
                <span class="field-error" id="err-nombre"></span></div>
            <div class="form-group"><label>Ciudad *</label>
                <input type="text" id="f-ciudad" placeholder="Ej: Cartagena" value="${tour?.ciudad||""}" maxlength="80">
                <span class="field-error" id="err-ciudad"></span></div>
            <div class="form-group"><label>Precio (COP) *</label>
                <input type="number" id="f-precio" placeholder="Ej: 250000" value="${tour?.precio||""}" min="1">
                <span class="field-error" id="err-precio"></span></div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="${tour ? `guardarEdicionTour(${tour.id})` : 'crearTour()'}">${tour ? "💾 Guardar" : "✅ Crear Tour"}</button>
                <button class="btn btn-outline" onclick="cargarTours()">Cancelar</button>
            </div>
        </div>`;}

async function crearTour() {
    const nombre = document.getElementById("f-nombre").value.trim();
    const ciudad = document.getElementById("f-ciudad").value.trim();
    const precio = parseFloat(document.getElementById("f-precio").value);
    let ok = true;
    if (!nombre||nombre.length<3){mostrarError(document.getElementById("err-nombre"),"Mínimo 3 caracteres");ok=false;}else limpiarError(document.getElementById("err-nombre"));
    if (!ciudad||ciudad.length<2){mostrarError(document.getElementById("err-ciudad"),"Mínimo 2 caracteres");ok=false;}else limpiarError(document.getElementById("err-ciudad"));
    if (!precio||precio<=0)      {mostrarError(document.getElementById("err-precio"),"Precio mayor a 0");ok=false;}else limpiarError(document.getElementById("err-precio"));
    if (!ok) return;
    const res = await fetchAPI("/tours/create","POST",{nombre,ciudad,precio});
    if (!res) return;
    const d = await res.json();
    if (res.ok){mostrarToast("✅ Tour creado");cargarTours();}
    else mostrarToast("❌ "+(d.detail||"Error"));
}
function editarTour(id,nombre,ciudad,precio){mostrarFormTour({id,nombre,ciudad,precio});}
async function guardarEdicionTour(id) {
    const nombre = document.getElementById("f-nombre").value.trim();
    const ciudad = document.getElementById("f-ciudad").value.trim();
    const precio = parseFloat(document.getElementById("f-precio").value);
    let ok=true;
    if(!nombre||nombre.length<3){mostrarError(document.getElementById("err-nombre"),"Mínimo 3 caracteres");ok=false;}else limpiarError(document.getElementById("err-nombre"));
    if(!ciudad||ciudad.length<2){mostrarError(document.getElementById("err-ciudad"),"Mínimo 2 caracteres");ok=false;}else limpiarError(document.getElementById("err-ciudad"));
    if(!precio||precio<=0)      {mostrarError(document.getElementById("err-precio"),"Precio mayor a 0");ok=false;}else limpiarError(document.getElementById("err-precio"));
    if(!ok)return;
    const res=await fetchAPI(`/tours/${id}`,"PUT",{nombre,ciudad,precio});
    if(!res)return;
    if(res.ok){mostrarToast("✅ Tour actualizado");cargarTours();}
    else{const d=await res.json();mostrarToast("❌ "+(d.detail||"Error"));}
}
async function eliminarTour(id) {
    if(!confirm("¿Eliminar este tour?"))return;
    const res=await fetchAPI(`/tours/${id}`,"DELETE");
    if(!res)return;
    if(res.ok){mostrarToast("🗑️ Tour eliminado");cargarTours();}
    else mostrarToast("❌ Error al eliminar");
}

/* CLIENTES */
async function cargarClientes() {
    document.getElementById("titulo").innerText="👥 Clientes";setNavActivo("nav-clientes");
    const res=await fetchAPI("/clientes");if(!res)return;const data=await res.json();
    document.getElementById("contenedor").innerHTML=`
        <div class="filtros"><button class="btn btn-primary" onclick="mostrarFormCliente()">➕ Nuevo Cliente</button></div>
        <div class="tabla-container"><table class="tabla">
            <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Acciones</th></tr></thead>
            <tbody id="tbody-clientes"></tbody></table></div>`;
    const tb=document.getElementById("tbody-clientes");
    if(!data.length){tb.innerHTML=`<tr><td colspan="4" class="empty-state">No hay clientes</td></tr>`;return;}
    data.forEach(c=>tb.innerHTML+=`<tr><td>#${c.id}</td><td>${c.nombre}</td><td>${c.email}</td>
        <td><button class="btn btn-sm btn-outline" onclick='editarCliente(${c.id},"${c.nombre}","${c.email}")'>✏️</button>
            <button class="btn btn-sm btn-danger" onclick='eliminarCliente(${c.id})'>🗑️</button></td></tr>`);
}
function mostrarFormCliente(c=null){
    document.getElementById("titulo").innerText=c?"✏️ Editar Cliente":"➕ Nuevo Cliente";
    document.getElementById("contenedor").innerHTML=`
        <div class="form-container"><h2>${c?"Editar Cliente":"Nuevo Cliente"}</h2>
            <div class="form-group"><label>Nombre *</label>
                <input type="text" id="f-nombre" placeholder="Nombre completo" value="${c?.nombre||""}">
                <span class="field-error" id="err-nombre"></span></div>
            <div class="form-group"><label>Email *</label>
                <input type="email" id="f-email" placeholder="correo@ejemplo.com" value="${c?.email||""}">
                <span class="field-error" id="err-email"></span></div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="${c?`guardarEdicionCliente(${c.id})`:'crearCliente()'}">${c?"💾 Guardar":"✅ Crear"}</button>
                <button class="btn btn-outline" onclick="cargarClientes()">Cancelar</button></div></div>`;}
async function crearCliente(){
    const nombre=document.getElementById("f-nombre").value.trim();const email=document.getElementById("f-email").value.trim();
    let ok=true;
    if(!nombre||nombre.length<2){mostrarError(document.getElementById("err-nombre"),"Mínimo 2 caracteres");ok=false;}else limpiarError(document.getElementById("err-nombre"));
    if(!email||!validarEmail(email)){mostrarError(document.getElementById("err-email"),"Email inválido");ok=false;}else limpiarError(document.getElementById("err-email"));
    if(!ok)return;
    const res=await fetchAPI("/clientes","POST",{nombre,email});if(!res)return;
    const d=await res.json();
    if(res.ok){mostrarToast("✅ Cliente creado");cargarClientes();}else mostrarToast("❌ "+(d.detail||"Error"));
}
function editarCliente(id,nombre,email){mostrarFormCliente({id,nombre,email});}
async function guardarEdicionCliente(id){
    const nombre=document.getElementById("f-nombre").value.trim();const email=document.getElementById("f-email").value.trim();
    let ok=true;
    if(!nombre||nombre.length<2){mostrarError(document.getElementById("err-nombre"),"Mínimo 2 caracteres");ok=false;}else limpiarError(document.getElementById("err-nombre"));
    if(!email||!validarEmail(email)){mostrarError(document.getElementById("err-email"),"Email inválido");ok=false;}else limpiarError(document.getElementById("err-email"));
    if(!ok)return;
    const res=await fetchAPI(`/clientes/${id}`,"PUT",{nombre,email});if(!res)return;
    if(res.ok){mostrarToast("✅ Cliente actualizado");cargarClientes();}
    else{const d=await res.json();mostrarToast("❌ "+(d.detail||"Error"));}
}
async function eliminarCliente(id){
    if(!confirm("¿Eliminar cliente?"))return;
    const res=await fetchAPI(`/clientes/${id}`,"DELETE");if(!res)return;
    if(res.ok){mostrarToast("🗑️ Cliente eliminado");cargarClientes();}else mostrarToast("❌ Error");
}

/* RESERVAS */


function cargarReservas(){

    const reservas = JSON.parse(
        localStorage.getItem("reservas")
    ) || [];

    let html = `

        <h2 class="panel-title">
            📅 Mis reservas
        </h2>
    `;

    if(reservas.length === 0){

        html += `

            <div class="info-card">

                <p>
                    No tienes reservas todavía
                </p>

            </div>
        `;

    }else{

        reservas.forEach(r => {

            html += `

                <div class="info-card">

                    <h4>${r.nombre}</h4>

                    <p>
                        📍 ${r.ciudad}
                    </p>

                    <p>
                        💲 ${r.precio}
                    </p>

                </div>
            `;
        });
    }

    abrirPanel(html);
}


async function mostrarFormReserva(tourIdPre=null){
    const[rC,rT]=await Promise.all([fetchAPI("/clientes"),fetchAPI("/tours")]);
    const clientes=await rC.json(),tours=await rT.json();
    document.getElementById("titulo").innerText="➕ Nueva Reserva";
    document.getElementById("contenedor").innerHTML=`
        <div class="form-container"><h2>Nueva Reserva</h2>
            <div class="form-group"><label>Cliente *</label>
                <select id="f-cliente"><option value="">-- Selecciona cliente --</option>
                ${clientes.map(c=>`<option value="${c.id}">${c.nombre} (${c.email})</option>`).join("")}</select>
                <span class="field-error" id="err-cliente"></span></div>
            <div class="form-group"><label>Tour *</label>
                <select id="f-tour"><option value="">-- Selecciona tour --</option>
                ${tours.map(t=>`<option value="${t.id}" ${t.id==tourIdPre?"selected":""}>${t.nombre} - ${t.ciudad} ($${Number(t.precio).toLocaleString("es-CO")})</option>`).join("")}</select>
                <span class="field-error" id="err-tour"></span></div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="crearReserva()">✅ Confirmar</button>
                <button class="btn btn-outline" onclick="cargarReservas()">Cancelar</button></div></div>`;}

async function crearReserva(){

    const cId=parseInt(
        document.getElementById("f-cliente").value
    );

    const tId=parseInt(
        document.getElementById("f-tour").value
    );

    let ok=true;

    if(!cId){

        mostrarError(
            document.getElementById("err-cliente"),
            "Selecciona un cliente"
        );

        ok=false;

    }else{

        limpiarError(
            document.getElementById("err-cliente")
        );
    }

    if(!tId){

        mostrarError(
            document.getElementById("err-tour"),
            "Selecciona un tour"
        );

        ok=false;

    }else{

        limpiarError(
            document.getElementById("err-tour")
        );
    }

    if(!ok)return;

    const res=await fetchAPI(
        "/reservas",
        "POST",
        {
            cliente_id:cId,
            tour_id:tId
        }
    );

    if(!res)return;

    const d=await res.json();

    if(res.ok){

        const tours = JSON.parse(
            localStorage.getItem("tours")
        ) || [];

        const tour = tours.find(
            t => t.id === tId
        );

        if(tour){

            let reservas = JSON.parse(
                localStorage.getItem("reservas")
            ) || [];

            reservas.push(tour);

            localStorage.setItem(
                "reservas",
                JSON.stringify(reservas)
            );
        }

        mostrarToast(
            "✅ Reserva creada"
        );

        cargarReservas();

    }else{

        mostrarToast(
            "❌ " + (d.detail || "Error")
        );
    }
}

async function cancelarReserva(id){
    if(!confirm("¿Cancelar esta reserva?"))return;
    const res=await fetchAPI(`/reservas/${id}`,"DELETE");if(!res)return;
    if(res.ok){mostrarToast("🗑️ Reserva cancelada");cargarReservas();}else mostrarToast("❌ Error");
}

/* GUÍAS */
async function cargarGuias(){
    document.getElementById("titulo").innerText="🧭 Guías";setNavActivo("nav-guias");
    const res=await fetchAPI("/guias");if(!res)return;const data=await res.json();
    document.getElementById("contenedor").innerHTML=`
        <div class="filtros"><button class="btn btn-primary" onclick="mostrarFormGuia()">➕ Nuevo Guía</button></div>
        <div class="grid">${!data.length?'<div class="empty-state">No hay guías</div>':
        data.map(g=>`<div class="card"><div class="card-body">
            <div class="guia-avatar">🧭</div><h3>${g.nombre}</h3><p>🗣️ ${g.idioma||"Español"}</p>
            <div class="card-actions">
                <button class="btn btn-sm btn-outline" onclick='editarGuia(${g.id},"${g.nombre}","${g.idioma||"Español"}")'>✏️</button>
                <button class="btn btn-sm btn-danger" onclick='eliminarGuia(${g.id})'>🗑️</button>
            </div></div></div>`).join("")}</div>`;}
function mostrarFormGuia(g=null){
    document.getElementById("titulo").innerText=g?"✏️ Editar Guía":"➕ Nuevo Guía";
    document.getElementById("contenedor").innerHTML=`
        <div class="form-container"><h2>${g?"Editar Guía":"Nuevo Guía"}</h2>
            <div class="form-group"><label>Nombre *</label>
                <input type="text" id="f-nombre" placeholder="Nombre del guía" value="${g?.nombre||""}">
                <span class="field-error" id="err-nombre"></span></div>
            <div class="form-group"><label>Idioma(s) *</label>
                <input type="text" id="f-idioma" placeholder="Ej: Español/Inglés" value="${g?.idioma||""}">
                <span class="field-error" id="err-idioma"></span></div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="${g?`guardarEdicionGuia(${g.id})`:'crearGuia()'}">${g?"💾 Guardar":"✅ Crear"}</button>
                <button class="btn btn-outline" onclick="cargarGuias()">Cancelar</button></div></div>`;}
async function crearGuia(){
    const nombre=document.getElementById("f-nombre").value.trim();const idioma=document.getElementById("f-idioma").value.trim();
    let ok=true;
    if(!nombre||nombre.length<2){mostrarError(document.getElementById("err-nombre"),"Mínimo 2 caracteres");ok=false;}else limpiarError(document.getElementById("err-nombre"));
    if(!idioma||idioma.length<2){mostrarError(document.getElementById("err-idioma"),"Indica el idioma");ok=false;}else limpiarError(document.getElementById("err-idioma"));
    if(!ok)return;
    const res=await fetchAPI("/guias","POST",{nombre,idioma});if(!res)return;
    if(res.ok){mostrarToast("✅ Guía creado");cargarGuias();}
    else{const d=await res.json();mostrarToast("❌ "+(d.detail||"Error"));}
}
function editarGuia(id,nombre,idioma){mostrarFormGuia({id,nombre,idioma});}
async function guardarEdicionGuia(id){
    const nombre=document.getElementById("f-nombre").value.trim();const idioma=document.getElementById("f-idioma").value.trim();
    let ok=true;
    if(!nombre||nombre.length<2){mostrarError(document.getElementById("err-nombre"),"Mínimo 2 caracteres");ok=false;}else limpiarError(document.getElementById("err-nombre"));
    if(!idioma||idioma.length<2){mostrarError(document.getElementById("err-idioma"),"Indica el idioma");ok=false;}else limpiarError(document.getElementById("err-idioma"));
    if(!ok)return;
    const res=await fetchAPI(`/guias/${id}`,"PUT",{nombre,idioma});if(!res)return;
    if(res.ok){mostrarToast("✅ Guía actualizado");cargarGuias();}
    else{const d=await res.json();mostrarToast("❌ "+(d.detail||"Error"));}
}
async function eliminarGuia(id){
    if(!confirm("¿Eliminar guía?"))return;
    const res=await fetchAPI(`/guias/${id}`,"DELETE");if(!res)return;
    if(res.ok){mostrarToast("🗑️ Guía eliminado");cargarGuias();}else mostrarToast("❌ Error");
}

/* FAVORITOS */
function toggleFavorito(tour){
    if(!requiereLogin()) return;
    const idx=favoritos.findIndex(f=>f.id===tour.id);
    if(idx>=0){favoritos.splice(idx,1);mostrarToast("💔 Eliminado de favoritos");}
    else{favoritos.push(tour);mostrarToast("❤️ Agregado a favoritos");}
    localStorage.setItem("favoritos",JSON.stringify(favoritos));
    const btn=document.getElementById(`fav-btn-${tour.id}`);
    if(btn){const es=!!favoritos.find(f=>f.id===tour.id);btn.innerHTML=es?"❤️":"🤍";btn.className=`btn btn-sm ${es?"btn-fav-active":"btn-fav"}`;}
}
function cargarFavoritos(){
    document.getElementById("titulo").innerText="⭐ Favoritos";setNavActivo("nav-favoritos");
    if(!favoritos.length){document.getElementById("contenedor").innerHTML=`<div class="empty-state">No tienes favoritos aún 🌎</div>`;return;}
    document.getElementById("contenedor").innerHTML=`<div class="grid" id="grid-favs"></div>`;
    pintarTours(favoritos,"grid-favs");
}

/* PERFIL */
async function verPerfil(){
    setNavActivo("nav-perfil");
    const res=await fetchAPI("/perfil");if(!res)return;const data=await res.json();
    document.getElementById("titulo").innerText="👤 Mi Perfil";
    document.getElementById("contenedor").innerHTML=`
        <div class="form-container perfil-card">
            <div class="perfil-avatar">👤</div>
            <h2>${data.nombres||data.username||"Usuario"}</h2>
            <div class="perfil-info">
                <div class="info-row"><span>🏷️ Rol</span><strong>${data.rol}</strong></div>
                <div class="info-row"><span>✅ Estado</span><strong>${data.estado}</strong></div>
                <div class="info-row"><span>🆔 ID</span><strong>#${data.id}</strong></div>
            </div>
            <div style="margin-top:20px;border-top:1px solid #eee;padding-top:20px;">
                <h3>📊 Estadísticas</h3>
                <div id="stats-perfil"><p>Cargando...</p></div>
            </div>
        </div>`;
    const[rT,rC,rR]=await Promise.all([fetchAPI("/tours"),fetchAPI("/clientes"),fetchAPI("/reservas")]);
    const tours=rT?await rT.json():[],clientes=rC?await rC.json():[],reservas=rR?await rR.json():[];
    document.getElementById("stats-perfil").innerHTML=`
        <div class="stats-grid">
            <div class="stat-card">🌍<br><strong>${tours.length}</strong><br>Tours</div>
            <div class="stat-card">👥<br><strong>${clientes.length}</strong><br>Clientes</div>
            <div class="stat-card">📅<br><strong>${reservas.length}</strong><br>Reservas</div>
            <div class="stat-card">⭐<br><strong>${favoritos.length}</strong><br>Favoritos</div>
        </div>`;}

/* UTILIDADES */
async function fetchAPI(endpoint,method="GET",body=null){
    try{
        const opts={method,headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"}};
        if(body)opts.body=JSON.stringify(body);
        const res=await fetch(API+endpoint,opts);
        if(res.status===401){mostrarToast("⚠️ Sesión expirada, inicia sesión");logout();return null;}
        return res;
    }catch(err){mostrarToast("❌ Error de conexión");return null;}
}
function validarEmail(e){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);}
function mostrarError(el,msg){if(!el)return;el.innerText=msg;el.style.display="block";}
function limpiarError(el){if(!el)return;el.innerText="";el.style.display="none";}
function setNavActivo(id){
    document.querySelectorAll(".app-nav button").forEach(b=>b.classList.remove("activo"));
    document.getElementById(id)?.classList.add("activo");
}

/* INIT */
window.onload = function () {
    const savedToken = localStorage.getItem("token");
    const savedUser  = localStorage.getItem("username");
    if (savedToken) {
        token = savedToken;
        mostrarApp(savedUser || "Usuario");
        cargarTours();
    }
    // Enter en password
    document.getElementById("loginPass")?.addEventListener("keydown", e => {
        if (e.key === "Enter") login();
    });
};

/* MI PERFIL */

function abrirPanel(html){

    const panel = document.getElementById(
        "userPanel"
    );

    document.getElementById(
        "panelContent"
    ).innerHTML = html;

    panel.classList.remove("hidden");
}

function cerrarPanel(){

    document.getElementById(
        "userPanel"
    ).classList.add("hidden");
}




/* VER PERFIL*/

function verPerfil(){

    const nombre = localStorage.getItem(
        "username"
    ) || "Usuario";

    const correo = localStorage.getItem(
        "correo"
    ) || "Sin correo";

    const html = `

        <h2 class="panel-title">
            👤 Mi cuenta
        </h2>

        <div class="info-card">

            <h4>Información personal</h4>

            <p>
                <strong>Nombre:</strong>
                ${nombre}
            </p>

            <p>
                <strong>Correo:</strong>
                ${correo}
            </p>

        </div>
    `;

    abrirPanel(html);
}

/*mis favoritos*/

function cargarFavoritos(){

    const favoritos = JSON.parse(
        localStorage.getItem("favoritos")
    ) || [];

    let html = `

        <h2 class="panel-title">
            ⭐ Mis favoritos
        </h2>
    `;

    if(favoritos.length === 0){

        html += `

            <div class="info-card">

                <p>
                    No tienes favoritos guardados
                </p>

            </div>
        `;

    }else{

        favoritos.forEach(f => {

            html += `

                <div class="info-card">

                    <h4>${f.nombre}</h4>

                    <p>
                        📍 ${f.ciudad}
                    </p>

                    <p>
                        💲 ${f.precio}
                    </p>

                </div>
            `;
        });
    }

    abrirPanel(html);
}

/**guardar favoritos */
function guardarFavorito(tour){

    const favoritos = JSON.parse(
        localStorage.getItem("favoritos")
    ) || [];

    favoritos.push(tour);

    localStorage.setItem(
        "favoritos",
        JSON.stringify(favoritos)
    );

    mostrarToast(
        "⭐ Agregado a favoritos"
    );
}

/*guardar reservas */

async function reservarTourRapido(id){
    if(!requiereLogin()) return;
    await mostrarFormReserva(id);

    const tours = JSON.parse(
        localStorage.getItem("tours")
    ) || [];

    const tour = tours.find(
        t => t.id === id
    );

    if(!tour) return;

    let reservas = JSON.parse(
        localStorage.getItem("reservas")
    ) || [];

    reservas.push(tour);

    localStorage.setItem(
        "reservas",
        JSON.stringify(reservas)
    );

    mostrarToast(
        "✅ Reserva agregada"
    );
}

function cargarReservasUsuario(){

    const reservas = JSON.parse(
        localStorage.getItem("reservas")
    ) || [];

    let html = `

        <h2 class="panel-title">
            📅 Mis reservas
        </h2>
    `;

    if(reservas.length === 0){

        html += `

            <div class="info-card">

                <p>
                    No tienes reservas todavía
                </p>

            </div>
        `;

    }else{

        reservas.forEach(r => {

            html += `

                <div class="info-card">

                    <h4>${r.nombre}</h4>

                    <p>
                        📍 ${r.ciudad}
                    </p>

                    <p>
                        💲 ${Number(r.precio).toLocaleString("es-CO")}
                    </p>

                </div>
            `;
        });
    }

    abrirPanel(html);
}

function usuarioLogueado(){

    return !!localStorage.getItem(
        "token"
    );
}



function abrirFavoritosProtegido(){

    if(!usuarioLogueado()){

        mostrarToast(
            "🔒 Inicia sesión para ver favoritos"
        );

        abrirLogin();

        return;
    }

    cargarFavoritos();
}

function abrirReservasProtegido(){

    if(!usuarioLogueado()){

        mostrarToast(
            "🔒 Inicia sesión para ver reservas"
        );

        abrirLogin();

        return;
    }

    cargarReservasUsuario();
}







async function mostrarToursPublicos(){

    try{

        const res = await fetch(
            API + "/tours"
        );

        const tours = await res.json();

        console.log(
            "TOURS:",
            tours
        );

        if(!Array.isArray(tours)){

            mostrarToast(
                "❌ Error cargando tours"
            );

            return;
        }

        const container = document.getElementById(
            "contenedorToursPublicos"
        );

        if(!container)return;

        container.innerHTML = "";

        const toursVisibles = tours.slice(0,4);

        toursVisibles.forEach(t => {

            const imagen = t.imagen

            ? `${API}${encodeURI(t.imagen)}`

            : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500";

            container.innerHTML += `

            <div 
                class="tour-card-public"
                onclick='abrirDetalleTour(${JSON.stringify(t).replace(/'/g,"&#39;")})'
            >

                <img 
                    src="${imagen}"
                    onerror="this.src='https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500'"
                >

                <div class="tour-public-body">

                    <span class="badge">
                        ${t.ciudad}
                    </span>

                    <h3>
                        ${t.nombre}
                    </h3>

                    <p class="descripcion-card">
                        ${
                            t.descripcion ||
                            "Explora destinos increíbles en Colombia"
                        }
                    </p>

                    <div class="tour-precio">

                        💲${Number(t.precio).toLocaleString("es-CO")}

                    </div>

                    <div class="tour-actions">

                    <button 
                        class="btn-reservar"
                        onclick='event.stopPropagation(); abrirReserva(${JSON.stringify(t).replace(/'/g,"&#39;")}, "tour")'
                    >
                        📅 Reservar
                    </button>

                        <button 
                            class="btn-favorito"
                            onclick='event.stopPropagation(); toggleFavorito(${JSON.stringify(t).replace(/'/g,"&#39;")})'
                        >
                            ❤️
                        </button>

                    </div>

                </div>

            </div>
            `;
        });

    }catch(err){

        console.error(
            "ERROR TOURS:",
            err
        );

        mostrarToast(
            "❌ Error cargando tours"
        );
    }
}


function abrirDetalleTour(tour){

    const modal = document.createElement(
        "div"
    );

    modal.className = "tour-detail-overlay";

    let galeriaHTML = "";

    if(
        Array.isArray(tour.galeria)
    ){

        tour.galeria.forEach(img => {

            galeriaHTML += `

                <img 
                    src="${API}${encodeURI(img)}"
                    class="gallery-image"
                    onerror="this.src='https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500'"
                >
            `;
        });
    }

    modal.innerHTML = `

        <div class="tour-detail-modal">

            <button 
                class="close-detail"
                onclick="this.parentElement.parentElement.remove()"
            >
                ✖
            </button>

            <div class="detail-gallery">

                ${galeriaHTML}

            </div>

            <div class="detail-content">

                <span class="badge">
                    ${tour.ciudad}
                </span>

                <h2>
                    ${tour.nombre}
                </h2>

                <p class="detail-description">
                    ${
                        tour.descripcion ||
                        "Explora destinos increíbles de Colombia."
                    }
                </p>

                <div class="detail-price">

                    💲${Number(tour.precio).toLocaleString("es-CO")}

                </div>

                <div class="detail-actions">

                <button 
                    class="btn-reservar"
                    onclick='reservarDesdeDetalle(${JSON.stringify(tour).replace(/'/g,"&#39;")})'
                >
                    📅 Reservar
                </button>

                <button 
                    class="btn-favorito"
                    onclick='favoritoDesdeDetalle(${JSON.stringify(tour).replace(/'/g,"&#39;")})'
                >
                    ❤️ Favorito
                </button>
                
                </div>

            </div>

        </div>
    `;

    document.body.appendChild(
        modal
    );
}

function reservarDesdeDetalle(tour){

    if(!usuarioLogueado()){

        mostrarToast(
            "🔒 Debes iniciar sesión para reservar"
        );

        return;
    }


}


function favoritoDesdeDetalle(tour){

    if(!usuarioLogueado()){

        mostrarToast(
            "🔒 Debes iniciar sesión para agregar favoritos"
        );

        return;
    }

    toggleFavorito(
        tour
    );
}

async function mostrarTodosTours(){

    try{

        const res = await fetch(
            API + "/tours"
        );

        const tours = await res.json();

        const container = document.getElementById(
            "contenedorToursPublicos"
        );

        if(!container)return;

        container.innerHTML = "";

        tours.forEach(t => {

            const imagen = t.imagen

            ? `${API}${encodeURI(t.imagen)}`

            : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500";

            container.innerHTML += `

            <div 
                class="tour-card-public"
                onclick='abrirDetalleTour(${JSON.stringify(t).replace(/'/g,"&#39;")})'
            >

                <img 
                    src="${imagen}"
                    onerror="this.src='https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500'"
                >

                <div class="tour-public-body">

                    <span class="badge">
                        ${t.ciudad}
                    </span>

                    <h3>
                        ${t.nombre}
                    </h3>

                    <p class="descripcion-card">
                        ${
                            t.descripcion ||
                            "Explora Colombia"
                        }
                    </p>

                    <div class="tour-precio">

                        💲${Number(t.precio).toLocaleString("es-CO")}

                    </div>

                    <div class="tour-actions">

                        <button 
                            class="btn-reservar"
                            onclick='event.stopPropagation(); abrirReserva(${JSON.stringify(t).replace(/'/g,"&#39;")}, "tour")'
                        >
                            📅 Reservar
                        </button>

                        <button 
                            class="btn-favorito"
                            onclick='event.stopPropagation(); toggleFavorito(${JSON.stringify(t).replace(/'/g,"&#39;")})'
                        >
                            ❤️
                        </button>

                    </div>

                </div>

            </div>
            `;
        });

        // 🔥 CAMBIAR BOTÓN

        document.getElementById(
            "btnVerTours"
        ).style.display = "none";

        document.getElementById(
            "btnVerMenosTours"
        ).style.display = "inline-flex";
            }catch(err){

        console.error(err);
    }
}


async function mostrarMenosTours(){

    await mostrarToursPublicos();

    // 🔥 MOSTRAR BOTÓN VER TODOS

    document.getElementById(
        "btnVerTours"
    ).style.display = "inline-flex";

    // 🔥 OCULTAR BOTÓN VER MENOS

    document.getElementById(
        "btnVerMenosTours"
    ).style.display = "none";

    // 🔥 SCROLL SUAVE

    document.getElementById(
        "contenedorToursPublicos"
    ).scrollIntoView({
        behavior:"smooth"
    });
}

async function cargarImagenesTour(
    tourId
){

    try{

        const res = await fetch(
            API + `/tours/${tourId}/imagenes`
        );

        const imagenes = await res.json();

        console.log(
            "IMAGENES:",
            imagenes
        );

        const gallery = document.getElementById(
            "detailGallery"
        );

        if(!gallery)return;

        gallery.innerHTML = "";

        if(
            !Array.isArray(imagenes) ||
            imagenes.length === 0
        ){

            gallery.innerHTML = `

                <img 
                    src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500"
                    class="gallery-image"
                >
            `;

            return;
        }

        imagenes.forEach(img => {

            const imagenUrl = img.imagen

            ? `${API}${encodeURI(img.imagen)}`

            : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500";

            gallery.innerHTML += `

                <img 
                    src="${imagenUrl}"
                    class="gallery-image"
                    onerror="this.src='https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500'"
                >
            `;
        });

    }catch(err){

        console.error(
            "ERROR GALERIA:",
            err
        );
    }
}

function abrirRecuperacion(){

    document.getElementById(
        "recoverModal"
    ).classList.remove(
        "hidden"
    );
}

function cerrarRecuperacion(){

    document.getElementById(
        "recoverModal"
    ).classList.add(
        "hidden"
    );
}

async function recuperarCuenta(){

    console.log("1 - Entró a recuperarCuenta");

    const input = document.getElementById("recoverEmail");

    console.log("2 - Input:", input);

    console.log("3 - Valor:", input?.value);

    const correo = input?.value?.trim();

    console.log("4 - Correo:", correo);

    if(!correo){

        mostrarToast(
            "⚠️ Ingresa tu correo"
        );

        return;
    }

    try{

        console.log("5 - Enviando fetch");

        const res = await fetch(
            API + "/forgot-password",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    email: correo
                })
            }
        );

        console.log("6 - Status:", res.status);

        const data = await res.json();

        console.log("7 - Data:", data);

        mostrarToast(
            data.message || data.detail || "Error"
        );

        cerrarRecuperacion();

    }catch(err){

        console.error("ERROR:", err);

        mostrarToast(
            "❌ Error al recuperar cuenta"
        );
    }
}

async function enviarRecuperacion(){

    const correo = document.getElementById(
        "correoRecuperacion"
    ).value.trim();

    if(!correo){

        mostrarToast(
            "📧 Ingresa un correo"
        );

        return;
    }

    mostrarToast(
        "📧 Se envió un enlace de recuperación a " +
        correo
    );

    cerrarRecuperarCuenta();
}

async function abrirSeccionTours(){

    await mostrarToursPublicos();

    document.getElementById(
        "contenedorToursPublicos"
    ).scrollIntoView({
        behavior:"smooth"
    });
}

async function cargarHoteles(
    mostrarTodos = false
){

    try{

        const res = await fetch(
            API + "/hoteles"
        );

        const hoteles = await res.json();

        const container = document.getElementById(
            "contenedorHoteles"
        );

        if(!container) return;

        container.innerHTML = "";

        const hotelesMostrar = mostrarTodos
            ? hoteles
            : hoteles.slice(0,4);

        hotelesMostrar.forEach(h => {

            const estrellas = "⭐".repeat(
                h.estrellas || 4
            );

            container.innerHTML += `

            <div class="tour-card-public">

                <img 
                    src="${API}${h.imagen}"
                    onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'"
                >

                <div class="tour-public-body">

                    <span class="badge">
                        📍 ${h.ciudad}
                    </span>

                    <h3>
                        ${h.nombre}
                    </h3>

                    <div class="hotel-stars">
                        ${estrellas}
                    </div>

                    <p class="descripcion-card">
                        ${
                            h.descripcion ||
                            "Hotel premium en Colombia"
                        }
                    </p>

                    <div class="tour-precio">
                        💲${Number(h.precio).toLocaleString("es-CO")}
                        / noche
                    </div>

                    <div class="tour-actions">

                        <button 
                            class="btn-reservar"
                            onclick='event.stopPropagation(); abrirReserva(${JSON.stringify(h).replace(/'/g,"&#39;")}, "hotel")'
                        >
                            🏨 Reservar
                        </button>

                        <button 
                            class="btn-favorito"
                            onclick='event.stopPropagation(); toggleFavorito(${JSON.stringify(h).replace(/'/g,"&#39;")})'
                        >
                            ❤️
                        </button>

                    </div>

                </div>

            </div>
            `;
        });

    }catch(err){

        console.error(
            "ERROR HOTELES:",
            err
        );
    }
}

window.addEventListener(
    "DOMContentLoaded",
    async () => {

        await mostrarToursPublicos();

        await cargarHoteles();
    }
);

function requiereLogin(){

    const token = localStorage.getItem(
        "token"
    );

    if(!token){

        mostrarToast(
            "🔒 Debes iniciar sesión para continuar"
        );

        return false;
    }

    return true;
}



// SOBRESCRIBIR abrirReserva para quitar .hidden antes de mostrar
function abrirReserva(item, tipo) {
 
    if (!requiereLogin()) return;
 
    // Cerrar detalle si está abierto
    document.querySelector(".tour-detail-overlay")?.remove();
 
    const modal = document.getElementById("reservaModal");
 
    // ← Este es el fix: quitar hidden ANTES de display
    modal.classList.remove("hidden");
    modal.style.display = "flex";
 
    // Rellenar campos
    document.getElementById("reservaTipo").value     = tipo || "";
    document.getElementById("reservaNombre").value   = item.nombre || "";
    document.getElementById("reservaServicio").value = item.nombre || "";
 
    // Fecha mínima hoy
    const hoy = new Date().toISOString().split("T")[0];
    const fechaInput = document.getElementById("reservaFecha");
    if (fechaInput) {
        fechaInput.min   = hoy;
        fechaInput.value = hoy;
    }
 
    // Reset campos
    const adultos = document.getElementById("reservaAdultos");
    const ninos   = document.getElementById("reservaNinos");
    const obs     = document.getElementById("reservaObs");
    if (adultos) adultos.value = "1";
    if (ninos)   ninos.value   = "0";
    if (obs)     obs.value     = "";
 
    // Guardar precio para confirmar
    modal.dataset.precio  = item.precio  || 0;
    modal.dataset.ciudad  = item.ciudad  || "";
}
 
function cerrarReserva() {
    const modal = document.getElementById("reservaModal");
    modal.classList.add("hidden");
    modal.style.display = "none";
}
 
async function confirmarReserva() {
    const fecha   = document.getElementById("reservaFecha")?.value;
    const adultos = parseInt(document.getElementById("reservaAdultos")?.value || "0");
    const ninos   = parseInt(document.getElementById("reservaNinos")?.value   || "0");
    const obs     = document.getElementById("reservaObs")?.value?.trim() || "";
    const nombre  = document.getElementById("reservaNombre")?.value || "";
    const tipo    = document.getElementById("reservaTipo")?.value   || "";
    const modal   = document.getElementById("reservaModal");
    const precio  = modal.dataset.precio  || 0;
    const ciudad  = modal.dataset.ciudad  || "";
 
    // Validaciones
    if (!fecha) {
        mostrarToast("⚠️ Selecciona una fecha");
        return;
    }
    if (adultos < 1) {
        mostrarToast("⚠️ Mínimo 1 adulto");
        return;
    }
 
    // Guardar en localStorage
    const reservas = JSON.parse(localStorage.getItem("reservas") || "[]");
    reservas.push({
        id:      Date.now(),
        nombre,
        tipo,
        ciudad,
        precio,
        fecha,
        adultos,
        ninos,
        obs,
        fechaCreacion: new Date().toLocaleDateString("es-CO")
    });
    localStorage.setItem("reservas", JSON.stringify(reservas));
 
    // Resumen
    const personas = adultos + " adulto(s)" + (ninos > 0 ? `, ${ninos} niño(s)` : "");
    mostrarToast(`✅ Reserva confirmada: ${nombre} — ${fecha} — ${personas}`);
 
    cerrarReserva();
}
 
// Cerrar al hacer click fuera del box
document.getElementById("reservaModal")?.addEventListener("click", function(e) {
    if (e.target === this) cerrarReserva();
});
 
/* ══ FIX FINAL RESERVA ══ */
function abrirReserva(item, tipo) {
    if (!requiereLogin()) return;

    document.querySelector(".tour-detail-overlay")?.remove();

    const modal = document.getElementById("reservaModal");
    
    // Quitar hidden y forzar visibilidad con style directo
    modal.removeAttribute("class");
    modal.setAttribute("style", 
        "display:flex!important;" +
        "position:fixed!important;" +
        "top:0!important;left:0!important;" +
        "width:100vw!important;height:100vh!important;" +
        "background:rgba(0,0,0,0.8)!important;" +
        "z-index:2147483647!important;" +
        "align-items:center!important;" +
        "justify-content:center!important;"
    );

    document.getElementById("reservaTipo").value     = tipo || "";
    document.getElementById("reservaNombre").value   = item.nombre || "";
    document.getElementById("reservaServicio").value = item.nombre || "";

    const hoy = new Date().toISOString().split("T")[0];
    const fechaInput = document.getElementById("reservaFecha");
    if (fechaInput) { fechaInput.min = hoy; fechaInput.value = hoy; }

    const adultos = document.getElementById("reservaAdultos");
    const ninos   = document.getElementById("reservaNinos");
    const obs     = document.getElementById("reservaObs");
    if (adultos) adultos.value = "1";
    if (ninos)   ninos.value   = "0";
    if (obs)     obs.value     = "";

    modal.dataset.precio = item.precio || 0;
    modal.dataset.ciudad = item.ciudad || "";
}

function cerrarReserva() {
    const modal = document.getElementById("reservaModal");
    modal.setAttribute("class", "auth-modal hidden");
    modal.setAttribute("style", "display:none!important;");
}


/* ══ MOVER reservaModal al body ══ */
window.addEventListener("load", function() {
    const rm = document.getElementById("reservaModal");
    if (rm) document.body.appendChild(rm);
});


async function mostrarTodosHoteles(){

    await cargarHoteles(true);

    document.getElementById(
        "btnVerHoteles"
    ).innerHTML =
        "Ver menos";

    document.getElementById(
        "btnVerHoteles"
    ).onclick =
        mostrarMenosHoteles;
}

async function mostrarMenosHoteles(){

    await cargarHoteles(false);

    document.getElementById(
        "btnVerHoteles"
    ).innerHTML =
        "Ver todos los hoteles →";

    document.getElementById(
        "btnVerHoteles"
    ).onclick =
        mostrarTodosHoteles;

    document.getElementById(
        "contenedorHoteles"
    ).scrollIntoView({
        behavior:"smooth"
    });
}


async function buscarViaje(){

    const destino = document.getElementById(
        "destino"
    ).value.trim();

    if(!destino){

        mostrarToast(
            "📍 Ingresa un destino"
        );

        return;
    }

    try{

        const res = await fetch(
            API + "/tours"
        );

        const tours = await res.json();

        const resultados = tours.filter(t =>
            t.ciudad.toLowerCase()
            .includes(
                destino.toLowerCase()
            )
        );

        if(resultados.length === 0){

            mostrarToast(
                "❌ No encontramos tours para ese destino"
            );

            return;
        }

        const container = document.getElementById(
            "contenedorToursPublicos"
        );

        container.innerHTML = "";

        resultados.forEach(t => {

            const imagen = t.imagen
                ? `${API}${encodeURI(t.imagen)}`
                : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500";

            container.innerHTML += `

            <div
                class="tour-card-public"
                onclick='abrirDetalleTour(${JSON.stringify(t).replace(/'/g,"&#39;")})'
            >

                <img
                    src="${imagen}"
                    onerror="this.src='https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500'"
                >

                <div class="tour-public-body">

                    <span class="badge">
                        ${t.ciudad}
                    </span>

                    <h3>
                        ${t.nombre}
                    </h3>

                    <p class="descripcion-card">
                        ${
                            t.descripcion ||
                            "Explora Colombia"
                        }
                    </p>

                    <div class="tour-precio">

                        💲${Number(t.precio).toLocaleString("es-CO")}

                    </div>

                    <div class="tour-actions">

                        <button
                            class="btn-reservar"
                            onclick='event.stopPropagation(); abrirReserva(${JSON.stringify(t).replace(/'/g,"&#39;")}, "tour")'
                        >
                            📅 Reservar
                        </button>

                        <button
                            class="btn-favorito"
                            onclick='event.stopPropagation(); toggleFavorito(${JSON.stringify(t).replace(/'/g,"&#39;")})'
                        >
                            ❤️
                        </button>

                    </div>

                </div>

            </div>
            `;
        });

        container.scrollIntoView({
            behavior:"smooth"
        });

        mostrarToast(
            `✅ ${resultados.length} resultado(s) encontrados`
        );

    }catch(err){

        console.error(err);

        mostrarToast(
            "❌ Error realizando búsqueda"
        );
    }
}



function mostrarResultadosBusqueda(
    tours
){

    const container = document.getElementById(
        "contenedorToursPublicos"
    );

    container.innerHTML = "";

    tours.forEach(t => {

        const imagen = `${API}${t.imagen}`;

        container.innerHTML += `

        <div
            class="tour-card-public"
            onclick='abrirDetalleTour(${JSON.stringify(t).replace(/'/g,"&#39;")})'
        >

            <img src="${imagen}">

            <div class="tour-public-body">

                <span class="badge">
                    ${t.ciudad}
                </span>

                <h3>
                    ${t.nombre}
                </h3>

                <div class="tour-precio">
                    💲${Number(t.precio).toLocaleString("es-CO")}
                </div>

            </div>

        </div>
        `;
    });

    document.getElementById(
        "contenedorToursPublicos"
    ).scrollIntoView({
        behavior:"smooth"
    });
}