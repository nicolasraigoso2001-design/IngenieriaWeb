const API = "https://nicolasapp.azurewebsites.net";
let token = "";
let favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");

// Global toast (usado también desde HTML público)
function mostrarToast(msg, esError = false) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerText = msg;
    toast.className = "toast show " + (esError ? "toast-error" : "toast-ok");
    setTimeout(() => toast.className = "toast", 3000);
}

// ===================== AUTH =====================

async function login() {
    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorEl = document.getElementById("login-error");

    // Validaciones frontend
    if (!usuario || !password) {
        mostrarError(errorEl, "Completa usuario y contraseña");
        return;
    }
    if (usuario.length < 3) {
        mostrarError(errorEl, "El usuario debe tener al menos 3 caracteres");
        return;
    }
    if (password.length < 6) {
        mostrarError(errorEl, "La contraseña debe tener al menos 6 caracteres");
        return;
    }

    const btn = document.querySelector("#login-form button");
    btn.disabled = true;
    btn.innerText = "Ingresando...";

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
            mostrarError(errorEl, "Usuario o contraseña incorrectos");
            return;
        }

        const data = await res.json();
        token = data.access_token;

        localStorage.setItem("token", token);
        localStorage.setItem("username", usuario);

        // Ocultar sitio público y modales, mostrar app
        document.getElementById("public-site").style.display = "none";
        document.getElementById("modal-login").classList.remove("open");
        document.getElementById("modal-registro").classList.remove("open");
        document.getElementById("app").style.display = "block";
        document.body.style.overflow = "";
        document.getElementById("username-display").innerText = usuario;

        cargarTours();

    } catch (error) {
        mostrarError(errorEl, "Error conectando con el servidor");
    } finally {
        btn.disabled = false;
        btn.innerText = "Ingresar";
    }
}

async function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    token = "";
    document.getElementById("app").style.display = "none";
    document.getElementById("public-site").style.display = "block";
    document.body.style.overflow = "";
}

async function registrar() {
    const user = document.getElementById("newUser").value.trim();
    const pass = document.getElementById("newPass").value.trim();
    const pass2 = document.getElementById("newPass2").value.trim();
    const errorEl = document.getElementById("reg-error");

    if (!user || !pass || !pass2) {
        mostrarError(errorEl, "Completa todos los campos");
        return;
    }
    if (user.length < 3) {
        mostrarError(errorEl, "El usuario debe tener al menos 3 caracteres");
        return;
    }
    if (pass.length < 6) {
        mostrarError(errorEl, "La contraseña debe tener al menos 6 caracteres");
        return;
    }
    if (pass !== pass2) {
        mostrarError(errorEl, "Las contraseñas no coinciden");
        return;
    }

    try {
        const res = await fetch(API + "/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();
        if (res.ok) {
            mostrarToast("✅ Usuario creado correctamente. Inicia sesión.");
            cerrarRegistro();
        } else {
            mostrarError(errorEl, data.detail || "Error al registrar");
        }
    } catch (error) {
        mostrarError(errorEl, "Error conectando con el servidor");
    }
}

function mostrarRegistro() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("registro-form").style.display = "block";
}

function cerrarRegistro() {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("registro-form").style.display = "none";
    limpiarError(document.getElementById("reg-error"));
}

function olvidarPassword() {
    mostrarToast("📧 Contacta al administrador para restablecer tu contraseña.");
}

// ===================== TOURS =====================

async function cargarTours() {
    document.getElementById("titulo").innerText = "🌍 Destinos en Colombia";
    setNavActivo("nav-tours");

    const res = await fetchAPI("/tours");
    if (!res) return;
    const data = await res.json();

    const container = document.getElementById("contenedor");
    container.innerHTML = `
        <div class="filtros">
            <input type="text" id="buscar" placeholder="🔍 Ciudad..." oninput="filtrar()">
            <input type="number" id="precio" placeholder="💰 Precio máx..." oninput="filtrar()">
            <button class="btn btn-primary" onclick="mostrarFormTour()">➕ Nuevo Tour</button>
        </div>
        <div id="grid-tours" class="grid"></div>
    `;

    pintarTours(data, "grid-tours");
}

