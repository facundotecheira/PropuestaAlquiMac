const STORAGE_KEY = 'alquimac_data_v3';
const PLACEHOLDER_IMG = 'img/placeholder.svg';

// ========== ESTADO INICIAL ==========
const estadoInicial = {
  herramientas: [
    { id: 1, nombre: 'Taladro Percutor', descripcion: 'Taladro percutor profesional de 800W con mandril metálico. Ideal para concreto, madera y metal.', categoria: 'Taladros', precioDia: 5000, precioMes: 80000, garantia: 15000, stockTotal: 10, stockAlquilado: 0, stockReservado: 0, imagen: 'img/taladro.svg', vecesAlquilada: 0, condicion: 'Usada - Buen estado', moneda: 'ARS' },
    { id: 2, nombre: 'Amoladora Angular', descripcion: 'Amoladora angular de 4 1/2" con disco de corte y desbaste. Potente motor de 1100W.', categoria: 'Amoladoras', precioDia: 4000, precioMes: 65000, garantia: 12000, stockTotal: 8, stockAlquilado: 0, stockReservado: 0, imagen: 'img/amoladora.svg', vecesAlquilada: 0, condicion: 'Nueva', moneda: 'ARS' },
    { id: 3, nombre: 'Hidrolavadora', descripcion: 'Hidrolavadora de alta presión 1800W con 120 bares. Incluye lanza y manguera de 10m.', categoria: 'Limpieza', precioDia: 7000, precioMes: 100000, garantia: 20000, stockTotal: 5, stockAlquilado: 0, stockReservado: 0, imagen: 'img/hidrolavadora.svg', vecesAlquilada: 0, condicion: 'Usada - Como nueva', moneda: 'ARS' },
    { id: 4, nombre: 'Soldadora Inverter', descripcion: 'Soldadora inverter 160A con electrodo revestido. Liviana y portátil.', categoria: 'Soldadoras', precioDia: 6000, precioMes: 90000, garantia: 18000, stockTotal: 4, stockAlquilado: 0, stockReservado: 0, imagen: 'img/soldadora.svg', vecesAlquilada: 0, condicion: 'Nueva', moneda: 'ARS' },
    { id: 5, nombre: 'Compresor de Aire', descripcion: 'Compresor de aire de 50L con motor de 2HP. Ideal para inflar neumáticos y herramientas neumáticas.', categoria: 'Compresores', precioDia: 8000, precioMes: 120000, garantia: 25000, stockTotal: 3, stockAlquilado: 0, stockReservado: 0, imagen: 'img/compresor.svg', vecesAlquilada: 0, condicion: 'Usada - Buen estado', moneda: 'ARS' }
  ],
  categorias: ['Taladros', 'Amoladoras', 'Limpieza', 'Soldadoras', 'Compresores'],
  categoriaColores: { Taladros: '#27AE60', Amoladoras: '#3498db', Limpieza: '#f39c12', Soldadoras: '#9b59b6', Compresores: '#1abc9c' },
  reservas: [],
  nextId: 6
};

// ========== CARGA / GUARDADO ==========
function cargarEstado() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(estadoInicial, data);
    }
  } catch (e) {}
}
function guardarEstado() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ herramientas, categorias, categoriaColores, reservas, nextId })); } catch (e) {}
}

cargarEstado();
let herramientas = estadoInicial.herramientas;
let categorias = estadoInicial.categorias;
let categoriaColores = estadoInicial.categoriaColores;
let reservas = estadoInicial.reservas;
let nextId = estadoInicial.nextId;
let rolActual = 'cliente';
let herramientaSeleccionada = null;
let imagenData = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  cargarCategorias();
  renderizarHerramientas();
  renderizarReservas();
  renderizarAlquiladas();
  renderizarStock();
  renderizarEstadisticas();
  document.getElementById('toolForm').addEventListener('submit', guardarHerramienta);
  initImageUpload();
  document.getElementById('newCategoryColor').addEventListener('input', e => {
    document.getElementById('newCategoryColorHex').textContent = e.target.value;
  });
});

