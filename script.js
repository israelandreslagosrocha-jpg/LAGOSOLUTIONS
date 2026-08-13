// LAGOSOLUTIONS STRATEGIC EXPANSION — script.js (V2 PREMIUM REFINEMENT)

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. INPUT SANITIZATION UTILITY (XSS Prevention)
    // ==========================================
    const sanitizeInput = (str) => {
        if (typeof str !== 'string') return '';
        return str.trim()
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#x27;")
                  .replace(/\//g, "&#x2F;");
    };

    // ==========================================
    // 2. NATIVE MODAL DIALOG MANAGER
    // ==========================================
    const dialog = document.getElementById("diagnostic-modal");
    const triggerButtons = document.querySelectorAll(".trigger-modal");
    const closeButton = document.querySelector(".modal-close-btn");

    if (dialog) {
        // Open Modal
        triggerButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                // Close mobile drawer if open
                closeMobileDrawer();
                dialog.showModal();
                document.body.style.overflow = "hidden"; // Prevent background scroll
            });
        });

        // Close Modal via button
        const closeModal = () => {
            dialog.close();
        };

        if (closeButton) {
            closeButton.addEventListener("click", closeModal);
        }

        // Restore body scroll when dialog closes
        dialog.addEventListener("close", () => {
            document.body.style.overflow = "";
        });

        // Fallback for backdrop click closure
        dialog.addEventListener("click", (event) => {
            if (event.target !== dialog) return;
            const rect = dialog.getBoundingClientRect();
            const isDialogContent = (
                rect.top <= event.clientY &&
                event.clientY <= rect.top + rect.height &&
                rect.left <= event.clientX &&
                event.clientX <= rect.left + rect.width
            );
            if (!isDialogContent) {
                closeModal();
            }
        });
    }

    // ==========================================
    // 3. MENÚ HAMBURGUESA RESPONSIVE MÓVIL
    // ==========================================
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileDrawer = document.getElementById("mobile-menu-drawer");
    const mobileDrawerClose = document.getElementById("mobile-drawer-close");
    const mobileLinks = document.querySelectorAll(".mobile-link");

    const openMobileDrawer = () => {
        if (mobileDrawer) {
            mobileDrawer.classList.add("active");
            mobileDrawer.setAttribute("aria-hidden", "false");
            if (mobileMenuBtn) mobileMenuBtn.setAttribute("aria-expanded", "true");
            document.body.style.overflow = "hidden";
        }
    };

    const closeMobileDrawer = () => {
        if (mobileDrawer && mobileDrawer.classList.contains("active")) {
            mobileDrawer.classList.remove("active");
            mobileDrawer.setAttribute("aria-hidden", "true");
            if (mobileMenuBtn) mobileMenuBtn.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
        }
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", openMobileDrawer);
    }

    if (mobileDrawerClose) {
        mobileDrawerClose.addEventListener("click", closeMobileDrawer);
    }

    // Close drawer when clicking any nav link
    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            closeMobileDrawer();
        });
    });

    // Escape key listener for mobile drawer
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeMobileDrawer();
        }
    });

    // ==========================================
    // 4. MAPA DE OPORTUNIDADES INTERACTIVO
    // ==========================================
    const nodeData = {
        clientes: {
            title: "CLIENTES",
            investigamos: "Perfil del comprador real, frecuencia de compra, motivo de elección y clientes inactivos.",
            evidencia: "Historial de facturación, registros de pedidos, encuestas o conversaciones comerciales directas.",
            hallazgo: "Podría aparecer que un segmento reducido de clientes genera la mayor parte del margen, o que existen clientes antiguos que dejaron de comprar por falta de contacto."
        },
        captacion: {
            title: "CAPTACIÓN",
            investigamos: "Origen de clientes calificados, canales activos, volúmenes de búsqueda y conducta post-contacto.",
            evidencia: "Google Analytics, Search Console, registros publicitarios, fuentes de recomendación.",
            hallazgo: "Podría aparecer demanda calificada en el mercado que la empresa actualmente no está capturando o canalizando adecuadamente."
        },
        ventas: {
            title: "VENTAS & CONVERSIÓN",
            investigamos: "Tiempos de cotización, velocidad de primera respuesta, tasa de cierre y frecuencia de seguimiento.",
            evidencia: "Registros de cotizaciones enviadas, correos salientes, WhatsApp Business, agendas comerciales.",
            hallazgo: "Podría aparecer que cotizaciones de alto margen se pierden únicamente por demoras de respuesta o falta de recordatorios estandarizados."
        },
        operacion: {
            title: "OPERACIÓN & ENTREGA",
            investigamos: "Flujo de trabajo posterior a la venta, cuellos de botella manuales, capacidad del equipo y tiempos de servicio.",
            evidencia: "Tiempos de entrega de proyectos/servicios, tareas repetitivas del personal, reportes de soporte.",
            hallazgo: "Podría aparecer que tareas administrativas repetitivas consumen horas que el equipo técnico podría dedicar a entregar más valor."
        },
        datos: {
            title: "DATOS & ANÁLISIS",
            investigamos: "Métricas que se registran históricamente vs métricas que efectivamente se utilizan para tomar decisiones de inversión.",
            evidencia: "Archivos Excel, sistemas de facturación, bases de contactos, reportes mensuales.",
            hallazgo: "Podría aparecer información valiosa sobre estacionalidad o rotación de servicios ignorada por estar dispersa en planillas."
        },
        tecnologia: {
            title: "TECNOLOGÍA & SISTEMAS",
            investigamos: "Utilidad real del software actual, nivel de integración entre herramientas, costos y propiedad de los activos digitales.",
            evidencia: "Sitio web actual, licencias de software, herramientas de comunicación interna y formularios.",
            hallazgo: "Podría aparecer que la tecnología actual aísla información o fuerza a re-tipiar datos en lugar de conectar procesos."
        }
    };

    const nodeButtons = document.querySelectorAll(".node-btn");
    const nodeTitle = document.getElementById("node-title");
    const nodeInvestigamos = document.getElementById("node-investigamos");
    const nodeEvidencia = document.getElementById("node-evidencia");
    const nodeHallazgo = document.getElementById("node-hallazgo");

    if (nodeButtons.length > 0) {
        nodeButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const key = btn.getAttribute("data-node");
                const data = nodeData[key];
                if (!data) return;

                // Update active state
                nodeButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                // Update content with smooth transition
                if (nodeTitle) nodeTitle.textContent = data.title;
                if (nodeInvestigamos) nodeInvestigamos.textContent = data.investigamos;
                if (nodeEvidencia) nodeEvidencia.textContent = data.evidencia;
                if (nodeHallazgo) nodeHallazgo.textContent = data.hallazgo;
            });
        });
    }

    // ==========================================
    // 5. ANIMACIONES REVEAL AL HACER SCROLL
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }

    // ==========================================
    // 6. ENVIÓ REAL DE FORMULARIO DE DIAGNÓSTICO
    // ==========================================
    const realForm = document.getElementById("real-diagnostic-form");
    const feedbackMsg = document.getElementById("form-feedback-msg");

    if (realForm) {
        realForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Inputs extraction & sanitization
            const nameInput = realForm.querySelector('input[name="name"]');
            const companyInput = realForm.querySelector('input[name="company"]');
            const emailInput = realForm.querySelector('input[name="email"]');
            const websiteInput = realForm.querySelector('input[name="website"]');
            const goalInput = realForm.querySelector('select[name="goal"]');
            const problemInput = realForm.querySelector('textarea[name="problem"]');
            const submitBtn = document.getElementById("submit-form-btn");

            const name = sanitizeInput(nameInput ? nameInput.value : "");
            const company = sanitizeInput(companyInput ? companyInput.value : "");
            const email = sanitizeInput(emailInput ? emailInput.value : "");
            const website = sanitizeInput(websiteInput ? websiteInput.value : "");
            const goal = sanitizeInput(goalInput ? goalInput.value : "NO LO SÉ TODAVÍA");
            const problem = sanitizeInput(problemInput ? problemInput.value : "");

            // Validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                if (emailInput) {
                    emailInput.style.borderColor = "#ef4444";
                    setTimeout(() => emailInput.style.borderColor = "", 1500);
                }
                return;
            }

            // Real action: Format a structured lead message for direct commercial routing
            const messageBody = `*SOLICITUD DE DIAGNÓSTICO V2 - LAGOSOLUTIONS*%0A%0A` +
                `*Nombre:* ${encodeURIComponent(name)}%0A` +
                `*Empresa:* ${encodeURIComponent(company)}%0A` +
                `*Email:* ${encodeURIComponent(email)}%0A` +
                `*Sitio Web:* ${encodeURIComponent(website || "No especificado")}%0A` +
                `*Prioridad a mejorar:* ${encodeURIComponent(goal)}%0A` +
                `*Contexto de empresa:* ${encodeURIComponent(problem)}`;

            // Feedback real
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "ABRIENDO ATENCIÓN COMERCIAL...";
                submitBtn.style.opacity = "0.75";
            }

            if (feedbackMsg) {
                feedbackMsg.classList.remove("hidden");
                feedbackMsg.classList.add("success");
                feedbackMsg.innerText = "✓ Solicitud preparada. Redirigiendo a WhatsApp Business...";
            }

            // Redirecting to WhatsApp / direct commercial channel
            setTimeout(() => {
                const whatsappNumber = "56990021689"; // Canal oficial de atención
                const waUrl = `https://wa.me/${whatsappNumber}?text=${messageBody}`;

                // Open WhatsApp channel
                window.open(waUrl, "_blank");

                // Reset form
                realForm.reset();
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "ENVIAR SOLICITUD DE EVALUACIÓN";
                    submitBtn.style.opacity = "1";
                }

                setTimeout(() => {
                    if (feedbackMsg) feedbackMsg.classList.add("hidden");
                    if (dialog && dialog.open) {
                        dialog.close();
                    }
                }, 1500);
            }, 800);
        });
    }
});
