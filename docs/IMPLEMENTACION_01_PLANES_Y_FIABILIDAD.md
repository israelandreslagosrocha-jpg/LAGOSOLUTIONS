# Primera entrega: planes y fiabilidad

Fecha: 3 de octubre de 2026. Cambios locales, pendientes de publicación.

## Definición comercial implementada

| Plan | Precio CLP | Alcance que lo diferencia |
|---|---:|---|
| START | $200.000 | Una landing responsive, SEO técnico inicial y contacto por canales acordados. Sin backend propio, CRM o CMS. |
| COMERCIAL | $400.000 | Hasta cinco páginas independientes, investigación SEO inicial, metadatos por página y GA4/GTM con eventos de contacto. Sin dashboard ni DB propia. |
| GROWTH | $700.000 | Hasta diez páginas, estrategia inicial y backend de captura con DB, UTMs y dashboard básico privado para consultar y clasificar contactos. Sin CMS ni CRM con múltiples roles. |
| PRO | $1.000.000 | Hasta diez páginas, panel comercial con estados, trazabilidad y CMS para contenidos acordados. |
| A MEDIDA | Desde $1.500.000 | Funciones cotizadas: reservas, ecommerce, roles, APIs, CRM o automatizaciones. El precio de entrada no incluye todos esos módulos. |

La comparación interactiva permite elegir cualquiera de los cinco planes. START y COMERCIAL aparecen por defecto. La analogía del restaurante explica salón/frontend, cocina/backend y administración/dashboard. Preguntas desplegables amplían backend, SEO/marketing, formulario externo y costes de renovación. Se mantienen diseño responsive en todos los niveles y hosting por 12 meses. Campañas, presupuesto publicitario y SEO mensual se cotizan aparte.

No se han inventado tiempos de entrega, revisiones, cuotas de infraestructura, renovación ni impuestos: deben concretarse por propuesta. Las fichas PNG existentes no se regeneraron en esta entrega; revisar su redacción y sincronizarlas antes de publicar cambios definitivos de alcance. No se implementó el backend vendido en los planes: aquí se explica la oferta de la agencia.

## Correcciones realizadas

- Hero con grid de mínimo cero; canvas con tamaño CSS fluido.
- Modal centrado nativamente y altura limitada al viewport, sin desplazamiento negativo.
- Menú simplificado y colapsado antes de exceder el ancho; gestión de foco, fondo inert y cierre con Escape.
- Pestañas de casos navegables con flechas, Home y End; acordeón con aria-expanded.
- Contenido reveal visible incluso si JavaScript falla.
- Formulario conserva datos y prepara un enlace explícito a email o WhatsApp mientras no haya API. No abre popup diferido ni afirma que registró datos.
- Rama de futura API espera respuesta y comprobación de éxito/lead_id; ofrece reintento y canal directo ante fallo.
- Referrer sin clasificar conserva UNKNOWN en lugar de inventar Google orgánico.
- Handler Node devuelve 400 ante JSON inválido y 503 si no existe cliente de persistencia; ya no genera lead_mock exitoso.
- Workflow genera artefacto público con lista de archivos y carpetas permitidos; excluye backend, SQL, documentación e informes.
- Naty Entrenadora, correo oficial y teléfono conservados desde la entrega anterior.

## Verificación

- Sintaxis JavaScript: script principal, comparador y canvas.
- Suite existente: 20/20.
- Regresiones nuevas: JSON inválido, ausencia de DB y persistencia simulada confirmada.
- Navegador: 320, 390, 768, 1024 y 1440 px. Hero y comparador dentro del ancho disponible.
- Modal 390×844: top aproximadamente 12 px; título y cierre visibles, scroll interno disponible.
- Comparación inicial START–COMERCIAL, GROWTH–PRO y selección A MEDIDA.
- Preparación de email/WhatsApp con acentos y &, sin enviar datos al exterior.
- Navegación de pestaña de Naty con ArrowRight y cierre de menú/modal con Escape.
- Artefacto de prueba en /private/tmp/lagos-audit/public-build: recursos locales presentes, IDs únicos, referencias aria-controls válidas, JSON-LD válido y directorios internos ausentes.

## Pendiente de las siguientes etapas

Backend real y seguridad de DB/RPC/RLS, validación exhaustiva, límites distribuidos, notificaciones fiables, privacidad, SEO multipágina y medición, reorganización completa de home, demos, agenda y Strix. No se han hecho commits, push ni despliegue. El workflow acotado elimina la exposición de rutas internas cuando se publique; no cambia aún las rutas del dominio actual.

## Carrusel de planes

Se muestra un plan a la vez con controles anterior/siguiente, selección directa,
miniatura Cloudinary ampliable y alcance desplegable. Los enlaces del comparador
revelan el plan correspondiente. Sin JavaScript se conservan todas las fichas.
Validado a 320, 390, 768, 1024 y 1440 px sin desbordamiento horizontal;
controles circulares, detalles y enlace del comparador comprobados en navegador.