function pintarTours(data, containerId = "contenedor") {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = `<div class="empty-state">😔 No se encontraron tours.</div>`;
        return;
    }

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
                    <button class="btn btn-sm btn-primary" onclick='reservarTourRapido(${t.id}, "${t.nombre}")'>📅 Reservar</button>
                    <button class="btn btn-sm btn-outline" onclick='editarTour(${t.id}, "${t.nombre}", "${t.ciudad}", ${t.precio})'>✏️</button>
                    <button class="btn btn-sm btn-danger" onclick='eliminarTour(${t.id})'>🗑️</button>
                    <button class="btn btn-sm ${esFav ? "btn-fav-active" : "btn-fav"}" 
                            onclick='toggleFavorito(${JSON.stringify(t).replace(/'/g, "&#39;")})' 
                            id="fav-btn-${t.id}">
                        ${esFav ? "❤️" : "🤍"}
                    </button>
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
    const data = await res.json();
    pintarTours(data, "grid-tours");
}

function mostrarFormTour(tour = null) {
    document.getElementById("titulo").innerText = tour ? "✏️ Editar Tour" : "➕ Nuevo Tour";
    document.getElementById("contenedor").innerHTML = `
        <div class="form-container">
            <h2>${tour ? "Editar Tour" : "Crear Nuevo Tour"}</h2>
            <div class="form-group">
                <label>Nombre del Tour *</label>
                <input type="text" id="f-nombre" placeholder="Ej: Ciudad Amurallada" 
                       value="${tour?.nombre || ""}" maxlength="100">
                <span class="field-error" id="err-nombre"></span>
            </div>
            <div class="form-group">
                <label>Ciudad *</label>
                <input type="text" id="f-ciudad" placeholder="Ej: Cartagena" 
                       value="${tour?.ciudad || ""}" maxlength="80">
                <span class="field-error" id="err-ciudad"></span>
            </div>
            <div class="form-group">
                <label>Precio (COP) *</label>
                <input type="number" id="f-precio" placeholder="Ej: 250000" 
                       value="${tour?.precio || ""}" min="1">
                <span class="field-error" id="err-precio"></span>
            </div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="${tour ? `guardarEdicionTour(${tour.id})` : 'crearTour()'}">
                    ${tour ? "💾 Guardar cambios" : "✅ Crear Tour"}
                </button>
                <button class="btn btn-outline" onclick="cargarTours()">Cancelar</button>
            </div>
        </div>
    `;
}

async function crearTour() {
    const nombre = document.getElementById("f-nombre").value.trim();
    const ciudad = document.getElementById("f-ciudad").value.trim();
    const precio = parseFloat(document.getElementById("f-precio").value);

    let valid = true;
    if (!nombre || nombre.length < 3) { mostrarError(document.getElementById("err-nombre"), "Mínimo 3 caracteres"); valid = false; } else limpiarError(document.getElementById("err-nombre"));
    if (!ciudad || ciudad.length < 2) { mostrarError(document.getElementById("err-ciudad"), "Mínimo 2 caracteres"); valid = false; } else limpiarError(document.getElementById("err-ciudad"));
    if (!precio || precio <= 0) { mostrarError(document.getElementById("err-precio"), "El precio debe ser mayor a 0"); valid = false; } else limpiarError(document.getElementById("err-precio"));

    if (!valid) return;

    const res = await fetchAPI("/tours/create", "POST", { nombre, ciudad, precio });
    if (!res) return;
    const data = await res.json();
    if (res.ok) { mostrarToast("✅ Tour creado correctamente"); cargarTours(); }
    else mostrarToast("❌ " + (data.detail || "Error al crear tour"), true);
}

