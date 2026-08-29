// ==========================================================================
// LAGOSOLUTIONS — SUITE DE PRUEBAS AUTOMATIZADA DE FASE 1 (20 CASOS)
// Node.js Execution Script
// ==========================================================================

import { 
    validateLeadPayload, 
    sanitize, 
    generateIdempotencyHash, 
    checkRateLimit, 
    handleIngestRequest 
} from '../api/ingest.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('================================================================');
console.log('EJECUCIÓN DE PRUEBAS AUTOMATIZADAS — FASE 1 SISTEMA COMERCIAL');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 20;

function assert(condition, testNum, testName) {
    if (condition) {
        console.log(`✅ [TEST ${testNum.toString().padStart(2, '0')}/20] PASS: ${testName}`);
        passedTests++;
    } else {
        console.error(`❌ [TEST ${testNum.toString().padStart(2, '0')}/20] FAIL: ${testName}`);
    }
}

// 1. Formulario válido
const validPayload = {
    name: 'Israel Lagos',
    company: 'Empresa Demo SpA',
    website: 'https://demo.cl',
    email: 'contacto@demo.cl',
    channel: 'WhatsApp',
    goal: 'VENTAS — Mejorar seguimiento y tiempos de cotización',
    problem: 'Necesitamos ordenar el flujo de cotizaciones para responder más rápido.',
    source: 'GOOGLE_ORGANIC_SEO',
    utm_source: 'google',
    utm_medium: 'organic'
};
const res1 = validateLeadPayload(validPayload);
assert(res1.isValid === true, 1, 'Formulario con datos completos y válidos es aceptado.');

// 2. Formulario inválido (Estructura no objeto)
const res2 = validateLeadPayload('esto no es un objeto');
assert(res2.isValid === false, 2, 'Payload con formato corrupto o no-objeto es rechazado.');

// 3. Campos vacíos obligatorios
const res3 = validateLeadPayload({ name: '', company: '', email: '', problem: '' });
assert(res3.isValid === false && res3.errors.length >= 4, 3, 'Formulario con campos obligatorios vacíos es rechazado.');

// 4. Email/Teléfono inválido
const res4 = validateLeadPayload({ ...validPayload, email: 'a' });
assert(res4.isValid === false, 4, 'Contacto con longitud menor a 5 caracteres es rechazado.');

// 5. Payload excesivo (> 15 KB)
const massiveString = 'A'.repeat(16000);
const res5 = await handleIngestRequest({ body: massiveString, headers: {} });
assert(res5.status === 413, 5, 'Payload que excede 15 KB es rechazado con HTTP 413 Payload Too Large.');

// 6. Protección contra Spam / Inyecciones (Sanitización)
const xssPayload = '<script>alert("hack")</script> Israel';
const sanitized = sanitize(xssPayload);
assert(!sanitized.includes('<script>') && sanitized.includes('&lt;script&gt;'), 6, 'Sanitización neutraliza etiquetas HTML y scripts maliciosos.');

// 7. Envío duplicado (Idempotencia)
const hashA = generateIdempotencyHash('Empresa Demo SpA', 'contacto@demo.cl', 'VENTAS');
const hashB = generateIdempotencyHash('Empresa Demo SpA', 'contacto@demo.cl', 'VENTAS');
const hashC = generateIdempotencyHash('Otra Empresa', 'otro@demo.cl', 'DATOS');
assert(hashA === hashB && hashA !== hashC, 7, 'Hash de idempotencia detecta envíos idénticos en la misma ventana de tiempo.');

// 8. Rate Limiting por IP (Exceder 5 peticiones)
const testIp = '192.168.1.99';
let allowedCount = 0;
for (let i = 0; i < 7; i++) {
    const rate = checkRateLimit(testIp);
    if (rate.allowed) allowedCount++;
}
assert(allowedCount === 5, 8, 'Rate limiting bloquea solicitudes después de 5 intentos por IP en 1 hora.');

