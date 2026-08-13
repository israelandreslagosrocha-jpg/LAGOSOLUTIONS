// LAGOSOLUTIONS STRATEGIC EXPANSION — script.js (V1 COMERCIAL REAL)

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
    // 4. SCROLL SUAVE Y BOTÓN "CÓMO TRABAJAMOS"
    // ==========================================
    const howWeWorkBtn = document.getElementById("how-we-work-btn");
    if (howWeWorkBtn) {
        howWeWorkBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const procesoSection = document.getElementById("proceso");
            if (procesoSection) {
                procesoSection.scrollIntoView({ behavior: "smooth" });
            }
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
            const phoneInput = realForm.querySelector('input[name="phone"]');
            const websiteInput = realForm.querySelector('input[name="website"]');
            const sectorInput = realForm.querySelector('select[name="sector"]');
            const problemInput = realForm.querySelector('textarea[name="problem"]');
            const submitBtn = document.getElementById("submit-form-btn");

            const name = sanitizeInput(nameInput ? nameInput.value : "");
            const company = sanitizeInput(companyInput ? companyInput.value : "");
            const email = sanitizeInput(emailInput ? emailInput.value : "");
            const phone = sanitizeInput(phoneInput ? phoneInput.value : "");
            const website = sanitizeInput(websiteInput ? websiteInput.value : "");
            const sector = sanitizeInput(sectorInput ? sectorInput.value : "");
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
            const messageBody = `*SOLICITUD DE DIAGNÓSTICO - LAGOSOLUTIONS*%0A%0A` +
                `*Nombre:* ${encodeURIComponent(name)}%0A` +
                `*Empresa:* ${encodeURIComponent(company)}%0A` +
                `*Email:* ${encodeURIComponent(email)}%0A` +
                `*Teléfono/WhatsApp:* ${encodeURIComponent(phone)}%0A` +
                `*Sitio Web:* ${encodeURIComponent(website || "No especificado")}%0A` +
                `*Sector:* ${encodeURIComponent(sector)}%0A` +
                `*Meta/Problema:* ${encodeURIComponent(problem)}`;

            // Feedback real
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "PROCESANDO SOLICITUD REAL...";
                submitBtn.style.opacity = "0.75";
            }

            if (feedbackMsg) {
                feedbackMsg.classList.remove("hidden");
                feedbackMsg.classList.add("success");
                feedbackMsg.innerText = "✓ Solicitud preparada. Abriendo canal de atención comercial...";
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
