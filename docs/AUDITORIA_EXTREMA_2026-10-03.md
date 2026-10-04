# Auditoría de LagoSolutions — 3 de octubre de 2026

## Dictamen

LagoSolutions tiene identidad visual, proyectos verificables y una oferta escalonada. Sin embargo, la página actual dedica su espacio principal a explicar una consultoría de diagnóstico y posterga la venta de desarrollo web. El principal salto de calidad consiste en hacer visible lo que construyes, para quién, cuánto cuesta y cómo se contrata; después demostrarlo con productos utilizables y un proceso comercial fiable.

Hay fallos comprobados que deben resolverse antes de invertir en captar tráfico: recorte móvil, modal desplazado, confirmaciones de contacto sin persistencia y publicación de archivos internos. La base de backend existente requiere revisión de permisos antes de manejar clientes reales.

No se puede afirmar que la página convierte bien o mal con una tasa concreta: no se proporcionaron GA4, Search Console, CRM real, ventas ni campañas. Los juicios de conversión son hipótesis profesionales apoyadas en la experiencia observada, no resultados de un experimento.

## Alcance y evidencia

- Código local: HTML/CSS/JS, módulos canvas, handler Node, Edge Function, dos esquemas SQL, CRM y workflow de Pages.
- Sitio publicado: navegación, apertura de menú y modal, capturas visuales, geometría DOM a 320, 390, 768, 1024 y 1440 px. No se enviaron formularios ni mensajes.
- HTTP: peticiones públicas de lectura y cabeceras. Ningún ataque activo a los proyectos de clientes.
- Contexto: conversación referenciada recuperada con `read_thread`. La respuesta disponible contiene seis turnos y algunos mensajes truncados; no equivale al historial completo. Se complementó con MASTER_STATE_V2 y COMMERCIAL_SYSTEM_SPEC_V2.1, respetando el objetivo actual indicado por el propietario.
- Investigación: bóveda enlazada por IA MarkeTIA, documentación oficial, Strix y tres plataformas de construcción con IA. Las fichas comerciales de proveedores no prueban causalmente tasas de conversión.

### GitHub y publicación, comprobados

Remoto: https://github.com/israelandreslagosrocha-jpg/LAGOSOLUTIONS

`git ls-remote origin HEAD refs/heads/main` devolvió `5d0c4fe133cfdb412ee2f1c92b1820991d468b5e`, igual a HEAD local. El workflow publica `main` mediante GitHub Pages. El sitio devuelve HTTP 200 y `server: GitHub.com`.

El HTML descargado del dominio es idéntico byte por byte a `index.html` local: 98.273 bytes, SHA-256 `5764a51e979fcfc34806d716762139460b18534c8c5e144350dfdf1f87d02348`. No se inspeccionó el panel privado de Actions ni las protecciones de rama. Hay cinco PNG de planes sin seguimiento por Git; no se modificaron.

### Estado real del backend

Hay código preliminar, pero la página no define `window.LAGOSOLUTIONS_API_URL`. El formulario solo ejecuta `fetch` si esa variable existe. El CRM contiene datos de ejemplo en memoria y no incluye un flujo real de autenticación o lectura de Supabase. GitHub Pages entrega archivos estáticos, no ejecuta los handlers.

La existencia de carpetas `backend` y `supabase` no acredita un servicio desplegado. El esquema completo de `backend/supabase/schema.sql` y la migración mínima de `supabase/migrations` son diferentes. El proyecto necesita una única secuencia canónica de migraciones antes de operar.

## Hallazgos priorizados

Prioridad P0: corregir antes de captar tráfico o habilitar datos reales. P1: siguiente iteración. P2: mejora posterior. La prioridad combina impacto comercial y técnico; no es una puntuación CVSS.

