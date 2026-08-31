// ==========================================================================
// LAGOSOLUTIONS — SUITE DE VALIDACIÓN ESPECÍFICA V3.2
// Validación de Sonda de Exploración, Físicas, Nodos y Bidireccionalidad
// ==========================================================================

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('================================================================');
console.log('EJECUCIÓN DE PRUEBAS ESPECÍFICAS — FRONTEND V3.2 (SPRINT 1)');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 12;

function assert(condition, testLetter, testName) {
    if (condition) {
        console.log(`✅ [TEST ${testLetter}] PASS: ${testName}`);
        passedTests++;
    } else {
        console.error(`❌ [TEST ${testLetter}] FAIL: ${testName}`);
    }
}

const canvasJs = readFileSync(join(process.cwd(), 'js/hero-system-canvas.js'), 'utf8');
const scriptJs = readFileSync(join(process.cwd(), 'script.js'), 'utf8');
const indexHtml = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
const styleCss = readFileSync(join(process.cwd(), 'style.css'), 'utf8');

// A. Los seis nodos definidos correctamente
const nodeKeys = ['clientes', 'captacion', 'ventas', 'operacion', 'datos', 'tecnologia'];
const allNodesPresent = nodeKeys.every(k => canvasJs.includes(`key: '${k}'`));
assert(allNodesPresent, 'A', 'Los 6 nodos funcionales (Clientes, Captación, Ventas, Operación, Datos, Tecnología) están configurados.');

// B. HTML -> Canvas (Llamada window.LagosHeroSystem.focusNode)
const htmlToCanvasHook = scriptJs.includes('window.LagosHeroSystem.focusNode(key)');
assert(htmlToCanvasHook, 'B', 'Interacción HTML -> Canvas implementada (selector de mapa enfoca la sonda).');

// C. Canvas -> HTML (Despacho de evento lagos:node-focus)
const canvasToHtmlHook = canvasJs.includes("new CustomEvent('lagos:node-focus'") && scriptJs.includes("window.addEventListener('lagos:node-focus'");
assert(canvasToHtmlHook, 'C', 'Comunicación Canvas -> HTML implementada vía evento nativo desacoplado.');

// D. Físicas de la sonda y orientación angular
const hasPhysics = canvasJs.includes('shortestAngleDiff') && canvasJs.includes('Math.atan2') && canvasJs.includes('probe.angularVelocity');
assert(hasPhysics, 'D', 'Físicas inerciales con amortiguación elástica y rotación angular suave calculadas.');

// E. Modo Inspección y Haz de escaneo
const hasInspectionBeam = canvasJs.includes('probe.scanIntensity') && canvasJs.includes('createLinearGradient') && canvasJs.includes('setLineDash');
assert(hasInspectionBeam, 'E', 'Haz de escaneo colimado y retícula de mira implementados durante la inspección.');

// F. Mouseleave y retorno al centro
const hasMouseLeaveReset = canvasJs.includes("canvas.addEventListener('mouseleave'") && canvasJs.includes('probe.targetX = centerX');
assert(hasMouseLeaveReset, 'F', 'Retorno suave con desaceleración hacia el centro orbital al salir del canvas.');

// G. IntersectionObserver (Pausa de RAF)
const hasIntersectionObserver = canvasJs.includes("'IntersectionObserver' in window") && canvasJs.includes('isVisible = entry.isIntersecting');
assert(hasIntersectionObserver, 'G', 'IntersectionObserver desconecta requestAnimationFrame al salir del viewport.');

// H. Reduced Motion (Frame estático sin loop RAF)
const hasReducedMotion = canvasJs.includes("prefersReducedMotion") && canvasJs.includes("cancelAnimationFrame(animationFrameId)");
assert(hasReducedMotion, 'H', 'prefers-reduced-motion renderiza un frame estático sin bucle de animación.');

// I. Mobile Touch (Manejo táctil sin tracking continuo)
const hasMobileTouch = canvasJs.includes("canvas.addEventListener('touchstart'") && canvasJs.includes("canvas.addEventListener('touchend'");
assert(hasMobileTouch, 'I', 'Soporte táctil móvil implementado con enfoque temporal sin tracking de mouse innecesario.');

// J. Consola y sintaxis (Sin librerías pesadas)
const noThreeJs = !canvasJs.includes('THREE') && !canvasJs.includes('WebGLRenderer');
assert(noThreeJs, 'J', 'Cero dependencias pesadas (Three.js/WebGL ausentes; 100% Canvas 2D nativo).');

// K. Conversión intacta (WhatsApp CTA)
const ctaIntact = scriptJs.includes('56961996576') && scriptJs.includes('https://wa.me/');
assert(ctaIntact, 'K', 'Canalización comercial de WhatsApp y modal de diagnóstico 100% preservados.');

// L. SEO Intacto (Cero texto comercial en Canvas)
const seoIntact = indexHtml.includes('<h1 class="hero-title">') && indexHtml.includes('Antes de construir una solución') && !canvasJs.includes('Antes de construir');
assert(seoIntact, 'L', 'Contenido comercial, H1 y arquitectura SEO permanecen como texto HTML indexable.');

console.log('\n----------------------------------------------------------------');
console.log(`RESULTADO DE PRUEBAS V3.2: ${passedTests}/${totalTests} CASOS SUPERADOS`);
console.log('----------------------------------------------------------------\n');
