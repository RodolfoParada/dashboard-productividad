// Task 4: Integración Completa y Mejores Prácticas (8 minutos)
// Completar la implementación con event listeners y funcionalidades finales.



// Extensión de la clase DashboardProductividad con métodos de interfaz
class DashboardProductividad {
  // ... métodos anteriores ...

  configurarEventListeners() {
    // Botón modo oscuro
    document.getElementById('btn-modo-oscuro').addEventListener('click', () => {
      this.toggleModoOscuro();
    });

    // Modal de nueva tarea
    const btnAgregarTarea = document.getElementById('btn-agregar-tarea');
    const modal = document.getElementById('modal-tarea');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnCancelar = document.getElementById('btn-cancelar');
    const formularioTarea = document.querySelector('.formulario-tarea');

    btnAgregarTarea.addEventListener('click', () => {
      modal.classList.add('visible');
    });

    [btnCerrarModal, btnCancelar].forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.remove('visible');
        formularioTarea.reset();
      });
    });

    // Cerrar modal haciendo click fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('visible');
        formularioTarea.reset();
      }
    });

    // Submit formulario tarea
    formularioTarea.addEventListener('submit', (e) => {
      e.preventDefault();

      const titulo = document.getElementById('titulo-tarea').value.trim();
      const descripcion = document.getElementById('descripcion-tarea').value.trim();
      const prioridad = document.getElementById('prioridad-tarea').value;
      const fechaLimite = document.getElementById('fecha-limite').value;

      if (titulo) {
        this.agregarTarea({
          titulo,
          descripcion,
          prioridad,
          fechaLimite: fechaLimite || null
        });

        modal.classList.remove('visible');
        formularioTarea.reset();
      }
    });

    // Filtros de tareas
    document.querySelectorAll('.filtros-tareas button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filtros-tareas button').forEach(b => b.classList.remove('filtro-activo'));
        btn.classList.add('filtro-activo');
        this.filtrarTareas(btn.dataset.filtro);
      });
    });

    // Controles del temporizador
    document.getElementById('btn-iniciar').addEventListener('click', () => {
      this.iniciarTemporizador();
    });

    document.getElementById('btn-pausar').addEventListener('click', () => {
      this.pausarTemporizador();
    });

    document.getElementById('btn-reiniciar').addEventListener('click', () => {
      this.pausarTemporizador();
      this.temporizador.tiempoRestante = this.temporizador.modo === 'trabajo' ? 25 * 60 : 5 * 60;
      this.actualizarDisplayTemporizador();
    });

    // Modos del temporizador
    document.querySelectorAll('[data-modo]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.cambiarModoTemporizador(btn.dataset.modo);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'n':
            e.preventDefault();
            btnAgregarTarea.click();
            break;
          case 'd':
            e.preventDefault();
            this.toggleModoOscuro();
            break;
        }
      }
    });
  }

  actualizarInterfaz() {
    this.actualizarEstadisticas();
    this.actualizarListaTareas();
    this.actualizarTemporizador();
  }

  actualizarEstadisticas() {
    const tareasCompletadas = this.tareas.filter(t => t.completada).length;
    const tiempoFormateado = Math.floor(this.tiempoEnfocado / 60) + 'h ' + (this.tiempoEnfocado % 60) + 'm';

    document.getElementById('tareas-completadas').textContent = tareasCompletadas;
    document.getElementById('tiempo-enfocado').textContent = tiempoFormateado;
    document.getElementById('sesiones-hoy').textContent = this.sesionesCompletadas;
  }

  actualizarListaTareas(filtro = 'todas') {
    const listaTareas = document.getElementById('lista-tareas');
    listaTareas.innerHTML = '';

    let tareasFiltradas = this.tareas;

    switch(filtro) {
      case 'pendientes':
        tareasFiltradas = this.tareas.filter(t => !t.completada);
        break;
      case 'completadas':
        tareasFiltradas = this.tareas.filter(t => t.completada);
        break;
    }

    if (tareasFiltradas.length === 0) {
      listaTareas.innerHTML = '<div class="empty-state"><p>🎯 No hay tareas en esta categoría.</p></div>';
      return;
    }

    tareasFiltradas.forEach(tarea => {
      const elementoTarea = crearElementoTarea(tarea);
      listaTareas.appendChild(elementoTarea);
    });
  }

  filtrarTareas(filtro) {
    this.actualizarListaTareas(filtro);
  }

  actualizarDisplayTemporizador() {
    const minutos = Math.floor(this.temporizador.tiempoRestante / 60);
    const segundos = this.temporizador.tiempoRestante % 60;
    const tiempoFormateado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

    document.getElementById('tiempo-restante').textContent = tiempoFormateado;
  }

  actualizarBotonesTemporizador() {
    const btnIniciar = document.getElementById('btn-iniciar');
    const btnPausar = document.getElementById('btn-pausar');

    btnIniciar.disabled = this.temporizador.activo;
    btnPausar.disabled = !this.temporizador.activo;
  }

  actualizarBotonesModo() {
    document.querySelectorAll('[data-modo]').forEach(btn => {
      btn.classList.toggle('modo-activo', btn.dataset.modo === this.temporizador.modo);
    });
  }

  aplicarModoOscuro() {
    document.body.classList.toggle('modo-oscuro', this.modoOscuro);
    const btn = document.getElementById('btn-modo-oscuro');
    btn.textContent = this.modoOscuro ? '☀️' : '🌙';
    btn.setAttribute('aria-label', this.modoOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  }
}

// Las funciones de utilidad ya están definidas arriba

// Inicialización se mantiene igual
// const dashboard = new DashboardProductividad();