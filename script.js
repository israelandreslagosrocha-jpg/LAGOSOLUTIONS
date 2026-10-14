// LAGOSOLUTIONS STRATEGIC EXPANSION — script.js (V3.1 FINAL COMMERCIAL POLISH)

document.addEventListener("DOMContentLoaded", () => {
    
    const education = document.querySelector('details#comparar-planes');
    const revealComparison = () => { if (education && window.location.hash === '#comparar-planes') education.open = true; };
    revealComparison();
    window.addEventListener('hashchange', revealComparison);

    // ==========================================
    // 1. INPUT NORMALIZATION (encode when constructing contact URLs)
    // ==========================================
    const normalizeInput = (str) => typeof str === 'string' ? str.trim() : '';

    // ==========================================
    // 2. NATIVE MODAL DIALOG MANAGER & STICKY CTA HIDING
    // ==========================================
    const dialog = document.getElementById("diagnostic-modal");
    const triggerButtons = document.querySelectorAll(".trigger-modal");
    const closeButton = document.querySelector(".modal-close-btn");
    const stickyCta = document.getElementById("sticky-mobile-cta");

    if (dialog) {
        triggerButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                closeMobileDrawer();
                dialog.showModal();
                document.body.style.overflow = "hidden";
                if (stickyCta) stickyCta.classList.add("hidden");
            });
        });

        const closeModal = () => {
            dialog.close();
        };

        if (closeButton) {
            closeButton.addEventListener("click", closeModal);
        }

        dialog.addEventListener("close", () => {
            document.body.style.overflow = "";
            checkStickyCtaVisibility();
        });

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
    // 3. INTELLIGENT STICKY MOBILE CTA VISIBILITY
    // ==========================================
    const checkStickyCtaVisibility = () => {
        if (!stickyCta) return;
        const scrollY = window.scrollY || window.pageYOffset;
        const dialogIsOpen = dialog && dialog.hasAttribute("open");

        if (scrollY < 250 || dialogIsOpen) {
            stickyCta.classList.add("hidden");
        } else {
            stickyCta.classList.remove("hidden");
        }
    };

    window.addEventListener("scroll", checkStickyCtaVisibility, { passive: true });
    checkStickyCtaVisibility();

    // ==========================================
    // 4. MENÚ HAMBURGUESA RESPONSIVE MÓVIL
    // ==========================================
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileDrawer = document.getElementById("mobile-menu-drawer");
    const mobileDrawerClose = document.getElementById("mobile-drawer-close");
    const mobileLinks = document.querySelectorAll(".mobile-link");

    const openMobileDrawer = () => {
        if (mobileDrawer) {
            mobileDrawer.inert = false;
            mobileDrawer.classList.add("active");
            mobileDrawer.setAttribute("aria-hidden", "false");
            if (mobileMenuBtn) mobileMenuBtn.setAttribute("aria-expanded", "true");
            document.body.style.overflow = "hidden";
            document.querySelector("main").inert = true;
            document.querySelector(".navbar").inert = true;
            document.querySelector("footer").inert = true;
            if (stickyCta) stickyCta.inert = true;
            mobileDrawerClose?.focus();
        }
    };

    const closeMobileDrawer = () => {
        if (mobileDrawer && mobileDrawer.classList.contains("active")) {
            mobileDrawer.classList.remove("active");
            mobileDrawer.inert = true;
            document.querySelector("main").inert = false;
            document.querySelector(".navbar").inert = false;
            document.querySelector("footer").inert = false;
            if (stickyCta) stickyCta.inert = false;
            mobileDrawer.setAttribute("aria-hidden", "true");
            if (mobileMenuBtn) mobileMenuBtn.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
            mobileMenuBtn?.focus();
        }
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", openMobileDrawer);
    }

    if (mobileDrawerClose) {
        mobileDrawerClose.addEventListener("click", closeMobileDrawer);
    }

    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            closeMobileDrawer();
        });
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === 'Tab' && mobileDrawer?.classList.contains('active')) {
            const targets = [...mobileDrawer.querySelectorAll('button, a[href]')];
            const first = targets[0], last = targets[targets.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
        if (e.key === "Escape") {
            closeMobileDrawer();
        }
    });

    // ==========================================
    // 5. ACCORDEÓN 10 ETAPAS (PROFUNDIDAD METODOLÓGICA)
    // ==========================================
    const toggle10StepsBtn = document.getElementById("toggle-10-steps-btn");
    const tenStepsContainer = document.getElementById("ten-steps-container");

    if (toggle10StepsBtn && tenStepsContainer) {
        toggle10StepsBtn.addEventListener("click", () => {
            tenStepsContainer.classList.toggle("hidden-steps");
            const isHidden = tenStepsContainer.classList.contains("hidden-steps");
            toggle10StepsBtn.setAttribute("aria-expanded", String(!isHidden));
            toggle10StepsBtn.textContent = isHidden ? 
                "Ver / Ocultar el Proceso Completo de 10 Etapas" : 
                "Ocultar el Proceso de 10 Etapas";
        });
    }

    // ==========================================
    // 6. CONMUTADOR INTERACTIVO DE PROYECTOS REALES CON ATRIBUTOS ARIA
    // ==========================================
    const caseTabs = document.querySelectorAll(".case-tab");
    if (caseTabs.length > 0) {
        caseTabs.forEach(tab => {
            tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
            tab.addEventListener('keydown', (e) => {
                const siblings = [...tab.parentElement.querySelectorAll('.case-tab')];
                const index = siblings.indexOf(tab);
                let next;
                if (e.key === 'ArrowRight') next = siblings[(index + 1) % siblings.length];
                if (e.key === 'ArrowLeft') next = siblings[(index - 1 + siblings.length) % siblings.length];
                if (e.key === 'Home') next = siblings[0];
                if (e.key === 'End') next = siblings[siblings.length - 1];
                if (next) { e.preventDefault(); next.click(); next.focus(); }
            });
            tab.addEventListener("click", () => {
                const cardId = tab.getAttribute("data-card");
                const state = tab.getAttribute("data-state");

                const siblingTabs = document.querySelectorAll(`.case-tab[data-card="${cardId}"]`);
                siblingTabs.forEach(t => {
                    t.classList.remove("active");
                    t.setAttribute("aria-selected", "false");
                    t.tabIndex = -1;
                });
                tab.classList.add("active");
                tab.setAttribute("aria-selected", "true");
                tab.tabIndex = 0;

                const cardElement = document.getElementById(`card-${cardId}`);
                if (cardElement) {
                    const panels = cardElement.querySelectorAll(".case-state-panel");
                    panels.forEach(p => p.classList.remove("active"));
                    const targetPanel = document.getElementById(`${cardId}-${state}`);
                    if (targetPanel) {
                        targetPanel.classList.add("active");
                    }
                }
            });
        });
    }

    // ==========================================
    // 7. MAPA DE OPORTUNIDADES INTERACTIVO
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

                nodeButtons.forEach(b => {
                    b.classList.remove("active");
                    b.setAttribute("aria-pressed", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-pressed", "true");

                if (nodeTitle) nodeTitle.textContent = data.title;
                if (nodeInvestigamos) nodeInvestigamos.textContent = data.investigamos;
                if (nodeEvidencia) nodeEvidencia.textContent = data.evidencia;
                if (nodeHallazgo) nodeHallazgo.textContent = data.hallazgo;

                // Sincronización Bidireccional: HTML -> Sonda Canvas
                if (window.LagosHeroSystem && typeof window.LagosHeroSystem.focusNode === 'function') {
                    window.LagosHeroSystem.focusNode(key);
                }
            });
        });

        // Sincronización Bidireccional: Canvas -> Display HTML
        window.addEventListener('lagos:node-focus', (e) => {
            const focusedKey = e.detail?.key;
            if (!focusedKey) return;

            const targetBtn = document.querySelector(`.node-btn[data-node="${focusedKey}"]`);
            if (targetBtn && !targetBtn.classList.contains('active')) {
                const data = nodeData[focusedKey];
                if (!data) return;

                nodeButtons.forEach(b => {
                    b.classList.remove("active");
                    b.setAttribute("aria-pressed", "false");
                });
                targetBtn.classList.add("active");
                targetBtn.setAttribute("aria-pressed", "true");

                if (nodeTitle) nodeTitle.textContent = data.title;
                if (nodeInvestigamos) nodeInvestigamos.textContent = data.investigamos;
                if (nodeEvidencia) nodeEvidencia.textContent = data.evidencia;
                if (nodeHallazgo) nodeHallazgo.textContent = data.hallazgo;
            }
        });
    }

    // ==========================================
    // 8. ANIMACIONES REVEAL AL HACER SCROLL
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
    // 9. ENVÍO REAL DE FORMULARIO DE DIAGNÓSTICO
    // ==========================================
    const realForm = document.getElementById("real-diagnostic-form");
    const feedbackMsg = document.getElementById("form-feedback-msg");

    if (realForm) {
        realForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nameInput = realForm.querySelector('input[name="name"]');
            const companyInput = realForm.querySelector('input[name="company"]');
            const websiteInput = realForm.querySelector('input[name="website"]');
            const emailInput = realForm.querySelector('input[name="email"]');
            const channelInput = realForm.querySelector('select[name="channel"]');
            const goalInput = realForm.querySelector('select[name="goal"]');
            const problemInput = realForm.querySelector('textarea[name="problem"]');
            const submitBtn = document.getElementById("submit-form-btn");

            const name = normalizeInput(nameInput ? nameInput.value : "");
            const company = normalizeInput(companyInput ? companyInput.value : "") || "No informada";
            const website = normalizeInput(websiteInput ? websiteInput.value : "");
            const email = normalizeInput(emailInput ? emailInput.value : "");
            const planInput = document.getElementById("modal-plan");
            const plan = normalizeInput(planInput ? planInput.value : "Sin definir / Necesito evaluación previa");
            const channel = normalizeInput(channelInput ? channelInput.value : "WhatsApp");
            const goal = normalizeInput(goalInput ? goalInput.value : "⭐ No estoy seguro. Quiero entender primero qué necesita mi empresa");
            const problem = normalizeInput(problemInput ? problemInput.value : "");

            // Captura de UTMs y fuente de la URL
            const urlParams = new URLSearchParams(window.location.search);
            const leadPayload = {
                name,
                company,
                website,
                email,
                plan,
                channel,
                goal,
                problem,
                source: urlParams.get('source') || 'UNKNOWN',
                utm_source: urlParams.get('utm_source') || '',
                utm_medium: urlParams.get('utm_medium') || '',
                utm_campaign: urlParams.get('utm_campaign') || ''
            };

            const message = `CONSULTA DE PROYECTO — LAGOSOLUTIONS\n\nNombre: ${name}\nEmpresa: ${company}\nContacto: ${email}\nPlan: ${plan}\nCanal: ${channel}\nSitio web: ${website || 'No especificado'}\nObjetivo: ${goal}\nContexto: ${problem}`;
            const contactUrl = channel === 'Email'
                ? `mailto:info@lagosolutions.cl?subject=${encodeURIComponent('Consulta de proyecto — LAGOSOLUTIONS')}&body=${encodeURIComponent(message)}`
                : `https://wa.me/56961996576?text=${encodeURIComponent(message)}`;

            const showFeedback = (text, kind, linkText) => {
                if (!feedbackMsg) return;
                feedbackMsg.className = `form-feedback-msg ${kind}`;
                feedbackMsg.replaceChildren(document.createTextNode(text));
                const link = document.createElement('a');
                link.href = contactUrl;
                link.textContent = linkText;
                if (channel === 'WhatsApp') {
                    link.target = '_blank';
                    link.rel = 'noopener';
                }
                feedbackMsg.append(document.createElement('br'), link);
            };

            const measurementChannel = channel === 'Email' ? 'email' : 'whatsapp';
            if (!window.LAGOSOLUTIONS_API_URL) {
                window.LagoAnalytics?.track('inquiry_prepared', {channel: measurementChannel});
                showFeedback('Mensaje preparado. Aún no se ha enviado: abre tu canal y confirma el envío. Tus datos permanecen aquí.', 'success', channel === 'Email' ? 'Abrir correo a info@lagosolutions.cl' : 'Abrir WhatsApp y enviar');
                feedbackMsg?.scrollIntoView({ block: 'nearest' });
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'ENVIANDO SOLICITUD…';
            }
            try {
                const response = await fetch(window.LAGOSOLUTIONS_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(leadPayload),
                    signal: AbortSignal.timeout(15000)
                });
                const result = await response.json();
                if (!response.ok || result.success !== true || !result.lead_id) {
                    throw new Error('No se confirmó el registro');
                }
                window.LagoAnalytics?.track('generate_lead', {channel: measurementChannel});
                showFeedback('Solicitud recibida y registrada. Puedes continuar la conversación por tu canal preferido.', 'success', channel === 'Email' ? 'Continuar por correo' : 'Continuar por WhatsApp');
            } catch {
                window.LagoAnalytics?.track('inquiry_error', {channel: measurementChannel});
                showFeedback('No pudimos confirmar la recepción. Conservamos tus datos para reintentar; también puedes enviarnos el mensaje directamente.', 'error', channel === 'Email' ? 'Enviar por correo' : 'Enviar por WhatsApp');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'PREPARAR MI CONSULTA';
                }
            }

        });
    }

    // ==========================================
    // 13. PLAN SPEC SHEET DOWNLOAD HANDLER (High-Resolution Cloudinary Assets)
    // ==========================================
    const downloadButtons = document.querySelectorAll(".btn-plan-download");
    downloadButtons.forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const url = btn.getAttribute("href");
            const planName = btn.getAttribute("data-plan-name") || "FICHA-TECNICA";
            const fileName = `LAGOSOLUTIONS-${planName}.png`;

            try {
                e.preventDefault();
                const originalContent = btn.innerHTML;
                btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Descargando...`;
                btn.style.opacity = "0.75";
                btn.style.pointerEvents = "none";

                const response = await fetch(url);
                if (!response.ok) throw new Error("Fetch failed");
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const tempLink = document.createElement("a");
                tempLink.style.display = "none";
                tempLink.href = blobUrl;
                tempLink.download = fileName;
                document.body.appendChild(tempLink);
                tempLink.click();
                window.URL.revokeObjectURL(blobUrl);
                document.body.removeChild(tempLink);

                btn.innerHTML = originalContent;
                btn.style.opacity = "1";
                btn.style.pointerEvents = "auto";
            } catch (err) {
                // Fallback directo en caso de restricción CORS en navegador estricto
                window.open(url, "_blank");
                btn.style.opacity = "1";
                btn.style.pointerEvents = "auto";
            }
        });
    });
});