// ========== ROL ==========
function toggleSidebar() {
  document.getElementById('hamburgerBtn').classList.toggle('active');
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

function cambiarRol(rol) {
  rolActual = rol;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.role-btn[data-role="${rol}"]`).classList.add('active');
  document.getElementById('clienteView').classList.toggle('hidden', rol !== 'cliente');
  document.getElementById('adminView').classList.toggle('hidden', rol !== 'admin');
  if (rol === 'admin') { renderizarReservas(); renderizarAlquiladas(); renderizarStock(); renderizarEstadisticas(); }
  document.getElementById('hamburgerBtn').classList.remove('active');
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// ========== CATEGORÍAS ==========
function cargarCategorias() {
  ['toolCategory', 'categoryFilter'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = id === 'categoryFilter' ? '<option value="">Todas las categorías</option>' : '';
    categorias.forEach(c => {
      const o = document.createElement('option');
      o.value = c; o.textContent = c;
      sel.appendChild(o);
    });
    if (cur && categorias.includes(cur)) sel.value = cur;
  });
}

function abrirModalCategoria() {
  document.getElementById('newCategoryInput').value = '';
  document.getElementById('newCategoryColor').value = '#2ECC71';
  document.getElementById('newCategoryColorHex').textContent = '#2ECC71';
  document.getElementById('categoriaModal').classList.remove('hidden');
  setTimeout(() => document.getElementById('newCategoryInput').focus(), 100);
}
function cerrarModalCategoria() { document.getElementById('categoriaModal').classList.add('hidden'); }

function guardarCategoria() {
  const nombre = document.getElementById('newCategoryInput').value.trim();
  if (!nombre) return;
  if (categorias.includes(nombre)) { alert('Esa categoría ya existe'); return; }
  const color = document.getElementById('newCategoryColor').value;
  categorias.push(nombre);
  categoriaColores[nombre] = color;
  cargarCategorias();
  guardarEstado();
  cerrarModalCategoria();
}

// ========== IMAGE UPLOAD ==========
function initImageUpload() {
  const da = document.getElementById('imageDropArea'), inp = document.getElementById('toolImageInput');
  da.addEventListener('click', () => inp.click());
  da.addEventListener('dragover', e => { e.preventDefault(); da.classList.add('dragover'); });
  da.addEventListener('dragleave', () => da.classList.remove('dragover'));
  da.addEventListener('drop', e => { e.preventDefault(); da.classList.remove('dragover'); if (e.dataTransfer.files[0]) processImageFile(e.dataTransfer.files[0]); });
  inp.addEventListener('change', e => { if (e.target.files[0]) processImageFile(e.target.files[0]); });
}
function processImageFile(file) {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { alert('Solo JPG, PNG o WebP'); return; }
  if (file.size > 2*1024*1024) { alert('Máximo 2MB'); return; }
  const r = new FileReader();
  r.onload = e => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > 800 || h > 600) { const ratio = Math.min(800/w, 600/h); w = Math.round(w*ratio); h = Math.round(h*ratio); }
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img,0,0,w,h);
      imagenData = c.toDataURL('image/jpeg',0.8);
      showPreview(imagenData);
    };
    img.src = e.target.result;
  };
  r.readAsDataURL(file);
}
function showPreview(d) {
  document.getElementById('imagePlaceholder').classList.add('hidden');
  const p = document.getElementById('imagePreview'); p.src = d; p.classList.remove('hidden');
  document.getElementById('removeImageBtn').style.display = 'inline-block';
}
function removerImagen() {
  imagenData = null;
  document.getElementById('imagePlaceholder').classList.remove('hidden');
  const p = document.getElementById('imagePreview'); p.classList.add('hidden'); p.src = '';
  document.getElementById('toolImageInput').value = '';
  document.getElementById('removeImageBtn').style.display = 'none';
}

// ========== FILTROS ==========
function filtrarHerramientas() { renderizarHerramientas(); }

// ========== RENDER: CATÁLOGO CLIENTE ==========
function renderizarHerramientas() {
  const grid = document.getElementById('herramientasGrid');
  const search = document.getElementById('searchInput').value.toLowerCase();
  const catFilter = document.getElementById('categoryFilter').value;
  let f = herramientas.filter(h => h.nombre.toLowerCase().includes(search) && (!catFilter || h.categoria === catFilter));
  if (!f.length) { grid.innerHTML = '<div class="empty-state">No se encontraron herramientas</div>'; return; }
  grid.innerHTML = f.map(h => {
    const disp = h.stockTotal - h.stockAlquilado - h.stockReservado;
    return `<div class="herramienta-card" onclick="abrirModal(${h.id})">
      <img src="${h.imagen||PLACEHOLDER_IMG}" alt="${h.nombre}" onerror="this.src='${PLACEHOLDER_IMG}'">
      <div class="card-body">
        <h3>${h.nombre}</h3>
        <p class="categoria">${h.condicion ? h.condicion : ''}</p>
        <div class="precios">
          <span>${formatearPrecio(h.precioDia,h.moneda)}/día</span>
          <span>${formatearPrecio(h.precioMes,h.moneda)}/mes</span>
        </div>
        ${disp > 0 ? `<span class="info-badge" style="color:#2ECC71">✅ Disponible (${disp} uds.)</span>` : `<span class="info-badge" style="color:#e74c3c">❌ Sin stock</span>`}
      </div>
    </div>`;
  }).join('');
}

function formatearPrecio(v, m) { return m === 'USD' ? 'US$'+Number(v).toLocaleString('es-AR',{minimumFractionDigits:2}) : '$'+Number(v).toLocaleString('es-AR'); }

// ========== MODAL CLIENTE ==========
function abrirModal(id) {
  const h = herramientas.find(t => t.id === id);
  if (!h) return;
  herramientaSeleccionada = h;
  const disp = h.stockTotal - h.stockAlquilado - h.stockReservado;
  document.getElementById('modalBody').innerHTML = `
    <img class="modal-tool-image" src="${h.imagen||PLACEHOLDER_IMG}" alt="${h.nombre}" onerror="this.src='${PLACEHOLDER_IMG}'">
    <div class="modal-tool-info">
      <h2>${h.nombre}</h2>
      <p class="desc">${h.descripcion}</p>
      <div class="detail-row">
        <span class="detail-label">Precio por día</span>
        <span class="detail-value">${formatearPrecio(h.precioDia,h.moneda)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Precio por mes</span>
        <span class="detail-value">${formatearPrecio(h.precioMes,h.moneda)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Garantía</span>
        <span class="detail-value">${formatearPrecio(h.garantia,h.moneda)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Disponibilidad</span>
        <span class="detail-value" style="color:${disp>0?'#2ECC71':'#e74c3c'}">${disp>0?'✅ Disponible ('+disp+' uds.)':'❌ Sin stock'}</span>
      </div>
      ${disp>0 ? `
        <div class="reserva-form">
          <h3>Solicitar Reserva</h3>
          <div class="form-group">
            <label>Nombre del cliente</label>
            <input type="text" id="reservaCliente" placeholder="Tu nombre" required>
          </div>
          <div class="form-group">
            <label>Teléfono / Contacto</label>
            <input type="text" id="reservaContacto" placeholder="Teléfono o email">
          </div>
          <div class="form-group">
            <label>Cantidad de unidades</label>
            <input type="number" id="reservaCantidad" min="1" max="${disp}" value="1" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Fecha inicio</label>
              <input type="date" id="reservaInicio" min="${hoyStr()}" onchange="document.getElementById('reservaFin').min=diaSiguienteStr(this.value)" required>
            </div>
            <div class="form-group">
              <label>Fecha fin</label>
              <input type="date" id="reservaFin" min="${hoyStr()}" required>
            </div>
          </div>
          <button class="btn-primary" onclick="solicitarReserva(${h.id})">Solicitar Reserva</button>
        </div>` : ''}
    </div>`;
  document.getElementById('toolModal').classList.remove('hidden');
}
function cerrarModal() { document.getElementById('toolModal').classList.add('hidden'); herramientaSeleccionada = null; }

// ========== RESERVAS ==========
function solicitarReserva(id) {
  const h = herramientas.find(t => t.id === id);
  if (!h) return;
  const c = document.getElementById('reservaCliente').value.trim();
  const t = document.getElementById('reservaContacto').value.trim();
  const inicio = document.getElementById('reservaInicio').value;
  const fin = document.getElementById('reservaFin').value;
  const cant = parseInt(document.getElementById('reservaCantidad').value) || 1;
  const disp = h.stockTotal - h.stockAlquilado - h.stockReservado;
  if (!c || !inicio || !fin) { alert('Completá todos los campos obligatorios'); return; }
  if (new Date(fin) <= new Date(inicio)) { alert('La fecha de fin debe ser posterior a la de inicio'); return; }
  if (!validarFecha(inicio)) { alert('La fecha de inicio debe ser hoy o posterior'); return; }
  if (cant > disp) { alert('No hay suficientes unidades disponibles'); return; }
  reservas.push({ id: Date.now(), herramientaId: h.id, herramientaNombre: h.nombre, cliente: c, contacto: t, inicio, fin, unidades: cant, direccion: '', estado: 'pendiente', fechaSolicitud: new Date().toISOString() });
  h.stockReservado = (h.stockReservado||0) + cant;
  guardarEstado();
  alert('¡Reserva solicitada con éxito!');
  cerrarModal();
  renderizarHerramientas(); renderizarReservas(); renderizarEstadisticas();
}

// ========== ADMIN: TABS ==========
function cambiarTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
  document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
  const map = { agregar:'tabAgregar', reservas:'tabReservas', alquiladas:'tabAlquiladas', stock:'tabStock', estadisticas:'tabEstadisticas' };
  const el = document.getElementById(map[tab]);
  if (el) {
    el.classList.remove('hidden');
    if (tab==='estadisticas') renderizarEstadisticas();
    if (tab==='stock') renderizarStock();
    if (tab==='reservas') renderizarReservas();
    if (tab==='alquiladas') renderizarAlquiladas();
  }
}

// ========== ADMIN: GUARDAR HERRAMIENTA ==========
function guardarHerramienta(e) {
  e.preventDefault();
  const editId = document.getElementById('editId').value;
  const data = {
    nombre: document.getElementById('toolName').value.trim(),
    descripcion: document.getElementById('toolDesc').value.trim(),
    categoria: document.getElementById('toolCategory').value,
    precioDia: parseFloat(document.getElementById('toolPriceDay').value),
    precioMes: parseFloat(document.getElementById('toolPriceMonth').value),
    garantia: parseFloat(document.getElementById('toolGarantia').value),
    stockTotal: parseInt(document.getElementById('toolStock').value),
    condicion: document.getElementById('toolCondicion').value || '',
    moneda: document.getElementById('toolMoneda').value,
    imagen: imagenData || ''
  };
  if (editId) {
    const idx = herramientas.findIndex(h => h.id === parseInt(editId));
    if (idx !== -1) herramientas[idx] = { ...herramientas[idx], ...data };
  } else {
    data.id = nextId++; data.stockAlquilado = 0; data.stockReservado = 0; data.vecesAlquilada = 0;
    herramientas.push(data);
  }
  document.getElementById('toolForm').reset();
  document.getElementById('editId').value = '';
  document.getElementById('toolCondicion').value = '';
  document.getElementById('toolMoneda').value = 'ARS';
  removerImagen();
  guardarEstado();
  renderizarHerramientas(); renderizarStock(); renderizarEstadisticas();
  if (editId) cambiarTab('stock');
  alert('Herramienta guardada correctamente');
}

function editarHerramienta(id) {
  const h = herramientas.find(t => t.id === id);
  if (!h) return;
  cambiarTab('agregar');
  document.getElementById('editId').value = h.id;
  document.getElementById('toolName').value = h.nombre;
  document.getElementById('toolDesc').value = h.descripcion;
  document.getElementById('toolCategory').value = h.categoria;
  document.getElementById('toolPriceDay').value = h.precioDia;
  document.getElementById('toolPriceMonth').value = h.precioMes;
  document.getElementById('toolGarantia').value = h.garantia;
  document.getElementById('toolStock').value = h.stockTotal;
  document.getElementById('toolCondicion').value = h.condicion || '';
  document.getElementById('toolMoneda').value = h.moneda || 'ARS';
  if (h.imagen) { imagenData = h.imagen; showPreview(h.imagen); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== ADMIN: RESERVAS ==========
function renderizarReservas() {
  const container = document.getElementById('reservasList');
  const filtroCliente = (document.getElementById('reservaFiltroCliente').value||'').toLowerCase();
  const filtroEstado = document.getElementById('reservaFiltroEstado').value;
  const filtroFecha = document.getElementById('reservaFiltroFecha').value;

  let items = reservas.filter(r => r.estado === 'pendiente' || r.estado === 'aprobada');
  if (filtroCliente) items = items.filter(r => r.cliente.toLowerCase().includes(filtroCliente));
  if (filtroEstado) items = items.filter(r => r.estado === filtroEstado);
  if (filtroFecha) items = items.filter(r => r.inicio <= filtroFecha && r.fin >= filtroFecha);

  items.sort((a, b) => Math.abs(new Date(a.inicio) - Date.now()) - Math.abs(new Date(b.inicio) - Date.now()));

  if (!items.length) { container.innerHTML = '<div class="empty-state">No hay reservas</div>'; return; }
  container.innerHTML = items.map(r => {
    const h = herramientas.find(t => t.id === r.herramientaId);
    const disp = h ? (h.stockTotal - h.stockAlquilado - h.stockReservado) : 0;
    return `<div class="reserva-item ${r.estado}">
      <div class="reserva-info">
        <h4>${r.herramientaNombre} <span style="font-size:0.8rem;color:var(--gray-500)">${r.unidades} ud(s)</span></h4>
        <p><strong>Cliente:</strong> ${r.cliente} ${r.contacto ? '| ' + r.contacto : ''}</p>
        <p><strong>Período:</strong> ${formatearFecha(r.inicio)} → ${formatearFecha(r.fin)}</p>
        <p><strong>Estado:</strong> ${estadoBadge(r.estado)}</p>
      </div>
      <div class="reserva-actions">
        ${r.estado === 'pendiente' ? `<button class="btn-small" onclick="editarReserva(${r.id})">✏️ Editar</button><button class="btn-success" onclick="aceptarReserva(${r.id})">Aceptar</button><button class="btn-danger" onclick="rechazarReserva(${r.id})">Rechazar</button>` : ''}
        ${r.estado === 'aprobada' ? `<button class="btn-primary" onclick="alquilarReserva(${r.id})">🔨 Alquilar</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function estadoBadge(e) {
  return { pendiente:'⏳ Pendiente', aprobada:'✅ Aprobada', alquilada:'🔨 Alquilada', rechazada:'❌ Rechazada', finalizada:'✔ Finalizada' }[e]||e;
}

function aceptarReserva(id) {
  const r = reservas.find(x => x.id === id);
  if (!r) return;
  r.estado = 'aprobada';
  guardarEstado();
  renderizarReservas(); renderizarHerramientas(); renderizarStock(); renderizarEstadisticas();
}
function rechazarReserva(id) {
  const r = reservas.find(x => x.id === id);
  if (!r) return;
  const h = herramientas.find(t => t.id === r.herramientaId);
  if (h) h.stockReservado = Math.max(0, (h.stockReservado||0) - r.unidades);
  r.estado = 'rechazada';
  guardarEstado();
  renderizarReservas(); renderizarHerramientas(); renderizarStock();
}

// ========== EDITAR RESERVA ==========
let reservaEditandoId = null;

function editarReserva(id) {
  const r = reservas.find(x => x.id === id);
  if (!r) return;
  reservaEditandoId = id;
  const h = herramientas.find(t => t.id === r.herramientaId);
  const disp = h ? (h.stockTotal - h.stockAlquilado - h.stockReservado + r.unidades) : 0;
  document.getElementById('editarReservaBody').innerHTML = `
    <p style="margin-bottom:0.75rem"><strong>${r.herramientaNombre}</strong></p>
    <div class="form-group">
      <label>Nombre del cliente</label>
      <input type="text" id="erCliente" value="${r.cliente}" required>
    </div>
    <div class="form-group">
      <label>Teléfono / Contacto</label>
      <input type="text" id="erContacto" value="${r.contacto || ''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Fecha inicio</label>
        <input type="date" id="erInicio" value="${r.inicio}" min="${hoyStr()}" onchange="document.getElementById('erFin').min=diaSiguienteStr(this.value)" required>
      </div>
      <div class="form-group">
        <label>Fecha fin</label>
        <input type="date" id="erFin" value="${r.fin}" min="${hoyStr()}" required>
      </div>
    </div>
    <div class="form-group">
      <label>Cantidad de unidades</label>
      <input type="number" id="erCantidad" min="1" max="${disp > 0 ? disp : 1}" value="${r.unidades}" required>
    </div>
    <button class="btn-primary" onclick="guardarEditarReserva()">Guardar Cambios</button>`;
  document.getElementById('editarReservaModal').classList.remove('hidden');
}

function cerrarModalEditarReserva() {
  document.getElementById('editarReservaModal').classList.add('hidden');
  reservaEditandoId = null;
}

function guardarEditarReserva() {
  const id = reservaEditandoId;
  if (!id) return;
  const r = reservas.find(x => x.id === id);
  if (!r) return;
  const h = herramientas.find(t => t.id === r.herramientaId);
  const cliente = document.getElementById('erCliente').value.trim();
  const contacto = document.getElementById('erContacto').value.trim();
  const inicio = document.getElementById('erInicio').value;
  const fin = document.getElementById('erFin').value;
  const cant = parseInt(document.getElementById('erCantidad').value) || 1;
  if (!cliente || !inicio || !fin) { alert('Completá todos los campos obligatorios'); return; }
  if (new Date(fin) <= new Date(inicio)) { alert('La fecha de fin debe ser posterior a la de inicio'); return; }
  if (!validarFecha(inicio)) { alert('La fecha de inicio debe ser hoy o posterior'); return; }
  const dif = cant - r.unidades;
  if (h && dif > 0) {
    const disp = h.stockTotal - h.stockAlquilado - h.stockReservado;
    if (dif > disp) { alert('No hay suficientes unidades disponibles'); return; }
    h.stockReservado = (h.stockReservado||0) + dif;
  }
  r.cliente = cliente;
  r.contacto = contacto;
  r.inicio = inicio;
  r.fin = fin;
  r.unidades = cant;
  guardarEstado();
  cerrarModalEditarReserva();
  renderizarReservas(); renderizarHerramientas(); renderizarStock(); renderizarEstadisticas();
}

let reservaPendienteAlquiler = null;

function alquilarReserva(id) {
  const r = reservas.find(x => x.id === id);
  if (!r) return;
  reservaPendienteAlquiler = id;
  document.getElementById('alquilarReservaInfo').textContent = `${r.herramientaNombre} — ${r.cliente} — ${r.unidades} ud(s)`;
  document.getElementById('alquilarReservaDireccion').value = r.direccion || '';
  document.getElementById('alquilarReservaModal').classList.remove('hidden');
  document.getElementById('alquilarReservaBtn').onclick = confirmarAlquilerReserva;
}

function cerrarModalAlquilarReserva() {
  document.getElementById('alquilarReservaModal').classList.add('hidden');
  reservaPendienteAlquiler = null;
}

function confirmarAlquilerReserva() {
  const id = reservaPendienteAlquiler;
  if (!id) return;
  const r = reservas.find(x => x.id === id);
  if (!r) return;
  const direccion = document.getElementById('alquilarReservaDireccion').value.trim();
  const h = herramientas.find(t => t.id === r.herramientaId);
  if (!h) return;
  r.direccion = direccion;
  r.estado = 'alquilada';
  h.stockReservado = Math.max(0, (h.stockReservado||0) - r.unidades);
  h.stockAlquilado = (h.stockAlquilado||0) + r.unidades;
  h.vecesAlquilada = (h.vecesAlquilada||0) + r.unidades;
  guardarEstado();
  cerrarModalAlquilarReserva();
  renderizarReservas(); renderizarAlquiladas(); renderizarHerramientas(); renderizarStock(); renderizarEstadisticas();
}

// ========== ADMIN: ALQUILADAS ==========
function renderizarAlquiladas() {
  const container = document.getElementById('alquiladasList');
  const filtroCliente = (document.getElementById('alquiladaFiltroCliente').value||'').toLowerCase();
  const filtroFecha = document.getElementById('alquiladaFiltroFecha').value;

  let items = reservas.filter(r => r.estado === 'alquilada');
  if (filtroCliente) items = items.filter(r => r.cliente.toLowerCase().includes(filtroCliente));
  if (filtroFecha) items = items.filter(r => r.inicio <= filtroFecha && r.fin >= filtroFecha);
  items.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));

  if (!items.length) { container.innerHTML = '<div class="empty-state">No hay herramientas alquiladas actualmente</div>'; return; }
  container.innerHTML = items.map(r => {
    const h = herramientas.find(t => t.id === r.herramientaId);
    return `<div class="reserva-item alquilada">
      <div class="reserva-info">
        <h4>${r.herramientaNombre} <span style="font-size:0.8rem;color:var(--gray-500)">${r.unidades} ud(s)</span></h4>
        <p><strong>Cliente:</strong> ${r.cliente} ${r.contacto ? '| ' + r.contacto : ''}</p>
        ${r.direccion ? `<p><strong>Dirección:</strong> ${r.direccion}</p>` : ''}
        <p><strong>Período:</strong> ${formatearFecha(r.inicio)} → ${formatearFecha(r.fin)}</p>
        <p><strong>Moneda:</strong> ${h ? h.moneda : 'ARS'}</p>
      </div>
      <div class="reserva-actions">
        <button class="btn-success" onclick="finalizarAlquiler(${r.id})">✔ Finalizar</button>
      </div>
    </div>`;
  }).join('');
}

function finalizarAlquiler(id) {
  if (!confirm('¿Confirmás que esta herramienta fue devuelta?')) return;
  const r = reservas.find(x => x.id === id);
  if (!r) return;
  const h = herramientas.find(t => t.id === r.herramientaId);
  if (h) h.stockAlquilado = Math.max(0, (h.stockAlquilado||0) - r.unidades);
  r.estado = 'finalizada';
  guardarEstado();
  renderizarAlquiladas(); renderizarStock(); renderizarHerramientas(); renderizarEstadisticas();
}

// ========== ADMIN: STOCK ==========
function renderizarStock() {
  const container = document.getElementById('stockList');
  const search = (document.getElementById('stockSearch').value||'').toLowerCase();
  const f = herramientas.filter(h => h.nombre.toLowerCase().includes(search));
  if (!f.length) { container.innerHTML = '<div class="empty-state">No se encontraron herramientas</div>'; return; }
  container.innerHTML = f.map(h => {
    const disp = h.stockTotal - h.stockAlquilado - h.stockReservado;
    const pD = Math.max((disp/h.stockTotal)*100,0), pA = Math.max((h.stockAlquilado/h.stockTotal)*100,0), pR = Math.max((h.stockReservado/h.stockTotal)*100,0);
    return `<div class="stock-item">
      <img class="stock-item-img" src="${h.imagen||PLACEHOLDER_IMG}" alt="${h.nombre}" onerror="this.src='${PLACEHOLDER_IMG}'">
      <div class="stock-item-body">
        <h4>${h.nombre} <span style="font-size:0.8rem;color:var(--gray-500)">(${h.moneda})</span></h4>
        <p class="stock-categoria">${h.categoria} ${h.condicion ? '· '+h.condicion : ''}</p>
        <div class="stock-bar">
          <div class="bar-segment bar-disponible" style="width:${pD}%"></div>
          <div class="bar-segment bar-alquilada" style="width:${pA}%"></div>
          <div class="bar-segment bar-reservada" style="width:${pR}%"></div>
        </div>
        <div class="stock-info">
          <span><span class="dot" style="background:#2ECC71"></span> Disp: ${disp}</span>
          <span><span class="dot" style="background:#3498db"></span> Alq: ${h.stockAlquilado}</span>
          <span><span class="dot" style="background:#f39c12"></span> Res: ${h.stockReservado}</span>
          <span><strong>Total: ${h.stockTotal}</strong></span>
        </div>
        <div class="stock-actions">
          <button class="btn-small" onclick="editarHerramienta(${h.id})">✏️ Editar</button>
          <button class="btn-small" onclick="abrirModalAlquilarStock(${h.id})" ${disp<=0?'disabled':''}>🔨 Alquilar</button>
          <button class="btn-small" onclick="abrirModalReservarStock(${h.id})" ${disp<=0?'disabled':''}>📋 Reservar</button>
          <button class="btn-danger" onclick="eliminarHerramienta(${h.id})">🗑 Eliminar</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function eliminarHerramienta(id) {
  const tieneReservas = reservas.some(r => r.herramientaId === id && (r.estado === 'pendiente' || r.estado === 'aprobada' || r.estado === 'alquilada'));
  if (tieneReservas) { alert('No se puede eliminar esta herramienta porque tiene reservas activas o está alquilada.'); return; }
  if (!confirm('¿Estás seguro de eliminar esta herramienta?')) return;
  herramientas = herramientas.filter(h => h.id !== id);
  guardarEstado();
  renderizarStock(); renderizarHerramientas(); renderizarEstadisticas();
}

// ========== MODAL: ALQUILAR DESDE STOCK ==========
function abrirModalAlquilarStock(id) {
  const h = herramientas.find(t => t.id === id);
  if (!h) return;
  const disp = h.stockTotal - h.stockAlquilado - h.stockReservado;
  if (disp <= 0) { alert('No hay unidades disponibles'); return; }
  document.getElementById('alquilarStockBody').innerHTML = `
    <p style="margin-bottom:0.75rem"><strong>${h.nombre}</strong> — Disponibles: ${disp} uds.</p>
    <div class="form-group">
      <label>Nombre del cliente</label>
      <input type="text" id="asCliente" required>
    </div>
    <div class="form-group">
      <label>Teléfono</label>
      <input type="text" id="asTelefono">
    </div>
    <div class="form-group">
      <label>Dirección (opcional)</label>
      <input type="text" id="asDireccion">
    </div>
      <div class="form-row">
        <div class="form-group">
          <label>Fecha inicio</label>
          <input type="date" id="asInicio" min="${hoyStr()}" onchange="document.getElementById('asFin').min=diaSiguienteStr(this.value)" required>
        </div>
        <div class="form-group">
          <label>Fecha fin</label>
          <input type="date" id="asFin" min="${hoyStr()}" required>
        </div>
      </div>
    <div class="form-group">
      <label>Cantidad de unidades</label>
      <input type="number" id="asCantidad" min="1" max="${disp}" value="1" required>
    </div>
    <button class="btn-primary" onclick="alquilarDesdeStock(${h.id})">Confirmar Alquiler</button>`;
  document.getElementById('alquilarStockModal').classList.remove('hidden');
}
function cerrarModalAlquilarStock() { document.getElementById('alquilarStockModal').classList.add('hidden'); }

function alquilarDesdeStock(id) {
  const h = herramientas.find(t => t.id === id);
  if (!h) return;
  const c = document.getElementById('asCliente').value.trim();
  const t = document.getElementById('asTelefono').value.trim();
  const d = document.getElementById('asDireccion').value.trim();
  const inicio = document.getElementById('asInicio').value;
  const fin = document.getElementById('asFin').value;
  const cant = parseInt(document.getElementById('asCantidad').value) || 1;
  const disp = h.stockTotal - h.stockAlquilado - h.stockReservado;
  if (!c || !inicio || !fin) { alert('Completá nombre y fechas'); return; }
  if (new Date(fin) <= new Date(inicio)) { alert('La fecha de fin debe ser posterior a la de inicio'); return; }
  if (!validarFecha(inicio)) { alert('La fecha de inicio debe ser hoy o posterior'); return; }
  if (cant > disp) { alert('No hay suficientes unidades'); return; }
  reservas.push({ id: Date.now(), herramientaId: h.id, herramientaNombre: h.nombre, cliente: c, contacto: t, direccion: d, inicio, fin, unidades: cant, estado: 'alquilada', fechaSolicitud: new Date().toISOString() });
  h.stockAlquilado = (h.stockAlquilado||0) + cant;
  h.vecesAlquilada = (h.vecesAlquilada||0) + cant;
  guardarEstado();
  cerrarModalAlquilarStock();
  renderizarAlquiladas(); renderizarStock(); renderizarHerramientas(); renderizarEstadisticas();
}

// ========== MODAL: RESERVAR DESDE STOCK ==========
function abrirModalReservarStock(id) {
  const h = herramientas.find(t => t.id === id);
  if (!h) return;
  const disp = h.stockTotal - h.stockAlquilado - h.stockReservado;
  if (disp <= 0) { alert('No hay unidades disponibles'); return; }
  document.getElementById('reservarStockBody').innerHTML = `
    <p style="margin-bottom:0.75rem"><strong>${h.nombre}</strong> — Disponibles: ${disp} uds.</p>
    <div class="form-group">
      <label>Nombre del cliente</label>
      <input type="text" id="rsCliente" required>
    </div>
    <div class="form-group">
      <label>Teléfono / Contacto</label>
      <input type="text" id="rsContacto">
    </div>
    <div class="form-group">
      <label>Cantidad de unidades</label>
      <input type="number" id="rsCantidad" min="1" max="${disp}" value="1" required>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Fecha inicio</label>
        <input type="date" id="rsInicio" min="${hoyStr()}" onchange="document.getElementById('rsFin').min=diaSiguienteStr(this.value)" required>
      </div>
      <div class="form-group">
        <label>Fecha fin</label>
        <input type="date" id="rsFin" min="${hoyStr()}" required>
      </div>
    </div>
    <button class="btn-primary" onclick="reservarDesdeStock(${h.id})">Solicitar Reserva</button>`;
  document.getElementById('reservarStockModal').classList.remove('hidden');
}
function cerrarModalReservarStock() { document.getElementById('reservarStockModal').classList.add('hidden'); }

function reservarDesdeStock(id) {
  const h = herramientas.find(t => t.id === id);
  if (!h) return;
  const c = document.getElementById('rsCliente').value.trim();
  const ct = document.getElementById('rsContacto').value.trim();
  const cant = parseInt(document.getElementById('rsCantidad').value) || 1;
  const inicio = document.getElementById('rsInicio').value;
  const fin = document.getElementById('rsFin').value;
  const disp = h.stockTotal - h.stockAlquilado - h.stockReservado;
  if (!c || !inicio || !fin) { alert('Completá nombre, fechas y cantidad'); return; }
  if (new Date(fin) <= new Date(inicio)) { alert('La fecha de fin debe ser posterior a la de inicio'); return; }
  if (!validarFecha(inicio)) { alert('La fecha de inicio debe ser hoy o posterior'); return; }
  if (cant > disp) { alert('No hay suficientes unidades'); return; }
  reservas.push({ id: Date.now(), herramientaId: h.id, herramientaNombre: h.nombre, cliente: c, contacto: ct, direccion: '', inicio, fin, unidades: cant, estado: 'pendiente', fechaSolicitud: new Date().toISOString() });
  h.stockReservado = (h.stockReservado||0) + cant;
  guardarEstado();
  cerrarModalReservarStock();
  renderizarStock(); renderizarHerramientas(); renderizarReservas(); renderizarEstadisticas();
}

// ========== ADMIN: ESTADÍSTICAS ==========
function renderizarEstadisticas() {
  document.getElementById('totalHerramientas').textContent = herramientas.length;
  document.getElementById('totalReservas').textContent = reservas.filter(r => r.estado === 'aprobada').length;
  document.getElementById('totalAlquiladas').textContent = reservas.filter(r => r.estado === 'alquilada').length;

  const ord = [...herramientas].sort((a,b) => (b.vecesAlquilada||0)-(a.vecesAlquilada||0));
  const topH = ord[0];
  document.getElementById('topHerramienta').textContent = topH && topH.vecesAlquilada>0 ? `${topH.nombre} (${topH.vecesAlquilada} veces)` : 'Sin datos';

  const catCount = {};
  herramientas.forEach(h => { const v = h.vecesAlquilada||0; if (v>0) catCount[h.categoria] = (catCount[h.categoria]||0)+v; });
  const topCat = Object.entries(catCount).sort((a,b) => b[1]-a[1])[0];
  document.getElementById('topCategoria').textContent = topCat ? `${topCat[0]} (${topCat[1]} veces)` : 'Sin datos';

  renderChartCategorias();
  renderChartReservas();
  renderChartTopHerramientas();
  renderChartTopCategorias();
}

function renderChartCategorias() {
  const container = document.getElementById('chartCategorias');
  const count = {};
  herramientas.forEach(h => { count[h.categoria] = (count[h.categoria]||0)+1; });
  const entries = Object.entries(count).sort((a,b) => b[1]-a[1]);
  const max = Math.max(...entries.map(e => e[1]),1);
  if (!entries.length) { container.innerHTML = '<div class="empty-state">Sin datos</div>'; return; }
  container.innerHTML = entries.map(([cat,num]) =>
    `<div class="chart-bar-row">
      <span class="chart-bar-label">${cat}</span>
      <div class="chart-bar-track"><div class="chart-bar-fill custom-color" style="width:${(num/max)*100}%;--bar-color:${categoriaColores[cat]||'#2ECC71'}">${num}</div></div>
      <span class="chart-bar-count">${num}</span>
    </div>`
  ).join('');
}

function renderChartReservas() {
  const container = document.getElementById('chartReservas');
  const count = { pendiente: 0 };
  reservas.filter(r => r.estado === 'pendiente').forEach(() => count.pendiente++);
  const entries = Object.entries(count).filter(e => e[1]>0);
  const max = Math.max(entries.map(e => e[1])[0]||0, 1);
  if (!entries.length) { container.innerHTML = '<div class="empty-state">Sin reservas pendientes</div>'; return; }
  container.innerHTML = entries.map(([est,num]) =>
    `<div class="chart-bar-row">
      <span class="chart-bar-label">⏳ Pendientes</span>
      <div class="chart-bar-track"><div class="chart-bar-fill orange" style="width:${(num/max)*100}%">${num}</div></div>
      <span class="chart-bar-count">${num}</span>
    </div>`
  ).join('');
}

function renderChartTopHerramientas() {
  const container = document.getElementById('chartTopHerramientas');
  const items = herramientas.filter(h => (h.vecesAlquilada||0)>0).sort((a,b) => (b.vecesAlquilada||0)-(a.vecesAlquilada||0)).slice(0,5);
  const max = Math.max(...items.map(h => h.vecesAlquilada||0),1);
  const cols = ['green','blue','orange','purple','teal'];
  if (!items.length) { container.innerHTML = '<div class="empty-state">Sin datos aún</div>'; return; }
  container.innerHTML = items.map((h,i) =>
    `<div class="chart-bar-row">
      <span class="chart-bar-label">${h.nombre}</span>
      <div class="chart-bar-track"><div class="chart-bar-fill ${cols[i%cols.length]}" style="width:${((h.vecesAlquilada||0)/max)*100}%">${h.vecesAlquilada||0}</div></div>
      <span class="chart-bar-count">${h.vecesAlquilada||0}</span>
    </div>`
  ).join('');
}

function renderChartTopCategorias() {
  const container = document.getElementById('chartTopCategorias');
  const catCount = {};
  herramientas.forEach(h => { const v = h.vecesAlquilada||0; if (v>0) catCount[h.categoria] = (catCount[h.categoria]||0)+v; });
  const items = Object.entries(catCount).sort((a,b) => b[1]-a[1]).slice(0,5);
  const max = Math.max(...items.map(e => e[1]),1);
  if (!items.length) { container.innerHTML = '<div class="empty-state">Sin datos aún</div>'; return; }
  container.innerHTML = items.map(([cat,num]) =>
    `<div class="chart-bar-row">
      <span class="chart-bar-label">${cat}</span>
      <div class="chart-bar-track"><div class="chart-bar-fill custom-color" style="width:${(num/max)*100}%;--bar-color:${categoriaColores[cat]||'#2ECC71'}">${num}</div></div>
      <span class="chart-bar-count">${num}</span>
    </div>`
  ).join('');
}

// ========== UTILIDADES ==========
function formatearFecha(f) { return new Date(f+'T12:00:00').toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'numeric'}); }

function hoyStr() { return new Date().toISOString().split('T')[0]; }
function diaSiguienteStr(fecha) {
  const d = new Date(fecha + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function validarFecha(fecha) {
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  return new Date(fecha+'T12:00:00') >= hoy;
}

document.addEventListener('click', e => { if (e.target.classList.contains('modal')) e.target.classList.add('hidden'); });
