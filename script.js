// B2B Command Center Interactions - script.js

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 0. CYBERSECURITY: INPUT SANITIZATION UTILITY
    // ==========================================
    // Prevents Cross-Site Scripting (XSS) reflection or injection attacks on B2B forms
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
    // 1. INTERACTIVE RADAR GRID CANVAS BACKGROUND
    // ==========================================
    const canvas = document.getElementById("radar-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        const gridSpacing = 40;
        let mouse = { x: null, y: null };
        let resizeTimeout;

        // Optimized Resize Handler (Debounced to prevent performance drops)
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const onResize = () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 100);
        };

        // Track Mouse
        window.addEventListener("mousemove", (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // Clear coordinates when mouse leaves window
        document.addEventListener("mouseleave", () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Animation Loop
        const drawGrid = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw fine grid lines
            ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
            ctx.lineWidth = 1;

            // Vertical lines
            for (let x = 0; x < canvas.width; x += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            // Horizontal lines
            for (let y = 0; y < canvas.height; y += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Mouse coordinate crosshair tracking
            if (mouse.x !== null && mouse.y !== null) {
                ctx.strokeStyle = "rgba(16, 185, 129, 0.035)";
                ctx.beginPath();
                ctx.moveTo(mouse.x, 0);
                ctx.lineTo(mouse.x, canvas.height);
                ctx.moveTo(0, mouse.y);
                ctx.lineTo(canvas.width, mouse.y);
                ctx.stroke();

                // Draw coordinates text in monospace style
                ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
                ctx.font = "9px 'JetBrains Mono', monospace";
                
                // Sanitize coordinates just in case
                const labelX = Math.round(mouse.x);
                const labelY = Math.round(mouse.y);
                ctx.fillText(`[LOC: ${labelX}px, ${labelY}px]`, mouse.x + 10, mouse.y - 10);
            }

            requestAnimationFrame(drawGrid);
        };

        window.addEventListener("resize", onResize);
        resizeCanvas();
        drawGrid();
    }

    // ==========================================
    // 2. RADAR SWEEP TARGET BEACON DETECTION
    // ==========================================
    const targetNodes = document.querySelectorAll(".radar-target-node");
    const radarScope = document.querySelector(".radar-scope-wrapper");
    
    if (radarScope && targetNodes.length > 0) {
        let currentSweepAngle = 0;

        // Calculate polar coordinates of each target node relative to center (50%, 50%)
        const targets = Array.from(targetNodes).map(node => {
            const leftPct = parseFloat(node.style.left);
            const topPct = parseFloat(node.style.top);
            
            const dx = leftPct - 50;
            const dy = topPct - 50;
            
            let angle = Math.atan2(dy, dx) * 180 / Math.PI;
            angle = (angle + 90 + 360) % 360; // Offset +90 to align with CSS conic-gradient sweep

            return {
                element: node,
                angle: angle,
                activated: false
            };
        });

        // Check radar sweep intersections
        const checkRadarScan = () => {
            const ms = new Date().getTime();
            currentSweepAngle = ((ms % 6000) / 6000) * 360; // 6s cycle

            targets.forEach(target => {
                const diff = (currentSweepAngle - target.angle + 360) % 360;
                
                // Active trigger window (15 degrees)
                if (diff < 15) {
                    if (!target.activated) {
                        target.element.classList.add("swept-active");
                        target.activated = true;
                        
                        const ping = target.element.querySelector(".target-ping");
                        if (ping) {
                            ping.style.transform = "scale(1.5)";
                            setTimeout(() => {
                                ping.style.transform = "scale(1)";
                            }, 400);
                        }
                    }
                } else {
                    target.element.classList.remove("swept-active");
                    target.activated = false;
                }
            });

            requestAnimationFrame(checkRadarScan);
        };

        checkRadarScan();
    }

    // ==========================================
    // 3. STATISTICAL COUNTER ANIMATIONS
    // ==========================================
    const counterElements = document.querySelectorAll(".metric-value, .c-stat-val, .badge-percentage");
    
    const countUp = (el) => {
        const text = el.innerText;
        const targetNumber = parseInt(text.replace(/[^0-9]/g, ''), 10);
        if (isNaN(targetNumber)) return;

        const isPercentage = text.includes("%");
        const hasPlus = text.includes("+");
        const duration = 2000;
        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            const currentValue = Math.floor(easedProgress * targetNumber);

            let formatted = "";
            if (hasPlus) formatted += "+";
            formatted += currentValue;
            if (isPercentage) formatted += "%";
            
            if (text.includes("TOP")) {
                el.innerText = "TOP #1";
                return;
            }

            el.innerText = formatted;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                el.innerText = text;
            }
        };

        requestAnimationFrame(animate);
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    counterElements.forEach(el => {
        counterObserver.observe(el);
    });

    // ==========================================
    // 4. FAQ ACCORDION HANDLER
    // ==========================================
    const faqItems = document.querySelectorAll(".faq-item");
    
    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        if (question && answer) {
            question.addEventListener("click", () => {
                const isActive = item.classList.contains("active");

                // Close other open accordions
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains("active")) {
                        otherItem.classList.remove("active");
                        otherItem.querySelector(".faq-answer").style.maxHeight = "0";
                    }
                });

                // Toggle current item
                if (isActive) {
                    item.classList.remove("active");
                    answer.style.maxHeight = "0";
                } else {
                    item.classList.add("active");
                    answer.style.maxHeight = `${answer.scrollHeight}px`;
                }
            });
        }
    });

    // ==========================================
    // 5. SECTIONS REVEAL ON SCROLL
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // ==========================================
    // 6. DIAGNOSTIC MODAL DIALOG MANAGER
    // ==========================================
    const modalOverlay = document.getElementById("diagnostic-modal");
    const triggerButtons = document.querySelectorAll(".trigger-modal");
    const closeButton = document.querySelector(".modal-close-btn");

    if (modalOverlay) {
        // Open
        triggerButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                modalOverlay.classList.add("active");
                document.body.style.overflow = "hidden";
            });
        });

        // Close
        const closeModal = () => {
            modalOverlay.classList.remove("active");
            document.body.style.overflow = "";
        };

        if (closeButton) {
            closeButton.addEventListener("click", closeModal);
        }

        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
                closeModal();
            }
        });
    }

    // ==========================================
    // 7. B2B MULTI-STAGE DIAGNOSTIC FORM SUBMISSION
    // ==========================================
    const forms = document.querySelectorAll('.leadFormAction');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = form.querySelector('input[type="email"]');
            const submitBtn = form.querySelector('button[type="submit"]');
            
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                emailInput.classList.add('error-shake');
                setTimeout(() => emailInput.classList.remove('error-shake'), 500);
                return;
            }

            // Sanitizing user inputs for cybersecurity
            const nameInput = form.querySelector('input[name="name"]');
            const websiteInput = form.querySelector('input[name="website"]');
            const sectorInput = form.querySelector('select[name="sector"]');

            const sanitizedName = nameInput ? sanitizeInput(nameInput.value) : "";
            const sanitizedEmail = sanitizeInput(emailInput.value);
            const sanitizedWebsite = websiteInput ? sanitizeInput(websiteInput.value) : "";
            const sanitizedSector = sectorInput ? sanitizeInput(sectorInput.value) : "";

            // Disable button
            submitBtn.style.pointerEvents = "none";
            submitBtn.style.opacity = "0.75";
            const originalText = submitBtn.innerText;

            // Multi-stage audit feedback (Commercial reality states)
            const stages = [
                { text: "Conectando rastreador de búsquedas...", delay: 600 },
                { text: "Evaluando tu posición frente a la competencia...", delay: 1200 },
                { text: "Analizando mapas y visibilidad local...", delay: 1800 },
                { text: "Buscando vacíos de demanda...", delay: 2400 },
                { text: "¡Auditoría de Visibilidad Lista!", delay: 3000 }
            ];

            stages.forEach(stage => {
                setTimeout(() => {
                    submitBtn.innerText = stage.text;
                    
                    // Final success feedback
                    if (stage.text === "¡Auditoría de Visibilidad Lista!") {
                        submitBtn.style.backgroundColor = "#FFFFFF";
                        submitBtn.style.color = "#050811";
                        submitBtn.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.4)";
                        
                        // Clear input fields
                        form.reset();

                        // Restore form to initial state after delay
                        setTimeout(() => {
                            submitBtn.innerText = originalText;
                            submitBtn.style.pointerEvents = "auto";
                            submitBtn.style.opacity = "1";
                            submitBtn.style.backgroundColor = "";
                            submitBtn.style.color = "";
                            submitBtn.style.boxShadow = "";

                            // Close modal if open
                            if (modalOverlay && modalOverlay.classList.contains("active")) {
                                modalOverlay.classList.remove("active");
                                document.body.style.overflow = "";
                            }
                        }, 3000);
                    }
                }, stage.delay);
            });
        });
    });
});