| ID | Prioridad / estado | Evidencia e impacto | Acción y aceptación |
|---|---|---|---|
| UX01 | P0, publicado | A 390 px el hero mide 445 px y llega a x=461. Se recortan H1, párrafos y CTA. A 320 px llega a x=447. `overflow-x:hidden` oculta el exceso. | Revisar tamaño mínimo del grid y canvas; usar `minmax(0,1fr)`, `min-width:0` y dimensionado coherente. Verificar todos los elementos visibles, no solo `scrollWidth`, a 320/360/390/414 px. |
| UX02 | P0, publicado | Modal a 390×844: top=-173, bottom=633; título y cierre con coordenadas negativas. `dialog[open]` aplica translate(-50%,-50%) junto con reglas de centrado y `margin:auto`. | Un solo sistema de centrado, altura máxima disponible y scroll interno. Título/cierre visibles y submit alcanzable con teclado virtual. |
| CV01 | P0, código confirmado | `script.js:342–399` muestra éxito sin esperar la API; para Email promete registro aunque no hay endpoint. Limpia el formulario. | Confirmar únicamente después de persistir. Mantener datos ante fallo y permitir reintento. Sin backend, describir explícitamente el paso de contacto disponible. |
| SEC01 | P0 antes de datos reales, riesgo de diseño | En esquema completo, `is_authenticated()` solo verifica `auth.uid() IS NOT NULL`; políticas permiten leer y modificar leads y expedientes a cualquier authenticated. La configuración local permite signup. No se comprobó su despliegue remoto. | Para CRM interno, usuarios invitados y membresía autorizada; para clientes, tenant_id y aislamiento. Probar usuario externo, usuario sin perfil, consultor y dos organizaciones distintas. |
| SEC02 | P1 hoy / P0 al contener información privada, publicado | Workflow sube `path: ./`. `/backend/crm/` y `/supabase/migrations/20260829000000_fase0_5_minimal_ingest.sql` devuelven 200. Exposición de demo y arquitectura; no demuestra filtración de leads reales. | Publicar solo directorio de distribución con lista explícita de archivos. Backend, seeds, informes y documentos fuera del artefacto. Las rutas internas deben devolver 404. Robots no es control de acceso. |
| SEC03 | P0 antes del backend, código | RPC `ingest_public_lead` SECURITY DEFINER sin REVOKE/GRANT explícitos ni `search_path` fijado. Las funciones pueden conservar ejecución pública y permitir saltarse el handler de validación y límites. | Revisar privilegios efectivos; revocar PUBLIC/anon/authenticated y conceder solo al rol servidor si se usa Edge Function. Fijar search_path y validar en DB. Probar que RPC directa anónima se deniega. |
| SEC04 | P1 antes del backend, código | Rate limit en Map local y confianza en x-forwarded-for. Reinicios/instancias independientes no comparten contadores; el control depende de cómo el proxy sobrescriba la cabecera. | Límite persistente compartido, IP obtenida de infraestructura confiable, cuota global y protección antibot según abuso observado. CORS no sustituye estas medidas. |
| BE01 | P0 antes del backend, reproducido | `handleIngestRequest` sin dbClient devuelve 200/LEAD_CREATED/lead_mock. | Configuración obligatoria y fallo cerrado; ningún éxito si no hay persistencia. |
| BE02 | P1, reproducido | JSON malformado produce SyntaxError fuera del try en handler Node. Edge Function sí captura ese parseo. | 400 controlado, sin lanzar excepción al framework. Unificar los handlers para evitar divergencias. |
| BE03 | P1, código | Email/WhatsApp se valida por longitud; `invalid` fue aceptado. Website, goal y UTMs carecen de varios límites. Tamaño del Edge body se comprueba después de leerlo completo. | Esquema tipado real, contacto según canal, longitudes y protocolo de URL. Límite de cuerpo también en gateway. El comentario Zod no implica que Zod esté usado. |
| BE04 | P1, código | `plan` se captura en frontend, pero no se guarda en los payloads/SQL de ingesta. | Persistir plan, versión de oferta, landing y variante de CTA. Poder reconstruir la solicitud. |
| BE05 | P1, código | Fuente asignada a Google orgánico ante cualquier referrer; falsea Instagram, socios y otras webs. | Clasificar por UTM/referrer con UNKNOWN legítimo. Registrar first touch y last touch con política definida. |
| BE06 | P1, código | Edge email no comprueba response.ok; sin API key retorna sin aviso. | Estado separado de persistencia y notificación, cola/outbox y reintentos. Confirmación de recepción no debe prometer envío realizado. |
| BE07 | P1, código | SELECT previo a INSERT no resuelve carreras de duplicación; unique puede fallar con dos solicitudes simultáneas. Hash por hora no cubre el cambio de ventana. | Idempotencia con clave y operación atómica; pruebas concurrentes y reintento tras timeout. |
| SEC05 | P1 al conectar CRM, riesgo futuro | `backend/crm/app.js` construye filas y fichas con innerHTML de campos de lead. Ahora son semillas fijas. | Renderizar entradas como texto o sanitizar HTML mediante política rigurosa. Probar XSS almacenado cuando existan datos externos; no afirmar explotación actual. |
| SEC06 | P1, código de servidor local | `backend/server.js` une cwd con URL sin comprobar confinamiento y escucha en 0.0.0.0. Sirve archivos del árbol y no es servidor de producción. | Solo loopback en desarrollo, raíz pública definida y control de rutas. No desplegarlo como backend comercial. Traversal requiere PoC controlada, no se ejecutó aquí. |
| SEC07 | P1, cabeceras observadas | Respuesta de home no incluye CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy ni HSTS en esta medición. Scripts GSAP externos sin integrity. | Definir cabeceras en hosting/proxy; evaluar CSP en report-only antes de bloquear. Autohospedar o SRI/versiones verificadas. Ausencia de cabeceras no demuestra por sí sola una explotación. |
| UX03 | P1, publicado | A 1024 px el extremo de nav-cta alcanza x≈1038 mientras clientWidth=1009. El menú solo colapsa bajo 991 px. | Menú compacto según espacio real; probar 992/1024/1100/1280, zoom 200% y cadenas largas. |
| UX04 | P1, código | Menú drawer no mueve/retorna foco ni deja el fondo inerte. Tabs solo click, sin flechas y gestión roving tabindex; acordeón no actualiza aria-expanded. | Flujo accesible de teclado y estado ARIA alineado. El dialog nativo aporta ventajas, pero su posicionamiento falla. |
| UX05 | P1, código | `.reveal` invisible por defecto; JS fallido deja secciones ocultas, salvo reduced-motion. | Contenido visible por defecto y animación como mejora progresiva. Probar JS desactivado y CDN no disponible. |
| CV02 | P1, observado | Home de 27.276 px a 390×844; planes en y≈7.381, sección planes ≈6.756 px. Metodología repetida antes y después de oferta. | Home breve de decisión, detalle en páginas específicas. Evaluar leads cualificados, no solo scroll o longitud. |
| CV03 | P1, editorial | H1/title venden diagnóstico; planes START venden presencia a emprendedores. Hero indica empresas con operación activa, que excluye parte de su propio plan de entrada. | Entrada explícita por necesidad: web nueva, mejorar web, plataforma/automatización. Método como diferenciador. |
| CV04 | P1, editorial | Claims “alta conversión”, “carga instantánea”, “sin límites” y “más clientes” sin medición aportada. | Sustituir promesas absolutas por entregables verificables. Aclarar que tráfico y ventas también requieren captación y gestión. |
| CV05 | P1, oferta | Pago único junto a hosting 12 meses, SaaS y soporte continuo puede ocultar coste posterior. PRO promete dominio, backups y CMS sin límites de operación detallados. | Fijar renovación, IVA/impuestos aplicables en la cotización, revisiones, plazo, dependencia del material, mantenimiento, APIs y propiedad/exportación. |
| SEO01 | P1, código | Canonical, robots, OG y ProfessionalService presentes, pero sitemap solo home y title genérico. Anclas no crean páginas para intenciones distintas. | Servicios y casos con URLs rastreables y contenido propio; sitemap de páginas canónicas. |
| SEO02 | P1, medición | No se encontró gtag/dataLayer/Plausible en la página y scripts locales revisados. Se habla de medición como producto, pero no hay embudo propio demostrable. | Instrumentar sin PII; atribución y resultado comercial en CRM. Confirmar posibles inyecciones externas antes de concluir sobre toda infraestructura. |
| GOV01 | P1, código y contexto | Guía de migración describe dominio como futuro aunque ya opera; config usa localhost y seed.sql ausente. Dos diseños SQL coexistentes. | README operativo, inventario de entornos, migraciones únicas, rollback y prueba de restauración. |
| PRIV01 | P1 antes de leads reales | No hay enlace de política de privacidad en home/modal; confidencialidad y una nota sobre WhatsApp no explican tratamiento de datos. | Aviso de tratamiento, proveedores, finalidad, retención y contacto. Permiso de marketing separado de atención a la solicitud. Validación legal según mercados atendidos. |

