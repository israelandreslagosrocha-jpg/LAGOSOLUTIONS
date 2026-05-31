// CRO & Advanced Space Theme Interactions - script.js

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. INTERACTIVE COSMIC CANVAS STARFIELD
    // ==========================================
    const canvas = document.getElementById("space-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let stars = [];
        let numStars = 120;
        let mouse = { x: null, y: null, radius: 100 };

        // Handle Resize
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        // Initialize Stars
        const initStars = () => {
            stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.8 + 0.4,
                    speedX: (Math.random() - 0.5) * 0.12,
                    speedY: (Math.random() - 0.5) * 0.12,
                    alpha: Math.random() * 0.8 + 0.2,
                    alphaSpeed: (Math.random() - 0.5) * 0.015,
                    color: getRandomStarColor()
                });
            }
        };

        // Star Colors: White, faint blue, faint green
        const getRandomStarColor = () => {
            const colors = [
                "rgba(255, 255, 255,",
                "rgba(0, 176, 255,", // Cyber Blue
                "rgba(0, 230, 118,", // Neon Green
                "rgba(213, 0, 249,"  // Cyber Purple
            ];
            const weight = [0.75, 0.12, 0.08, 0.05];
            const random = Math.random();
            let sum = 0;
            for (let i = 0; i < colors.length; i++) {
                sum += weight[i];
                if (random <= sum) return colors[i];
            }
            return colors[0];
        };

        // Track Mouse Movement
        window.addEventListener("mousemove", (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // Clear Mouse position on leave
        window.addEventListener("mouseout", () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Animation Loop
        const animateStars = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw & Update stars
            stars.forEach(star => {
                // Gentle twinking / alpha cycle
                star.alpha += star.alphaSpeed;
                if (star.alpha > 1 || star.alpha < 0.2) {
                    star.alphaSpeed = -star.alphaSpeed;
                }
                
                // Normal Drift
                star.x += star.speedX;
                star.y += star.speedY;

                // Mouse Repulsion (Interactive Drift)
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = star.x - mouse.x;
                    const dy = star.y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        const forceX = (dx / distance) * force * 1.5;
                        const forceY = (dy / distance) * force * 1.5;
                        
                        // Push star away gently, but return to normal path when mouse moves
                        star.x += forceX;
                        star.y += forceY;
                    }
                }

                // Wrap around edges
                if (star.x < 0) star.x = canvas.width;
                if (star.x > canvas.width) star.x = 0;
                if (star.y < 0) star.y = canvas.height;
                if (star.y > canvas.height) star.y = 0;

                // Draw
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = star.color + star.alpha + ")";
                ctx.fill();
            });

            requestAnimationFrame(animateStars);
        };

        // Start Canvas
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        animateStars();
    }

    // ==========================================
    // 2. ROCKET ORBIT TRAJECTORY ANIMATION
    // ==========================================
    const rocketPath = document.getElementById("rocketPath");
    const activePath = document.getElementById("rocketPathActive");
    const rocketIcon = document.getElementById("rocketIcon");
    const nodes = document.querySelectorAll(".trajectory-node");

    if (rocketPath && activePath && rocketIcon) {
        // Initialize path lengths
        const pathLength = rocketPath.getTotalLength();
        activePath.style.strokeDasharray = pathLength;
        activePath.style.strokeDashoffset = pathLength;

        let animProgress = 0;
        let targetProgress = 1;
        let duration = 2500; // 2.5 seconds
        let startTime = null;

        // Custom easing function (Cubic Out)
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const updateRocketPosition = (progress) => {
            // 1. Draw Active Path
            activePath.style.strokeDashoffset = pathLength - (pathLength * progress);

            // 2. Move & Rotate Rocket
            const currentDistance = progress * pathLength;
            const pt = rocketPath.getPointAtLength(currentDistance);
            
            // Percentage coordinates mapped to the viewBox="0 0 500 500"
            const pctX = (pt.x / 500) * 100;
            const pctY = (pt.y / 500) * 100;
            
            rocketIcon.style.left = `${pctX}%`;
            rocketIcon.style.top = `${pctY}%`;
            rocketIcon.style.opacity = progress > 0.01 ? 1 : 0;

            // Calculate rotation angle relative to trajectory direction
            const aheadDistance = Math.min(pathLength, currentDistance + 2);
            const ptAhead = rocketPath.getPointAtLength(aheadDistance);
            const angle = Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x) * 180 / Math.PI;
            
            // Rotate rocket SVG (compensated +45deg for rocket orientation)
            rocketIcon.style.transform = `translate(-50%, -50%) rotate(${angle + 45}deg)`;

            // 3. Highlight milestones as the rocket passes them
            // Map progress to activation triggers
            if (progress >= 0.12) nodes[0].classList.add("active");
            if (progress >= 0.44) nodes[1].classList.add("active");
            if (progress >= 0.68) nodes[2].classList.add("active");
            if (progress >= 0.85) nodes[3].classList.add("active");
        };

        // Animate rocket entry
        const playRocketAnimation = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const timeProgress = Math.min(elapsed / duration, 1);
            
            animProgress = easeOutCubic(timeProgress);
            updateRocketPosition(animProgress);

            if (timeProgress < 1) {
                requestAnimationFrame(playRocketAnimation);
            }
        };

        // Trigger animation after brief delay
        setTimeout(() => {
            requestAnimationFrame(playRocketAnimation);
        }, 300);
    }

    // ==========================================
    // 3. DYNAMIC COUNTER NUMBERS
    // ==========================================
    const counterElements = document.querySelectorAll(".counter-number, .badge-percentage");
    
    const countUp = (el) => {
        const target = parseInt(el.getAttribute("data-target"), 10);
        const duration = 2000; // 2 seconds
        let startTime = null;

        const animateCount = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easedProgress * target);

            // Maintain formatting suffixes
            if (el.classList.contains("badge-percentage") || el.innerText.includes("%") || el.getAttribute("data-target") === "300" || el.getAttribute("data-target") === "200" || el.getAttribute("data-target") === "320") {
                el.innerText = `+${currentValue}%`;
            } else if (el.innerText.includes("+")) {
                el.innerText = `+${currentValue}`;
            } else {
                el.innerText = `+${currentValue}`;
            }

            if (progress < 1) {
                requestAnimationFrame(animateCount);
            } else {
                // Ensure exact target value is written at the end
                if (el.classList.contains("badge-percentage") || el.getAttribute("data-target") === "300" || el.getAttribute("data-target") === "200" || el.getAttribute("data-target") === "320") {
                    el.innerText = `+${target}%`;
                } else {
                    el.innerText = `+${target}`;
                }
            }
        };

        requestAnimationFrame(animateCount);
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, { threshold: 0.2 });

    counterElements.forEach(el => {
        counterObserver.observe(el);
    });

    // ==========================================
    // 4. SECTIONS REVEAL ON SCROLL
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
    // 5. MODAL DIALOG CONTROLLER (DIAGNÓSTICO)
    // ==========================================
    const modalOverlay = document.getElementById("diagnostic-modal");
    const triggerButtons = document.querySelectorAll(".trigger-modal");
    const closeButton = document.querySelector(".modal-close-btn");

    if (modalOverlay) {
        // Open Modal
        triggerButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                modalOverlay.classList.add("active");
                document.body.style.overflow = "hidden"; // Disable scroll when modal open
            });
        });

        // Close Modal
        const closeModal = () => {
            modalOverlay.classList.remove("active");
            document.body.style.overflow = "";
        };

        if (closeButton) {
            closeButton.addEventListener("click", closeModal);
        }

        // Close when clicking backdrop overlay
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // Close on Escape key press
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
                closeModal();
            }
        });
    }

    // ==========================================
    // 6. INTERACTIVE CONVERSION FORMS LOGIC
    // ==========================================
    const forms = document.querySelectorAll('.leadFormAction');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            const submitBtn = form.querySelector('button[type="submit"]');
            
            // Basic Email Regex validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailRegex.test(emailInput.value)) {
                // CRO shake error feedback
                emailInput.classList.add('error-shake');
                setTimeout(() => emailInput.classList.remove('error-shake'), 500);
                return;
            }

            // Processing UI State (expectancy generator)
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Analizando negocio...";
            submitBtn.style.opacity = "0.7";
            submitBtn.style.pointerEvents = "none";

            // Simulated asynchronous API process
            setTimeout(() => {
                // Success feedback state
                submitBtn.innerText = "¡Diagnóstico Enviado!";
                submitBtn.style.backgroundColor = "#FFFFFF";
                submitBtn.style.color = "#03070C";
                submitBtn.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.4)";
                
                // Clear input field
                emailInput.value = '';
                
                // Restore form to initial state after 3.5 seconds
                setTimeout(() => {
                    submitBtn.innerText = originalText;
                    submitBtn.style.opacity = "1";
                    submitBtn.style.pointerEvents = "auto";
                    
                    // Reset styling to primary/theme style depending on source
                    if (submitBtn.classList.contains("btn-primary-neon")) {
                        submitBtn.style.backgroundColor = "var(--color-neon-green)";
                        submitBtn.style.color = "var(--bg-dark)";
                        submitBtn.style.boxShadow = "0 10px 30px var(--color-neon-green-glow)";
                    } else {
                        submitBtn.style.backgroundColor = "";
                        submitBtn.style.color = "";
                        submitBtn.style.boxShadow = "";
                    }

                    // Auto-close modal if form was submitted inside one
                    if (modalOverlay && modalOverlay.classList.contains("active")) {
                        modalOverlay.classList.remove("active");
                        document.body.style.overflow = "";
                    }
                }, 3500);

            }, 1800);
        });
    });
});
