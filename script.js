// B2B Command Center Interactions - script.js

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. INTERACTIVE RADAR GRID CANVAS BACKGROUND
    // ==========================================
    const canvas = document.getElementById("radar-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let gridSpacing = 40;
        let sweepAngle = 0;
        let radarLines = [];
        let mouse = { x: null, y: null };

        // Handle Resize
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        // Track Mouse
        window.addEventListener("mousemove", (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
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
                ctx.strokeStyle = "rgba(16, 185, 129, 0.04)";
                ctx.beginPath();
                ctx.moveTo(mouse.x, 0);
                ctx.lineTo(mouse.x, canvas.height);
                ctx.moveTo(0, mouse.y);
                ctx.lineTo(canvas.width, mouse.y);
                ctx.stroke();

                // Draw coordinates text in monospace style
                ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
                ctx.font = "9px 'JetBrains Mono', monospace";
                ctx.fillText(`[LOC: ${mouse.x}px, ${mouse.y}px]`, mouse.x + 10, mouse.y - 10);
            }

            requestAnimationFrame(drawGrid);
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        drawGrid();
    }

    // ==========================================
    // 2. RADAR SWEEP TARGET BEACON DETECTION
    // ==========================================
    // Calculate node angles relative to center of radar to align beacon flares
    const targetNodes = document.querySelectorAll(".radar-target-node");
    const radarScope = document.querySelector(".radar-scope-wrapper");
    
    if (radarScope && targetNodes.length > 0) {
        let currentSweepAngle = 0;

        // Calculate polar coordinates of each target node
        const targets = Array.from(targetNodes).map(node => {
            // Read left and top styles as percentages
            const leftPct = parseFloat(node.style.left);
            const topPct = parseFloat(node.style.top);
            
            // Vector relative to center (50%, 50%)
            const dx = leftPct - 50;
            const dy = topPct - 50;
            
            // Calculate polar angle (0 to 360)
            let angle = Math.atan2(dy, dx) * 180 / Math.PI;
            angle = (angle + 90 + 360) % 360; // Offset +90 to align with CSS conic-gradient start

            return {
                element: node,
                angle: angle,
                activated: false
            };
        });

        // Run detection loops in sync with CSS conic sweep (6000ms duration)
        const checkRadarScan = () => {
            // Estimate angle based on time (6s cycle)
            const ms = new Date().getTime();
            currentSweepAngle = ((ms % 6000) / 6000) * 360;

            targets.forEach(target => {
                // Calculate angular distance
                const diff = (currentSweepAngle - target.angle + 360) % 360;
                
                // If sweep line is passing over target (within 12 degree window)
                if (diff < 15) {
                    if (!target.activated) {
                        target.element.classList.add("swept-active");
                        target.activated = true;
                        
                        // Briefly pulse/blink node
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
        // Parse numerical target from text
        const text = el.innerText;
        const targetNumber = parseInt(text.replace(/[^0-9]/g, ''), 10);
        if (isNaN(targetNumber)) return;

        const isPercentage = text.includes("%");
        const hasPlus = text.includes("+");
        const duration = 2000; // 2 seconds
        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easedProgress * targetNumber);

            // Construct string
            let formatted = "";
            if (hasPlus) formatted += "+";
            formatted += currentValue;
            if (isPercentage) formatted += "%";
            
            // Special exception for Top #1
            if (text.includes("TOP")) {
                el.innerText = "TOP #1";
                return;
            }

            el.innerText = formatted;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                el.innerText = text; // Set final format
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

                // Close all other active items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains("active")) {
                        otherItem.classList.remove("active");
                        otherItem.querySelector(".faq-answer").style.maxHeight = "0";
                    }
                });

                // Toggle selected item
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
            
            // Validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                emailInput.classList.add('error-shake');
                setTimeout(() => emailInput.classList.remove('error-shake'), 500);
                return;
            }

            // Disable button
            submitBtn.style.pointerEvents = "none";
            submitBtn.style.opacity = "0.75";
            const originalText = submitBtn.innerText;

            // Multi-stage audit feedback simulation (Generates high perceived technical value)
            const stages = [
                { text: "Conectando crawlers...", delay: 600 },
                { text: "Analizando indexación móvil...", delay: 1200 },
                { text: "Auditando mapas y cobertura local...", delay: 1800 },
                { text: "Resolviendo referencias IA...", delay: 2400 },
                { text: "¡Diagnóstico Completado!", delay: 3000 }
            ];

            stages.forEach(stage => {
                setTimeout(() => {
                    submitBtn.innerText = stage.text;
                    
                    // Final Success State styling
                    if (stage.text === "¡Diagnóstico Completado!") {
                        submitBtn.style.backgroundColor = "#FFFFFF";
                        submitBtn.style.color = "#050811";
                        submitBtn.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.4)";
                        
                        // Clear input fields inside this form
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
