/**
 * LAGOSOLUTIONS V3 — causal-chain-draw.js
 * Módulo Independiente: Visualización interactiva y reactiva de los 9 eslabones de la Cadena Causal.
 * 
 * Cadena Metodológica:
 * EVIDENCIA → PROBLEMA → CAUSA PROBABLE → CAUSA DEMOSTRADA → OPORTUNIDAD → ALTERNATIVAS → PRIORIZACIÓN → SOLUCIÓN → MÉTRICA
 * 
 * Resiliencia: Todos los 9 eslabones están presentes en el DOM HTML y permanecen legibles sin JS.
 */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initCausalChain() {
        const chainBox = document.querySelector('.causal-chain-box');
        if (!chainBox) return;

        const nodes = chainBox.querySelectorAll('.c-node');
        if (nodes.length === 0) return;

        if (prefersReducedMotion) {
            nodes.forEach(node => node.classList.add('node-active'));
            return;
        }

        // Iluminación secuencial al scroll
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        nodes.forEach((node, idx) => {
                            setTimeout(() => {
                                node.classList.add('node-active');
                            }, idx * 120);
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.25 });

            observer.observe(chainBox);
        } else {
            nodes.forEach(node => node.classList.add('node-active'));
        }

        // Microinteracción al hover
        nodes.forEach(node => {
            node.addEventListener('mouseenter', () => {
                nodes.forEach(n => n.classList.remove('node-hover'));
                node.classList.add('node-hover');
            });
            node.addEventListener('mouseleave', () => {
                node.classList.remove('node-hover');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCausalChain);
    } else {
        initCausalChain();
    }
})();
