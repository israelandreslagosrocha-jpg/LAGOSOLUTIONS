(() => {
    'use strict';
    const form = document.getElementById('scope-guide');
    if (!form) return;
    const options = {
        start: ['START · Landing enfocada en contacto', '$200.000 CLP', 'Una página para una oferta concreta, con contenido y canales de contacto.', 'No incluye base de datos propia ni dashboard. Un enlace a WhatsApp facilita iniciar un mensaje; no acredita una consulta recibida.'],
        comercial: ['COMERCIAL · Web para tu empresa', '$400.000 CLP', 'Hasta cinco páginas para organizar servicios, con estructura SEO inicial y medición de contacto según la propuesta.', 'No incorpora backend propio, base de contactos ni panel. Más páginas permiten separar contenidos; no garantizan posiciones en buscadores.'],
        growth: ['GROWTH · Captación con backend', '$700.000 CLP', 'Hasta diez páginas, almacenamiento de consultas y panel privado básico para revisar contactos.', 'El panel básico no equivale a un CMS ni a una aplicación con múltiples roles. Se deben definir datos, accesos y costes de infraestructura.'],
        pro: ['PRO · Gestión comercial y contenido', '$1.000.000 CLP', 'Hasta diez páginas y la gestión comercial, estados de contactos y CMS acordados en el alcance.', 'Los módulos, contenidos editables e integraciones se fijan en la propuesta. No incluye cualquier automatización o función sin límite.'],
        medida: ['A MEDIDA · Producto con procesos propios', 'Desde $1.500.000 CLP', 'Para herramientas con tareas, módulos, usuarios o integraciones que requieren una definición particular.', 'Usuarios, pagos y funcionalidades especiales se evalúan por separado. El precio final depende del alcance y de los servicios externos necesarios.']
    };
    form.addEventListener('submit', event => {
        event.preventDefault();
        const key = document.getElementById('scope-need').value;
        if (!Object.hasOwn(options, key)) return;
        const [title, price, explanation, limit] = options[key];
        for (const [id, value] of Object.entries({'scope-title': title, 'scope-price': price, 'scope-explanation': explanation, 'scope-limit': limit})) document.getElementById(id).textContent = value;
        document.getElementById('scope-plan').href = '/#plan-' + key;
        const result = document.getElementById('scope-result');
        result.hidden = false;
        result.focus();
    });
})();
