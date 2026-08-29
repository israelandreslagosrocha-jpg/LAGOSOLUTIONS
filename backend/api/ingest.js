// ==========================================================================
// LAGOSOLUTIONS — SECURE LEAD INGESTION HANDLER (FASE 1)
// Serverless / Edge / Node.js Compatible Endpoint
// ==========================================================================

import { createHash } from 'crypto';

// In-Memory Rate Limiting Cache (Máx 5 peticiones por hora por IP)
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora
const RATE_LIMIT_MAX_REQUESTS = 5;

// Sanitización de entrada (XSS & inyecciones)
export const sanitize = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim()
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#x27;")
              .replace(/\//g, "&#x2F;");
};

// Generación de Clave de Idempotencia (Previene envíos duplicados por recarga o doble clic)
export const generateIdempotencyHash = (company, email, goal) => {
    const hourBucket = Math.floor(Date.now() / (1000 * 60 * 60)); // Ventana de 1 hora
    const raw = `${company.toLowerCase().trim()}_${email.toLowerCase().trim()}_${goal.trim()}_${hourBucket}`;
    return createHash('sha256').update(raw).digest('hex');
};

// Validador de Esquema Riguroso
export const validateLeadPayload = (data) => {
    const errors = [];

    if (!data || typeof data !== 'object') {
        return { isValid: false, errors: ['Payload inválido o vacío.'] };
    }

    const name = sanitize(data.name || '');
    const company = sanitize(data.company || '');
    const website = sanitize(data.website || '');
    const email = sanitize(data.email || '');
    const channel = sanitize(data.channel || 'WhatsApp');
    const goal = sanitize(data.goal || '');
    const problem = sanitize(data.problem || '');
    const source = sanitize(data.source || 'UNKNOWN');

    // Reglas de Validación
    if (name.length < 2 || name.length > 120) {
        errors.push('El nombre debe tener entre 2 y 120 caracteres.');
    }
    if (company.length < 2 || company.length > 150) {
        errors.push('El nombre de la empresa debe tener entre 2 y 150 caracteres.');
    }
    if (email.length < 5 || email.length > 150) {
        errors.push('Debe proporcionar un email o teléfono de contacto válido.');
    }
    if (!['WhatsApp', 'Email'].includes(channel)) {
        errors.push('El canal preferido debe ser WhatsApp o Email.');
    }
    if (problem.length < 5 || problem.length > 2000) {
        errors.push('La descripción del contexto debe tener entre 5 y 2000 caracteres.');
    }

    const validSources = [
        'GOOGLE_ORGANIC_SEO', 'GOOGLE_MAPS', 'GOOGLE_ADS', 
        'LINKEDIN_ORGANIC', 'LINKEDIN_OUTBOUND', 'INSTAGRAM', 'FACEBOOK', 
        'WHATSAPP_DIRECT', 'REFERRAL_CLIENT', 'REFERRAL_PARTNER', 
        'PREVIOUS_CLIENT', 'DIRECT_CONTACT', 'EVENT_NETWORKING', 
        'OUTBOUND_DIRECT', 'OTHER', 'UNKNOWN'
    ];
    const normalizedSource = validSources.includes(source) ? source : 'UNKNOWN';

    return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: {
            name,
            company,
            website,
            email,
            channel,
            goal: goal || '⭐ No estoy seguro. Quiero entender primero qué necesita mi empresa',
            problem,
            source: normalizedSource,
            utm_source: sanitize(data.utm_source || ''),
            utm_medium: sanitize(data.utm_medium || ''),
            utm_campaign: sanitize(data.utm_campaign || '')
        }
    };
};

// Middleware de Rate Limiting por IP
export const checkRateLimit = (clientIp) => {
    const now = Date.now();
    const clientData = rateLimitCache.get(clientIp);

    if (!clientData) {
        rateLimitCache.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        return { allowed: true };
    }

    if (now > clientData.resetTime) {
        rateLimitCache.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        return { allowed: true };
    }

    if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
        return { allowed: false, retryAfterSeconds: Math.ceil((clientData.resetTime - now) / 1000) };
    }

    clientData.count += 1;
    return { allowed: true };
};