function editarTour(id, nombre, ciudad, precio) {
    mostrarFormTour({ id, nombre, ciudad, precio });
}

async function guardarEdicionTour(id) {
    const nombre = document.getElementById("f-nombre").value.trim();
    const ciudad = document.getElementById("f-ciudad").value.trim();
    const precio = parseFloat(document.getElementById("f-precio").value);

    let valid = true;
    if (!nombre || nombre.length < 3) { mostrarError(document.getElementById("err-nombre"), "Mínimo 3 caracteres"); valid = false; } else limpiarError(document.getElementById("err-nombre"));
    if (!ciudad || ciudad.length < 2) { mostrarError(document.getElementById("err-ciudad"), "Mínimo 2 caracteres"); valid = false; } else limpiarError(document.getElementById("err-ciudad"));
    if (!precio || precio <= 0) { mostrarError(document.getElementById("err-precio"), "El precio debe ser mayor a 0"); valid = false; } else limpiarError(document.getElementById("err-precio"));

    if (!valid) return;

    const res = await fetchAPI(`/tours/${id}`, "PUT", { nombre, ciudad, precio });
    if (!res) return;
    if (res.ok) { mostrarToast("✅ Tour actualizado"); cargarTours(); }
    else { const d = await res.json(); mostrarToast("❌ " + (d.detail || "Error"), true); }
}

async function eliminarTour(id) {
    if (!confirm("¿Eliminar este tour?")) return;
    const res = await fetchAPI(`/tours/${id}`, "DELETE");
    if (!res) return;
    if (res.ok) { mostrarToast("🗑️ Tour eliminado"); cargarTours(); }
    else mostrarToast("❌ Error al eliminar", true);
}

// ===================== CLIENTES =====================

