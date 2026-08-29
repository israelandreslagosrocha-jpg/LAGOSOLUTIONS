# LAGOSOLUTIONS — ESPECIFICACIÓN TÉCNICA DEL SISTEMA COMERCIAL Y DIAGNÓSTICO INTERNO (V2)
`LAGOSOLUTIONS_COMMERCIAL_SYSTEM_SPEC_V2.md`

> **ESTADO DEL DOCUMENTO:** Especificación Maestra de Arquitectura Comercial, Expediente de Diagnóstico y Motor de Conversión.  
> **FECHA DE REVISIÓN Y APROBACIÓN V2:** 29 de Agosto de 2026  
> **ÁREA:** Operaciones Comerciales, CRM Desacoplado, Diagnóstico Basado en Evidencia y Arquitectura Backend.  
> **REGLA FUNDAMENTAL:** Este documento define la máquina operativa interna de LAGOSOLUTIONS. Prohíbe categóricamente iniciar programación de backend, tablas de Supabase, APIs o dashboards sin antes tener este marco formalmente validado. No inventa benchmarks ni métricas ficticias. Separa estrictamente el CRM comercial de la investigación diagnóstica.

---

## ÍNDICE

1. [PRINCIPIOS Y CORRECCIONES DE LA V2](#1-principios-y-correcciones-de-la-v2)
2. [ARQUITECTURA GENERAL DEL SISTEMA](#2-arquitectura-general-del-sistema)
3. [MODELO DE DATOS Y ENTIDADES (DATA SCHEMAS)](#3-modelo-de-datos-y-entidades-data-schemas)
4. [FUENTES DE CAPTACIÓN Y TRAZABILIDAD](#4-fuentes-de-captacion-y-trazabilidad)
5. [ESTADOS DEL PIPELINE Y GESTIÓN DE CONTACTO (CRM)](#5-estados-del-pipeline-y-gestion-de-contacto-crm)
6. [HISTORIAL CRONOLÓGICO COMPLETO (MEMORIA EMPRESARIAL)](#6-historial-cronologico-completo-memoria-empresarial)
7. [EXPEDIENTE DE DIAGNÓSTICO E INTEGRACIÓN EVIDENCE FRAMEWORK (E0–E4)](#7-expediente-de-diagnostico-e-integracion-evidence-framework-e0e4)
8. [ESTRUCTURA DE PROPUESTA MODULAR ("CARRITO DE SERVICIOS")](#8-estructura-de-propuesta-modular-carrito-de-servicios)
9. [SEPARACIÓN FINANCIERA: DESARROLLO VS. COSTES OPERATIVOS EXTERNOS](#9-separacion-financiera-desarrollo-vs-costes-operativos-externos)
10. [ETAPA DE POSTPROYECTO Y EVOLUCIÓN (PARTNERSHIP NATURAL)](#10-etapa-de-postproyecto-y-evolucion-partnership-natural)
11. [DASHBOARD CONCEPTUAL Y REGISTRO DE APRENDIZAJES](#11-dashboard-conceptual-y-registro-de-aprendizajes)
12. [ARQUITECTURA DE SEGURIDAD, RLS Y PRIVACIDAD DE DATOS](#12-arquitectura-de-seguridad-rls-y-privacidad-de-datos)
13. [DECISIONES PENDIENTES, RIESGOS Y QUÉ NO IMPLEMENTAR TODAVÍA](#13-decisiones-pendientes-riesgos-y-que-no-implementar-todavia)

---

## 1. PRINCIPIOS Y CORRECCIONES DE LA V2

La V2 corrige las desviaciones detectadas en la versión preliminar para asegurar que el sistema automatice la gestión operativa sin desvirtuar la metodología consultiva de LAGOSOLUTIONS.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PRINCIPIO OPERATIVO DE LAGOSOLUTIONS (V2)                   │
└─────────────────────────────────────────────────────────────────────────────┘

  CAPTAR ──► REGISTRAR ──► ENTENDER ──► DIAGNOSTICAR ──► PROPONER ──► SEGUIMIENTO ──► CERRAR ──► APRENDER
```

### Correcciones Obligatorias Integradas:
1. **Eliminación del Scoring Numérico (1-100):** Sustituido por una **clasificación cualitativa objetiva** (`ALTA PRIORIDAD`, `PRIORIDAD MEDIA`, `BAJA PRIORIDAD`, `REQUIERE INFORMACIÓN`). No se asignan puntos artificiales sin histórico estadístico real.
2. **Cero Benchmarks Inventados:** Se eliminan objetivos arbitrarios como `>70%` o `>30%`. El sistema se limita a registrar eventos reales del embudo para descubrir las tasas empíricas propias con el tiempo.
3. **SLA Operativo Interno vs. Promesa Comercial:** No se publicita *"respuesta en 30 min"*. El sistema registra `created_at` y `first_contact_at` para calcular el Tiempo de Primera Respuesta real ($TTR$) sin generar presiones contractuales falsas.
4. **Separación Estructural:**  
   - **CRM Comercial:** Gestiona contactos, procedencia, estados del pipeline y tareas de seguimiento.  
   - **Sistema de Diagnóstico:** Gestiona evidencia observable ($E0-E4$), causas raíz, hipótesis, alternativas y veredictos.
5. **Separación Financiera Estricta:** Distingue el honorario de desarrollo propio (financiable en cuotas) de los costes de infraestructura externa (hosting, dominios, licencias, APIs) que deben ser cubiertos inmediatamente.
6. **Privacidad en WhatsApp:** No se extraen conversaciones privadas completas; solo se registra la minuta empresarial necesaria.

---

## 2. ARQUITECTURA GENERAL DEL SISTEMA

La arquitectura desacopla el frontend estático de alta velocidad (GitHub Pages) de la capa transaccional y de almacenamiento seguro:

```
                                  LAGOSOLUTIONS.CL
                                         │
                                         ▼
                                  WEB / FORMULARIO
                                         │
                                         ▼
                                 INGESTA SEGURA
                       (Serverless Edge Worker / HTTPS POST)
                                         │
                                         ▼
                                BASE DE DATOS (PostgreSQL / Supabase)
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
              CRM COMERCIAL                             DIAGNÓSTICO
            (Contactos / Pipeline)                   (Expediente E0–E4)
                    │                                         │
                    ▼                                         ▼
               SEGUIMIENTO                              OPORTUNIDADES
            (Historial & Alertas)                    (Matriz 6 Áreas)
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         ▼
                                 PROPUESTA MODULAR
                           (Desarrollo vs Costes Externos)
                                         │
                                ┌────────┴────────┐
                                ▼                 ▼
                             GANADO            PERDIDO
                                │                 │
                                ▼                 ▼
                            PROYECTO      APRENDIZAJE MOTIVO
                                │
                                ▼
                           POSTPROYECTO
                    (Resultados & Partnership)
```

---

## 3. MODELO DE DATOS Y ENTIDADES (DATA SCHEMAS)

El sistema se define mediante esquemas relacionales estrictos y tipados en TypeScript / PostgreSQL.

### 3.1 Entidad `LeadContact` (CRM Comercial)

```typescript
export type PriorityClassification = 
  | 'ALTA_PRIORIDAD'        // Operación activa demostrada + interlocutor con poder de decisión + dolor claro
  | 'PRIORIDAD_MEDIA'       // Empresa activa pero con requerimiento difuso o sin urgencia inmediata
  | 'BAJA_PRIORIDAD'        // Proyecto en fase de idea / sin tracción / presupuesto desalineado
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
  created_at: string;                 // ISO 8601 (Hora de entrada)
  updated_at: string;
  first_contact_at?: string;          // ISO 8601 (Hora real del primer contacto)
  time_to_first_response_minutes?: number; // Calculado: (first_contact_at - created_at)

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
    | 'WHATSAPP_INTERACTION'
    | 'EMAIL_SENT'
    | 'PHONE_CALL'
    | 'DIAGNOSTIC_SESSION_HELD'
    | 'DELIVERABLE_SENT'
    | 'PROPOSAL_MODIFIED'
    | 'INTERNAL_NOTE';

  title: string;                      // Ej: "Reunión de diagnóstico realizada"
  summary: string;                    // Minuta objetiva con hechos relevantes
  metadata?: Record<string, unknown>; // Datos de contexto (ej: etapa previa -> nueva)
}
```

---

## 4. FUENTES DE CAPTACIÓN Y TRAZABILIDAD

El sistema registra el origen exacto de cada lead desde el día uno para descubrir posteriormente qué canales generan oportunidades reales.

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
  | 'OTHER';

export interface AcquisitionMetadata {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_page?: string;
  referral_entity_name?: string;      // Nombre de quién refirió
}
```

---

## 5. ESTADOS DEL PIPELINE Y GESTIÓN DE CONTACTO (CRM)

El CRM gestiona las transiciones de estado con reglas operativas claras:

```
[01_NUEVO_CONTACTO] ──► [02_CONTACTO_INICIADO] ──► [03_EN_CONVERSACION]
                                                         │
                                                         ▼
                                             [04_DIAGNOSTICO_AGENDADO]
                                                         │
                                                         ▼
                                            [05_DIAGNOSTICO_EN_PROCESO]
                                                         │
                                                         ▼
                                              [06_INFORME_ENTREGADO]
                                                         │
                                                         ▼
                                               [07_PROPUESTA_ENVIADA]
                                                         │
                                                         ▼
                                             [08_PROPUESTA_EN_REVISION]
                                                         │
                                 ┌───────────────────────┼───────────────────────┐
                                 ▼                       ▼                       ▼
                        [09_CERRADO_GANADO]   [10_CERRADO_NO_INTERVENIR]  [11_CERRADO_PERDIDO]
                                 │                       │                       │
                                 ▼                       ▼                       ▼
                             PROYECTO              MOTIVO: HONESTIDAD        MOTIVO PÉRDIDA
```

### Reglas de Transición:
- Al pasar a `05_DIAGNOSTICO_EN_PROCESO`, se genera automáticamente un `DiagnosticCaseFile` vinculado.
- Para pasar a `09_CERRADO_GANADO`, debe existir una `ModularProposal` aprobada y firmada.
- Si se cierra como `10_CERRADO_NO_INTERVENIR`, se documenta formalmente la razón técnica/financiera en el historial.
- Si se cierra como `11_CERRADO_PERDIDO`, es obligatorio registrar el motivo real (`PRECIO_ELEVADO`, `SIN_PRESUPUESTO_ACTUAL`, `POSTERGADO_FUTURO`, `PREFIRIÓ_OTRA_OPCIÓN`, `SIN_RESPUESTA`).

---

## 6. HISTORIAL CRONOLÓGICO COMPLETO (MEMORIA EMPRESARIAL)

Cada empresa cuenta con una línea de tiempo inmutable. Si un cliente regresa tras 6 meses, cualquier consultor de LAGOSOLUTIONS puede reconstruir toda la historia:

```
[ LÍNEA DE TIEMPO EMPRESARIAL — EJEMPLO ]

29/08/2026 14:32  [FORM_SUBMITTED]        Ingreso por Formulario Web (Fuente: SEO Orgánico).
29/08/2026 15:05  [WHATSAPP_INTERACTION]  Primer contacto enviado por WhatsApp (TTR: 33 min).
30/08/2026 10:15  [STAGE_CHANGED]         Pasa a "04_DIAGNOSTICO_AGENDADO" para el 02/09.
02/09/2026 11:00  [DIAGNOSTIC_HELD]       Sesión de entendimiento (60 min). Relevada evidencia E2 en cotizaciones.
04/09/2026 16:20  [DELIVERABLE_SENT]      Informe de Diagnóstico entregado con Veredicto: ADAPTAR + CONSTRUIR.
06/09/2026 18:00  [PROPOSAL_SENT]         Propuesta Modular enviada ($XXX desarrollo + $YYY hosting/servicios).
10/09/2026 09:30  [PROPOSAL_MODIFIED]     Cliente solicita diferir Módulo 4 y priorizar Módulo 1 y 2.
12/09/2026 15:00  [STAGE_CHANGED]         Pasa a "09_CERRADO_GANADO". Contrato firmado. Inicio fijado para 15/09.
```

---

## 7. EXPEDIENTE DE DIAGNÓSTICO E INTEGRACIÓN EVIDENCE FRAMEWORK (E0–E4)

El expediente de diagnóstico no es un campo de texto en el CRM: es un documento técnico estructurado que garantiza que **ninguna hipótesis sea tratada como un hecho demostrado**.

### 7.1 Niveles de Evidencia (Evidence Framework)

| Nivel | Denominación | Definición Rigurosa |
|:---:|---|---|
| **E0** | **Afirmación Declarativa** | Opinión o percepción del cliente sin respaldo empírico (*"Creemos que la web no vende"*). |
| **E1** | **Observación Directa** | Hecho comprobable a simple vista por el consultor (*"El formulario no tiene selector de canal"*). |
| **E2** | **Registro Histórico Parcial** | Datos existentes pero incompletos (*"Planilla Excel de ventas con 8 meses de registro"*). |
| **E3** | **Datos Consolidados Comprobables** | Registros estructurados y auditables (*"Exportación completa de ERP o facturación SII de 24 meses"*). |
| **E4** | **Correlación / Causa Demostrada** | Experimento o medición reproducible (*"Medición con Tag Manager que demuestra 80% de abandono en paso 2"*). |

### 7.2 Estructura del Expediente `DiagnosticCaseFile`

```typescript
export interface DiagnosticCaseFile {
  id: string;                         // UUID
  lead_id: string;                    // FK -> LeadContact.id
  created_at: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'DELIVERED';

  // 1. Información Declarada vs. Evidencia Observada
  declared_problems: Array<{
    area: 'CLIENTES' | 'CAPTACION' | 'VENTAS' | 'OPERACION' | 'DATOS' | 'TECNOLOGIA';
    statement: string;                // Lo que el cliente dice
    evidence_level: 'E0';
  }>;

  observed_evidence: Array<{
    area: 'CLIENTES' | 'CAPTACION' | 'VENTAS' | 'OPERACION' | 'DATOS' | 'TECNOLOGIA';
    description: string;              // Lo que realmente se comprobó
    evidence_level: 'E1' | 'E2' | 'E3' | 'E4';
    source_document?: string;         // Nombre del archivo / registro auditado
  }>;

  // 2. Cadena Causal de Hallazgos
  causal_findings: Array<{
    symptom: string;                  // Lo observable
    probable_cause: string;           // Hipótesis técnica
    demonstrated_cause?: string;      // Causa probada con evidencia
    opportunity_identified: string;   // Oportunidad concreta de negocio
    estimated_impact_qualitative: string;
  }>;

  // 3. Alternativas y Veredicto Metodológico
  evaluated_alternatives: Array<{
    alternative_name: string;
    description: string;
    pros: string;
    cons: string;
    is_recommended: boolean;
  }>;

  final_verdict: 
    | 'OPTIMIZAR'      // Mejorar lo existente
    | 'ADAPTAR'        // Conectar herramientas
    | 'CONSTRUIR'      // Nueva infraestructura justificada
    | 'NO_INTERVENIR'; // Veredicto de honestidad

  verdict_justification: string;
}
```

---

## 8. ESTRUCTURA DE PROPUESTA MODULAR ("CARRITO DE SERVICIOS")

La propuesta comercial se estructura como un catálogo modular donde cada componente tiene justificación económica e independencia técnica:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PROPUESTA MODULAR — ESTRUCTURA DEL ALCANCE                  │
└─────────────────────────────────────────────────────────────────────────────┘

  [ MÓDULO 1: INFRAESTRUCTURA WEB B2B ]
  • Qué hace: Plataforma web de carga rápida orientada a captación institucional.
  • Para quién sirve: Para empresas que necesitan validar autoridad técnica ante clientes.
  • Problema que resuelve: Presencia web obsoleta o lenta que genera desconfianza.
  • Qué necesita: Dominio, hosting estático y contenidos corporativos.
  • Inversión Desarrollo: $XXX

  [ MÓDULO 2: CANALIZACIÓN COMERCIAL Y WHATSAPP B2B ]
  • Qué hace: Sistema de captura estructurada de prospectos con selector de canal.
  • Para quién sirve: Equipos comerciales que pierden seguimiento de cotizaciones.
  • Problema que resuelve: Mensajes informales perdidos en chats personales.
  • Qué necesita: Número oficial de WhatsApp Business y formularios dedicados.
  • Inversión Desarrollo: $YYY

  [ MÓDULO 3: BASE DE DATOS E INGESTA AUTOMÁTICA ]
  • Qué hace: Registro centralizado y persistente de cada consulta entrante.
  • Para quién sirve: Gerencias que no tienen control de cuántos prospectos entran al mes.
  • Problema que resuelve: Información dispersa en correos personales.
  • Qué necesita: Cuenta en Supabase / Base de datos PostgreSQL.
  • Inversión Desarrollo: $ZZZ
```

### Esquema de la Entidad `ModularProposal`

```typescript
export interface ProposalModule {
  module_id: string;
  module_name: string;
  business_purpose: string;           // Qué hace y para quién
  problem_solved: string;             // Problema operativo que resuelve
  prerequisites: string[];            // Qué necesita para operar
  delivery_time_days: number;
  development_fee: number;            // Inversión de desarrollo LAGOSOLUTIONS
  is_optional: boolean;
  is_selected: boolean;
}

export interface ModularProposal {
  id: string;
  diagnostic_id: string;              // FK -> DiagnosticCaseFile.id
  created_at: string;
  valid_until: string;
  modules: ProposalModule[];
  
  // Totales de Desarrollo Propio
  total_development_investment: number;
  payment_terms: {
    installments_count: number;
    initial_payment_amount: number;
    subsequent_installments_amount: number;
    conditions_notes: string;
  };
}
```

---

## 9. SEPARACIÓN FINANCIERA: DESARROLLO VS. COSTES OPERATIVOS EXTERNOS

El sistema prohíbe explícitamente empaquetar costes de terceros dentro de las cuotas de desarrollo de LAGOSOLUTIONS.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 DESGLOSE FINANCIERO ESTRICTO EN PROPUESTA                   │
└─────────────────────────────────────────────────────────────────────────────┘

  A. INVERSIÓN EN DESARROLLO LAGOSOLUTIONS (Honorarios Profesionales)
  ├── Alcance de ingeniería, diseño, desarrollo, pruebas e implementación.
  └── Modalidad de pago: Financiable en cuotas acordadas según contrato.

  B. COSTES OPERATIVOS EXTERNOS (A nombre y propiedad directa del Cliente)
  ├── Dominio (.cl / .com): NIC Chile / Proveedor ($XX anual directo).
  ├── Infraestructura / Hosting: GitHub Pages / Cloudflare (Gratis o directo).
  ├── Base de Datos / Backend: Supabase Free / Pro ($XX mensual directo si aplica).
  ├── APIs de Mensajería / Correo: Resend / Twilio / Meta API (Consumo directo).
  └── Licencias de Software de Terceros: (Directo del proveedor).
```

* **Regla de Protección de Caja:** LAGOSOLUTIONS nunca absorbe pasivos recurrentes de proveedores externos en sus cobros de desarrollo. El cliente mantiene la titularidad legal de sus cuentas y dominios.

---

## 10. ETAPA DE POSTPROYECTO Y EVOLUCIÓN (PARTNERSHIP NATURAL)

Al finalizar la entrega de un proyecto, el sistema no abandona al cliente. Inicia una etapa de aprendizaje y acompañamiento natural:

```
PROYECTO TERMINADO
       │
       ▼ (30 a 60 días posteriores)
EVALUACIÓN DE RESULTADOS OBSERVADOS
       │
       ├─► ¿Qué funcionó según lo esperado?
       ├─► ¿Qué fricciones nuevas surgieron con el volumen real?
       ├─► ¿Qué aprendió el equipo del cliente?
       └─► ¿Existe una nueva oportunidad que justifique optimizar?
              │
              ▼
    PARTNERSHIP ESTRATÉGICO
    (Acompañamiento, Medición & Módulos Futuros)
```

---

## 11. DASHBOARD CONCEPTUAL Y REGISTRO DE APRENDIZAJES

El panel de control inicial de LAGOSOLUTIONS no es un gráfico decorativo; responde a **4 preguntas clave de gestión**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD OPERATIVO — LAGOSOLUTIONS                      │
└─────────────────────────────────────────────────────────────────────────────┘

1. ¿QUÉ ESTÁ PASANDO HOY?
   • Nuevos Contactos (Sin responder)  • Diagnósticos en Proceso
   • Seguimientos Pendientes (>48h)     • Propuestas en Revisión

2. ¿DE DÓNDE LLEGAN LAS MEJORES OPORTUNIDADES?
   • Google SEO / Maps                 • Referidos
   • WhatsApp Directo                  • Outbound

3. ¿QUÉ PROBLEMAS OPERATIVOS BUSCAN RESOLVER?
   • Fugas en Cotizaciones / Ventas    • Datos Dispersos en Excel
   • Procesos Manuales Lentos          • Renovación Web con Captación

4. REGISTRO DE APRENDIZAJES ACUMULADOS
   • Sectores más receptivos           • Tiempo promedio de ciclo de venta
   • Motivos frecuentes de pérdida     • Oportunidades recurrentes no cubiertas
```

---

## 12. ARQUITECTURA DE SEGURIDAD, RLS Y PRIVACIDAD DE DATOS

La infraestructura backend se regirá por los siguientes estándares de ciberseguridad antes de admitir datos reales:

1. **Autenticación & Autorización:**
   - Autenticación segura vía Supabase Auth (Email + 2FA para consultores).
   - Roles definidos: `ADMIN` (acceso total) y `CONSULTOR` (gestión de leads asignados y diagnósticos).
2. **Políticas de Row Level Security (RLS):**
   - RLS activado en todas las tablas de PostgreSQL.
   - Ninguna consulta anónima tiene acceso de lectura o modificación sobre `LeadContact`, `DiagnosticCaseFile` o `LeadActivityLog`.
3. **Ingesta Segura y Rate Limiting:**
   - Endpoint de formulario protegido mediante Cloudflare Turnstile / Token anti-spam y Rate Limiting server-side (máx. 5 envíos por IP/hora).
   - Validación estricta de esquemas mediante librerías serverless (Zod).
4. **Protección de Credenciales:**
   - Cero `service_role` keys en el cliente.
   - Todas las variables sensibles (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) residen exclusivamente en el entorno seguro de ejecución serverless.
5. **Privacidad en WhatsApp & Minimización:**
   - Prohibido el almacenamiento de volcados de chats completos. Solo se registran resúmenes comerciales pertinentes con consentimiento tácito en el formulario.

---

## 13. DECISIONES PENDIENTES, RIESGOS Y QUÉ NO IMPLEMENTAR TODAVÍA

### 13.1 Decisiones Pendientes `[PENDIENTE]`
- [ ] Definir el canal oficial de alertas inmediatas para el equipo (Bot de Telegram privado vs. Notificación Push a dispositivo móvil).
- [ ] Establecer el umbral de facturación estimada para clasificar automáticamente un lead como `ALTA_PRIORIDAD`.

### 13.2 Matriz de Riesgos Identificados
- **Riesgo 1: Complejidad excesiva de carga manual.** Si llenar el expediente de diagnóstico toma demasiado tiempo, el consultor no lo usará.  
  *Mitigación:* Crear plantillas ágiles de 1 página con campos clave desplegables.
- **Riesgo 2: Retraso en el seguimiento.** Perder oportunidades por falta de tiempo de respuesta.  
  *Mitigación:* Alerta instantánea al móvil tras cada solicitud web.

### 13.3 Qué NO Implementar Todavía `[NO IMPLEMENTAR EN FASE 1]`
- ❌ **NO crear algoritmos de Scoring de Inteligencia Artificial:** No hay base estadística para justificarlo.
- ❌ **NO implementar pasarelas de pago automatizadas tipo checkout e-commerce:** Los proyectos B2B se pagan contra factura y transferencia bancaria directa.
- ❌ **NO crear un portal de autoservicio de clientes:** Innecesario y costoso de mantener en la etapa inicial.
- ❌ **NO instalar herramientas pesadas de tracking invasivo:** Mantener el respeto a la privacidad del usuario.

---

> **VERIFICACIÓN DE FRONTEND:** Se certifica que los archivos [`index.html`](file:///Users/teomusicrecords/Documents/WEB/LAGOSOLUTIONS/index.html), [`style.css`](file:///Users/teomusicrecords/Documents/WEB/LAGOSOLUTIONS/style.css) y [`script.js`](file:///Users/teomusicrecords/Documents/WEB/LAGOSOLUTIONS/script.js) se mantienen **100% inalterados**.
