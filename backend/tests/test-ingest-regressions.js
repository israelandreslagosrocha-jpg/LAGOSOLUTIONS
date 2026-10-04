import assert from 'node:assert/strict';
import { handleIngestRequest } from '../api/ingest.js';

const body = { name: 'Prueba', company: 'Empresa Demo', email: 'prueba@example.com', channel: 'Email', problem: 'Consulta de prueba local.' };
const request = (payload, ip) => ({ body: payload, headers: { 'x-forwarded-for': ip } });
const malformed = await handleIngestRequest(request('{', 'regression-json'));
assert.equal(malformed.status, 400);
assert.equal(malformed.body.success, false);
const unavailable = await handleIngestRequest(request(body, 'regression-no-db'));
assert.equal(unavailable.status, 503);
assert.equal(unavailable.body.success, false);
assert.equal(unavailable.body.lead_id, undefined);
const mockDb = { rpc: async () => ({ data: { lead_id: 'persisted-lead', status: 'LEAD_CREATED' }, error: null }) };
const saved = await handleIngestRequest(request(body, 'regression-saved'), mockDb);
assert.equal(saved.status, 200);
assert.equal(saved.body.lead_id, 'persisted-lead');
console.log('Regresiones de ingesta: JSON inválido controlado, fallo sin DB y éxito con persistencia confirmada.');