### Pruebas y sus límites

`node --check script.js` pasa. Suite existente `node backend/tests/run-fase1-tests.js`: 20/20. Muchas aserciones inspeccionan cadenas del SQL o usan mocks; no prueban una base real, aislamiento de tenants, envío de correo, autenticación ni extremo a extremo. Dos pruebas adicionales de ejecución reprodujeron éxito sin DB y excepción con JSON inválido. Por eso los 20 PASS no permiten certificar seguridad.

No se asignan números de Lighthouse, Core Web Vitals, CVSS ni tasas de conversión: no fueron medidos. La lectura Python falló por certificados locales; curl con verificación TLS y el navegador sí funcionaron. No se ignoraron errores TLS para realizar las comprobaciones.

## Responsividad, UX y dirección visual

| Viewport probado | Altura de home aprox. | Inicio de planes | Hallazgo |
|---|---:|---:|---|
| 320×900 | 30.469 px | 8.491 px | Hero desborda y recorta |
| 390×844 | 27.276 px | 7.381 px | Hero y modal fallan |
| 768×900 | 19.983 px | 5.906 px | Hero cabe; demasiada profundidad comercial |
| 1024×900 | 17.698 px | 5.425 px | Hero cabe; navegación excede ancho disponible |
| 1440×900 | 13.270 px | 3.636 px | Hero y navegación caben |

