// TaskModoOscuro.js

const btnToggle = document.getElementById("btn-modo-oscuro");

// 1. Al cargar la página, revisamos si había un modo guardado
document.addEventListener("DOMContentLoaded", () => {
  const modoGuardado = localStorage.getItem("modo");

  if (modoGuardado === "oscuro") {
    document.body.classList.add("dark");
    btnToggle.textContent = "☀️";   // Cambiar icono
  }
});

// 2. Al hacer click, alternamos entre claro/oscuro
btnToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  // Si tiene la clase → está en modo oscuro
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("modo", "oscuro");
    btnToggle.textContent = "☀️";
  } else {
    localStorage.setItem("modo", "claro");
    btnToggle.textContent = "🌙";
  }
});


document.addEventListener("keydown", (e) => {
  const modal = document.getElementById("modal-tarea");

  if (e.key === "Escape" && modal.classList.contains("show")) {
    modal.classList.remove("show");
  }
});

function activarConTeclado(elemento, callback){
  elemento.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callback();
    }
  });
}




/* ============================
   VARIABLES Y ELEMENTOS
============================ */
const btnAgregar = document.getElementById("btn-agregar-tarea");
const modal = document.getElementById("modal-tarea");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");
const btnCancelar = document.getElementById("btn-cancelar");
const listaTareas = document.getElementById("lista-tareas");

const inputTitulo = document.getElementById("titulo-tarea");
const inputDescripcion = document.getElementById("descripcion-tarea");
const inputPrioridad = document.getElementById("prioridad-tarea");
const inputFecha = document.getElementById("fecha-limite");

const tareasCompletadasUI = document.getElementById("tareas-completadas");

/* Filtros */
const botonesFiltro = document.querySelectorAll(".filtros-tareas button");



/* Array de tareas (almacenado en localStorage) */
let tareas = JSON.parse(localStorage.getItem("tareas")) || [];

/* ============================
   MOSTRAR / OCULTAR MODAL
============================ */
btnAgregar.addEventListener("click", () => {
  modal.classList.add("show");
  inputTitulo.focus();
});

btnCerrarModal.addEventListener("click", cerrarModal);
btnCancelar.addEventListener("click", cerrarModal);

function cerrarModal() {
  modal.classList.remove("show");
  limpiarFormulario();
}

/* ============================
   LIMPIAR FORMULARIO
============================ */
function limpiarFormulario() {
  inputTitulo.value = "";
  inputDescripcion.value = "";
  inputPrioridad.value = "media";
  inputFecha.value = "";
}

/* ============================
   CREAR TAREA
============================ */
document.querySelector(".formulario-tarea")
        .addEventListener("submit", agregarTarea);

 function agregarTarea(e) {
    e.preventDefault();

    const nuevaTarea = {
        id: Date.now(),
        titulo: inputTitulo.value.trim(),
        descripcion: inputDescripcion.value.trim(),
        prioridad: inputPrioridad.value,
        fechaLimite: inputFecha.value || null,
        completada: false
    };

    // Evita tareas vacías o duplicadas por error
    if (!nuevaTarea.titulo) return;

    tareas.push(nuevaTarea);
    guardarTareas();
    renderTareas();
    cerrarModal();
}



/* ============================
   GUARDAR EN LOCALSTORAGE
============================ */
function guardarTareas() {
  localStorage.setItem("tareas", JSON.stringify(tareas));
}

/* ============================
   FILTROS
============================ */
let filtroActual = "todas";

botonesFiltro.forEach(btn => {
  btn.addEventListener("click", () => {
    botonesFiltro.forEach(b => b.classList.remove("filtro-activo"));
    btn.classList.add("filtro-activo");
    filtroActual = btn.dataset.filtro;
    renderTareas();
  });
});

