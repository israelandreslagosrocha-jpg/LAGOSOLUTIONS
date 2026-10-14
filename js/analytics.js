/* GA4: carga solo después de aceptar la medición. Sin publicidad ni datos del formulario. */
(() => {
    'use strict';
    const ID = 'G-6FWR3QW9Q2';
    const KEY = 'lagos.analytics-choice.v1';
    const banner = document.getElementById('measurement-banner');
    if (!banner) return;
    const accept = document.getElementById('measurement-accept');
    const reject = document.getElementById('measurement-reject');
    const settings = document.querySelectorAll('[data-measurement-settings]');
    const status = document.getElementById('measurement-status');
    const validEvents = new Set(['inquiry_open', 'inquiry_prepared', 'contact_channel_open', 'plan_sheet_open', 'project_open', 'generate_lead', 'inquiry_error']);
    const values = {
        channel: new Set(['whatsapp', 'email', 'phone']),
        plan: new Set(['start', 'comercial', 'growth', 'pro', 'medida']),
        project: new Set(['harmonigrid-com', 'harmonigrid-app', 'bandabruna', 'logos', 'sforzato', 'naty'])
    };
    let granted = false, loaded = false, pageViewed = false, previousFocus;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    const cleanPage = () => window.location.origin + window.location.pathname;
    const referrer = () => {
        try { return new URL(document.referrer).origin; } catch { return ''; }
    };
    function enable() {
        if (!['www.lagosolutions.cl', 'lagosolutions.cl'].includes(window.location.hostname)) return;
        granted = true;
        window[`ga-disable-${ID}`] = false;
        if (!loaded) {
            loaded = true;
            gtag('consent', 'default', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
            gtag('consent', 'update', {analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
            gtag('js', new Date());
            gtag('config', ID, {send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: cleanPage(), page_referrer: referrer()});
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
            document.head.append(script);
        } else {
            gtag('consent', 'update', {analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
        }
        if (!pageViewed) {
            pageViewed = true;
            gtag('event', 'page_view', {send_to: ID, page_location: cleanPage(), page_referrer: referrer(), page_title: document.title});
        }
    }
    function disable() {
        granted = false;
        window[`ga-disable-${ID}`] = true;
        if (loaded) gtag('consent', 'update', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
        const hostname = window.location.hostname;
        const domains = new Set(['', hostname, `.${hostname}`, hostname.replace(/^www\./, ''), `.${hostname.replace(/^www\./, '')}`]);
        document.cookie.split(';').map(cookie => cookie.trim().split('=')[0]).filter(name => /^_ga(?:_|$)/.test(name)).forEach(name => {
            domains.forEach(domain => { document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ''} SameSite=Lax; Secure`; });
        });
    }
    function choose(value) {
        try { window.localStorage.setItem(KEY, JSON.stringify({value, at: Date.now()})); } catch { /* Choice remains valid for this page. */ }
        if (value === 'granted') enable(); else disable();
        banner.hidden = true;
        if (status) status.textContent = value === 'granted' ? 'Medición de visitas activada.' : 'Medición de visitas desactivada.';
        previousFocus?.focus();
    }
    accept.addEventListener('click', () => choose('granted'));
    reject.addEventListener('click', () => choose('denied'));
    settings.forEach(button => button.addEventListener('click', () => {
        previousFocus = button;
        banner.hidden = false;
        reject.focus();
    }));
    window.addEventListener('lagos:measurement', event => {
        if (!granted || !validEvents.has(event.detail?.name)) return;
        const properties = {send_to: ID, page_location: cleanPage(), page_referrer: referrer()};
        for (const [key, allowed] of Object.entries(values)) {
            const value = event.detail.properties?.[key];
            if (allowed.has(value)) properties[key] = value;
        }
        gtag('event', event.detail.name, properties);
    });
    let choice;
    try {
        const saved = JSON.parse(window.localStorage.getItem(KEY));
        if (saved && Date.now() - saved.at >= 0 && Date.now() - saved.at < 180 * 86400000) choice = saved.value;
    } catch { /* Ask again if storage is unavailable or invalid. */ }
    if (choice === 'granted') { banner.hidden = true; enable(); }
    else if (choice === 'denied') { banner.hidden = true; disable(); }
    else { window[`ga-disable-${ID}`] = true; banner.hidden = false; }
})();
