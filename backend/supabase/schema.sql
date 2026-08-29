-- ==========================================================================
-- LAGOSOLUTIONS — MASTER DATABASE SCHEMA & RLS POLICIES (FASE 1)
-- PostgreSQL / Supabase Engine
-- Compatible con: Supabase CLI / Direct PostgreSQL 15+
-- ==========================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUM PERSONALIZADOS
DO $$ BEGIN
    CREATE TYPE priority_classification_enum AS ENUM (
        'ALTA_PRIORIDAD',
        'PRIORIDAD_MEDIA',
        'BAJA_PRIORIDAD',
        'REQUIERE_INFORMACION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pipeline_stage_enum AS ENUM (
        '01_NUEVO_CONTACTO',
        '02_CONTACTO_INICIADO',
        '03_EN_CONVERSACION',
        '04_DIAGNOSTICO_AGENDADO',
        '05_DIAGNOSTICO_EN_PROCESO',
        '06_INFORME_ENTREGADO',
        '07_PROPUESTA_ENVIADA',
        '08_PROPUESTA_EN_REVISION',
        '09_CERRADO_GANADO',
        '10_CERRADO_NO_INTERVENIR',
        '11_CERRADO_PERDIDO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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

DO $$ BEGIN
    CREATE TYPE diagnostic_type_enum AS ENUM (
        'FREE_INITIAL_CONVERSATION',
        'PAID_DIAGNOSTIC',
        'INCLUDED_IN_PROJECT',
        'NOT_APPLICABLE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evidence_level_enum AS ENUM (
        'E0', -- Declaración del cliente
        'E1', -- Observación directa
        'E2', -- Registro histórico parcial
        'E3', -- Datos consolidados comprobables
        'E4'  -- Causa demostrada / Experimento reproducible
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE final_verdict_enum AS ENUM (
        'OPTIMIZAR',
        'ADAPTAR',
        'CONSTRUIR',
        'NO_INTERVENIR'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM (
        'ADMIN',
        'CONSULTOR'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLA: PERFILES DE USUARIO Y ROLES INTERNOS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'CONSULTOR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA PRINCIPAL: LEAD CONTACTS (CRM)
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
    referral_entity_name TEXT,

    -- Pipeline y Cualificación
    pipeline_stage pipeline_stage_enum NOT NULL DEFAULT '01_NUEVO_CONTACTO',
    classification priority_classification_enum NOT NULL DEFAULT 'REQUIERE_INFORMACION',
    classification_reason TEXT,

    -- Regla de Próxima Acción (Garantía Operativa)
    next_action TEXT NOT NULL DEFAULT 'Revisar contexto inicial y realizar primer contacto',
    next_action_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_action_owner UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Declaración Inicial del Cliente
    initial_declared_goal TEXT NOT NULL,
    initial_context_statement TEXT NOT NULL,

    -- Clave de Idempotencia para prevención de duplicados
    idempotency_hash TEXT UNIQUE,

    -- Flags de Auditoría y Retención
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    anonymized_at TIMESTAMPTZ
);

-- 5. TABLA: HISTORIAL CRONOLÓGICO DE ACTIVIDAD (LEAD ACTIVITY LOG)
CREATE TABLE IF NOT EXISTS public.lead_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.lead_contacts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL DEFAULT 'Sistema',
    
    event_type TEXT NOT NULL CHECK (event_type IN (
        'FORM_SUBMITTED',
        'STAGE_CHANGED',
        'CLASSIFICATION_CHANGED',
        'NEXT_ACTION_UPDATED',
        'WHATSAPP_INTERACTION',
        'EMAIL_SENT',
        'PHONE_CALL',
        'DIAGNOSTIC_SESSION_HELD',
        'DELIVERABLE_SENT',
        'PROPOSAL_CREATED',
        'PROPOSAL_VERSIONED',
        'INTERNAL_NOTE'
    )),

    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 6. TABLA: EXPEDIENTE DE DIAGNÓSTICO (DIAGNOSTIC CASE FILE)
CREATE TABLE IF NOT EXISTS public.diagnostic_case_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL UNIQUE REFERENCES public.lead_contacts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IN_REVIEW', 'DELIVERED')),
    
    diagnostic_type diagnostic_type_enum NOT NULL DEFAULT 'FREE_INITIAL_CONVERSATION',
    diagnostic_fee NUMERIC(12, 2) DEFAULT 0.00,

    -- Información en 6 Dimensiones (E0 a E4)
    declared_problems JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de { area, statement, evidence_level: 'E0' }
    observed_evidence JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de { area, description, evidence_level, source_document }
    causal_findings JSONB NOT NULL DEFAULT '[]'::jsonb,   -- Array de { symptom, probable_cause, demonstrated_cause, opportunity_identified, qualitative_impact }

    -- Veredicto Metodológico
    final_verdict final_verdict_enum NOT NULL DEFAULT 'OPTIMIZAR',
    verdict_justification TEXT NOT NULL DEFAULT 'Pendiente de formalización'
);

-- 7. TABLA: PROPUESTA MODULAR (MODULAR PROPOSALS)
CREATE TABLE IF NOT EXISTS public.modular_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostic_id UUID NOT NULL REFERENCES public.diagnostic_case_files(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.lead_contacts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_version_number INT NOT NULL DEFAULT 1
);

-- 8. TABLA: VERSIONES INMUTABLES DE PROPUESTAS (PROPOSAL VERSIONS)
CREATE TABLE IF NOT EXISTS public.proposal_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES public.modular_proposals(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '15 days')::DATE,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REVISED_SUPERSEDED', 'REJECTED')),
    
    -- Módulos Seleccionados en esta versión
    modules JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de ProposalModule
    
    -- Separación Financiera Estricta
    total_development_investment NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    external_operational_costs_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Condiciones de Pago
    payment_terms JSONB NOT NULL DEFAULT '{
        "installments_count": 1,
        "initial_payment_amount": 0,
        "subsequent_installments_amount": 0,
        "conditions_notes": "Pago contra factura y entrega por etapas."
    }'::jsonb,

    CONSTRAINT unique_proposal_version UNIQUE (proposal_id, version_number)
);

