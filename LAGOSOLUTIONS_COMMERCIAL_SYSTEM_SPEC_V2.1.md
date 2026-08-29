# LAGOSOLUTIONS — ESPECIFICACIÓN TÉCNICA DEFINITIVA DEL SISTEMA COMERCIAL Y DIAGNÓSTICO (V2.1)
`LAGOSOLUTIONS_COMMERCIAL_SYSTEM_SPEC_V2.1.md`

> **ESTADO DEL DOCUMENTO:** Especificación Maestra Definitiva — Aprobada para Diseño de Base de Datos y Backend.  
> **FECHA DE APROBACIÓN TÉCNICA:** 29 de Agosto de 2026  
> **ÁREA:** Operaciones Comerciales, CRM Consultivo, Expediente de Diagnóstico Basado en Evidencia y Arquitectura de Datos.  
> **REGLA FUNDAMENTAL:** Este documento constituye el diseño canónico final previo a la programación de la Fase 1. No inventa métricas ni benchmarks ficticios. Separa de forma estricta el CRM operativo de la investigación de diagnóstico ($E0-E4$). El frontend permanece 100% intacto.

---

## ÍNDICE

1. [PRINCIPIOS Y REGLAS OPERATIVAS FUNDAMENTALES](#1-principios-y-reglas-operativas-fundamentales)
2. [ARQUITECTURA GENERAL DEL SISTEMA](#2-arquitectura-general-del-sistema)
3. [MODELO DE DATOS Y RELACIONES ENTRE ENTIDADES](#3-modelo-de-datos-y-relaciones-entre-entidades)
4. [FUENTES DE CAPTACIÓN Y TRAZABILIDAD (CON SOPORTE UNKNOWN)](#4-fuentes-de-captacion-y-trazabilidad-con-soporte-unknown)
5. [ESTADOS DEL PIPELINE Y REGLA DE PRÓXIMA ACCIÓN](#5-estados-del-pipeline-y-regla-de-proxima-accion)
6. [HISTORIAL CRONOLÓGICO Y DATOS DERIVADOS CALCULADOS](#6-historial-cronologico-y-datos-derivados-calculados)
7. [EXPEDIENTE DE DIAGNÓSTICO Y EVIDENCE FRAMEWORK (E0–E4)](#7-expediente-de-diagnostico-y-evidence-framework-e0e4)
8. [PROPUESTA MODULAR VERSIONADA (V1, V2, V3...)](#8-propuesta-modular-versionada-v1-v2-v3)
9. [SEPARACIÓN FINANCIERA: DESARROLLO VS. COSTES EXTERNOS](#9-separacion-financiera-desarrollo-vs-costes-externos)
10. [ETAPA POSTPROYECTO Y APRENDIZAJES ACUMULADOS](#10-etapa-postproyecto-y-aprendizajes-acumulados)
11. [DASHBOARD OPERATIVO DE 5 PREGUNTAS CLAVE](#11-dashboard-operativo-de-5-preguntas-clave)
12. [ARQUITECTURA DE SEGURIDAD, RLS Y PRIVACIDAD DE DATOS](#12-arquitectura-de-seguridad-rls-y-privacidad-de-datos)
13. [DECISIONES PENDIENTES, RIESGOS Y QUÉ NO IMPLEMENTAR](#13-decisiones-pendientes-riesgos-y-que-no-implementar)

---

## 1. PRINCIPIOS Y REGLAS OPERATIVAS FUNDAMENTALES

El sistema comercial de LAGOSOLUTIONS se rige por una secuencia operativa clara:

$$\text{CAPTAR} \longrightarrow \text{REGISTRAR} \longrightarrow \text{ENTENDER} \longrightarrow \text{DIAGNOSTICAR} \longrightarrow \text{PROPONER} \longrightarrow \text{SEGUIMIENTO} \longrightarrow \text{CERRAR} \longrightarrow \text{APRENDER}$$

### Las 7 Reglas Inviolables de la V2.1:
1. **Doble Naturaleza del Diagnóstico:**
   - **Primera conversación de entendimiento (`FREE_INITIAL_CONVERSATION`):** Sin coste, orientada a comprender el contexto y evaluar si existe justificación para profundizar.
   - **Diagnóstico profundo (`PAID_DIAGNOSTIC`):** Servicio profesional independiente cuando requiera auditoría extensa de datos, procesos, planillas o investigación técnica.
   - **Otras modalidades:** `INCLUDED_IN_PROJECT` (incluido en el alcance acordado) o `NOT_APPLICABLE` (casos de no intervención).
2. **Priorización Cualitativa (Cero Scoring Arbitrario):** La prioridad (`ALTA`, `MEDIA`, `BAJA`, `REQUIERE INFORMACIÓN`) se determina por el encaje del negocio, claridad del dolor, urgencia, capacidad de decisión y evidencia disponible, **nunca de forma automática por la facturación**.
3. **Cero Benchmarks Inventados:** No se asumen tasas de conversión teóricas. Se registran eventos reales para construir el histórico propio.
4. **Regla de Próxima Acción Obligatoria:** Ningún lead activo puede quedar sin `next_action`, `next_action_date` y `next_action_owner`.
5. **Datos Derivados Calculados:** Tiempos como el $TTR$ (Tiempo de Primera Respuesta) se calculan mediante funciones sobre marcas de tiempo originales (`created_at`, `first_contact_at`), evitando inconsistencias por edición manual.
6. **Versionado Inmutable de Propuestas:** Las propuestas no se sobrescriben. Cada cambio genera una nueva versión (`V1`, `V2`, `V3`) congelada en el tiempo.
7. **Privacidad y Datos Legítimos:** Solo se almacenan los datos necesarios para gestionar la solicitud y se informa al usuario mediante el mecanismo de privacidad correspondiente. Queda prohibido el almacenamiento de volcados completos de chats de WhatsApp.

---

## 2. ARQUITECTURA GENERAL DEL SISTEMA

```
                         LAGOSOLUTIONS.CL
                                │
                                ▼
                         CONTACTO / LEAD
                                │
                                ▼ (HTTPS POST / Zod Validation)
                         CRM COMERCIAL
                                │
                  ┌─────────────┴─────────────┐
                  ▼                           ▼
           SEGUIMIENTO                 CUALIFICACIÓN
        (Próxima Acción)           (Contexto & Encaje)
                  │                           │
                  └─────────────┬─────────────┘
                                ▼
                         CONVERSACIÓN
                                │
                                ▼
                         ¿DIAGNÓSTICO?
                         /             \
                       NO              SÍ
                       │                │
                       ▼                ▼
                    CERRAR        EXPEDIENTE
                  (Honestidad)          │
                                        ▼
                                    E0 → E4
                                (Evidence Matrix)
                                        │
                                        ▼
                                    HALLAZGOS
                                        │
                                        ▼
                                   OPORTUNIDAD
                                        │
                                        ▼
                                   ALTERNATIVAS
                                        │
                                        ▼
                                    VEREDICTO
                         ┌────────────┼────────────┐
                         ▼            ▼            ▼
                     OPTIMIZAR     ADAPTAR     CONSTRUIR
                         │            │            │
                         └────────────┼────────────┘
                                      ▼
                              PROPUESTA MODULAR
                              (V1 → V2 → V3...)
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                      GANADO                    PERDIDO
                         │                         │
                         ▼                         ▼
                     PROYECTO                 APRENDIZAJE
                         │                  (Motivo Real)
                         ▼
                    POSTPROYECTO
                  (30-60 Días Post)
                         │
                         ▼
                 NUEVA OPORTUNIDAD /
                    PARTNERSHIP
```

---

## 3. MODELO DE DATOS Y RELACIONES ENTRE ENTIDADES

Esquema relacional en PostgreSQL / TypeScript con tipado estricto.

```
┌─────────────────┐       1:N       ┌──────────────────────┐
│   LeadContact   │────────────────►│    LeadActivityLog   │
└────────┬────────┘                 └──────────────────────┘
         │
         │ 1:1 (Opcional)
         ▼
┌─────────────────┐       1:N       ┌──────────────────────┐
│DiagnosticCaseFile│────────────────►│  ModularProposal     │
└─────────────────┘                 └──────────┬───────────┘
                                               │
                                               │ 1:N (Versionado)
                                               ▼
                                    ┌──────────────────────┐
                                    │   ProposalVersion    │
                                    │    (V1, V2, V3...)   │
                                    └──────────────────────┘
```

### 3.1 Entidad `LeadContact` (CRM Comercial)

```typescript
export type PriorityClassification = 
  | 'ALTA_PRIORIDAD'        // Operación activa + decisor directo + dolor claro + evidencia disponible
  | 'PRIORIDAD_MEDIA'       // Empresa activa con necesidad difusa o sin urgencia inmediata
  | 'BAJA_PRIORIDAD'        // Proyecto en fase de idea sin tracción / presupuesto incompatible
  | 'REQUIERE_INFORMACION'; // Faltan datos esenciales para evaluar

export type PipelineStage = 
  | '01_NUEVO_CONTACTO'
  | '02_CONTACTO_INICIADO'
  | '03_EN_CONVERSACION'
  | '04_DIAGNOSTICO_AGENDADO'
  | '05_DIAGNOSTICO_EN_PROCESO'
  | '06_INFORME_ENTREGADO'
  | '07_PROPUESTA_ENVIADA'
  | '08_PROPUESTA_EN_REVISION'
  | '09_CERRADO_GANADO'
  | '10_CERRADO_NO_INTERVENIR' // Cierre honesto: no amerita desarrollo
  | '11_CERRADO_PERDIDO';      // Rechazado por precio / prioridad / competencia

export interface LeadContact {
  id: string;                         // UUID v4
  created_at: string;                 // ISO 8601 (Timestamp inmutable de entrada)
  updated_at: string;                 // ISO 8601
  first_contact_at?: string;          // ISO 8601 (Timestamp inmutable de primera respuesta)

  // Datos de Contacto
  full_name: string;
  company_name: string;
  website_url?: string;
  contact_value: string;              // Teléfono WhatsApp (+569...) o Correo
  preferred_channel: 'WhatsApp' | 'Email';

  // Trazabilidad de Captación
  acquisition_source: AcquisitionSource;
  acquisition_metadata?: AcquisitionMetadata;

  // Estado y Clasificación
  pipeline_stage: PipelineStage;
  classification: PriorityClassification;
  classification_reason?: string;

  // Próxima Acción Obligatoria (Garantía Operativa)
  next_action: string;                // Ej: "Llamada de contexto", "Enviar informe de diagnóstico"
  next_action_date: string;           // YYYY-MM-DD
  next_action_owner: string;          // ID / Nombre del consultor responsable

  // Declaración Inicial del Cliente
  initial_declared_goal: string;
  initial_context_statement: string;

  // Relaciones
  assigned_to?: string;               // ID del consultor
  diagnostic_file_id?: string;        // ID del expediente de diagnóstico (FK)
}
```

### 3.2 Entidad `LeadActivityLog` (Historial Cronológico Completo)

```typescript
export interface LeadActivityLog {
  id: string;
  lead_id: string;                    // FK -> LeadContact.id
  created_at: string;                 // Timestamp inmutable
  author_id: string;                  // Consultor / Sistema
  author_name: string;
  
  event_type: 
    | 'FORM_SUBMITTED'
    | 'STAGE_CHANGED'
    | 'CLASSIFICATION_CHANGED'
    | 'NEXT_ACTION_UPDATED'
    | 'WHATSAPP_INTERACTION'
    | 'EMAIL_SENT'
    | 'PHONE_CALL'
    | 'DIAGNOSTIC_SESSION_HELD'
    | 'DELIVERABLE_SENT'
    | 'PROPOSAL_CREATED'
    | 'PROPOSAL_VERSIONED'
    | 'INTERNAL_NOTE';

  title: string;
  summary: string;                    // Minuta objetiva con hechos relevantes
  metadata?: Record<string, unknown>; // Datos de contexto inmutables
}
```

---

## 4. FUENTES DE CAPTACIÓN Y TRAZABILIDAD (CON SOPORTE `UNKNOWN`)

La ausencia de información nunca debe forzar al consultor a inventar un origen.

```typescript
export type AcquisitionSource = 
  | 'GOOGLE_ORGANIC_SEO'
  | 'GOOGLE_MAPS'
  | 'GOOGLE_ADS'
  | 'LINKEDIN_ORGANIC'
  | 'LINKEDIN_OUTBOUND'
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'WHATSAPP_DIRECT'
  | 'REFERRAL_CLIENT'
  | 'REFERRAL_PARTNER'
  | 'PREVIOUS_CLIENT'
  | 'DIRECT_CONTACT'
  | 'EVENT_NETWORKING'
  | 'OUTBOUND_DIRECT'
  | 'OTHER'
  | 'UNKNOWN';                        // Para casos donde la fuente no fue identificada

export interface AcquisitionMetadata {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_page?: string;
  referral_entity_name?: string;      // Nombre de la persona u organización que refirió
}
```

---

## 5. ESTADOS DEL PIPELINE Y REGLA DE PRÓXIMA ACCIÓN

Cada oportunidad debe tener asignada una siguiente acción comercial con fecha límite y responsable.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       REGLA DE LA PRÓXIMA ACCIÓN                            │
└─────────────────────────────────────────────────────────────────────────────┘

  Todo lead en estado activo (no cerrado) debe contener:
  • NEXT_ACTION:       ¿Qué se debe hacer a continuación?
  • NEXT_ACTION_DATE:  ¿En qué fecha límite?
  • NEXT_ACTION_OWNER: ¿Quién es el responsable de ejecutarlo?

  Si NEXT_ACTION_DATE < HOY  ──► Alerta en Dashboard: "ACCIÓN VENCIDA"
```

---

## 6. HISTORIAL CRONOLÓGICO Y DATOS DERIVADOS CALCULADOS

### Regla de Inmutabilidad de Datos Derivados:
Los datos derivados **nunca se almacenan como campos estáticos editables**. Se calculan dinámicamente o se exponen mediante vistas SQL seguras:

$$\text{TTR (Tiempo de Primera Respuesta)} = \text{EXTRACT(EPOCH FROM (first\_contact\_at} - \text{created\_at})) / 60$$

```sql
-- Vista SQL de Datos Derivados y Tiempos de Respuesta Reales
CREATE OR REPLACE VIEW v_leads_performance AS
SELECT 
    id,
    company_name,
    created_at,
    first_contact_at,
    CASE 
        WHEN first_contact_at IS NOT NULL THEN 
            ROUND((EXTRACT(EPOCH FROM (first_contact_at - created_at)) / 60)::numeric, 1)
        ELSE NULL 
    END AS ttr_minutes,
    CASE 
        WHEN next_action_date < CURRENT_DATE AND pipeline_stage NOT IN ('09_CERRADO_GANADO', '10_CERRADO_NO_INTERVENIR', '11_CERRADO_PERDIDO') THEN TRUE
        ELSE FALSE 
    END AS is_action_overdue
FROM lead_contacts;
```

---

## 7. EXPEDIENTE DE DIAGNÓSTICO Y EVIDENCE FRAMEWORK (E0–E4)

### 7.1 Definición Comercial del Diagnóstico

```typescript
export type DiagnosticCommercialType = 
  | 'FREE_INITIAL_CONVERSATION' // Conversación inicial de entendimiento sin costo (20-30 min)
  | 'PAID_DIAGNOSTIC'           // Auditoría técnica/operativa profunda pagada
  | 'INCLUDED_IN_PROJECT'       // Diagnóstico formal incluido en el alcance del proyecto
  | 'NOT_APPLICABLE';           // No amerita diagnóstico
```

### 7.2 Niveles de Evidencia Rigurosos ($E0-E4$)

```
  [ E0: DECLARATIVO ] ──► Opinión del cliente sin respaldo ("Creo que la web no vende").
  [ E1: OBSERVACIÓN ] ──► Comprobación directa del consultor ("El formulario no tiene selector de canal").
  [ E2: REGISTRO ]    ──► Planillas parciales / historial de cotizaciones de algunos meses.
  [ E3: CONSOLIDADO ] ──► Exportación completa de ERP, facturación SII o registros completos.
  [ E4: DEMOSTRADO ]  ──► Experimento o medición reproducible (embudo medido con Google Tag Manager).
```

### 7.3 Entidad `DiagnosticCaseFile`

```typescript
export interface DiagnosticCaseFile {
  id: string;                         // UUID
  lead_id: string;                    // FK -> LeadContact.id
  created_at: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'DELIVERED';
  diagnostic_type: DiagnosticCommercialType;
  diagnostic_fee?: number;            // Solo si diagnostic_type === 'PAID_DIAGNOSTIC'

  // Indagación en 6 Dimensiones
  declared_problems: Array<{
    area: 'CLIENTES' | 'CAPTACION' | 'VENTAS' | 'OPERACION' | 'DATOS' | 'TECNOLOGIA';
    statement: string;
    evidence_level: 'E0';
  }>;

  observed_evidence: Array<{
    area: 'CLIENTES' | 'CAPTACION' | 'VENTAS' | 'OPERACION' | 'DATOS' | 'TECNOLOGIA';
    description: string;
    evidence_level: 'E1' | 'E2' | 'E3' | 'E4';
    source_document?: string;
  }>;

  // Cadena Causal
  causal_findings: Array<{
    symptom: string;
    probable_cause: string;
    demonstrated_cause?: string;
    opportunity_identified: string;
    qualitative_impact: string;
  }>;

  // Veredicto Metodológico
  final_verdict: 
    | 'OPTIMIZAR'      // Mejorar lo existente sin reemplazarlo
    | 'ADAPTAR'        // Conectar herramientas ante nueva demanda
    | 'CONSTRUIR'      // Nueva infraestructura justificada
    | 'NO_INTERVENIR'; // Veredicto de honestidad profesional

  verdict_justification: string;
}
```

---

## 8. PROPUESTA MODULAR VERSIONADA (V1, V2, V3...)

Cada propuesta está compuesta por versiones inmutables para mantener el registro histórico exacto de cada cotización.

```typescript
export interface ProposalModule {
  module_id: string;
  module_name: string;
  business_purpose: string;           // Qué hace y para quién
  problem_solved: string;             // Qué problema operativo resuelve
  prerequisites: string[];            // Qué necesita para operar
  delivery_time_days: number;
  development_fee: number;            // Inversión de desarrollo LAGOSOLUTIONS
  is_optional: boolean;
  is_selected: boolean;
}

export interface ProposalVersion {
  id: string;                         // UUID
  proposal_id: string;                // FK -> ModularProposal.id
  version_number: number;             // 1, 2, 3...
  created_at: string;                 // Fecha de emisión congelada
  valid_until: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REVISED_SUPERSEDED' | 'REJECTED';
  modules: ProposalModule[];
  
  // Totales de Desarrollo
  total_development_investment: number;
  payment_terms: {
    installments_count: number;
    initial_payment_amount: number;
    subsequent_installments_amount: number;
    conditions_notes: string;
  };
}

export interface ModularProposal {
  id: string;                         // UUID
  diagnostic_id: string;              // FK -> DiagnosticCaseFile.id
  lead_id: string;                    // FK -> LeadContact.id
  created_at: string;
  current_version_number: number;
}
```

---

## 9. SEPARACIÓN FINANCIERA: DESARROLLO VS. COSTES EXTERNOS

El sistema garantiza que los costes operativos de terceros nunca se mezclen con los honorarios de LAGOSOLUTIONS.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 DESGLOSE FINANCIERO ESTRICTO EN PROPUESTA                   │
└─────────────────────────────────────────────────────────────────────────────┘

  A. INVERSIÓN EN DESARROLLO LAGOSOLUTIONS (Honorarios Profesionales)
  ├── Alcance técnico, diseño, desarrollo, pruebas y puesta en producción.
  └── Modalidad de pago: Financiable en cuotas según contrato comercial.

  B. COSTES OPERATIVOS EXTERNOS (Propiedad y pago directo del Cliente)
  ├── Dominio (.cl / .com): NIC Chile / Proveedor ($XX anual directo).
  ├── Infraestructura / Hosting: GitHub Pages / Cloudflare (Gratis / Directo).
  ├── Base de Datos / Backend: Supabase Free / Pro ($XX mensual directo si aplica).
  ├── APIs de Mensajería / Correo: Resend / Twilio / Meta API (Consumo directo).
  └── Licencias de Software de Terceros: Directo con el proveedor.
```

---

## 10. ETAPA POSTPROYECTO Y APRENDIZAJES ACUMULADOS

```typescript
export interface PostProjectReview {
  id: string;
  lead_id: string;                    // FK -> LeadContact.id
  project_delivery_date: string;
  review_date: string;                // 30 a 60 días post-lanzamiento
  consultor_id: string;

  observed_results: {
    what_worked_as_expected: string;
    unexpected_frictions: string;
    client_team_feedback: string;
  };

  partnership_opportunity: {
    new_opportunity_identified: boolean;
    recommended_next_module?: string;
    notes: string;
  };
}

export interface CommercialLearningRecord {
  id: string;
  lead_id: string;
  industry_sector: string;            // Ej: "Arquitectura B2B", "Servicios de Climatización", "Eventos"
  primary_frequent_problem: string;
  acquisition_source: AcquisitionSource;
  closed_status: 'WON' | 'LOST' | 'NO_INTERVENTION';
  loss_reason?: 'PRECIO_ELEVADO' | 'SIN_PRESUPUESTO_ACTUAL' | 'POSTERGADO_FUTURO' | 'PREFIRIO_OTRA_OPCION' | 'SIN_RESPUESTA';
  final_deal_size?: number;
  sales_cycle_days: number;
}
```

---

## 11. DASHBOARD OPERATIVO DE 5 PREGUNTAS CLAVE

El panel interno responde de inmediato a las preguntas cotidianas del consultor:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD OPERATIVO — LAGOSOLUTIONS                      │
└─────────────────────────────────────────────────────────────────────────────┘

1. ¿QUIÉN ENTRÓ?
   • Nuevos Contactos sin responder (Badge de horas transcurridas).

2. ¿DE DÓNDE VINO?
   • Distribución por fuente real (Google SEO, Maps, WhatsApp, Referidos, Unknown).

3. ¿EN QUÉ ESTADO ESTÁ?
   • Resumen del Pipeline (Conversación ──► Diagnóstico ──► Propuesta ──► Cierre).

4. ¿QUÉ TENGO QUE HACER AHORA?
   • Lista priorizada de NEXT_ACTIONS vencidas y para hoy.

5. ¿QUÉ ESTAMOS APRENDIENDO DEL MERCADO?
   • Sectores con mayor tracción, motivos frecuentes de pérdida y ticket promedio real.
```

---

## 12. ARQUITECTURA DE SEGURIDAD, RLS Y PRIVACIDAD DE DATOS

1. **Autenticación & Autorización:**
   - Supabase Auth con autenticación por correo + 2FA para consultores.
   - Roles en base de datos: `ADMIN` y `CONSULTOR`.
2. **Políticas de Row Level Security (RLS):**
   - RLS obligatorio en todas las tablas (`lead_contacts`, `lead_activity_logs`, `diagnostic_case_files`, `modular_proposals`, `proposal_versions`).
   - El rol público `anon` solo tiene permiso de ejecución sobre la función serverless de ingesta (`insert_lead_submission`).
3. **Ingesta Segura y Rate Limiting:**
   - Endpoint protegido por Rate Limiting server-side (máx. 5 envíos por IP/hora) y sanitización XSS.
   - Validación de esquema mediante Zod antes de escribir en base de datos.
4. **Protección de Credenciales:**
   - Cero `service_role` keys en el cliente.
   - Claves de servicio alojadas exclusivamente en variables de entorno seguras del runtime serverless.
5. **Privacidad de Datos:**
   - *Declaración de Privacidad:* "Solo se almacenan los datos necesarios para gestionar la solicitud y se informa al usuario del uso de sus datos mediante el mecanismo de privacidad correspondiente."
   - Prohibido el almacenamiento de volcados de chats de WhatsApp.

---

## 13. DECISIONES PENDIENTES, RIESGOS Y QUÉ NO IMPLEMENTAR

### 13.1 Decisiones Pendientes `[PENDIENTE]`
- [ ] Elegir el canal de alertas para el equipo (Bot privado de Telegram vs. Notificación por Email vía Resend).

### 13.2 Matriz de Riesgos Identificados
- **Riesgo 1: Complejidad en la toma de minutas de diagnóstico.**  
  *Mitigación:* Estructura de formulario simple de una sola vista con casillas $E0-E4$ preconfiguradas.
- **Riesgo 2: Tareas de seguimiento olvidadas.**  
  *Mitigación:* Alerta visual de `NEXT_ACTION` vencida destacada en rojo en el dashboard.

### 13.3 Qué NO Implementar en la Fase 1 `[PROHIBIDO EN FASE 1]`
- ❌ **NO programar algoritmos automáticos de scoring o IA.**
- ❌ **NO implementar pasarelas de pago con tarjeta ni checkout e-commerce.**
- ❌ **NO construir un portal de autoservicio de clientes.**
- ❌ **NO implementar herramientas de tracking invasivo.**

---

> **CERTIFICACIÓN DE FRONTEND:** Se certifica que los archivos [`index.html`](file:///Users/teomusicrecords/Documents/WEB/LAGOSOLUTIONS/index.html), [`style.css`](file:///Users/teomusicrecords/Documents/WEB/LAGOSOLUTIONS/style.css) y [`script.js`](file:///Users/teomusicrecords/Documents/WEB/LAGOSOLUTIONS/script.js) se mantienen **100% inalterados**.