Mediciones de una sesión de navegador con scrollbar y contenido dinámico; pueden variar ligeramente con fuente, tamaño y estado. No sustituyen Safari iOS y Android reales.

La paleta oscura, contraste de títulos, mezcla serif/sans y CTA azul forman un sistema reconocible. El problema de UI es la jerarquía: demasiados bloques equivalentes y demasiado énfasis en explicación. El canvas demuestra animación, pero no muestra una web o aplicación que el cliente pueda comprar.

Priorizar capturas y recorridos de productos. Mostrar el resultado de una consulta ficticia dentro de un CRM de demo, una reserva o un CMS. Mantener las animaciones con propósito y reduced-motion, que ya está contemplado en CSS y módulos. Revisar contraste de textos secundarios con medición, no inferir cumplimiento WCAG por apariencia. Algunas visitas de portafolio tienen 18 px de altura; ampliar área táctil y separación según contexto.

El formulario tiene ocho campos (cinco required), varios con opciones muy largas. Propuesta de primer contacto: nombre, contacto y necesidad; empresa/sitio opcionales, presupuesto/plazo en un segundo paso. Etiquetas visibles, autocompletado y validación por canal. La contratación compleja puede requerir más datos, pero después de que el visitante comprenda valor y siguiente paso.

## Venta y arquitectura comercial

La cantidad de texto no decide por sí sola la conversión. Aquí hay repetición de principios internos y decisiones abstractas mientras faltan respuestas de compra: plazo, trabajo mostrado, coste posterior, quién responde, material necesario y alcance del diagnóstico gratuito. La consulta inicial gratuita debe distinguirse del diagnóstico profundo pagado, tal como ya plantea la V2.1.

### Mensaje de entrada propuesto

H1: **Diseño y desarrollo web para empresas en Chile.**

Subtítulo: **Creamos sitios, plataformas y automatizaciones para captar consultas y ordenar tu operación. Comenzamos entendiendo tu negocio y entregamos una solución con alcance claro.**

CTA: **Cuéntame tu proyecto**. Secundario: **Explora trabajos reales**.

Debajo: precios desde $200.000 CLP, modalidades y primera conversación sin coste, cuando esa sea la oferta efectiva. No prometer nuevos clientes sin estrategia de captación y datos. Puedes expresar la IA como método de producción con revisión humana, pruebas y responsabilidad profesional; no es necesario que sea la promesa central.

### Orden recomendado de home

1. Qué construyes, para quién y CTA.
2. Tres proyectos con imagen, problema y resultado funcional verificable.
3. Tres caminos: web comercial, plataforma web, automatización.
4. Una demo funcional breve con datos ficticios.
5. Resumen comparativo de planes; detalle y condiciones por plan.
6. Proceso de cuatro pasos: entender, proponer, construir, lanzar/medir.
7. Quién lo hace, testimonio autorizado y responsabilidad de entrega.
8. FAQ sobre plazo, coste posterior, propiedad, contenido, soporte y medición.
9. Contacto sencillo y agenda.