/* ============================
   RENDERIZAR TAREAS
============================ */
function renderTareas() {
  listaTareas.innerHTML = "";

  let tareasFiltradas = tareas;

  if (filtroActual === "pendientes") {
    tareasFiltradas = tareas.filter(t => !t.completada);
  } else if (filtroActual === "completadas") {
    tareasFiltradas = tareas.filter(t => t.completada);
  }

  if (tareasFiltradas.length === 0) {
    listaTareas.innerHTML = `
      <div class="empty-state tarea">
        <p>🎯 No hay tareas para mostrar.</p>
      </div>`;
    actualizarEstadisticas();
    return;
  }

  tareasFiltradas.forEach(tarea => {
    const div = document.createElement("div");
    div.className = "tarea";
    div.innerHTML = `
      <div class="info">
        <input type="checkbox" ${tarea.completada ? "checked" : ""} data-id="${tarea.id}">
        
        <div>
          <div class="titulo">${tarea.titulo}</div>
          <div class="meta">
            ${tarea.fechaLimite ? `📅 ${tarea.fechaLimite}` : ""}
          </div>
        </div>
      </div>

      <span class="tag-prioridad tag-${tarea.prioridad}">
        ${tarea.prioridad}
      </span>
    `;

    // Listener marcar completada
    div.querySelector("input[type=checkbox]").addEventListener("change", (e) => {
      marcarCompletada(tarea.id, e.target.checked);
    });

    listaTareas.appendChild(div);
  });

  actualizarEstadisticas();
}

/* ============================
   MARCAR COMO COMPLETADA
============================ */
function marcarCompletada(id, estado) {
  const tarea = tareas.find(t => t.id === id);
  if (tarea) tarea.completada = estado;

  guardarTareas();
  renderTareas();
}

/* ============================
   ESTADÍSTICAS
============================ */
function actualizarEstadisticas() {
  const completadas = tareas.filter(t => t.completada).length;
  tareasCompletadasUI.textContent = completadas;
}


/* ============================
   INICIALIZACIÓN
============================ */
renderTareas();





/* ==========================================
   ⏱️ TEMPORIZADOR POMODORO
========================================== */

// Elementos del DOM
const tiempoRestanteEl = document.getElementById("tiempo-restante");
const btnIniciar = document.getElementById("btn-iniciar");
const btnPausar = document.getElementById("btn-pausar");
const btnReiniciar = document.getElementById("btn-reiniciar");
const botonesModo = document.querySelectorAll(".modo-temporizador button");
const sesionesHoyEl = document.getElementById("sesiones-hoy");

// Valores del temporizador
let tiempoTrabajo = 25 * 60;
let tiempoDescanso = 5 * 60;

let tiempoRestante = tiempoTrabajo; // por defecto
let temporizadorActivo = null;
let modoActual = "trabajo"; // trabajo | descanso
let sesionesCompletadas = 0;

// Formatear mm:ss
function formatearTiempo(segundos) {
  let min = Math.floor(segundos / 60);
  let sec = segundos % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

// Actualiza el temporizador en pantalla
function actualizarPantalla() {
  tiempoRestanteEl.textContent = formatearTiempo(tiempoRestante);
}

// Cambiar modo
function cambiarModo(modo) {
  modoActual = modo;

  botonesModo.forEach(btn =>
    btn.classList.toggle("modo-activo", btn.dataset.modo === modo)
  );

  if (modo === "trabajo") {
    tiempoRestante = tiempoTrabajo;
  } else {
    tiempoRestante = tiempoDescanso;
  }

  detenerTemporizador();
  actualizarPantalla();
}

// Iniciar temporizador
function iniciarTemporizador() {
  if (temporizadorActivo) return;

  temporizadorActivo = setInterval(() => {
    tiempoRestante--;

    actualizarPantalla();

    if (tiempoRestante <= 0) {
      clearInterval(temporizadorActivo);
      temporizadorActivo = null;

      // Cambiar de modo automáticamente
      if (modoActual === "trabajo") {
        sesionesCompletadas++;
        sesionesHoyEl.textContent = sesionesCompletadas;
        cambiarModo("descanso");
      } else {
        cambiarModo("trabajo");
      }
    }
  }, 1000);

  btnIniciar.disabled = true;
  btnPausar.disabled = false;
}

// Pausar
function pausarTemporizador() {
  detenerTemporizador();
}

// Detener interval
function detenerTemporizador() {
  if (temporizadorActivo) {
    clearInterval(temporizadorActivo);
    temporizadorActivo = null;
  }
  btnIniciar.disabled = false;
  btnPausar.disabled = true;
}

// Reiniciar
function reiniciarTemporizador() {
  detenerTemporizador();

  tiempoRestante = modoActual === "trabajo" ? tiempoTrabajo : tiempoDescanso;

  actualizarPantalla();
}

// Eventos
btnIniciar.addEventListener("click", iniciarTemporizador);
btnPausar.addEventListener("click", pausarTemporizador);
btnReiniciar.addEventListener("click", reiniciarTemporizador);

botonesModo.forEach(btn => {
  btn.addEventListener("click", () => {
    cambiarModo(btn.dataset.modo);
  });
});

// Estado inicial
actualizarPantalla();