// Generador del Formato de Alerta por Email (Para el Consultor)
export const buildAlertEmailContent = (lead) => {
    return {
        subject: `[NUEVO LEAD B2B] ${lead.company} — ${lead.name}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #060f22; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #060f22; color: #ffffff; padding: 20px; text-align: center;">
                    <h2 style="margin: 0; color: #10b981;">LAGOSOLUTIONS</h2>
                    <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #94a3b8;">Nueva Solicitud de Diagnóstico Recibida</p>
                </div>
                <div style="padding: 24px; background-color: #ffffff;">
                    <p style="margin-top: 0;"><strong>Empresa:</strong> ${lead.company}</p>
                    <p><strong>Contacto:</strong> ${lead.name} (${lead.email})</p>
                    <p><strong>Canal Preferido:</strong> <span style="background-color: #e8f4f0; color: #137752; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${lead.channel}</span></p>
                    <p><strong>Sitio Web:</strong> ${lead.website || 'No especificado'}</p>
                    <p><strong>Fuente de Captación:</strong> ${lead.source}</p>
                    <p><strong>Objetivo Declarado:</strong> ${lead.goal}</p>
                    <div style="background-color: #f8fafc; border-left: 4px solid #137752; padding: 12px; margin: 16px 0;">
                        <strong>Contexto Actual Declarado:</strong>
                        <p style="margin: 6px 0 0 0; font-size: 0.9rem;">${lead.problem}</p>
                    </div>
                    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 0.8rem; color: #64748b;">
                        <em>Próxima Acción Automática: Revisar solicitud web y coordinar primer contacto.</em>
                    </div>
                </div>
            </div>
        `
    };
};

// Handler Principal de la API
export async function handleIngestRequest(req, dbClient = null, emailClient = null) {
    const clientIp = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    
    // 1. Control de Rate Limiting
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
        return {
            status: 429,
            headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) },
            body: { success: false, error: 'Demasiadas solicitudes enviadas. Por favor intente más tarde.' }
        };
    }

    // 2. Control de Tamaño del Payload (Máx 15 KB)
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (Buffer.byteLength(rawBody, 'utf8') > 15360) {
        return {
            status: 413,
            body: { success: false, error: 'El tamaño de la solicitud excede el límite permitido.' }
        };
    }

    // 3. Validación de Esquema con Zod/Sanitizer
    const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const validation = validateLeadPayload(bodyData);
    if (!validation.isValid) {
        return {
            status: 400,
            body: { success: false, errors: validation.errors }
        };
    }

    const clean = validation.sanitizedData;
    const idempotencyHash = generateIdempotencyHash(clean.company, clean.email, clean.goal);

    try {
        let leadId = `lead_mock_${Date.now()}`;
        let status = 'LEAD_CREATED';

        // 4. Inserción en Base de Datos PostgreSQL si existe cliente conectado
        if (dbClient && typeof dbClient.rpc === 'function') {
            const { data, error } = await dbClient.rpc('ingest_public_lead', {
                p_full_name: clean.name,
                p_company_name: clean.company,
                p_website_url: clean.website || null,
                p_contact_value: clean.email,
                p_preferred_channel: clean.channel,
                p_initial_goal: clean.goal,
                p_initial_problem: clean.problem,
                p_source: clean.source,
                p_utm_source: clean.utm_source || null,
                p_utm_medium: clean.utm_medium || null,
                p_utm_campaign: clean.utm_campaign || null,
                p_idempotency_hash: idempotencyHash
            });

            if (error) {
                console.error('[DATABASE_ERROR]', error);
                throw new Error('Error al registrar la solicitud en base de datos.');
            }

            leadId = data.lead_id;
            status = data.status;
        }

        // 5. Despacho de Alerta Interna por Email (si no es duplicado)
        if (emailClient && status === 'LEAD_CREATED') {
            const alert = buildAlertEmailContent(clean);
            await emailClient.send({
                to: process.env.INTERNAL_ALERT_EMAIL || 'consultor@lagosolutions.cl',
                subject: alert.subject,
                html: alert.html
            }).catch(err => console.error('[EMAIL_ALERT_ERROR]', err));
        }

        return {
            status: 200,
            body: {
                success: true,
                status,
                lead_id: leadId,
                message: clean.channel === 'Email' ? 
                    'Solicitud recibida. Revisaremos su contexto y le responderemos vía Email Corporativo.' : 
                    'Solicitud recibida. Coordinando canal oficial de WhatsApp.'
            }
        };

    } catch (err) {
        console.error('[INGESTION_FATAL_ERROR]', err);
        return {
            status: 500,
            body: { success: false, error: 'Ocurrió un error interno procesando su solicitud. Por favor intente nuevamente o use el canal directo.' }
        };
    }
}