Menú: Servicios · Proyectos · Planes · Cómo trabajo · Contacto. En una agencia personal, mostrar a Israel, su experiencia verificable y canal directo. No inventar equipo, certificaciones ni cifras.

Trasladar reconocimiento, diez etapas, evidencia E0–E4, análisis de datos y actuar/no actuar a `/metodologia/` o `/diagnostico-empresarial/`. Mantener su esencia como criterio de trabajo; no obligar a todo comprador de landing a recorrerla.

### Planes

Conservar los cinco niveles, pero presentar primero un comparador corto. START = presencia enfocada; COMERCIAL = estructura y medición; GROWTH = captura y gestión básica; PRO = autonomía de contenido y operación; A MEDIDA = alcance cotizado. No tratar el salto de precio como más páginas o más estética.

El precio de $1M para CMS, CRM y soporte puede o no ser rentable: calcular horas de descubrimiento, desarrollo, QA, soporte y costes recurrentes antes de confirmar margen. Cada plan necesita criterios de aceptación y exclusiones, no solo lista de tecnologías. Evitar “sin límites”. Un formulario que usa un proveedor externo también tiene procesamiento de servidor, aunque el cliente no compre backend propio.

## Portafolio investigado

Los tres dominios respondieron a lectura pública. No se auditaron sus backends ni conversiones.

