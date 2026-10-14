# Etapa 1 de captación: indexación y base de medición

13 de octubre de 2026, America/Santiago.

## Completado

- Propiedad de prefijo https://www.lagosolutions.cl/ creada y verificada en Google Search Console mediante etiqueta HTML. Conservar la etiqueta publicada.
- Sitemap actualizado a la fecha real de modificación de la portada y enviado a Search Console. Estado mostrado: Correcto; una página descubierta.
- Inspección del índice: portada «Descubierta: actualmente sin indexar», último rastreo N/D.
- Prueba de URL publicada: «La URL está disponible para Google» y «La página se puede indexar».
- Solicitud de indexación aceptada: URL añadida a cola de rastreo prioritaria. Esto no confirma inclusión en el índice ni posición.
- El informe agregado de Search Console sigue procesando datos; no hay una línea base histórica disponible en esta propiedad recién verificada.

## Eventos preparados

js/commercial-events.js publica eventos locales lagos:measurement. No incluye SDK, peticiones de red, cookies ni almacenamiento. Falta conectar un proveedor autorizado y verificar la recepción en ese proveedor. No afirmar que GA4 ya está funcionando.

| Evento | Qué significa |
|---|---|
| inquiry_open | Apertura del formulario de consulta |
| inquiry_prepared | Formulario válido convertido en mensaje, sin recepción confirmada |
| contact_channel_open | Clic hacia WhatsApp, correo o teléfono; no equivale a mensaje enviado |
| plan_sheet_open | Clic en ficha de plan; no acredita descarga completada |
| project_open | Clic para abrir un proyecto |
| generate_lead | Solo después de respuesta de backend con éxito y lead_id |
| inquiry_error | No se confirmó la recepción en backend |

Propiedades permitidas: canal (whatsapp/email/phone), plan (cinco identificadores internos) y proyecto (seis identificadores internos). Se descartan todas las otras propiedades. Nunca enviar nombre, empresa, correo, teléfono, problema, mensajes ni href con texto de WhatsApp.

Al conectar GA4 hay que revisar su medición mejorada: la captura automática de enlaces salientes podría incluir el mensaje de WhatsApp en link_url y las interacciones con formulario podrían confundir preparación con recepción. Usar eventos controlados y desactivar esas capturas automáticas. No activar generate_lead para simples clics de contacto.

## Pendiente por autorización de cuenta

Se abrió el asistente de Google Analytics. La revisión automática bloqueó crear una cuenta y fijar su compartición de datos sin autorización explícita. Se solicitó permiso para una cuenta gratuita LagoSolutions, con opciones de compartición adicional desactivadas. No se obtuvo un ID G-… ni se conectó un colector. Si el flujo exige aceptar términos legales, corresponde presentarlos al usuario antes de aceptarlos.

## Validación

- node --check para script.js y commercial-events.js.
- backend/tests/test-measurement-privacy.js comprueba exclusión de datos privados, rechazo de nombres de eventos no reconocidos y diferencia entre contacto preparado/abierto y lead recibido.
- Comprobación local de carga del módulo y apertura del formulario.

## Siguientes tareas

1. Con autorización, terminar cuenta y flujo de GA4; conectar ID y validar eventos recibidos.
2. Completar Bing Webmaster Tools con el acceso autorizado correspondiente.
3. Registrar la línea base de impresiones, clics y contactos cuando los servicios dispongan de datos.
4. Continuar con el nuevo mensaje principal, portada breve y páginas de servicios/casos conforme a la auditoría.
