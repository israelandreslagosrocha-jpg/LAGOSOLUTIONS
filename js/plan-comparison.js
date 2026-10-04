// Public plan comparison. Uses text nodes so plan content cannot introduce HTML.
document.addEventListener('DOMContentLoaded', () => {
    const plans = {
        start: {
            title: 'START · Presencia enfocada', price: '$200.000 CLP · pago único',
            purpose: 'Para presentar un servicio o una oferta y facilitar consultas.',
            rows: [['Web pública', 'Una landing responsive, con secciones dentro de la misma página.'], ['SEO', 'Base técnica: título, descripción, estructura y preparación para indexación.'], ['Contacto', 'WhatsApp y formulario de contacto con destino acordado.'], ['Gestión interna', 'Sin base de datos propia, dashboard ni editor de contenido.'], ['Por qué elegirlo', 'Tu oferta cabe en una página y atenderás las consultas por tus canales habituales.']]
        },
        comercial: {
            title: 'COMERCIAL · Estructura y medición', price: '$400.000 CLP · pago único',
            purpose: 'Para explicar varios servicios y medir cómo te contactan.',
            rows: [['Web pública', 'Hasta cinco páginas independientes, con navegación entre ellas.'], ['SEO', 'Investigación inicial de búsquedas, metadatos por página, schema y sitemap.'], ['Contacto y medición', 'Formulario a email y WhatsApp; GA4/GTM y eventos de contacto.'], ['Gestión interna', 'Sin base de datos propia, dashboard ni editor de contenido.'], ['Qué añade frente a START', 'Arquitectura de varias páginas, investigación SEO inicial y medición de acciones.']]
        },
        growth: {
            title: 'GROWTH · Captura y organización', price: '$700.000 CLP · pago único',
            purpose: 'Para guardar las consultas y consultar sus datos desde un panel privado.',
            rows: [['Web pública', 'Hasta diez páginas y estructura de servicios, casos y recursos según alcance.'], ['SEO y estrategia', 'Público objetivo, propuesta de valor y páginas por intención de búsqueda.'], ['Captura y medición', 'Backend de formularios, base de datos de contactos y origen de campañas con UTMs.'], ['Gestión interna', 'Dashboard básico con acceso privado para consultar y clasificar contactos. Sin CMS ni CRM con múltiples roles.'], ['Qué añade frente a COMERCIAL', 'Las consultas se guardan en tu sistema; puedes revisarlas y organizarlas desde un panel.']]
        },
        pro: {
            title: 'PRO · Gestión y autonomía', price: '$1.000.000 CLP · pago único',
            purpose: 'Para dar seguimiento comercial y actualizar el contenido acordado.',
            rows: [['Web pública', 'Hasta diez páginas con contenidos editables definidos en la propuesta.'], ['SEO y estrategia', 'Arquitectura comercial, SEO por intención y medición de acciones y campañas.'], ['Captura y medición', 'Backend y base de datos con trazabilidad del origen de consultas.'], ['Gestión interna', 'Panel privado con estados comerciales y CMS para publicar y editar contenido.'], ['Qué añade frente a GROWTH', 'Seguimiento por estados y editor de contenido. Mayor autonomía para operar la web.']]
        },
        medida: {
            title: 'A MEDIDA · Operación específica', price: 'Desde $1.500.000 CLP · cotización',
            purpose: 'Para un negocio que necesita funciones e integraciones específicas.',
            rows: [['Web pública', 'Interfaces y alcance definidos después de evaluar el proyecto.'], ['SEO y estrategia', 'Se acuerdan según el producto y sus objetivos; no se presupone un pack ilimitado.'], ['Captura e integraciones', 'Puede incluir reservas, ecommerce, APIs o automatizaciones según cotización.'], ['Gestión interna', 'Puede incluir CRM, múltiples roles y dashboards avanzados. Cada módulo se cotiza.'], ['Por qué se cotiza', 'La complejidad depende de flujos, permisos, integraciones y volumen de uso. El precio de entrada no incluye todas las funciones posibles.']]
        }
    };
    const a = document.getElementById('compare-plan-a');
    const b = document.getElementById('compare-plan-b');
    const container = document.getElementById('plan-comparison');
    if (!a || !b || !container) return;
    const element = (tag, text, className) => {
        const node = document.createElement(tag);
        node.textContent = text;
        if (className) node.className = className;
        return node;
    };
    const card = (key) => {
        const plan = plans[key];
        const article = element('article', '', 'plan-compare-card');
        article.append(element('h4', plan.title), element('span', plan.price, 'plan-compare-price'), element('p', plan.purpose));
        const list = document.createElement('dl');
        plan.rows.forEach(([name, value]) => list.append(element('dt', name), element('dd', value)));
        const link = element('a', 'Ver alcance del plan ↓');
        link.href = `#plan-${key}`;
        article.append(list, element('p', 'Hosting incluido durante 12 meses. Renovación y servicios externos detallados en la propuesta.'), link);
        return article;
    };
    const render = () => container.replaceChildren(card(a.value), card(b.value));
    a.disabled = false;
    b.disabled = false;
    a.addEventListener('change', render);
    b.addEventListener('change', render);
    render();
});