| Proyecto | Lo observado | Cómo usarlo para vender |
|---|---|---|
| [Banda Bruna](https://www.bandabruna.cl/) | Sitio con contenido musical y formulario de cotización específico: tipo de evento, fecha, comuna y requerimiento. | Mostrar recorrido escuchar/ver → seleccionar evento → solicitar cotización. Prueba funcional de captación especializada. No afirmar ingresos derivados sin CRM. |
| [Logos Arquitectura](https://logosarquitectura.cl/) | www redirige al dominio sin www. H1 orientado a aprobación ante Seremi; servicios, evaluación, FAQ y guía. Script público de Google Ads presente. | Mejor referencia de propuesta por nicho: comprador, problema y acción concretos. Identificar entregables y aclarar que aprobación administrativa depende de requisitos; un tag de Ads no prueba campaña ni ventas. |
| [Sforzato Music](https://www.sforzatomusic.cl/) | HTML y chunks de Next.js; título Música con propósito; narrativa musical y conversación. | Evidencia de dirección artística y experiencia multimedia. Añadir objetivo, capturas, navegación y funcionalidades. Next.js no acredita por sí solo backend o escalabilidad. |

LagoSolutions debería ofrecer fichas de caso independientes: necesidad → alcance → interfaces → integración → estado → evidencia → contactar. Añadir vídeo corto o capturas de desktop y móvil. Si no se dispone de resultados comerciales, publicar capacidades y tiempos técnicos medidos; mantener la transparencia actual sobre métricas no divulgadas o no medidas.

No se verificó que Banda Bruna utilice cada tecnología indicada en la ficha de LagoSolutions ni todos los proveedores de Sforzato. Las tecnologías deben contrastarse con el repositorio de cada proyecto antes de anunciarlas como arquitectura comprobada.

## Investigación de construcción web con IA

| Referencia oficial | Práctica observada | Adaptación útil |
|---|---|---|
| [Lovable](https://lovable.dev/) | Entrada por idea y previews de aplicaciones. | Brief corto y recorrido visible de una solución; reducir tiempo hasta entender el producto. |
| [Framer AI](https://www.framer.com/ai/) | Creación editable, control de diseño, responsive, CMS y publicación ilustrados. | Demostrar qué puede editar el cliente y cómo se entrega el sitio. |
| [Durable](https://durable.com/) | Agrupa web, CRM, reservas y automatización; casos/testimonios y preguntas de compra. | Vender una operación comercial comprensible y aclarar costes e integración. |

Estas prácticas existen en sus páginas; no se accedió a sus experimentos o ventas. La hipótesis transferible es que visualizar producto, reducir incertidumbre y ofrecer un primer paso sencillo puede mejorar la conversión. No copiar promesas de construir en minutos: una agencia debe justificar su valor con conocimiento del negocio, personalización, propiedad, integraciones, calidad y acompañamiento.

### Hitos comerciales que debes medir

| Hito | Evidencia | Métrica útil |
|---|---|---|
| Comprensión | Usuario identifica qué vendes y para quién | Prueba breve con prospectos; errores de comprensión |
| Confianza | Abre caso y prueba demo | case_view/demo_complete, segmentados por canal |
| Selección | Elige necesidad/plan | plan_select y avance hacia contacto |
| Contacto válido | Servidor registra solicitud | generate_lead tras persistencia, no tras click |
| Conversación | Reunión confirmada y realizada | booked/attended y tiempo de primera respuesta |
| Propuesta | Oferta entregada | qualified_to_proposal, plazo de cotización |
| Venta rentable | Aceptación/pago y costes reales | proposal_to_won, ingreso y margen por canal |

`whatsapp_click` es intención, no lead confirmado ni venta. No incluir email, teléfono, nombres o texto del formulario en analítica. Registrar `form_start`, `form_error`, `lead_saved`, `booking_confirmed`, y estados comerciales con identificadores internos. No fabricar tasas objetivo: levantar baseline y evaluar cambios por fuente/dispositivo. Con poco tráfico, pruebas de usabilidad y seguimiento de oportunidades son más útiles que A/B sin potencia estadística.

## SEO y posicionamiento

Canonical/OG/robots/schema dan una base técnica, pero no una estrategia suficiente para varios servicios. Una home extensa puede indexarse; su limitación aquí es cubrir múltiples intenciones con mensajes generales. No se comprobó indexación o ranking real en Search Console y no se proporcionan volúmenes inventados.

### Arquitectura propuesta y consultas semilla

| URL propuesta | Intención | Consulta semilla por validar |
|---|---|---|
| `/diseno-web/` | Servicio comercial | diseño web Chile, páginas web para empresas |
| `/landing-pages/` | Captación de campañas | creación de landing page, landing page para negocio |
| `/plataformas-web/` | Desarrollo funcional | desarrollo de aplicaciones web Chile |
| `/automatizacion/` | Integrar operación | automatización de procesos para pymes |
| `/planes/` | Comparar inversión | cuánto cuesta una página web en Chile |
| `/proyectos/banda-bruna/` y otros casos | Ver experiencia | sitio web para bandas / arquitectura / música |
| `/metodologia/` | Evaluar proveedor | proceso de desarrollo y diagnóstico |

Validar demanda, SERP, dificultad y consultas actuales con Search Console, Keyword Planner y entrevistas comerciales. Priorizar diseño/desarrollo web y uno o dos nichos donde ya hay experiencia. Temuco u otra ciudad solo si corresponde a presencia/mercado real; no inventar ubicación ni producir páginas cambiando nombres de ciudades.

Propuesta de title home: `Diseño y desarrollo web en Chile | LagoSolutions`. Cada servicio necesita title/H1 descriptivo, alcance, ejemplos, preguntas reales, CTA y enlaces a sus casos. Mantener una variante canónica de dominio con redirecciones coherentes; actualizar sitemap al crear páginas. Validar schema basado en datos reales, sin reviews o AggregateRating fabricados. Para visibilidad local, revisar elegibilidad y datos verificables de Google Business Profile.

La etiqueta meta keywords presente no aporta posicionamiento en Google. [Documentación oficial](https://developers.google.com/search/docs/crawling-indexing/special-tags?hl=es).

Google admite utilidad de IA para investigación y estructura, pero exige calidad y revisión; producción masiva sin valor puede violar políticas. Publicar contenido propio como decisiones de proyectos, costes explicados, integraciones y mediciones. [Guía de contenido generativo](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content).

Las funciones de IA de Google siguen fundamentos SEO; no requieren un schema secreto ni optimizaciones especiales. [Guía oficial](https://developers.google.com/search/docs/appearance/ai-features).

Medir en campo LCP≤2,5 s, INP≤200 ms y CLS≤0,1 al percentil 75 por dispositivo. Son objetivos de referencia, no resultados de esta auditoría. Complementar con Lighthouse y pruebas en teléfonos. [Web Vitals](https://web.dev/articles/vitals?hl=en).

## Bóveda IA MarkeTIA: herramientas verificadas

Se accedió a la [bóveda enlazada por el plugin](https://shimmering-horse-26068d.netlify.app/) sin reutilizar el token incrustado en su enlace. Es un catálogo de enlaces, no una integración ejecutable ni una garantía de seguridad/calidad de sus descripciones. Strix no apareció en el contenido público recuperado. La entrada de seguridad consultada enlaza Cybersecurity Skills.

| Herramienta presente | Papel recomendado | Valor en la página |
|---|---|---|
| [Cal.com](https://cal.com/) | Agenda con disponibilidad y recordatorios | Conversión directa a conversación; cargar integración al abrir agenda |
| [n8n](https://github.com/n8n-io/n8n) | Automatizar eventos después de persistir leads | Demo visual formulario → CRM → tarea → notificación, con datos ficticios |
| [Plausible](https://plausible.io/) | Analítica de páginas y eventos | Medición propia y reporte para clientes; no reemplaza registro de ventas |
| [Marketing Skills](https://github.com/coreyhaines31/marketingskills) | Apoyar copy, CRO, SEO y medición | Proceso interno de calidad, no widget decorativo |
| [Cybersecurity Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) | Guías y procedimientos de revisión | Checklist interno; no certificación ni escáner automático |
| [Penpot](https://github.com/penpot/penpot) | Prototipos y sistema visual | Enseñar diseño aprobado y evolución de proyecto |
| [Google Stitch](https://stitch.withgoogle.com/) | Explorar alternativas de UI | Apoyo al diseño, con revisión humana antes de publicar |
| [Apify](https://apify.com/) / [ScrapeGraphAI](https://github.com/ScrapeGraphAI/Scrapegraph-ai) | Investigación de datos públicos y auditoría técnica controlada | Un diagnóstico de URL con alcance, límites y permiso del propietario |

No insertar toda la bóveda en la página: confunde un catálogo de herramientas con capacidad de una agencia. La singularidad proviene de aplicar herramientas a un recorrido propio. Revisar licencia y costes antes de revender servicios o embeber productos; n8n se presenta como fair-code, no como una promesa de uso comercial ilimitado y gratuito. El enlace GitHub de Cal.com en la bóveda redirige a cal.diy; para una agenda operativa verificar la opción oficial y su mantenimiento.

### Funciones distintivas ordenadas por valor

1. **Configurador de proyecto.** Tres o cuatro respuestas: necesidad, contenido, funciones y plazo. Devuelve plan sugerido y rango orientativo con exclusiones. Puede empezar sin IA ni backend y debe mostrar que requiere cotización final.
2. **Demo comercial interactiva.** Crear una consulta ficticia, verla en pipeline, cambiar estado y comprobar próxima acción. Sesión aislada y reiniciable; rotular DEMOSTRACIÓN / DATOS FICTICIOS. No reutilizar un CRM interno con leads reales.
3. **Galería de recorridos por sector.** Banda/evento, arquitectura/evaluación, profesional/reserva. El comprador prueba el trabajo, no solo lo lee.
4. **Agenda integrada.** Disponibilidad real y confirmación; alternativa de WhatsApp para quien prefiera contacto directo.
5. **Auditoría de sitio por URL.** Después del backend: disponibilidad, title, enlaces, accesibilidad y rendimiento con límites. Distinguir comprobaciones automáticas de interpretación. Proteger SSRF: bloquear localhost, IP privadas, metadata cloud y redirecciones a ellas; controlar DNS, puertos, tamaño y tiempo. No ofrecer pentest público contra cualquier URL.
6. **Portal de entrega del cliente.** Hitos, documentos, aprobaciones y soporte. Útil al gestionar proyectos; requiere aislamiento por organización y gestión de acceso.
7. **Asistente de alcance.** Chat opcional basado en planes vigentes, que prepara brief y deriva a humano. No cotiza compromisos finales ni accede al CRM. Publicar costes, disponibilidad y tratamiento pertinente.

Un chatbot genérico no debe ser la primera inversión: puede añadir coste sin resolver la claridad comercial ni el contacto fallido. El configurador y la demo son más controlables y muestran directamente tu capacidad.

## Strix: estado y ejecución pendiente

[Strix oficial](https://github.com/usestrix/strix) es una herramienta de pruebas de seguridad con agentes y validación de hallazgos. Su documentación exige Docker en ejecución y una clave de proveedor LLM para la modalidad local. En este entorno `command -v strix` y `command -v docker` no devolvieron ejecutables. No se utilizó una clave privada ni se enviaron archivos a Strix Cloud. **No se ejecutó Strix y este informe no es un reporte generado por Strix.**

Al estar disponible el runtime, la revisión autorizada puede comenzar sobre una copia local del repositorio (`strix --target ./app-directory`, según quick start oficial), con versión fijada, presupuesto y alcance delimitado. El pentest dinámico con mayor valor será sobre staging del backend: roles, sesión, RLS, RPC, validación, spam, archivos, XSS y recuperación. No incluir los dominios de clientes en ataques activos sin un alcance autorizado para ellos.

Strix puede complementar, no sustituir, pruebas de aislamiento y revisión de hallazgos. No usar una insignia “seguridad certificada” por haber pasado una herramienta.

## Arquitectura para el siguiente nivel

Frontend público estático → API de leads → PostgreSQL/Supabase → outbox de notificaciones → email/agenda/automatización.

CRM interno con autenticación separada y usuarios invitados. Portal de cliente con membresía por organización y RLS comprobada. CMS privado con publicación validada. Analytics sin PII; negocio y contactos en base de datos con acceso restringido.

No hace falta abandonar HTML estático para mejorar SEO y venta. Tampoco hace falta instalar Next.js solo por tener backend. Elegir framework según CMS, portal, contenido y equipo; Pages puede seguir alojando frontend mientras API corre fuera. Si necesitas controlar cabeceras, SSR o rutas servidor, evaluar hosting compatible antes de migrar.

Antes de producción: una sola ruta de ingesta, migraciones versionadas, variables obligatorias, DB transaccional, permisos de ejecución explícitos, recuperación de backup probada, logs sin PII innecesaria, monitoreo y alertas de error, límites y límites de gasto. Secretos solo en servidor. Separar staging y producción.

La V2.1 aporta ideas valiosas: próxima acción obligatoria, versiones de propuesta y diferencia entre conversación gratuita y diagnóstico pagado. Implementar esas reglas reales antes de añadir un dashboard ornamental. Las propuestas supuestamente inmutables necesitan protección efectiva de escritura, no solo texto de especificación.

## Secuencia de trabajo recomendada

| Fase | Entregable | Criterio de salida |
|---|---|---|
| 0: fiabilidad | Responsive, modal, estado de formulario y artefacto público acotado | Ningún recorte; contacto honesto; archivos internos 404 |
| 1: oferta | Home reorganizada, comparador, casos visuales y condiciones | Prospecto comprende servicio, precio orientativo y siguiente paso |
| 2: captación | API real, analítica, agenda y CRM interno mínimo | Lead persistido, fuente correcta y próxima acción asignada |
| 3: posicionamiento | Páginas de servicios/casos e inspección Search Console | Páginas rastreables e indexación observada; consultas reales registradas |
| 4: demostración | Configurador y demo de sistema comercial | Visitor entiende lo que compra al usarlo; métricas de avance |
| 5: operación | Portal/CMS/automatizaciones y pentest de staging | Roles y tenants aislados, restauración probada y hallazgos resueltos |

Estimaciones de calendario requieren acordar alcance y disponibilidad. Primera prioridad: que tu propia agencia muestre el estándar de contacto, claridad y calidad que estás vendiendo a tus clientes.

## Límites que permanecen

Pendiente: Strix ejecutado, RLS en instancia real, pruebas de roles y tenants, verificación de entrega de correo, seguridad de sesiones, Safari/Android reales, Lighthouse/CrUX, resultados Search Console/analítica, costes y margen de cada plan. No se hicieron commits, pushes, cambios de producto ni despliegues en esta auditoría. El único archivo añadido es este informe, que debe quedar fuera del futuro artefacto público.


## Actualización de portafolio y contacto — 3 de octubre de 2026

El propietario confirmó Naty Entrenadora como proyecto entregado. Se verificó el sitio público https://www.natyentrenadora.com/: propuesta de membresía de entrenamiento, contenido multimedia y enlaces a registro, login y portal de alumnas. Se añadió al portafolio local sin atribuir tasas de conversión, arquitectura privada ni funcionamiento del cobro no comprobados. Complementa los otros casos mostrando una oferta de membresía y acceso a plataforma.

Contacto oficial confirmado: info@lagosolutions.cl y +56961996576. Añadidos al footer y datos estructurados; el teléfono ya coincidía con WhatsApp. Actualizado el destinatario por defecto de alertas en los dos handlers. INTERNAL_ALERT_EMAIL conserva precedencia si está configurada. Estos cambios son locales y no se desplegaron.
