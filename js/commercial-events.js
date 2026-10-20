/* Eventos comerciales sin datos del formulario ni URLs de contacto.
 * Este módulo no envía datos: el proveedor de analítica se conecta por separado.
 */
(() => {
    'use strict';
    const events = new Set(['inquiry_open', 'inquiry_prepared', 'contact_channel_open', 'plan_sheet_open', 'project_open', 'generate_lead', 'inquiry_error']);
    const channels = new Set(['whatsapp', 'email', 'phone']);
    const plans = new Set(['start', 'comercial', 'growth', 'pro', 'medida']);
    const projects = new Set(['harmonigrid-com', 'harmonigrid-app', 'bandabruna', 'logos', 'sforzato', 'naty', 'ross']);
    function track(name, properties = {}) {
        if (!events.has(name)) return;
        const safe = {};
        if (channels.has(properties.channel)) safe.channel = properties.channel;
        if (plans.has(properties.plan)) safe.plan = properties.plan;
        if (projects.has(properties.project)) safe.project = properties.project;
        // Analytics must never interrupt contact or navigation.
        try { window.dispatchEvent(new CustomEvent('lagos:measurement', {detail: {name, properties: safe}})); } catch { /* Provider unavailable. */ }
    }
    window.LagoAnalytics = Object.freeze({track});
    document.addEventListener('click', event => {
        const element = event.target.closest('a, button');
        if (!element) return;
        if (element.matches('.trigger-modal')) track('inquiry_open');
        const card = element.closest('.plan-card');
        const plan = card?.id.replace('plan-', '');
        if (element.matches('.btn-plan-download')) track('plan_sheet_open', {plan});
        const project = element.closest('.project-slide')?.id.replace('card-', '');
        if (element.matches('.project-preview, .portfolio-link-btn')) track('project_open', {project});
        const href = element.getAttribute('href') || '';
        let channel;
        if (href.startsWith('mailto:')) channel = 'email';
        else if (href.startsWith('tel:')) channel = 'phone';
        else {
            try { if (new URL(href, window.location.origin).hostname === 'wa.me') channel = 'whatsapp'; } catch { /* Not a URL. */ }
        }
        if (channel) track('contact_channel_open', {channel, plan});
    });
})();
