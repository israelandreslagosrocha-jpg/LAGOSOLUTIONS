import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
const recorded = [];
const window = {dispatchEvent: event => recorded.push(event.detail)};
runInNewContext(readFileSync(new URL('../../js/commercial-events.js', import.meta.url), 'utf8'), {
    window, document: {addEventListener() {}}, CustomEvent: class { constructor(type, options) { this.detail = options.detail; } }
});
window.LagoAnalytics.track('inquiry_prepared', {
    channel: 'email', name: 'PRIVATE_NAME', email: 'private@example.com', problem: 'PRIVATE_CONTEXT',
    url: 'https://wa.me/123?text=PRIVATE_MESSAGE', plan: 'PRIVATE_VALUE', project: 'PRIVATE_VALUE'
});
assert.deepEqual(JSON.parse(JSON.stringify(recorded)), [{name: 'inquiry_prepared', properties: {channel: 'email'}}]);
window.LagoAnalytics.track('PRIVATE_EVENT', {channel: 'PRIVATE_CHANNEL'});
assert.equal(recorded.length, 1, 'Unknown event names must not be forwarded');
window.LagoAnalytics.track('contact_channel_open', {channel: 'PRIVATE_CHANNEL'});
assert.deepEqual(JSON.parse(JSON.stringify(recorded[1].properties)), {});
assert.ok(!recorded.some(event => event.name === 'generate_lead'), 'Preparing or opening contact is not a received lead');
window.LagoAnalytics.track('generate_lead', {channel: 'whatsapp'});
assert.equal(recorded[2].name, 'generate_lead');
console.log('Medición: datos privados excluidos; preparar/abrir contacto no cuenta como lead recibido.');
