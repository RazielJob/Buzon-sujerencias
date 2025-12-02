document.addEventListener("DOMContentLoaded", function () {
  // Theme toggle functionality
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;
  const icon = themeToggle.querySelector("i");

  // Check for saved theme preference or prefer-color-scheme
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Apply theme based on saved preference or system preference
  function applyTheme(theme) {
    if (theme === "dark" || (!savedTheme && prefersDark)) {
      body.classList.remove("light-theme");
      body.classList.add("dark-theme");
      icon.classList.replace("fa-moon", "fa-sun");
      document
        .querySelector('meta[name="theme-color"]')
        .setAttribute("content", "#0f1419");
    } else {
      body.classList.remove("dark-theme");
      body.classList.add("light-theme");
      icon.classList.replace("fa-sun", "fa-moon");
      document
        .querySelector('meta[name="theme-color"]')
        .setAttribute("content", "#0070f3");
    }
  }

  // Initialize theme
  applyTheme(savedTheme);

  // Toggle theme when button is clicked
  themeToggle.addEventListener("click", function () {
    const isDark = body.classList.contains("dark-theme");

    if (isDark) {
      // Switch to light theme
      body.classList.remove("dark-theme");
      body.classList.add("light-theme");
      icon.classList.replace("fa-sun", "fa-moon");
      localStorage.setItem("theme", "light");
      document
        .querySelector('meta[name="theme-color"]')
        .setAttribute("content", "#0070f3");
    } else {
      // Switch to dark theme
      body.classList.remove("light-theme");
      body.classList.add("dark-theme");
      icon.classList.replace("fa-moon", "fa-sun");
      localStorage.setItem("theme", "dark");
      document
        .querySelector('meta[name="theme-color"]')
        .setAttribute("content", "#0f1419");
    }
  });

  // Mobile navigation toggle
  const menuToggle = document.getElementById("menuToggle");
  const closeMenu = document.getElementById("closeMenu");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuToggle && closeMenu && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      mobileMenu.classList.remove("translate-x-full");
      document.body.classList.add("overflow-hidden");
    });

    closeMenu.addEventListener("click", function () {
      mobileMenu.classList.add("translate-x-full");
      document.body.classList.remove("overflow-hidden");
    });

    // Close mobile menu when clicking on a link
    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach((link) => {
      link.addEventListener("click", function () {
        mobileMenu.classList.add("translate-x-full");
        document.body.classList.remove("overflow-hidden");
      });
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const headerHeight = document.querySelector("header").offsetHeight;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Suggestion form handling
  const sugerenciaForm = document.getElementById("sugerenciaForm");
  const listaSugerencias = document.getElementById("lista-sugerencias");
  const cargarMasBtn = document.getElementById("cargarMas");

  // Sample data for demonstration
  let sugerencias = JSON.parse(localStorage.getItem("sugerencias")) || [];
  let currentPage = 1;
  const suggestionsPerPage = 6;

  // Initialize the application
  function init() {
    updateStatistics();
    renderSugerencias();
    setupEventListeners();
  }

  // Setup event listeners
  function setupEventListeners() {
    // Form submission
    if (sugerenciaForm) {
      sugerenciaForm.addEventListener("submit", handleFormSubmit);
    }

    // Load more button
    if (cargarMasBtn) {
      cargarMasBtn.addEventListener("click", loadMoreSuggestions);
    }

    // Real-time character counter for suggestion textarea
    const sugerenciaTextarea = document.getElementById("sugerencia");
    if (sugerenciaTextarea) {
      sugerenciaTextarea.addEventListener("input", updateCharacterCount);
    }
  }

  // Handle form submission
  function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(sugerenciaForm);
    const anonimo = document.getElementById("anonimo").checked;

    const nuevaSugerencia = {
      id: Date.now(),
      nombre: anonimo ? "Anónimo" : formData.get("nombre") || "Anónimo",
      email: anonimo ? "" : formData.get("email") || "",
      categoria: formData.get("categoria"),
      sugerencia: formData.get("sugerencia"),
      fecha: new Date().toISOString(),
      status: "pendiente",
      votos: 0,
    };

    // Add to suggestions array
    sugerencias.unshift(nuevaSugerencia);

    // Save to localStorage
    localStorage.setItem("sugerencias", JSON.stringify(sugerencias));

    // Update UI
    updateStatistics();
    renderSugerencias();

    // Show success message
    showAlert(
      "¡Sugerencia enviada con éxito! Gracias por tu contribución.",
      "success"
    );

    // Reset form
    sugerenciaForm.reset();
  }

  // Render suggestions
  function renderSugerencias() {
    if (!listaSugerencias) return;

    const startIndex = 0;
    const endIndex = currentPage * suggestionsPerPage;
    const suggestionsToShow = sugerencias.slice(startIndex, endIndex);

    if (suggestionsToShow.length === 0) {
      listaSugerencias.innerHTML = `
                <div class="col-span-full empty-state">
                    <i class="fa-solid fa-inbox empty-state-icon text-4xl"></i>
                    <p class="empty-state-text">No hay sugerencias aún. ¡Sé el primero en compartir una idea!</p>
                </div>
            `;
      cargarMasBtn.style.display = "none";
      return;
    }

    listaSugerencias.innerHTML = suggestionsToShow
      .map(
        (sugerencia) => `
            <div class="suggestion-card animate-fade-in-up">
                <div class="suggestion-header">
                    <span class="suggestion-category ${sugerencia.categoria}">
                        ${getCategoryLabel(sugerencia.categoria)}
                    </span>
                    <span class="suggestion-status status-${sugerencia.status}">
                        ${getStatusLabel(sugerencia.status)}
                    </span>
                </div>
                <div class="suggestion-content">
                    <p class="suggestion-text">${sugerencia.sugerencia}</p>
                </div>
                <div class="suggestion-footer">
                    <span class="suggestion-author">${sugerencia.nombre}</span>
                    <span class="suggestion-date">${formatDate(
                      sugerencia.fecha
                    )}</span>
                </div>
            </div>
        `
      )
      .join("");

    // Show/hide load more button
    cargarMasBtn.style.display =
      endIndex < sugerencias.length ? "block" : "none";
  }

  // Load more suggestions
  function loadMoreSuggestions() {
    currentPage++;
    renderSugerencias();
  }

  // Update statistics
  function updateStatistics() {
    const totalSugerencias = document.getElementById("total-sugerencias");
    const sugerenciasImplementadas = document.getElementById(
      "sugerencias-implementadas"
    );
    const sugerenciasRevision = document.getElementById("sugerencias-revision");
    const participantes = document.getElementById("participantes");

    if (totalSugerencias) {
      totalSugerencias.textContent = sugerencias.length;
    }

    if (sugerenciasImplementadas) {
      const implementadas = sugerencias.filter(
        (s) => s.status === "implementado"
      ).length;
      sugerenciasImplementadas.textContent = implementadas;
    }

    if (sugerenciasRevision) {
      const enRevision = sugerencias.filter(
        (s) => s.status === "revision"
      ).length;
      sugerenciasRevision.textContent = enRevision;
    }

    if (participantes) {
      const participantesUnicos = new Set(
        sugerencias.map((s) => s.email || s.nombre)
      ).size;
      participantes.textContent = participantesUnicos;
    }
  }

  // Utility functions
  function getCategoryLabel(categoria) {
    const categories = {
      mejora: "Mejora",
      "nueva-funcionalidad": "Nueva Funcionalidad",
      "experiencia-usuario": "Experiencia Usuario",
      contenido: "Contenido",
      tecnico: "Técnico",
      otro: "Otro",
    };
    return categories[categoria] || "Otro";
  }

  function getStatusLabel(status) {
    const statuses = {
      pendiente: "Pendiente",
      revision: "En Revisión",
      implementado: "Implementado",
      descartado: "Descartado",
    };
    return statuses[status] || "Pendiente";
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function updateCharacterCount() {
    const textarea = document.getElementById("sugerencia");
    const counter =
      document.getElementById("char-counter") || createCharacterCounter();
    const count = textarea.value.length;

    counter.textContent = `${count} caracteres`;

    if (count > 500) {
      counter.classList.add("text-red-500");
    } else {
      counter.classList.remove("text-red-500");
    }
  }

  function createCharacterCounter() {
    const counter = document.createElement("div");
    counter.id = "char-counter";
    counter.className = "text-sm text-gray-500 text-right mt-1";
    document.getElementById("sugerencia").parentNode.appendChild(counter);
    return counter;
  }

  function showAlert(message, type = "info") {
    // Remove existing alerts
    const existingAlert = document.querySelector(".alert");
    if (existingAlert) {
      existingAlert.remove();
    }

    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button class="text-gray-500 hover:text-gray-700" onclick="this.parentElement.parentElement.remove()">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        `;

    // Insert after the form title or at the top of the form
    const form = document.getElementById("sugerenciaForm");
    if (form) {
      form.insertBefore(alert, form.firstChild);
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 5000);
  }

  // Add scroll events for header shadow and reveal animations
  const header = document.querySelector("header");
  const sections = document.querySelectorAll("section");

  function checkScroll() {
    // Header shadow
    if (window.scrollY > 0) {
      header.classList.add("shadow-md");
    } else {
      header.classList.remove("shadow-md");
    }

    // Reveal animations for sections
    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (sectionTop < windowHeight * 0.85) {
        section.classList.add("opacity-100", "translate-y-0");
        section.classList.remove("opacity-0", "translate-y-4");
      }
    });
  }

  window.addEventListener("scroll", checkScroll);

  // Initialize the application
  init();
  checkScroll();
});
