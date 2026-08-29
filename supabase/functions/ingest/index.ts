// ==========================================================================
// LAGOSOLUTIONS — SUPABASE EDGE FUNCTION: /functions/v1/ingest
// Runtime: Deno (TypeScript / Supabase Edge Runtime)
// ==========================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Encabezados CORS estándar
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json"
};

// Sanitizador de texto básico
function sanitize(str: string): string {
    if (typeof str !== "string") return "";
    return str.trim()
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#x27;")
              .replace(/\//g, "&#x2F;");
}

// Generador de Hash de Idempotencia mediante Web Crypto API nativa
async function generateIdempotencyHash(company: string, email: string, goal: string): Promise<string> {
    const hourBucket = Math.floor(Date.now() / (1000 * 60 * 60)); // Ventana de 1 hora
    const raw = `${company.toLowerCase().trim()}_${email.toLowerCase().trim()}_${goal.trim()}_${hourBucket}`;
    const msgBuffer = new TextEncoder().encode(raw);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// In-Memory Rate Limiter (Ventana de 1 hora, máx. 5 peticiones por IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 });
        return { allowed: true };
    }

    if (entry.count >= 5) {
        return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
    }

    entry.count += 1;
    return { allowed: true };
}

// Validador del Payload de Entrada
interface IngestPayload {
    name: string;
    company: string;
    website?: string;
    email: string;
    channel?: string;
    goal?: string;
    problem: string;
    source?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
}

function validateInput(data: any): { isValid: boolean; errors: string[]; cleanData?: IngestPayload } {
    const errors: string[] = [];

    if (!data || typeof data !== "object") {
        return { isValid: false, errors: ["Payload inválido."] };
    }

    const name = sanitize(data.name || "");
    const company = sanitize(data.company || "");
    const website = sanitize(data.website || "");
    const email = sanitize(data.email || "");
    const channel = sanitize(data.channel || "WhatsApp");
    const goal = sanitize(data.goal || "⭐ No estoy seguro. Quiero entender primero qué necesita mi empresa");
    const problem = sanitize(data.problem || "");
    const source = sanitize(data.source || "UNKNOWN");

    if (name.length < 2 || name.length > 120) errors.push("El nombre debe tener entre 2 y 120 caracteres.");
    if (company.length < 2 || company.length > 150) errors.push("El nombre de la empresa debe tener entre 2 y 150 caracteres.");
    if (email.length < 5 || email.length > 150) errors.push("El contacto debe tener entre 5 y 150 caracteres.");
    if (problem.length < 5 || problem.length > 2000) errors.push("El contexto debe tener entre 5 y 2000 caracteres.");

    const validSources = [
        "GOOGLE_ORGANIC_SEO", "GOOGLE_MAPS", "GOOGLE_ADS", 
        "LINKEDIN_ORGANIC", "LINKEDIN_OUTBOUND", "INSTAGRAM", "FACEBOOK", 
        "WHATSAPP_DIRECT", "REFERRAL_CLIENT", "REFERRAL_PARTNER", 
        "PREVIOUS_CLIENT", "DIRECT_CONTACT", "EVENT_NETWORKING", 
        "OUTBOUND_DIRECT", "OTHER", "UNKNOWN"
    ];
    const normalizedSource = validSources.includes(source) ? source : "UNKNOWN";

    return {
        isValid: errors.length === 0,
        errors,
        cleanData: {
            name,
            company,
            website,
            email,
            channel: ["WhatsApp", "Email"].includes(channel) ? channel : "WhatsApp",
            goal,
            problem,
            source: normalizedSource,
            utm_source: sanitize(data.utm_source || ""),
            utm_medium: sanitize(data.utm_medium || ""),
            utm_campaign: sanitize(data.utm_campaign || "")
        }
    };
}

