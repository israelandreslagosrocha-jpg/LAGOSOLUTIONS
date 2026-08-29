/**
 * LAGOSOLUTIONS V3 — kinetic-type.js
 * Módulo Independiente: Tipografía cinética y revelado cinematográfico al scroll.
 * 
 * Concepto: NO PARTIMOS DE LA SOLUCIÓN. ENTENDEMOS → DETECTAMOS → DECIDIMOS → CONSTRUIMOS → MEDIMOS → EVOLUCIONAMOS
 * Resiliencia: Si GSAP no carga o falla, opera con IntersectionObserver nativo o CSS sin ocultar contenido.
 */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        // En reducción de movimiento, asegurar visibilidad inmediata de todos los elementos cinéticos
        document.querySelectorAll('.kinetic-word, .kinetic-line').forEach(el => {
            el.classList.add('visible');
        });
        return;
    }

    function initKineticTypography() {
        const kineticSections = document.querySelectorAll('.kinetic-container');
        if (kineticSections.length === 0) return;

        // Comprobación de GSAP disponible vía CDN
        const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

        if (hasGSAP) {
            try {
                window.gsap.registerPlugin(window.ScrollTrigger);

                kineticSections.forEach(section => {
                    const words = section.querySelectorAll('.kinetic-word');
                    if (words.length > 0) {
                        window.gsap.fromTo(words, 
                            { 
                                opacity: 0.15,
                                y: 15,
                                filter: 'blur(4px)'
                            },
                            {
                                opacity: 1,
                                y: 0,
                                filter: 'blur(0px)',
                                stagger: 0.12,
                                duration: 0.8,
                                ease: 'power2.out',
                                scrollTrigger: {
                                    trigger: section,
                                    start: 'top 80%',
                                    end: 'bottom 45%',
                                    toggleActions: 'play none none reverse'
                                }
                            }
                        );
                    }
                });
                return;
            } catch (err) {
                console.warn('GSAP initialization fallback:', err);
            }
        }

        // Fallback Nativo Robusto con IntersectionObserver
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-active');
                        const words = entry.target.querySelectorAll('.kinetic-word');
                        words.forEach((w, i) => {
                            setTimeout(() => {
                                w.classList.add('visible');
                            }, i * 100);
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

            kineticSections.forEach(sec => observer.observe(sec));
        } else {
            // Fallback para navegadores antiguos: todo visible de inmediato
            document.querySelectorAll('.kinetic-word').forEach(w => w.classList.add('visible'));
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initKineticTypography);
    } else {
        initKineticTypography();
    }
})();
