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