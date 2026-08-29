-- ==========================================================================
-- LAGOSOLUTIONS — FASE 0.5: ESQUEMA MÍNIMO DE INGESTA DE LEADS
-- PostgreSQL / Supabase
-- ==========================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS MÍNIMOS
DO $$ BEGIN
    CREATE TYPE acquisition_source_enum AS ENUM (
        'GOOGLE_ORGANIC_SEO',
        'GOOGLE_MAPS',
        'GOOGLE_ADS',
        'LINKEDIN_ORGANIC',
        'LINKEDIN_OUTBOUND',
        'INSTAGRAM',
        'FACEBOOK',
        'WHATSAPP_DIRECT',
        'REFERRAL_CLIENT',
        'REFERRAL_PARTNER',
        'PREVIOUS_CLIENT',
        'DIRECT_CONTACT',
        'EVENT_NETWORKING',
        'OUTBOUND_DIRECT',
        'OTHER',
        'UNKNOWN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLA: LEAD CONTACTS (MÍNIMA FASE 0.5)
CREATE TABLE IF NOT EXISTS public.lead_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    first_contact_at TIMESTAMPTZ,

    -- Datos de Identificación y Contacto
    full_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    website_url TEXT,
    contact_value TEXT NOT NULL,
    preferred_channel TEXT NOT NULL DEFAULT 'WhatsApp' CHECK (preferred_channel IN ('WhatsApp', 'Email')),

    -- Trazabilidad de Captación
    acquisition_source acquisition_source_enum NOT NULL DEFAULT 'UNKNOWN',
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    landing_page TEXT,

    -- Pipeline Básico
    pipeline_stage TEXT NOT NULL DEFAULT '01_NUEVO_CONTACTO',
    classification TEXT NOT NULL DEFAULT 'REQUIERE_INFORMACION',

    -- Regla de Próxima Acción Inicial
    next_action TEXT NOT NULL DEFAULT 'Revisar solicitud web y realizar primer contacto',
    next_action_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Declaración Inicial del Cliente
    initial_declared_goal TEXT NOT NULL,
    initial_context_statement TEXT NOT NULL,

    -- Idempotencia para evitar duplicados
    idempotency_hash TEXT UNIQUE
);

-- 4. TABLA: HISTORIAL DE ACTIVIDAD (LEAD ACTIVITY LOGS)
CREATE TABLE IF NOT EXISTS public.lead_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.lead_contacts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    author_name TEXT NOT NULL DEFAULT 'Sistema Web',
    event_type TEXT NOT NULL DEFAULT 'FORM_SUBMITTED',
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.lead_contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_idempotency ON public.lead_contacts(idempotency_hash);
CREATE INDEX IF NOT EXISTS idx_activity_lead_id ON public.lead_activity_logs(lead_id);

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.lead_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activity_logs ENABLE ROW LEVEL SECURITY;

-- Denegar acceso directo anónimo a las tablas
DROP POLICY IF EXISTS "Anon no puede leer leads directamente" ON public.lead_contacts;
CREATE POLICY "Anon no puede leer leads directamente"
    ON public.lead_contacts FOR SELECT
    TO anon
    USING (FALSE);

DROP POLICY IF EXISTS "Anon no puede leer logs directamente" ON public.lead_activity_logs;
CREATE POLICY "Anon no puede leer logs directamente"
    ON public.lead_activity_logs FOR SELECT
    TO anon
    USING (FALSE);

-- 7. FUNCIÓN TRANSACCIONAL SEGURA (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.ingest_public_lead(
    p_full_name TEXT,
    p_company_name TEXT,
    p_website_url TEXT,
    p_contact_value TEXT,
    p_preferred_channel TEXT,
    p_initial_goal TEXT,
    p_initial_problem TEXT,
    p_source acquisition_source_enum,
    p_utm_source TEXT DEFAULT NULL,
    p_utm_medium TEXT DEFAULT NULL,
    p_utm_campaign TEXT DEFAULT NULL,
    p_idempotency_hash TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_new_lead_id UUID;
    v_existing_lead_id UUID;
BEGIN
    -- 1. Comprobación de idempotencia
    IF p_idempotency_hash IS NOT NULL THEN
        SELECT id INTO v_existing_lead_id 
        FROM public.lead_contacts 
        WHERE idempotency_hash = p_idempotency_hash;

        IF v_existing_lead_id IS NOT NULL THEN
            RETURN jsonb_build_object(
                'success', true,
                'status', 'IDEMPOTENT_DUPLICATE_IGNORED',
                'lead_id', v_existing_lead_id
            );
        END IF;
    END IF;

    -- 2. Inserción de Lead
    INSERT INTO public.lead_contacts (
        full_name,
        company_name,
        website_url,
        contact_value,
        preferred_channel,
        initial_declared_goal,
        initial_context_statement,
        acquisition_source,
        utm_source,
        utm_medium,
        utm_campaign,
        idempotency_hash,
        next_action,
        next_action_date
    ) VALUES (
        p_full_name,
        p_company_name,
        p_website_url,
        p_contact_value,
        p_preferred_channel,
        p_initial_goal,
        p_initial_problem,
        p_source,
        p_utm_source,
        p_utm_medium,
        p_utm_campaign,
        p_idempotency_hash,
        'Revisar solicitud web y realizar primer contacto',
        CURRENT_DATE
    ) RETURNING id INTO v_new_lead_id;

    -- 3. Inserción de Log de Actividad
    INSERT INTO public.lead_activity_logs (
        lead_id,
        author_name,
        event_type,
        title,
        summary,
        metadata
    ) VALUES (
        v_new_lead_id,
        'Sistema Web',
        'FORM_SUBMITTED',
        'Solicitud de Diagnóstico Recibida',
        format('Lead ingresado vía formulario web. Canal: %s. Fuente: %s.', p_preferred_channel, p_source),
        jsonb_build_object(
            'initial_goal', p_initial_goal,
            'source', p_source,
            'preferred_channel', p_preferred_channel
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'status', 'LEAD_CREATED',
        'lead_id', v_new_lead_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