// Despachador de Correo de Alerta vía Resend API (Opcional si RESEND_API_KEY está configurada)
async function sendAlertEmail(lead: IngestPayload, resendApiKey: string | undefined) {
    if (!resendApiKey) return;

    try {
        await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "LAGOSOLUTIONS Alertas <alertas@lagosolutions.cl>",
                to: [Deno.env.get("INTERNAL_ALERT_EMAIL") || "contacto@lagosolutions.cl"],
                subject: `[NUEVO LEAD B2B] ${lead.company} — ${lead.name}`,
                html: `
                    <h2>Nueva Solicitud de Diagnóstico</h2>
                    <p><strong>Empresa:</strong> ${lead.company}</p>
                    <p><strong>Contacto:</strong> ${lead.name} (${lead.email})</p>
                    <p><strong>Canal Preferido:</strong> ${lead.channel}</p>
                    <p><strong>Fuente:</strong> ${lead.source}</p>
                    <p><strong>Objetivo:</strong> ${lead.goal}</p>
                    <p><strong>Contexto:</strong> ${lead.problem}</p>
                `
            })
        });
    } catch (err) {
        console.error("[RESEND_ALERT_ERROR]", err);
    }
}

// Handler Principal Deno.serve
Deno.serve(async (req: Request) => {
    // 1. Manejo de Preflight CORS OPTIONS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders, status: 200 });
    }

    if (req.method !== "POST") {
        return new Response(JSON.stringify({ success: false, error: "Método no permitido." }), {
            headers: corsHeaders,
            status: 405
        });
    }

    const clientIp = req.headers.get("x-forwarded-for") || "unknown_ip";

    // 2. Rate Limiting
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
        return new Response(JSON.stringify({ success: false, error: "Demasiadas solicitudes. Intente más tarde." }), {
            headers: { ...corsHeaders, "Retry-After": String(rateCheck.retryAfter) },
            status: 429
        });
    }

    // 3. Límite de Tamaño del Payload (15 KB)
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).length > 15360) {
        return new Response(JSON.stringify({ success: false, error: "Payload demasiado grande." }), {
            headers: corsHeaders,
            status: 413
        });
    }

    // 4. Validación de Entrada
    let parsedBody: any;
    try {
        parsedBody = JSON.parse(rawBody);
    } catch {
        return new Response(JSON.stringify({ success: false, error: "JSON malformado." }), {
            headers: corsHeaders,
            status: 400
        });
    }

    const validation = validateInput(parsedBody);
    if (!validation.isValid || !validation.cleanData) {
        return new Response(JSON.stringify({ success: false, errors: validation.errors }), {
            headers: corsHeaders,
            status: 400
        });
    }

    const lead = validation.cleanData;
    const idempotencyHash = await generateIdempotencyHash(lead.company, lead.email, lead.goal || "");

    // 5. Inserción en Base de Datos Supabase
    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase.rpc("ingest_public_lead", {
            p_full_name: lead.name,
            p_company_name: lead.company,
            p_website_url: lead.website || null,
            p_contact_value: lead.email,
            p_preferred_channel: lead.channel,
            p_initial_goal: lead.goal,
            p_initial_problem: lead.problem,
            p_source: lead.source,
            p_utm_source: lead.utm_source || null,
            p_utm_medium: lead.utm_medium || null,
            p_utm_campaign: lead.utm_campaign || null,
            p_idempotency_hash: idempotencyHash
        });

        if (error) {
            console.error("[DATABASE_RPC_ERROR]", error);
            throw new Error("Error interno de persistencia.");
        }

        // 6. Alerta por Email si es un lead nuevo
        if (data && data.status === "LEAD_CREATED") {
            const resendApiKey = Deno.env.get("RESEND_API_KEY");
            await sendAlertEmail(lead, resendApiKey);
        }

        return new Response(JSON.stringify({
            success: true,
            status: data?.status || "PROCESSED",
            lead_id: data?.lead_id
        }), {
            headers: corsHeaders,
            status: 200
        });

    } catch (err) {
        console.error("[INGEST_RUNTIME_ERROR]", err);
        return new Response(JSON.stringify({
            success: false,
            error: "No se pudo procesar la solicitud en este momento."
        }), {
            headers: corsHeaders,
            status: 500
        });
    }
});
