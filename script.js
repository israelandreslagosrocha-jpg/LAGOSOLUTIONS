// CRO & UX Animations - script.js

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Intersection Observer for Scroll Animations (Reveal)
    // Esto asegura que las secciones aparezcan de forma elegante cuando el usuario hace scroll, manteniendo la atención (UX Moderno)
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.1, // Se activa cuando el 10% del elemento es visible
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Solo anima la primera vez (rendimiento)
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 2. Lógica de visibilidad del Botón Flotante (Sticky CTA)
    // El botón solo debe aparecer cuando el usuario ya pasó el Hero, para no saturar arriba y para estar disponible cuando se genera dolor abajo.
    const stickyCta = document.getElementById('stickyCta');
    const heroSection = document.getElementById('hero');

    const stickyOptions = {
        threshold: 0,
        rootMargin: "-300px 0px 0px 0px" // Aparece 300px después de hacer scroll en el hero
    };

    const stickyObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                stickyCta.classList.add('visible');
            } else {
                stickyCta.classList.remove('visible');
            }
        });
    }, stickyOptions);

    if (heroSection && stickyCta) {
        stickyObserver.observe(heroSection);
    }

    // 3. Feedback Interactivo de Formularios (Psicología de Conversión)
    const forms = document.querySelectorAll('.leadFormAction');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            const submitBtn = form.querySelector('button[type="submit"]');
            
            // Validación básica de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if(!emailRegex.test(emailInput.value)) {
                // Efecto de error físico (Shake) que rompe el patrón e indica corrección sin alert intrusivo
                emailInput.classList.add('error-shake');
                setTimeout(() => emailInput.classList.remove('error-shake'), 500);
                return;
            }

            // Simulación de carga (Genera expectativa de un sistema sofisticado - "Analizando")
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Analizando negocio...";
            submitBtn.style.opacity = "0.7";
            submitBtn.style.pointerEvents = "none";

            // Simular petición asíncrona
            setTimeout(() => {
                // Estado de Éxito
                submitBtn.innerText = "¡Diagnóstico Enviado!";
                submitBtn.style.backgroundColor = "#FFFFFF"; // Contraste limpio
                submitBtn.style.color = "#0B0B0B";
                
                // Limpiar formulario
                emailInput.value = '';
                
                // Retornar al estado original
                setTimeout(() => {
                    submitBtn.innerText = originalText;
                    submitBtn.style.opacity = "1";
                    submitBtn.style.pointerEvents = "auto";
                    submitBtn.style.backgroundColor = "var(--cta-color)";
                    submitBtn.style.color = "var(--bg-dark)";
                }, 3500);

            }, 1800); // 1.8 segundos de carga genera percepción de "procesamiento real"
        });
    });
});