async function cargarClientes() {
    document.getElementById("titulo").innerText = "👥 Clientes";
    setNavActivo("nav-clientes");

    const res = await fetchAPI("/clientes");
    if (!res) return;
    const data = await res.json();

    const container = document.getElementById("contenedor");
    container.innerHTML = `
        <div class="filtros">
            <button class="btn btn-primary" onclick="mostrarFormCliente()">➕ Nuevo Cliente</button>
        </div>
        <div class="tabla-container">
            <table class="tabla">
                <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Acciones</th></tr></thead>
                <tbody id="tbody-clientes"></tbody>
            </table>
        </div>
    `;

    const tbody = document.getElementById("tbody-clientes");
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No hay clientes registrados</td></tr>`;
        return;
    }
    data.forEach(c => {
        tbody.innerHTML += `
        <tr>
            <td>#${c.id}</td>
            <td>${c.nombre}</td>
            <td>${c.email}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick='editarCliente(${c.id}, "${c.nombre}", "${c.email}")'>✏️</button>
                <button class="btn btn-sm btn-danger" onclick='eliminarCliente(${c.id})'>🗑️</button>
            </td>
        </tr>`;
    });
}

function mostrarFormCliente(cliente = null) {
    document.getElementById("titulo").innerText = cliente ? "✏️ Editar Cliente" : "➕ Nuevo Cliente";
    document.getElementById("contenedor").innerHTML = `
        <div class="form-container">
            <h2>${cliente ? "Editar Cliente" : "Nuevo Cliente"}</h2>
            <div class="form-group">
                <label>Nombre *</label>
                <input type="text" id="f-nombre" placeholder="Nombre completo" value="${cliente?.nombre || ""}">
                <span class="field-error" id="err-nombre"></span>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" id="f-email" placeholder="correo@ejemplo.com" value="${cliente?.email || ""}">
                <span class="field-error" id="err-email"></span>
            </div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="${cliente ? `guardarEdicionCliente(${cliente.id})` : 'crearCliente()'}">
                    ${cliente ? "💾 Guardar" : "✅ Crear"}
                </button>
                <button class="btn btn-outline" onclick="cargarClientes()">Cancelar</button>
            </div>
        </div>
    `;
}

async function crearCliente() {
    const nombre = document.getElementById("f-nombre").value.trim();
    const email = document.getElementById("f-email").value.trim();

    let valid = true;
    if (!nombre || nombre.length < 2) { mostrarError(document.getElementById("err-nombre"), "Mínimo 2 caracteres"); valid = false; } else limpiarError(document.getElementById("err-nombre"));
    if (!email || !validarEmail(email)) { mostrarError(document.getElementById("err-email"), "Email inválido"); valid = false; } else limpiarError(document.getElementById("err-email"));
    if (!valid) return;

    const res = await fetchAPI("/clientes", "POST", { nombre, email });
    if (!res) return;
    const data = await res.json();
    if (res.ok) { mostrarToast("✅ Cliente creado"); cargarClientes(); }
    else mostrarToast("❌ " + (data.detail || "Error"), true);
}

function editarCliente(id, nombre, email) {
    mostrarFormCliente({ id, nombre, email });
}

async function guardarEdicionCliente(id) {
    const nombre = document.getElementById("f-nombre").value.trim();
    const email = document.getElementById("f-email").value.trim();

    let valid = true;
    if (!nombre || nombre.length < 2) { mostrarError(document.getElementById("err-nombre"), "Mínimo 2 caracteres"); valid = false; } else limpiarError(document.getElementById("err-nombre"));
    if (!email || !validarEmail(email)) { mostrarError(document.getElementById("err-email"), "Email inválido"); valid = false; } else limpiarError(document.getElementById("err-email"));
    if (!valid) return;

    const res = await fetchAPI(`/clientes/${id}`, "PUT", { nombre, email });
    if (!res) return;
    if (res.ok) { mostrarToast("✅ Cliente actualizado"); cargarClientes(); }
    else { const d = await res.json(); mostrarToast("❌ " + (d.detail || "Error"), true); }
}

async function eliminarCliente(id) {
    if (!confirm("¿Eliminar este cliente?")) return;
    const res = await fetchAPI(`/clientes/${id}`, "DELETE");
    if (!res) return;
    if (res.ok) { mostrarToast("🗑️ Cliente eliminado"); cargarClientes(); }
    else mostrarToast("❌ Error al eliminar", true);
}

// ===================== RESERVAS =====================

async function cargarReservas() {
    document.getElementById("titulo").innerText = "📅 Reservas";
    setNavActivo("nav-reservas");

    const [resReservas, resClientes, resTours] = await Promise.all([
        fetchAPI("/reservas"),
        fetchAPI("/clientes"),
        fetchAPI("/tours")
    ]);
    if (!resReservas || !resClientes || !resTours) return;

    const reservas = await resReservas.json();
    const clientes = await resClientes.json();
    const tours = await resTours.json();

    const container = document.getElementById("contenedor");
    container.innerHTML = `
        <div class="filtros">
            <button class="btn btn-primary" onclick="mostrarFormReserva()">➕ Nueva Reserva</button>
        </div>
        <div class="tabla-container">
            <table class="tabla">
                <thead><tr><th>ID</th><th>Cliente</th><th>Tour</th><th>Acciones</th></tr></thead>
                <tbody id="tbody-reservas"></tbody>
            </table>
        </div>
    `;

    const tbody = document.getElementById("tbody-reservas");
    if (reservas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No hay reservas</td></tr>`;
        return;
    }
    reservas.forEach(r => {
        tbody.innerHTML += `
        <tr>
            <td>#${r.id}</td>
            <td>${r.cliente_nombre || `Cliente #${r.cliente_id}`}</td>
            <td>${r.tour_nombre || `Tour #${r.tour_id}`}</td>
            <td><button class="btn btn-sm btn-danger" onclick='cancelarReserva(${r.id})'>❌ Cancelar</button></td>
        </tr>`;
    });
}

async function mostrarFormReserva(tourIdPredefinido = null, tourNombrePredefinido = null) {
    const [resClientes, resTours] = await Promise.all([fetchAPI("/clientes"), fetchAPI("/tours")]);
    const clientes = await resClientes.json();
    const tours = await resTours.json();

    document.getElementById("titulo").innerText = "➕ Nueva Reserva";
    document.getElementById("contenedor").innerHTML = `
        <div class="form-container">
            <h2>Nueva Reserva</h2>
            <div class="form-group">
                <label>Cliente *</label>
                <select id="f-cliente">
                    <option value="">-- Selecciona cliente --</option>
                    ${clientes.map(c => `<option value="${c.id}">${c.nombre} (${c.email})</option>`).join("")}
                </select>
                <span class="field-error" id="err-cliente"></span>
            </div>
            <div class="form-group">
                <label>Tour *</label>
                <select id="f-tour">
                    <option value="">-- Selecciona tour --</option>
                    ${tours.map(t => `<option value="${t.id}" ${t.id == tourIdPredefinido ? "selected" : ""}>${t.nombre} - ${t.ciudad} ($${Number(t.precio).toLocaleString("es-CO")})</option>`).join("")}
                </select>
                <span class="field-error" id="err-tour"></span>
            </div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="crearReserva()">✅ Confirmar Reserva</button>
                <button class="btn btn-outline" onclick="cargarReservas()">Cancelar</button>
            </div>
        </div>
    `;
}

async function reservarTourRapido(tourId, tourNombre) {
    await mostrarFormReserva(tourId, tourNombre);
}

async function crearReserva() {
    const clienteId = parseInt(document.getElementById("f-cliente").value);
    const tourId = parseInt(document.getElementById("f-tour").value);

    let valid = true;
    if (!clienteId) { mostrarError(document.getElementById("err-cliente"), "Selecciona un cliente"); valid = false; } else limpiarError(document.getElementById("err-cliente"));
    if (!tourId) { mostrarError(document.getElementById("err-tour"), "Selecciona un tour"); valid = false; } else limpiarError(document.getElementById("err-tour"));
    if (!valid) return;

    const res = await fetchAPI("/reservas", "POST", { cliente_id: clienteId, tour_id: tourId });
    if (!res) return;
    const data = await res.json();
    if (res.ok) { mostrarToast("✅ Reserva creada correctamente"); cargarReservas(); }
    else mostrarToast("❌ " + (data.detail || "Error al crear reserva"), true);
}

async function cancelarReserva(id) {
    if (!confirm("¿Cancelar esta reserva?")) return;
    const res = await fetchAPI(`/reservas/${id}`, "DELETE");
    if (!res) return;
    if (res.ok) { mostrarToast("🗑️ Reserva cancelada"); cargarReservas(); }
    else mostrarToast("❌ Error al cancelar", true);
}

// ===================== GUÍAS =====================

async function cargarGuias() {
    document.getElementById("titulo").innerText = "🧭 Guías Turísticos";
    setNavActivo("nav-guias");

    const res = await fetchAPI("/guias");
    if (!res) return;
    const data = await res.json();

    const container = document.getElementById("contenedor");
    container.innerHTML = `
        <div class="filtros">
            <button class="btn btn-primary" onclick="mostrarFormGuia()">➕ Nuevo Guía</button>
        </div>
        <div class="grid">
            ${data.length === 0
                ? `<div class="empty-state">No hay guías registrados</div>`
                : data.map(g => `
                    <div class="card">
                        <div class="card-body">
                            <div class="guia-avatar">🧭</div>
                            <h3>${g.nombre}</h3>
                            <p>🗣️ ${g.idioma || "Español"}</p>
                            <div class="card-actions">
                                <button class="btn btn-sm btn-outline" onclick='editarGuia(${g.id}, "${g.nombre}", "${g.idioma || "Español"}")'>✏️</button>
                                <button class="btn btn-sm btn-danger" onclick='eliminarGuia(${g.id})'>🗑️</button>
                            </div>
                        </div>
                    </div>`).join("")}
        </div>
    `;
}

function mostrarFormGuia(guia = null) {
    document.getElementById("titulo").innerText = guia ? "✏️ Editar Guía" : "➕ Nuevo Guía";
    document.getElementById("contenedor").innerHTML = `
        <div class="form-container">
            <h2>${guia ? "Editar Guía" : "Nuevo Guía"}</h2>
            <div class="form-group">
                <label>Nombre *</label>
                <input type="text" id="f-nombre" placeholder="Nombre del guía" value="${guia?.nombre || ""}">
                <span class="field-error" id="err-nombre"></span>
            </div>
            <div class="form-group">
                <label>Idioma(s) *</label>
                <input type="text" id="f-idioma" placeholder="Ej: Español/Inglés" value="${guia?.idioma || ""}">
                <span class="field-error" id="err-idioma"></span>
            </div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="${guia ? `guardarEdicionGuia(${guia.id})` : 'crearGuia()'}">
                    ${guia ? "💾 Guardar" : "✅ Crear"}
                </button>
                <button class="btn btn-outline" onclick="cargarGuias()">Cancelar</button>
            </div>
        </div>
    `;
}

async function crearGuia() {
    const nombre = document.getElementById("f-nombre").value.trim();
    const idioma = document.getElementById("f-idioma").value.trim();
    let valid = true;
    if (!nombre || nombre.length < 2) { mostrarError(document.getElementById("err-nombre"), "Mínimo 2 caracteres"); valid = false; } else limpiarError(document.getElementById("err-nombre"));
    if (!idioma || idioma.length < 2) { mostrarError(document.getElementById("err-idioma"), "Indica el idioma"); valid = false; } else limpiarError(document.getElementById("err-idioma"));
    if (!valid) return;

    const res = await fetchAPI("/guias", "POST", { nombre, idioma });
    if (!res) return;
    if (res.ok) { mostrarToast("✅ Guía creado"); cargarGuias(); }
    else { const d = await res.json(); mostrarToast("❌ " + (d.detail || "Error"), true); }
}

function editarGuia(id, nombre, idioma) { mostrarFormGuia({ id, nombre, idioma }); }

async function guardarEdicionGuia(id) {
    const nombre = document.getElementById("f-nombre").value.trim();
    const idioma = document.getElementById("f-idioma").value.trim();
    let valid = true;
    if (!nombre || nombre.length < 2) { mostrarError(document.getElementById("err-nombre"), "Mínimo 2 caracteres"); valid = false; } else limpiarError(document.getElementById("err-nombre"));
    if (!idioma || idioma.length < 2) { mostrarError(document.getElementById("err-idioma"), "Indica el idioma"); valid = false; } else limpiarError(document.getElementById("err-idioma"));
    if (!valid) return;

    const res = await fetchAPI(`/guias/${id}`, "PUT", { nombre, idioma });
    if (!res) return;
    if (res.ok) { mostrarToast("✅ Guía actualizado"); cargarGuias(); }
    else { const d = await res.json(); mostrarToast("❌ " + (d.detail || "Error"), true); }
}

async function eliminarGuia(id) {
    if (!confirm("¿Eliminar este guía?")) return;
    const res = await fetchAPI(`/guias/${id}`, "DELETE");
    if (!res) return;
    if (res.ok) { mostrarToast("🗑️ Guía eliminado"); cargarGuias(); }
    else mostrarToast("❌ Error al eliminar", true);
}

// ===================== FAVORITOS =====================

function toggleFavorito(tour) {
    const idx = favoritos.findIndex(f => f.id === tour.id);
    if (idx >= 0) {
        favoritos.splice(idx, 1);
        mostrarToast("💔 Eliminado de favoritos");
    } else {
        favoritos.push(tour);
        mostrarToast("❤️ Agregado a favoritos");
    }
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    const btn = document.getElementById(`fav-btn-${tour.id}`);
    if (btn) {
        btn.innerHTML = favoritos.find(f => f.id === tour.id) ? "❤️" : "🤍";
        btn.className = `btn btn-sm ${favoritos.find(f => f.id === tour.id) ? "btn-fav-active" : "btn-fav"}`;
    }
}

function cargarFavoritos() {
    document.getElementById("titulo").innerText = "⭐ Favoritos";
    setNavActivo("nav-favoritos");
    const container = document.getElementById("contenedor");
    if (favoritos.length === 0) {
        container.innerHTML = `<div class="empty-state">No tienes tours favoritos aún. ¡Explora y agrega algunos! 🌎</div>`;
        return;
    }
    container.innerHTML = `<div class="grid" id="grid-favs"></div>`;
    pintarTours(favoritos, "grid-favs");
}

// ===================== PERFIL =====================

async function verPerfil() {
    setNavActivo("nav-perfil");
    const res = await fetchAPI("/perfil");
    if (!res) return;
    const data = await res.json();

    document.getElementById("titulo").innerText = "👤 Mi Perfil";
    document.getElementById("contenedor").innerHTML = `
        <div class="form-container perfil-card">
            <div class="perfil-avatar">👤</div>
            <h2>${data.username}</h2>
            <div class="perfil-info">
                <div class="info-row"><span>🏷️ Rol</span><strong>${data.rol}</strong></div>
                <div class="info-row"><span>✅ Estado</span><strong>${data.estado}</strong></div>
                <div class="info-row"><span>🆔 ID</span><strong>#${data.id}</strong></div>
            </div>
            <div style="margin-top:20px; border-top:1px solid #eee; padding-top:20px;">
                <h3>📊 Estadísticas</h3>
                <div id="stats-perfil"><p>Cargando...</p></div>
            </div>
        </div>
    `;

    // Estadísticas
    const [rT, rC, rR] = await Promise.all([fetchAPI("/tours"), fetchAPI("/clientes"), fetchAPI("/reservas")]);
    const tours = rT ? await rT.json() : [];
    const clientes = rC ? await rC.json() : [];
    const reservas = rR ? await rR.json() : [];

    document.getElementById("stats-perfil").innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">🌍<br><strong>${tours.length}</strong><br>Tours</div>
            <div class="stat-card">👥<br><strong>${clientes.length}</strong><br>Clientes</div>
            <div class="stat-card">📅<br><strong>${reservas.length}</strong><br>Reservas</div>
            <div class="stat-card">⭐<br><strong>${favoritos.length}</strong><br>Favoritos</div>
        </div>
    `;
}

// ===================== UTILIDADES =====================

async function fetchAPI(endpoint, method = "GET", body = null) {
    try {
        const opts = {
            method,
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(API + endpoint, opts);
        if (res.status === 401) {
            mostrarToast("⚠️ Sesión expirada. Inicia sesión nuevamente.", true);
            logout();
            return null;
        }
        return res;
    } catch (err) {
        mostrarToast("❌ Error de conexión con el servidor", true);
        return null;
    }
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mostrarError(el, msg) {
    if (!el) return;
    el.innerText = msg;
    el.style.display = "block";
}

function limpiarError(el) {
    if (!el) return;
    el.innerText = "";
    el.style.display = "none";
}

function setNavActivo(id) {
    document.querySelectorAll("nav button").forEach(b => b.classList.remove("activo"));
    const el = document.getElementById(id);
    if (el) el.classList.add("activo");
}

// ===================== INIT =====================

window.onload = function () {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("username");

    if (savedToken) {
        token = savedToken;
        document.getElementById("public-site").style.display = "none";
        document.getElementById("app").style.display = "block";
        document.getElementById("username-display").innerText = savedUser || "Usuario";
        cargarTours();
    }

    document.getElementById("password")?.addEventListener("keydown", e => {
        if (e.key === "Enter") login();
    });
};


// =========================
// FUNCIONES PÚBLICAS
// =========================

function mostrarServicio(servicio){

    const nombres = {
        "vuelos": "✈️ Vuelos nacionales por Colombia",
        "hoteles": "🏨 Hoteles en destinos turísticos",
        "tours": "🗺️ Tours guiados por Colombia",
        "transporte": "🚐 Transporte turístico",
        "vuelo-hotel": "✈️🏨 Paquetes Vuelo + Hotel",
        "hotel-transporte": "🏨🚐 Hotel + Transporte"
    };

    mostrarToast(
        nombres[servicio] || "Servicio disponible próximamente"
    );
}

function verPromocion(){

    mostrarToast(
        "🔥 Mostrando promociones disponibles"
    );

    scrollToSection("promos");
}

function verTodosTours(){

    mostrarToast(
        "🌍 Tours turísticos en Colombia"
    );

    scrollToSection("tours-pub");
}

function verTodosDestinos(){

    mostrarToast(
        "📍 Destinos turísticos destacados"
    );

    scrollToSection("hoteles");
}

function verDestino(ciudad){

    mostrarToast(
        "🏙️ Explorando " + ciudad
    );
}

function mostrarAyuda(tipo){

    const mensajes = {
        "faq": "❓ Preguntas frecuentes",
        "contacto": "📞 Contacto y soporte",
        "terminos": "📄 Términos y condiciones",
        "privacidad": "🔒 Política de privacidad"
    };

    mostrarToast(
        mensajes[tipo]
    );
}

function abrirFavoritosPublico(){

    mostrarToast(
        "❤️ Debes iniciar sesión para usar favoritos"
    );
}

function buscarViajes(){

    mostrarToast(
        "🔍 Buscando las mejores ofertas..."
    );
}

function scrollToSection(id){

    const section = document.getElementById(id);

    if(section){

        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}

// =========================
// AUTH MODAL
// =========================

function abrirLogin(){

    document.getElementById(
        "authModal"
    ).style.display = "flex";

    mostrarLogin();
}

function abrirRegistro(){

    document.getElementById(
        "authModal"
    ).style.display = "flex";

    mostrarRegistro();
}

function cerrarAuth(){

    document.getElementById(
        "authModal"
    ).style.display = "none";
}

function mostrarLogin(){

    document.getElementById(
        "loginForm"
    ).style.display = "block";

    document.getElementById(
        "registerForm"
    ).style.display = "none";

    document.getElementById(
        "loginTab"
    ).classList.add("active");

    document.getElementById(
        "registerTab"
    ).classList.remove("active");
}

function mostrarRegistro(){

    document.getElementById(
        "loginForm"
    ).style.display = "none";

    document.getElementById(
        "registerForm"
    ).style.display = "block";

    document.getElementById(
        "registerTab"
    ).classList.add("active");

    document.getElementById(
        "loginTab"
    ).classList.remove("active");
}

// =========================
// LOGIN JWT
// =========================

async function login(){

    const username = document.getElementById(
        "loginUser"
    ).value;

    const password = document.getElementById(
        "loginPass"
    ).value;

    const formData = new URLSearchParams();

    formData.append("username", username);

    formData.append("password", password);

    const response = await fetch(
        "/token",
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/x-www-form-urlencoded"
            },

            body:formData
        }
    );

    if(response.ok){

        const data = await response.json();

        localStorage.setItem(
            "token",
            data.access_token
        );

        mostrarToast(
            "✅ Bienvenido " + username
        );

        cerrarAuth();

    }else{

        mostrarToast(
            "❌ Credenciales inválidas"
        );
    }
}

// =========================
// CREAR CUENTA
// =========================

function crearCuenta(){

    const user = document.getElementById(
        "registerUser"
    ).value;

    mostrarToast(
        "✅ Cuenta creada para " + user
    );

    mostrarLogin();
}