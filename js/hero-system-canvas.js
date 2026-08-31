/**
 * LAGOSOLUTIONS V3.2 — hero-system-canvas.js
 * Módulo: Sonda de Exploración y Telemetría Empresarial (Canvas 2D)
 * 
 * Concepto: Metáfora de investigación, análisis e indagación tecnológica.
 * Áreas: CLIENTES, CAPTACIÓN, VENTAS, OPERACIÓN, DATOS, TECNOLOGÍA.
 * Rendimiento: Zero-GC RAF loop, IntersectionObserver, DPR cap 1.5, soporte prefers-reduced-motion.
 * Bidireccionalidad: Expone window.LagosHeroSystem y despacha eventos 'lagos:node-focus'.
 */

(function () {
    'use strict';

    const canvas = document.getElementById('hero-system-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Verificación de prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId = null;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // 2. Configuración de los 6 Nodos de Análisis
    const baseNodeDefinitions = [
        {
            key: 'clientes',
            label: 'CLIENTES',
            xRatio: 0.20,
            yRatio: 0.28,
            tag: 'Perfil & Recurrencia',
            icon: '👥'
        },
        {
            key: 'captacion',
            label: 'CAPTACIÓN',
            xRatio: 0.50,
            yRatio: 0.16,
            tag: 'Canales & Demanda',
            icon: '🎯'
        },
        {
            key: 'ventas',
            label: 'VENTAS',
            xRatio: 0.80,
            yRatio: 0.28,
            tag: 'Conversión & Seguimiento',
            icon: '💼'
        },
        {
            key: 'operacion',
            label: 'OPERACIÓN',
            xRatio: 0.82,
            yRatio: 0.72,
            tag: 'Flujos & Entrega',
            icon: '⚙️'
        },
        {
            key: 'datos',
            label: 'DATOS',
            xRatio: 0.50,
            yRatio: 0.84,
            tag: 'Planillas & Reportes',
            icon: '📊'
        },
        {
            key: 'tecnologia',
            label: 'TECNOLOGÍA',
            xRatio: 0.18,
            yRatio: 0.72,
            tag: 'Sistemas & Stack',
            icon: '💻'
        }
    ];

    let nodes = [];

    // 3. Estado de la Sonda de Exploración
    const probe = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        targetX: 0,
        targetY: 0,
        angle: 0,
        targetAngle: 0,
        angularVelocity: 0,
        scanIntensity: 0,
        activeNode: null,
        pinnedNode: null,
        isHovered: false,
        size: 14,
        trail: []
    };

    // Estado del cursor
    const mouse = {
        x: -1000,
        y: -1000,
        active: false,
        isTouch: false
    };

    // 4. Redimensionamiento y escala DPI
    function resizeCanvas() {
        const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : canvas.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        width = Math.floor(rect.width) || 480;
        height = Math.floor(rect.height) || 360;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        initNodes();

        // Inicializar sonda en el centro si es primer arranque
        if (probe.x === 0 && probe.y === 0) {
            probe.x = width * 0.5;
            probe.y = height * 0.5;
            probe.targetX = probe.x;
            probe.targetY = probe.y;
        }
    }

    function initNodes() {
        nodes = baseNodeDefinitions.map((def, i) => {
            const bx = width * def.xRatio;
            const by = height * def.yRatio;
            return {
                ...def,
                baseX: bx,
                baseY: by,
                x: bx,
                y: by,
                vx: 0,
                vy: 0,
                radius: 5,
                pulseOffset: (i * Math.PI) / 3,
                pulseScale: 0,
                isHovered: false,
                isFocused: false
            };
        });
    }

    // 5. Utilidades Matemáticas Vectoriales
    function shortestAngleDiff(target, current) {
        const diff = (target - current) % (Math.PI * 2);
        return ((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    }

    function getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 6. Listeners de Interacción del Mouse / Touch
    function updateMousePosition(clientX, clientY, isTouch = false) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = clientX - rect.left;
        mouse.y = clientY - rect.top;
        mouse.active = true;
        mouse.isTouch = isTouch;
    }

    canvas.addEventListener('mousemove', (e) => {
        updateMousePosition(e.clientX, e.clientY, false);
    }, { passive: true });

    canvas.addEventListener('mouseleave', () => {
        mouse.active = false;
        mouse.x = -1000;
        mouse.y = -1000;
        probe.activeNode = probe.pinnedNode;
    }, { passive: true });

    // Click en Canvas para fijar foco
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Comprobar si se hizo clic en un nodo
        let clickedNode = null;
        for (let node of nodes) {
            if (getDistance(clickX, clickY, node.x, node.y) < 24) {
                clickedNode = node;
                break;
            }
        }

        if (clickedNode) {
            focusNodeInternal(clickedNode.key, true);
        } else {
            // Clic en espacio vacío deselecciona
            probe.pinnedNode = null;
            probe.activeNode = null;
            nodes.forEach(n => n.isFocused = false);
            window.dispatchEvent(new CustomEvent('lagos:node-unfocus'));
        }
    });

    // Touch en dispositivos móviles
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            updateMousePosition(e.touches[0].clientX, e.touches[0].clientY, true);
            // Si toca un nodo, enfocamos
            for (let node of nodes) {
                if (getDistance(mouse.x, mouse.y, node.x, node.y) < 32) {
                    focusNodeInternal(node.key, true);
                    break;
                }
            }
        }
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
        setTimeout(() => {
            mouse.active = false;
        }, 1500);
    }, { passive: true });

    // 7. Función Interna de Enfoque Bidireccional
    function focusNodeInternal(nodeKey, triggerEvent = false) {
        const targetNode = nodes.find(n => n.key === nodeKey);
        if (!targetNode) return;

        nodes.forEach(n => n.isFocused = (n.key === nodeKey));
        probe.pinnedNode = targetNode;
        probe.activeNode = targetNode;

        if (triggerEvent) {
            window.dispatchEvent(new CustomEvent('lagos:node-focus', {
                detail: {
                    key: targetNode.key,
                    label: targetNode.label,
                    tag: targetNode.tag
                }
            }));
        }
    }

    // 8. Bucle de Simulación y Renderizado
    let time = 0;

    function render() {
        if (!isVisible) {
            animationFrameId = requestAnimationFrame(render);
            return;
        }

        time += 0.018;
        ctx.clearRect(0, 0, width, height);

        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // --- A. ACTUALIZACIÓN DE NODOS ---
        let hoveredNode = null;

        nodes.forEach((node) => {
            // Movimiento ambiental sinusoidal sutil
            const ambientX = Math.sin(time + node.pulseOffset) * 3;
            const ambientY = Math.cos(time + node.pulseOffset * 1.3) * 3;

            let targetX = node.baseX + ambientX;
            let targetY = node.baseY + ambientY;

            // Detección de proximidad con el cursor
            const distMouse = getDistance(mouse.x, mouse.y, node.x, node.y);
            node.isHovered = mouse.active && (distMouse < 32);
            if (node.isHovered) {
                hoveredNode = node;
            }

            // Físicas de resorte suave de nodos
            const ax = (targetX - node.x) * 0.06;
            const ay = (targetY - node.y) * 0.06;
            node.vx = (node.vx + ax) * 0.86;
            node.vy = (node.vy + ay) * 0.86;
            node.x += node.vx;
            node.y += node.vy;

            // Pulso de nodo
            if (node.isFocused || node.isHovered) {
                node.pulseScale = Math.sin(time * 6) * 4;
            } else {
                node.pulseScale = 0;
            }
        });

        // Actualizar nodo activo de la sonda
        if (hoveredNode) {
            probe.activeNode = hoveredNode;
        } else if (probe.pinnedNode) {
            probe.activeNode = probe.pinnedNode;
        } else {
            probe.activeNode = null;
        }

        // --- B. ACTUALIZACIÓN DE LA SONDA DE EXPLORACIÓN ---
        if (probe.activeNode) {
            // Modo Inspección: la sonda se posiciona cerca del nodo enfocado
            const angleToCenter = Math.atan2(centerY - probe.activeNode.y, centerX - probe.activeNode.x);
            // Posición de inspección (ligeramente desplazada hacia el centro)
            probe.targetX = probe.activeNode.x + Math.cos(angleToCenter) * 38;
            probe.targetY = probe.activeNode.y + Math.sin(angleToCenter) * 38;

            // Orientación apuntando directamente al nodo objetivo
            probe.targetAngle = Math.atan2(probe.activeNode.y - probe.y, probe.activeNode.x - probe.x);
            probe.scanIntensity = Math.min(probe.scanIntensity + 0.08, 1);

        } else if (mouse.active && !mouse.isTouch) {
            // Modo Navegación con Mouse: seguimiento con inercia elástica
            probe.targetX = mouse.x;
            probe.targetY = mouse.y;

            const dx = probe.targetX - probe.x;
            const dy = probe.targetY - probe.y;
            const moveDist = Math.sqrt(dx * dx + dy * dy);

            if (moveDist > 2) {
                probe.targetAngle = Math.atan2(dy, dx);
            }
            probe.scanIntensity = Math.max(probe.scanIntensity - 0.05, 0);

        } else {
            // Modo Reposo (Idle): Flotación en el centro orbital
            const ambientProbeX = Math.sin(time * 1.2) * 4 + Math.cos(time * 0.7) * 2;
            const ambientProbeY = Math.cos(time * 1.4) * 3 + Math.sin(time * 0.9) * 1.5;
            probe.targetX = centerX + ambientProbeX;
            probe.targetY = centerY + ambientProbeY;

            probe.targetAngle = Math.sin(time * 0.8) * 0.15; // Oscilación leve de rumbo
            probe.scanIntensity = Math.max(probe.scanIntensity - 0.04, 0);
        }

        // Físicas elásticas de la sonda (Spring Damping)
        const pAx = (probe.targetX - probe.x) * 0.05;
        const pAy = (probe.targetY - probe.y) * 0.05;
        probe.vx = (probe.vx + pAx) * 0.88;
        probe.vy = (probe.vy + pAy) * 0.88;
        probe.x += probe.vx;
        probe.y += probe.vy;

        // Rotación angular suave sin saltos de 360°
        const angleDiff = shortestAngleDiff(probe.targetAngle, probe.angle);
        probe.angularVelocity = (probe.angularVelocity + angleDiff * 0.08) * 0.75;
        probe.angle += probe.angularVelocity;

        // --- C. DIBUJADO DE ESTRUCTURA Y RED DE TELEMETRÍA ---

        // 1. Núcleo Central (Empresa)
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(19, 119, 82, 0.4)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(19, 119, 82, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Líneas de Conexión Radial y Perimetral
        ctx.lineWidth = 1;

        // Líneas radiales centro -> nodos
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(centerX, centerY);
            ctx.strokeStyle = (node === probe.activeNode) ? 'rgba(19, 119, 82, 0.35)' : 'rgba(6, 15, 34, 0.07)';
            ctx.stroke();
        });

        // Líneas perimetrales
        for (let i = 0; i < nodes.length; i++) {
            const nextNode = nodes[(i + 1) % nodes.length];
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nextNode.x, nextNode.y);
            ctx.strokeStyle = 'rgba(19, 119, 82, 0.12)';
            ctx.stroke();
        }

        // --- D. HAZ DE INSPECCIÓN / ESCANEO DE LA SONDA ---
        if (probe.scanIntensity > 0.02 && probe.activeNode) {
            ctx.save();
            const beamDist = getDistance(probe.x, probe.y, probe.activeNode.x, probe.activeNode.y);
            const beamAngle = Math.atan2(probe.activeNode.y - probe.y, probe.activeNode.x - probe.x);

            ctx.translate(probe.x, probe.y);
            ctx.rotate(beamAngle);

            // Gradiente cónico de escaneo colimado
            const grad = ctx.createLinearGradient(0, 0, beamDist, 0);
            grad.addColorStop(0, `rgba(16, 185, 129, ${0.4 * probe.scanIntensity})`);
            grad.addColorStop(0.5, `rgba(19, 119, 82, ${0.15 * probe.scanIntensity})`);
            grad.addColorStop(1, `rgba(16, 185, 129, 0.0)`);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(beamDist, -14 * probe.scanIntensity);
            ctx.lineTo(beamDist, 14 * probe.scanIntensity);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();

            // Línea de mira central de precisión
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(beamDist, 0);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.6 * probe.scanIntensity})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.restore();
        }

        // --- E. DIBUJO DE NODOS Y ETIQUETAS DE TELEMETRÍA ---
        nodes.forEach(node => {
            const isTarget = (node === probe.activeNode);

            // Anillo de Pulso/Escaneo
            if (isTarget) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 14 + node.pulseScale, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }

            // Halo suave
            ctx.beginPath();
            ctx.arc(node.x, node.y, isTarget ? 10 : 7, 0, Math.PI * 2);
            ctx.fillStyle = isTarget ? 'rgba(19, 119, 82, 0.15)' : 'rgba(19, 119, 82, 0.06)';
            ctx.fill();

            // Punto de nodo sólido
            ctx.beginPath();
            ctx.arc(node.x, node.y, isTarget ? 5 : 3.5, 0, Math.PI * 2);
            ctx.fillStyle = isTarget ? '#10b981' : '#137752';
            ctx.fill();

            // Etiqueta tipográfica principal
            ctx.font = isTarget ? '700 11px "Outfit", sans-serif' : '600 10px "Outfit", sans-serif';
            ctx.fillStyle = isTarget ? '#060f22' : '#334155';
            ctx.textAlign = 'center';
            ctx.fillText(node.label, node.x, node.y - (isTarget ? 15 : 12));

            // Micro-tag de telemetría durante inspección
            if (isTarget) {
                ctx.font = '500 8.5px "Outfit", sans-serif';
                ctx.fillStyle = '#137752';
                ctx.fillText(`[ ${node.tag} ]`, node.x, node.y + 18);
            }
        });

        // --- F. DIBUJO VECTORIAL DE LA SONDA DE EXPLORACIÓN ---
        ctx.save();
        ctx.translate(probe.x, probe.y);
        ctx.rotate(probe.angle);

        // Halo de propulsión / telemetría trasera
        ctx.beginPath();
        ctx.arc(-8, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(19, 119, 82, 0.2)';
        ctx.fill();

        // Cuerpo geométrico: Prisma Delta de Precisión Técnica
        ctx.beginPath();
        ctx.moveTo(12, 0);       // Vértice proa
        ctx.lineTo(-8, -6.5);    // Ala superior
        ctx.lineTo(-4.5, 0);     // Muesca central trasera
        ctx.lineTo(-8, 6.5);     // Ala inferior
        ctx.closePath();

        // Relleno de alto contraste y trazo de ingeniería
        ctx.fillStyle = '#060f22';
        ctx.fill();
        ctx.strokeStyle = '#137752';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Línea central de instrumentación
        ctx.beginPath();
        ctx.moveTo(-4.5, 0);
        ctx.lineTo(8, 0);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Punto sensor de proa (Foco verde esmeralda)
        ctx.beginPath();
        ctx.arc(10, 0, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();

        ctx.restore();

        // Solicitar siguiente cuadro
        animationFrameId = requestAnimationFrame(render);
    }

    // 9. Manejo de prefers-reduced-motion (Frame estático elegante)
    if (prefersReducedMotion) {
        resizeCanvas();
        // Renderizar un único frame estático limpio
        time = 0.5;
        render();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        return;
    }

    // 10. Pausa Automática con IntersectionObserver
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
            });
        }, { threshold: 0.05 });

        observer.observe(canvas);
    }

    // 11. Inicialización
    window.addEventListener('resize', debounce(resizeCanvas, 120), { passive: true });
    resizeCanvas();
    render();

    function debounce(func, wait) {
        let timeout;
        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(func, wait);
        };
    }

    // 12. API Pública Bidireccional
    window.LagosHeroSystem = {
        focusNode: function (nodeKey) {
            focusNodeInternal(nodeKey, false);
        },
        resetFocus: function () {
            probe.pinnedNode = null;
            probe.activeNode = null;
            nodes.forEach(n => n.isFocused = false);
        },
        getActiveNode: function () {
            return probe.activeNode ? probe.activeNode.key : null;
        }
    };

})();