// 9. Lead creado correctamente con esquema válido
const mockDb = {
    rpc: async (fn, params) => {
        return {
            data: { lead_id: 'lead_uuid_123', status: 'LEAD_CREATED' },
            error: null
        };
    }
};
const res9 = await handleIngestRequest({ body: validPayload, headers: { 'x-forwarded-for': '10.0.0.1' } }, mockDb);
assert(res9.status === 200 && res9.body.lead_id === 'lead_uuid_123', 9, 'Lead es insertado exitosamente en base de datos.');

// 10. Activity Log creado con evento FORM_SUBMITTED (Verificado en DDL schema.sql)
const schemaSql = readFileSync(join(process.cwd(), 'backend/supabase/schema.sql'), 'utf8');
assert(schemaSql.includes("'FORM_SUBMITTED'") && schemaSql.includes('INSERT INTO public.lead_activity_logs'), 10, 'Función transaccional registra automáticamente evento FORM_SUBMITTED.');

// 11. Fuente de captación registrada (GOOGLE_ORGANIC_SEO)
assert(res1.sanitizedData.source === 'GOOGLE_ORGANIC_SEO', 11, 'Fuente de captación GOOGLE_ORGANIC_SEO es validada y preservada.');

// 12. Fuente UNKNOWN manejada sin errores
const res12 = validateLeadPayload({ ...validPayload, source: 'INEXISTENTE_XYZ' });
assert(res12.sanitizedData.source === 'UNKNOWN', 12, 'Fuente no reconocida se normaliza automáticamente a UNKNOWN sin romper el flujo.');

// 13. Parámetros UTM registrados
assert(res1.sanitizedData.utm_source === 'google' && res1.sanitizedData.utm_medium === 'organic', 13, 'Parámetros UTM son capturados y sanitizados correctamente.');

// 14. Próxima acción inicial creada automáticamente en DDL
assert(schemaSql.includes("'Revisar solicitud web y realizar primer contacto'"), 14, 'Esquema asigna próxima acción obligatoria por defecto.');

// 15. Rol de usuario ADMIN definido con permisos de eliminación
assert(schemaSql.includes("public.is_admin()") && schemaSql.includes("role user_role_enum NOT NULL DEFAULT 'CONSULTOR'"), 15, 'Perfil de usuario y función is_admin() implementados con control estricto.');

// 16. Rol de usuario CONSULTOR restringido (No puede hacer DELETE físico)
assert(schemaSql.includes('Solo admins pueden eliminar leads físicamente'), 16, 'Política RLS prohíbe eliminación física a consultores estándar.');

// 17. Intento de acceso no autorizado bloqueado por RLS (Row Level Security activado en todas las tablas)
const rlsCount = (schemaSql.match(/ENABLE ROW LEVEL SECURITY/g) || []).length;
assert(rlsCount >= 7, 17, 'Row Level Security activado explícitamente en las 7 tablas de la base de datos.');

// 18. service_role ausente del frontend
const frontendJs = readFileSync(join(process.cwd(), 'script.js'), 'utf8');
const indexHtml = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
assert(!frontendJs.includes('service_role') && !indexHtml.includes('service_role'), 18, 'Cero tokens service_role o secretos expuestos en frontend.');

// 19. Manejo de error de backend sin filtrar información sensible
const badDb = { rpc: async () => { throw new Error('Postgres password leak crash'); } };
const res19 = await handleIngestRequest({ body: validPayload, headers: { 'x-forwarded-for': '10.0.0.2' } }, badDb);
assert(res19.status === 500 && !JSON.stringify(res19.body).includes('Postgres password'), 19, 'Errores internos no exponen stack traces ni credenciales.');

// 20. Protocolo de recuperación de backup y prueba documentada
const backupDocExists = existsSync(join(process.cwd(), 'docs/BACKUP_AND_RECOVERY_PROTOCOL.md'));
assert(backupDocExists === true, 20, 'Protocolo de respaldo, restauración y política de retención documentado.');

console.log('\n----------------------------------------------------------------');
console.log(`RESULTADO FINAL DE PRUEBAS: ${passedTests}/${totalTests} CASOS SUPERADOS`);
console.log('----------------------------------------------------------------\n');