-- 9. TABLA: REGISTRO DE APRENDIZAJES COMERCIALES
CREATE TABLE IF NOT EXISTS public.commercial_learning_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.lead_contacts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    industry_sector TEXT NOT NULL,
    primary_frequent_problem TEXT NOT NULL,
    acquisition_source acquisition_source_enum NOT NULL,
    closed_status TEXT NOT NULL CHECK (closed_status IN ('WON', 'LOST', 'NO_INTERVENTION')),
    loss_reason TEXT,
    final_deal_size NUMERIC(12, 2),
    sales_cycle_days INT NOT NULL DEFAULT 0
);

-- 10. ÍNDICES DE RENDIMIENTO Y CONSULTA
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON public.lead_contacts(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_leads_classification ON public.lead_contacts(classification);
CREATE INDEX IF NOT EXISTS idx_leads_acquisition_source ON public.lead_contacts(acquisition_source);
CREATE INDEX IF NOT EXISTS idx_leads_next_action_date ON public.lead_contacts(next_action_date);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.lead_contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_lead_id ON public.lead_activity_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_proposals_lead_id ON public.modular_proposals(lead_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_lead_id ON public.diagnostic_case_files(lead_id);

-- 11. VISTAS SQL CALCULADAS (DATOS DERIVADOS DINÁMICOS)
CREATE OR REPLACE VIEW public.v_leads_dashboard AS
SELECT 
    l.id,
    l.company_name,
    l.full_name,
    l.contact_value,
    l.preferred_channel,
    l.pipeline_stage,
    l.classification,
    l.acquisition_source,
    l.next_action,
    l.next_action_date,
    p.full_name AS next_action_owner_name,
    l.created_at,
    l.first_contact_at,
    CASE 
        WHEN l.first_contact_at IS NOT NULL THEN 
            ROUND((EXTRACT(EPOCH FROM (l.first_contact_at - l.created_at)) / 60)::numeric, 1)
        ELSE NULL 
    END AS ttr_minutes,
    CASE 
        WHEN l.next_action_date < CURRENT_DATE 
             AND l.pipeline_stage NOT IN ('09_CERRADO_GANADO', '10_CERRADO_NO_INTERVENIR', '11_CERRADO_PERDIDO') 
        THEN TRUE 
        ELSE FALSE 
    END AS is_action_overdue,
    (SELECT COUNT(*) FROM public.lead_activity_logs a WHERE a.lead_id = l.id) AS total_activities
FROM public.lead_contacts l
LEFT JOIN public.profiles p ON l.next_action_owner = p.id
WHERE l.is_archived = FALSE
ORDER BY l.created_at DESC;

-- 12. TRIGGERS AUTOMÁTICOS PARA updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lead_updated_at ON public.lead_contacts;
CREATE TRIGGER trigger_lead_updated_at
    BEFORE UPDATE ON public.lead_contacts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_diagnostic_updated_at ON public.diagnostic_case_files;
CREATE TRIGGER trigger_diagnostic_updated_at
    BEFORE UPDATE ON public.diagnostic_case_files
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================================================
-- 13. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ==========================================================================

-- Activar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_case_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modular_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_learning_records ENABLE ROW LEVEL SECURITY;

-- Helper function: Comprobar si el usuario actual es ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Comprobar si el usuario está autenticado
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para Profiles
DROP POLICY IF EXISTS "Perfiles legibles por usuarios autenticados" ON public.profiles;
CREATE POLICY "Perfiles legibles por usuarios autenticados"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "Solo admins pueden modificar perfiles" ON public.profiles;
CREATE POLICY "Solo admins pueden modificar perfiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_admin());

-- Políticas para Lead Contacts (CRM)
DROP POLICY IF EXISTS "Consultores autenticados pueden ver leads" ON public.lead_contacts;
CREATE POLICY "Consultores autenticados pueden ver leads"
    ON public.lead_contacts FOR SELECT
    TO authenticated
    USING (public.is_authenticated());

DROP POLICY IF EXISTS "Consultores autenticados pueden modificar leads" ON public.lead_contacts;
CREATE POLICY "Consultores autenticados pueden modificar leads"
    ON public.lead_contacts FOR UPDATE
    TO authenticated
    USING (public.is_authenticated());

DROP POLICY IF EXISTS "Solo admins pueden eliminar leads físicamente" ON public.lead_contacts;
CREATE POLICY "Solo admins pueden eliminar leads físicamente"
    ON public.lead_contacts FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Políticas para Lead Activity Logs
DROP POLICY IF EXISTS "Consultores autenticados pueden ver historial" ON public.lead_activity_logs;
CREATE POLICY "Consultores autenticados pueden ver historial"
    ON public.lead_activity_logs FOR SELECT
    TO authenticated
    USING (public.is_authenticated());

DROP POLICY IF EXISTS "Consultores autenticados pueden registrar actividad" ON public.lead_activity_logs;
CREATE POLICY "Consultores autenticados pueden registrar actividad"
    ON public.lead_activity_logs FOR INSERT
    TO authenticated
    WITH CHECK (public.is_authenticated());

-- Políticas para Diagnostic Case Files
DROP POLICY IF EXISTS "Consultores autenticados pueden ver y editar diagnósticos" ON public.diagnostic_case_files;
CREATE POLICY "Consultores autenticados pueden ver y editar diagnósticos"
    ON public.diagnostic_case_files FOR ALL
    TO authenticated
    USING (public.is_authenticated());

-- Políticas para Modular Proposals y Proposal Versions
DROP POLICY IF EXISTS "Consultores autenticados pueden ver y editar propuestas" ON public.modular_proposals;
CREATE POLICY "Consultores autenticados pueden ver y editar propuestas"
    ON public.modular_proposals FOR ALL
    TO authenticated
    USING (public.is_authenticated());

DROP POLICY IF EXISTS "Consultores autenticados pueden gestionar versiones de propuestas" ON public.proposal_versions;
CREATE POLICY "Consultores autenticados pueden gestionar versiones de propuestas"
    ON public.proposal_versions FOR ALL
    TO authenticated
    USING (public.is_authenticated());

-- Políticas para Commercial Learning Records
DROP POLICY IF EXISTS "Consultores pueden ver aprendizajes de mercado" ON public.commercial_learning_records;
CREATE POLICY "Consultores pueden ver aprendizajes de mercado"
    ON public.commercial_learning_records FOR ALL
    TO authenticated
    USING (public.is_authenticated());

-- 14. FUNCIÓN TRANSACCIONAL DE INGESTA PÚBLICA SEGURA (SECURITY DEFINER)
-- Permite insertar nuevos leads desde la API serverless validando idempotencia
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
    -- 1. Comprobar idempotencia si se proporcionó hash
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

    -- 2. Insertar nuevo registro de lead
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

    -- 3. Insertar log inicial de actividad
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
        format('Lead ingresado vía formulario web. Canal preferido: %s. Fuente: %s.', p_preferred_channel, p_source),
        jsonb_build_object(
            'initial_goal', p_initial_goal,
            'source', p_source,
            'preferred_channel', p_preferred_channel
        )
    );

    -- 4. Retornar confirmación
    RETURN jsonb_build_object(
        'success', true,
        'status', 'LEAD_CREATED',
        'lead_id', v_new_lead_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
