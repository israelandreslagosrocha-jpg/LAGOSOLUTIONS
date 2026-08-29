/**
 * LAGOSOLUTIONS V3 — hero-system-canvas.js
 * Módulo Independiente: Representación visual interactiva de 6 áreas clave de investigación.
 * 
 * Áreas: Clientes, Captación, Ventas, Operación, Datos, Tecnología.
 * Comportamiento: Reposo calmo por defecto. Reacción suave al cursor.
 * Resiliencia: Si falla o se desactiva, la web continúa funcionando sin errores.
 */

(function () {
    'use strict';

    // Verificación de prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        return; // Salida limpia en modo de reducción de movimiento
    }

    const canvas = document.getElementById('hero-system-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = null;
    let isVisible = true;
    let width = 0;
    let height = 0;

    // 6 Áreas clave de investigación
    const nodeLabels = ['CLIENTES', 'CAPTACIÓN', 'VENTAS', 'OPERACIÓN', 'DATOS', 'TECNOLOGÍA'];
    
    // Coordenadas relativas iniciales (distribución armónica alrededor del núcleo)
    const basePositions = [
        { xRatio: 0.22, yRatio: 0.30, label: 'CLIENTES' },
        { xRatio: 0.50, yRatio: 0.18, label: 'CAPTACIÓN' },
        { xRatio: 0.78, yRatio: 0.30, label: 'VENTAS' },
        { xRatio: 0.80, yRatio: 0.70, label: 'OPERACIÓN' },
        { xRatio: 0.50, yRatio: 0.82, label: 'DATOS' },
        { xRatio: 0.20, yRatio: 0.70, label: 'TECNOLOGÍA' }
    ];

    let nodes = [];
    const mouse = { x: -1000, y: -1000, active: false };

    function resizeCanvas() {
        const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Cap a 1.5 para ahorrar GPU
        width = rect.width;
        height = rect.height;

        if (width === 0 || height === 0) {
            width = 480;
            height = 360;
        }

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        initNodes();
    }

    function initNodes() {
        nodes = basePositions.map((bp, i) => {
            const bx = width * bp.xRatio;
            const by = height * bp.yRatio;
            return {
                baseX: bx,
                baseY: by,
                x: bx,
                y: by,
                vx: 0,
                vy: 0,
                radius: 4,
                label: bp.label,
                highlight: false,
                pulseOffset: (i * Math.PI) / 3
            };
        });
    }

    // Interacción suave con mouse
    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    }

    function handleMouseLeave() {
        mouse.active = false;
        mouse.x = -1000;
        mouse.y = -1000;
    }

    canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    let time = 0;

    function render() {
        if (!isVisible) {
            animationFrameId = requestAnimationFrame(render);
            return;
        }

        time += 0.015;
        ctx.clearRect(0, 0, width, height);

        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // 1. Dibujar núcleo central tenue (EMPRESA)
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(19, 119, 82, 0.4)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 14, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(19, 119, 82, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 2. Actualizar posiciones con físicas de resorte suaves
        nodes.forEach((node, i) => {
            // Movimiento ambiental calmo de muy baja amplitud
            const ambientX = Math.sin(time + node.pulseOffset) * 4;
            const ambientY = Math.cos(time + node.pulseOffset * 1.5) * 4;

            let targetX = node.baseX + ambientX;
            let targetY = node.baseY + ambientY;

            // Reacción sutil al cursor si está activo
            if (mouse.active) {
                const dx = mouse.x - node.x;
                const dy = mouse.y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120 && dist > 0) {
                    const force = (120 - dist) / 120;
                    targetX += (dx / dist) * force * 15;
                    targetY += (dy / dist) * force * 15;
                }
            }

            // Físicas de resorte suaves
            const ax = (targetX - node.x) * 0.08;
            const ay = (targetY - node.y) * 0.08;
            node.vx = (node.vx + ax) * 0.85;
            node.vy = (node.vy + ay) * 0.85;
            node.x += node.vx;
            node.y += node.vy;
        });

        // 3. Dibujar líneas conectoras entre nodos y hacia el centro
        ctx.lineWidth = 1;

        // Líneas al centro
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(centerX, centerY);
            ctx.strokeStyle = 'rgba(6, 15, 34, 0.08)';
            ctx.stroke();
        });

        // Líneas perimetrales entre nodos continuos
        for (let i = 0; i < nodes.length; i++) {
            const nextNode = nodes[(i + 1) % nodes.length];
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nextNode.x, nextNode.y);
            ctx.strokeStyle = 'rgba(19, 119, 82, 0.12)';
            ctx.stroke();
        }

        // 4. Dibujar nodos y etiquetas
        nodes.forEach(node => {
            // Halo de nodo
            ctx.beginPath();
            ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(19, 119, 82, 0.06)';
            ctx.fill();

            // Punto de nodo
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#137752';
            ctx.fill();

            // Etiqueta tipográfica nítida
            ctx.font = '600 10px "Outfit", sans-serif';
            ctx.fillStyle = '#060f22';
            ctx.textAlign = 'center';
            ctx.fillText(node.label, node.x, node.y - 12);
        });

        animationFrameId = requestAnimationFrame(render);
    }

    // Auto-pausa con IntersectionObserver para no gastar batería fuera de pantalla
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
            });
        }, { threshold: 0.05 });

        observer.observe(canvas);
    }

    // Inicialización y resize listener
    window.addEventListener('resize', debounce(resizeCanvas, 150), { passive: true });
    resizeCanvas();
    render();

    function debounce(func, wait) {
        let timeout;
        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(func, wait);
        };
    }
})();
