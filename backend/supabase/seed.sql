-- ==========================================================================
-- LAGOSOLUTIONS — SEED DATA DE PRUEBA Y ESTRUCTURA INICIAL (FASE 1)
-- ==========================================================================

-- 1. Insertar Leads Semilla para Verificación de Dashboard
INSERT INTO public.lead_contacts (
    id,
    created_at,
    first_contact_at,
    full_name,
    company_name,
    website_url,
    contact_value,
    preferred_channel,
    acquisition_source,
    pipeline_stage,
    classification,
    next_action,
    next_action_date,
    initial_declared_goal,
    initial_context_statement
) VALUES 
(
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '90 minutes',
    'Rodrigo Valenzuela',
    'Servicios Industriales Norte SpA',
    'https://sinorte.cl',
    '+56987654321',
    'WhatsApp',
    'GOOGLE_ORGANIC_SEO',
    '02_CONTACTO_INICIADO',
    'ALTA_PRIORIDAD',
    'Llamada de contexto y confirmación de agenda para diagnóstico',
    CURRENT_DATE,
    'VENTAS — Mejorar seguimiento y tiempos de cotización',
    'Tenemos muchas solicitudes de cotización semanales por correo y WhatsApp pero tardamos hasta 4 días en enviar el presupuesto formal.'
),
(
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '22 hours',
    'Camila Soto',
    'Consultores Ambientales Sur',
    'https://ambientalsur.cl',
    'contacto@ambientalsur.cl',
    'Email',
    'REFERRAL_CLIENT',
    '05_DIAGNOSTICO_EN_PROCESO',
    'ALTA_PRIORIDAD',
    'Entregar informe de diagnóstico con hallazgos en planillas Excel',
    CURRENT_DATE + INTERVAL '2 days',
    'DATOS — Ordenar información dispersa para decidir mejor',
    'Llevamos 6 años facturando con clientes recurrentes pero toda la información está en 14 planillas Excel distintas sin cruzar.'
),
(
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    NOW() - INTERVAL '4 hours',
    NULL,
    'Manuel Morales',
    'Transportes & Carga Central',
    NULL,
    '+56911223344',
    'WhatsApp',
    'UNKNOWN',
    '01_NUEVO_CONTACTO',
    'REQUIERE_INFORMACION',
    'Revisar solicitud web y realizar primer contacto',
    CURRENT_DATE,
    '⭐ No estoy seguro. Quiero entender primero qué necesita mi empresa',
    'Queremos ordenar la captación de clientes de flotas para empresas mineras.'
);

-- 2. Insertar Logs de Actividad para los Leads Semilla
INSERT INTO public.lead_activity_logs (
    lead_id,
    author_name,
    event_type,
    title,
    summary,
    metadata
) VALUES 
(
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Sistema Web',
    'FORM_SUBMITTED',
    'Solicitud de Diagnóstico Recibida',
    'Lead ingresado vía formulario web. Canal: WhatsApp. Fuente: GOOGLE_ORGANIC_SEO.',
    '{"source": "GOOGLE_ORGANIC_SEO"}'::jsonb
),
(
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Israel Lagos',
    'WHATSAPP_INTERACTION',
    'Primer Mensaje de Contexto Enviado',
    'Se envió mensaje de bienvenida y se ofreció llamada de 15 minutos. TTR: 30 minutos.',
    '{"channel": "WhatsApp"}'::jsonb
),
(
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'Sistema Web',
    'FORM_SUBMITTED',
    'Solicitud de Diagnóstico Recibida',
    'Lead ingresado vía formulario web. Canal: Email. Fuente: REFERRAL_CLIENT.',
    '{"source": "REFERRAL_CLIENT"}'::jsonb
),
(
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'Israel Lagos',
    'DIAGNOSTIC_SESSION_HELD',
    'Sesión de Indagación Operativa',
    'Revisión de planillas históricas de 2023-2025. Se levantó evidencia nivel E2 en 8 archivos Excel.',
    '{"evidence_level": "E2"}'::jsonb
);

-- 3. Insertar Expediente de Diagnóstico Semilla
INSERT INTO public.diagnostic_case_files (
    id,
    lead_id,
    status,
    diagnostic_type,
    declared_problems,
    observed_evidence,
    causal_findings,
    final_verdict,
    verdict_justification
) VALUES (
    'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'IN_REVIEW',
    'FREE_INITIAL_CONVERSATION',
    '[
        {
            "area": "DATOS",
            "statement": "El cliente indica que pierde tiempo consolidando reportes mensuales para la gerencia.",
            "evidence_level": "E0"
        }
    ]'::jsonb,
    '[
        {
            "area": "DATOS",
            "description": "Se auditaron 14 planillas Excel. Se verificó que 3 personas dedican 12 horas mensuales a copiar celdas entre archivos.",
            "evidence_level": "E2",
            "source_document": "Planillas_Operacion_2025.xlsx"
        }
    ]'::jsonb,
    '[
        {
            "symptom": "Reportes tardíos a fin de mes",
            "probable_cause": "Falta de centralización relacional de registros",
            "demonstrated_cause": "Duplicación manual de datos entre departamentos",
            "opportunity_identified": "Unificar la base de registros en PostgreSQL y automatizar el tablero mensual",
            "qualitative_impact": "Ahorro de ~36 horas hombre mensuales de personal clave"
        }
    ]'::jsonb,
    'ADAPTAR',
    'No requiere reconstruir el software contable existente; solo adaptar la ingesta de planillas hacia un repositorio centralizado.'
);
