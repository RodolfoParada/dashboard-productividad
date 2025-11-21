// Task 3: Sistema de Gestión de Estado (9 minutos)
// Implementar la lógica JavaScript para manejar el estado de la aplicación.

// Clase principal para gestionar el estado de la aplicación
class DashboardProductividad {
  constructor() {
    this.tareas = this.cargarTareas();
    this.sesionesCompletadas = parseInt(localStorage.getItem('sesionesCompletadas')) || 0;
    this.tiempoEnfocado = parseInt(localStorage.getItem('tiempoEnfocado')) || 0;
    this.modoOscuro = localStorage.getItem('modoOscuro') === 'true';

    // Estado del temporizador
    this.temporizador = {
      activo: false,
      tiempoRestante: 25 * 60, // 25 minutos en segundos
      modo: 'trabajo', // 'trabajo' o 'descanso'
      intervalo: null
    };

    this.inicializar();
  }

  inicializar() {
    this.configurarEventListeners();
    this.actualizarInterfaz();
    this.aplicarModoOscuro();
  }

  // Gestión de tareas
  agregarTarea(tarea) {
    const nuevaTarea = {
      id: Date.now(),
      titulo: tarea.titulo,
      descripcion: tarea.descripcion || '',
      prioridad: tarea.prioridad || 'media',
      fechaLimite: tarea.fechaLimite || null,
      completada: false,
      fechaCreacion: new Date().toISOString()
    };

    this.tareas.push(nuevaTarea);
    this.guardarTareas();
    this.actualizarInterfaz();
    return nuevaTarea;
  }

  completarTarea(id) {
    const tarea = this.tareas.find(t => t.id === id);
    if (tarea && !tarea.completada) {
      tarea.completada = true;
      tarea.fechaCompletada = new Date().toISOString();
      this.guardarTareas();
      this.actualizarInterfaz();
      return true;
    }
    return false;
  }

  eliminarTarea(id) {
    this.tareas = this.tareas.filter(t => t.id !== id);
    this.guardarTareas();
    this.actualizarInterfaz();
  }

  // Temporizador Pomodoro
  iniciarTemporizador() {
    if (this.temporizador.activo) return;

    this.temporizador.activo = true;
    this.actualizarBotonesTemporizador();

    this.temporizador.intervalo = setInterval(() => {
      this.temporizador.tiempoRestante--;

      if (this.temporizador.tiempoRestante <= 0) {
        this.completarSesion();
      } else {
        this.actualizarDisplayTemporizador();
      }
    }, 1000);
  }

  pausarTemporizador() {
    this.temporizador.activo = false;
    clearInterval(this.temporizador.intervalo);
    this.actualizarBotonesTemporizador();
  }

  cambiarModoTemporizador(modo) {
    this.temporizador.modo = modo;
    this.temporizador.tiempoRestante = modo === 'trabajo' ? 25 * 60 : 5 * 60;
    this.actualizarDisplayTemporizador();
    this.actualizarBotonesModo();

    // Si estaba activo, reiniciar
    if (this.temporizador.activo) {
      this.pausarTemporizador();
    }
  }

  completarSesion() {
    this.pausarTemporizador();

    if (this.temporizador.modo === 'trabajo') {
      this.sesionesCompletadas++;
      this.tiempoEnfocado += 25;
      localStorage.setItem('sesionesCompletadas', this.sesionesCompletadas);
      localStorage.setItem('tiempoEnfocado', this.tiempoEnfocado);

      // Notificación
      this.mostrarNotificacion('¡Sesión de trabajo completada! Toma un descanso de 5 minutos.');

      // Cambiar automáticamente a descanso
      setTimeout(() => {
        this.cambiarModoTemporizador('descanso');
      }, 1000);
    } else {
      this.mostrarNotificacion('¡Descanso terminado! Listo para trabajar.');
      setTimeout(() => {
        this.cambiarModoTemporizador('trabajo');
      }, 1000);
    }

    this.actualizarInterfaz();
  }

  // Modo oscuro
  toggleModoOscuro() {
    this.modoOscuro = !this.modoOscuro;
    localStorage.setItem('modoOscuro', this.modoOscuro);
    this.aplicarModoOscuro();
  }

  // Persistencia
  cargarTareas() {
    const tareasGuardadas = localStorage.getItem('tareas');
    return tareasGuardadas ? JSON.parse(tareasGuardadas) : [];
  }

  guardarTareas() {
    localStorage.setItem('tareas', JSON.stringify(this.tareas));
  }
}

// Funciones de utilidad para el DOM
function crearElementoTarea(tarea) {
  const div = document.createElement('div');
  div.className = `item-tarea ${tarea.completada ? 'completada' : ''}`;
  div.setAttribute('role', 'listitem');

  const prioridadClase = `prioridad-${tarea.prioridad}`;
  const iconoPrioridad = {
    alta: '🔴',
    media: '🟡',
    baja: '🟢'
  };

  div.innerHTML = `
    <div class="contenido-tarea">
      <input type="checkbox" class="checkbox-tarea" ${tarea.completada ? 'checked' : ''}>
      <div class="detalles-tarea">
        <h4 class="titulo-tarea">${tarea.titulo}</h4>
        ${tarea.descripcion ? `<p class="descripcion-tarea">${tarea.descripcion}</p>` : ''}
        <div class="meta-tarea">
          <span class="prioridad ${prioridadClase}">${iconoPrioridad[tarea.prioridad]} ${tarea.prioridad}</span>
          ${tarea.fechaLimite ? `<span class="fecha-limite">📅 ${formatearFecha(tarea.fechaLimite)}</span>` : ''}
        </div>
      </div>
    </div>
    <button class="btn-eliminar" aria-label="Eliminar tarea">🗑️</button>
  `;

  // Event listeners
  const checkbox = div.querySelector('.checkbox-tarea');
  const btnEliminar = div.querySelector('.btn-eliminar');

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      dashboard.completarTarea(tarea.id);
    }
  });

  btnEliminar.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      dashboard.eliminarTarea(tarea.id);
    }
  });

  return div;
}

function formatearFecha(fechaString) {
  const fecha = new Date(fechaString);
  return fecha.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  });
}

function mostrarNotificacion(mensaje) {
  // Crear notificación temporal
  const notificacion = document.createElement('div');
  notificacion.className = 'notificacion';
  notificacion.textContent = mensaje;

  document.body.appendChild(notificacion);

  // Animar entrada
  setTimeout(() => notificacion.classList.add('visible'), 100);

  // Remover después de 3 segundos
  setTimeout(() => {
    notificacion.classList.remove('visible');
    setTimeout(() => notificacion.remove(), 300);
  }, 3000);
}

// Inicializar la aplicación
const dashboard = new DashboardProductividad();