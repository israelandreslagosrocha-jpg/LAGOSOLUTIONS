# LagoSolutions: auditoría de captación, SEO e IA

Fecha de revisión: 13 de octubre de 2026, America/Santiago.
Alcance: sitio público publicado, HTML y scripts del repositorio, búsquedas públicas, comparación de agencias y catálogo de la bóveda IA MarkeTIA. No se implementaron cambios en producción durante esta investigación.

## Dictamen

Recomiendo rediseñar el mensaje comercial y la arquitectura de contenidos. La base actual permite mostrar trabajo real, precios y capacidades, pero su recorrido principal está construido alrededor de una consultoría de diagnóstico. Ese mensaje no coincide con la intención de alguien que quiere contratar una página web o una aplicación.

No hay datos disponibles para afirmar que actualmente convierte bien, ocupa posiciones destacadas o recibe recomendaciones habituales de asistentes de IA. Tampoco sería correcto afirmar que convierte mal basándonos solo en su diseño. La inspección identifica obstáculos e hipótesis que deben medirse.

## Evidencias observadas

| Área | Evidencia | Interpretación y límite |
|---|---|---|
| Disponibilidad | La portada devuelve HTTP 200 mediante HTTPS. Las variantes HTTP y sin www terminan en la URL canónica con www. | No hay un bloqueo de acceso general visible en estas comprobaciones. |
| Rastreo | robots.txt permite el rastreo general; el HTML tiene index, follow y canonical. | Permitir rastreo no acredita visitas de robots ni inclusión en índices. |
| Sitemap | Solo contiene la portada. lastmod sigue en 2026-08-31 pese a cambios posteriores. | Se debe actualizar con fechas reales de modificaciones significativas y futuras páginas. La fecha antigua no prueba por sí sola un problema de indexación. |
| Google | La búsqueda directa site:lagosolutions.cl no devolvió resultados en esta sesión. | Señal de alerta; la inspección de URL en Search Console debe confirmar el estado y la causa. No es una prueba exhaustiva del índice. |
| Search Console | En la cuenta disponible se mostró una pantalla para añadir sitio, sin informes del dominio. | No permite afirmar que nadie lo haya verificado en otra cuenta. No se creó una propiedad ni se modificó DNS. |
| Descubrimiento público | Las consultas de marca, dominio y servicios realizadas con la herramienta de búsqueda no aportaron resultados del dominio. | Muestra limitada; no equivale a un seguimiento de posiciones por palabra, ubicación y fecha. |
| Analítica | No se encontraron GA4, GTM, Plausible ni otro proveedor de medición en los scripts revisados y cargados por la portada. | No hay evidencia disponible de un embudo de medición web operativo. Podría existir seguimiento externo fuera de lo inspeccionado. |
| Contenido | Aproximadamente 4.489 palabras en el HTML, incluyendo paneles, fichas y formulario; 13 secciones más el hero. | No son 4.489 palabras visibles simultáneamente. La cantidad no constituye una penalización SEO. La repetición y el orden dificultan la decisión comercial. |
| Jerarquía | En la vista de escritorio observada, proyectos comienza aproximadamente a 2.444 px del inicio y servicios a 7.651 px. | La prueba y la oferta concreta aparecen tarde. Medición de esa vista, no un valor universal para todos los dispositivos. |
| Rendimiento | La API pública PageSpeed devolvió 429 por cuota del servicio. | No se obtuvo una medición Lighthouse ni datos de campo Core Web Vitals. No asignar una puntuación inventada. |

## Problemas comerciales prioritarios

### 1. El primer mensaje no identifica suficientemente el servicio

Título actual: “LAGOSOLUTIONS | Diagnóstico y Desarrollo de Sistemas Digitales”. H1 actual: “Antes de construir una solución, entendemos cómo funciona su empresa.” Ambos describen un enfoque, pero no dicen claramente que se venden webs y aplicaciones en Chile.

Propuesta de trabajo, pendiente de validar con el público objetivo:

- Título: “Diseño web y aplicaciones a medida en Chile | LagoSolutions”.
- H1: “Webs y aplicaciones a medida para captar clientes y simplificar tu negocio”.
- Apoyo: “Desde una landing hasta una plataforma con usuarios y panel de gestión. Explora proyectos publicados y elige el alcance que necesita tu negocio”.
- Acción principal: “Cotizar mi proyecto”.
- Acción secundaria: “Ver webs y aplicaciones”.

La comprensión del negocio debe conservarse como método y diferenciador, detrás de una oferta explícita. No atribuir incrementos de ventas garantizados al desarrollo.

### 2. Dos segmentos reciben el mismo discurso

La portada se dirige a “Empresas con Operación Activa”, pero START de $200.000 también podría interesar a alguien que inicia su presencia online. Pedir diagnóstico operativo a ambos puede producir fricción.

Proponer dos caminos:

- Necesito una web: presentación, servicios, contacto, precio, plazo y alcance.
- Necesito una aplicación o sistema: usuarios, datos, procesos, integraciones y evaluación de alcance.

Un diagnóstico más profundo puede seguir siendo la entrada de los proyectos complejos. No tiene por qué ser requisito para una consulta sencilla.

### 3. La educación necesita otra ubicación

Se repite el principio de entender antes de construir mediante filosofía, reconocimiento, cinco pasos, diez etapas, mapa, fuentes de datos, ejemplos y actuar/no actuar.

Recomiendo una portada con siete bloques:

1. Oferta explícita y prueba visual.
2. Proyectos destacados con imágenes y enlaces.
3. Servicios agrupados en tres categorías comprensibles.
4. Opciones de inversión resumidas y acceso al comparador.
5. Casos y testimonios verificables.
6. Proceso de tres pasos.
7. Preguntas decisivas y contacto.

La metodología completa debe vivir en su propia página. La analogía del restaurante es útil junto al comparador de planes; no debe interrumpir el acceso a precio, muestra o contacto. Como objetivo editorial inicial, reducir alrededor de la mitad de la explicación metodológica en portada, conservándola organizada en páginas específicas. Esto no es un umbral SEO ni una promesa de conversión.

### 4. La confianza debe tener rostro y prueba

Mantener capturas y enlaces reales. Crear casos con contexto, funciones implementadas, decisiones y evidencia observable. Publicar resultados comerciales únicamente cuando haya datos y permiso del cliente. Mostrar quién responde y desarrolla, con identidad profesional real y responsabilidades claras.

HarmoniGrid.com y HarmoniGrid.app son dos experiencias de un mismo producto. No presentarlas como dos clientes independientes. Confirmar qué proyectos son de clientes y cuáles son productos propios antes de usar cifras de clientes.

Reducir mensajes defensivos como “no mostramos conceptos inventados” o “sin métricas infladas”. Sustituirlos por información afirmativa y verificable: proyecto, alcance y enlace. Las advertencias sobre métricas no medidas pueden quedar en el caso completo cuando aporten contexto.

### 5. El formulario pide demasiado para una primera conversación

El formulario actual reúne ocho controles, seis obligatorios. Incluye empresa, objetivo operativo y descripción del funcionamiento del negocio. Además, sin backend prepara un mensaje que el visitante debe enviar en WhatsApp o correo.

Probar un inicio breve: nombre, canal de contacto y qué necesita; el resto puede preguntarse después. Enviar un mensaje a WhatsApp no debe confundirse con abrir un enlace. La posterior implementación del backend debe guardar la consulta y devolver confirmación real; el cliente potencial no debería descubrir al final que todavía tiene que realizar otro envío.

## Comparables revisados

No se dispuso de sus conversiones, rentabilidad ni Search Console. Son referencias de estructura observable, no ejemplos de éxito comercial demostrado.

| Referencia | Patrón observado | Aplicación para LagoSolutions |
|---|---|---|
| desarrolloweb.cl | Oferta explícita de webs/apps, servicios con páginas propias, precios y rutas de cotización. | Separar intenciones de búsqueda y mostrar alcance antes que metodología extensa. |
| Sova, desarrollo web | Entregable visible, precios, plazos declarados y preguntas comerciales. | Responder qué se recibe, cuánto cuesta y cómo empezar. No copiar promesas que no podamos sostener. |
| Ramotion | Casos, servicios diferenciados y testimonios atribuidos a personas y empresas. | Hacer que el portafolio pruebe capacidad y confianza. Su público y escala son distintos. |

Fuentes: https://www.desarrolloweb.cl/ · https://sova.cl/agencia-desarrollo-web · https://www.ramotion.com/

## SEO: pasar de una portada extensa a un sitio con intenciones claras

Los anclajes como #planes y #proyectos son navegación dentro de una página; no sustituyen páginas de servicio independientes. Propongo crear gradualmente estas rutas, cada una con contenido original y alcance real:

- /diseno-web/ — páginas web para empresas en Chile, alcance y casos relacionados.
- /landing-pages/ — campañas y presentación de una oferta.
- /aplicaciones-web/ — usuarios, datos, paneles e integraciones.
- /proyectos/ y casos individuales.
- /planes/ — precios, exclusiones y costes recurrentes.
- /nosotros/ y /contacto/.

Añadir SEO o automatización como servicios separados solo si realmente se prestan con entregables propios. Evitar crear páginas para muchas ciudades cambiando únicamente el nombre. Las expresiones propuestas son hipótesis de intención; no se han obtenido volúmenes, CPC ni dificultad con una base de palabras clave.

Cada página debe tener título, H1, descripción, canonical y enlaces internos coherentes. Actualizar sitemap con las URLs definitivas y fechas verdaderas. La etiqueta meta keywords actual no aporta posicionamiento en Google. Los datos estructurados deben reflejar la información visible y no inventar reseñas ni ubicaciones.

Primer paso técnico: verificar propiedad de dominio en Search Console y Bing Webmaster Tools; inspeccionar URL, canonical elegida, rastreo y posibles causas de exclusión; enviar sitemap. Es necesario observar el diagnóstico antes de atribuir la ausencia a una causa concreta.

Referencias: https://developers.google.com/search/docs/crawling-indexing/url-structure · https://support.google.com/webmasters/answer/9012289 · https://developers.google.com/search/docs/crawling-indexing/special-tags

## ¿Las IA la recomiendan?

No se ha demostrado. El robots.txt permite el acceso general, pero no se verificaron registros de rastreo ni citas históricas. Consultar una IA en una conversación que ya contiene LagoSolutions sesgaría la prueba.

Para medirlo:

- Registrar preguntas comerciales sin mencionar la marca, motor/modelo, fecha, ubicación y fuentes citadas. Repetir un panel fijo y conservar evidencia.
- Consultar AI Performance de Bing Webmaster Tools para las superficies que cubre; sus citas no equivalen a recomendaciones comerciales ni a clientes.
- Medir tráfico referido desde asistentes, contactos cualificados y ventas. Una recomendación sin clic puede no generar una visita medible.
- Publicar casos, precios y respuestas concretas que aporten conocimiento propio y puedan citarse.

Google indica que sus funciones de IA usan los fundamentos habituales de SEO y no exigen archivos especiales de IA ni un schema específico. OpenAI distingue el robot de búsqueda OAI-SearchBot del robot de entrenamiento GPTBot. Habilitar acceso no garantiza aparecer.

Fuentes: https://developers.google.com/search/docs/appearance/ai-features · https://developers.openai.com/api/docs/bots · https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c

## Bóveda IA MarkeTIA: selección concreta

El catálogo fue consultado con autorización del usuario. Se verificaron los repositorios oficiales de los recursos principales. No se instalaron ni ejecutaron herramientas.

| Recurso localizado | Uso recomendado | Prioridad |
|---|---|---|
| Marketing Skills | Posicionamiento, ofertas, copywriting, CRO, SEO y medición. Empezar por contexto del producto y público. | Alta |
| Plausible Analytics | Medir páginas, fuentes y eventos. Elegir Plausible o GA4 según necesidades, sin duplicar por costumbre. | Alta |
| Penpot / Google Stitch | Diseñar dos propuestas del nuevo hero, jerarquía y páginas de servicio antes de rehacer toda la web. | Media-alta |
| Cal.com | Reserva de una llamada de alcance con disponibilidad real. Preferible carga bajo demanda. | Media |
| n8n | Con backend listo: consulta → registro → aviso → seguimiento; evitar consultas perdidas. | Media |
| Strix | Seguridad de la futura aplicación y backend en un entorno autorizado. No mejora rankings ni reemplaza SEO. | Según backend |
| Guía RANKEAR | Localizada en catálogo, pero su enlace exige inicio de sesión en Claude. | Contenido no auditado |

Enlaces: https://github.com/coreyhaines31/marketingskills · https://github.com/plausible/analytics · https://github.com/penpot/penpot · https://stitch.withgoogle.com/ · https://github.com/calcom/cal.com · https://github.com/n8n-io/n8n · https://github.com/usestrix/strix

## Herramientas que mostraría en la propia web

1. Orientador de proyecto: tres preguntas para recomendar alcance y explicar por qué. Comparación y precio orientativo abiertos; contacto opcional al final.
2. Cotizador con reglas transparentes: módulos y rangos, gastos recurrentes y supuestos. No presentar una estimación como presupuesto cerrado.
3. Demostración de una aplicación: consultar un lead de ejemplo, cambiar su estado y mostrar un panel con datos ficticios etiquetados.
4. Comparador de planes actual, simplificado e integrado en una página dedicada.

La combinación de oferta clara, pruebas y una herramienta útil puede diferenciar más que añadir varias animaciones o un chatbot genérico. Un chatbot solo tendría sentido con alcance, precios, respuestas y derivación humana bien definidos.

## Plan de trabajo y medición

| Orden | Entregable | Cómo se verifica |
|---|---|---|
| 1 | Línea base de indexación y medición | Propiedades verificadas, informe de URL y sitemap; eventos comprobados. |
| 2 | Nuevo hero y recorrido breve | Usuarios del segmento identifican oferta, destinatario y siguiente paso sin explicación del autor. |
| 3 | Servicios y casos independientes | URLs rastreables, contenido original, enlaces y metadatos correctos. |
| 4 | Confianza y contacto | Identidad real, testimonios autorizados, condiciones claras y consulta registrada. |
| 5 | Orientador o cotizador | Uso medido y comparación de consultas cualificadas frente al recorrido anterior. |
| 6 | Distribución | Casos en canales profesionales, referencias y enlaces legítimos; campañas controladas a servicios concretos. |
| 7 | Revisión continua | Impresiones sin marca, clics, contactos cualificados, propuestas y ventas por fuente. |

No medir el éxito solo con puntuaciones Lighthouse, visitas, impresiones o clics en WhatsApp. Distinguir apertura de contacto, consulta recibida, consulta cualificada, propuesta y venta. La posición media agrega consultas distintas y no debe convertirse en una promesa de primer lugar.

Revisar semanalmente captación y fallos del embudo. Evaluar evolución orgánica por periodos comparables y dar tiempo al rastreo y a los datos; no prometer posiciones en un número fijo de días. Para conseguir conversaciones mientras se construye SEO, usar referencias de clientes, casos bien distribuidos y campañas acotadas cuando haya medición y oferta preparadas.

## Límites del análisis

Sin datos históricos de Search Console, Bing, analítica, CRM, ingresos, backlinks o pruebas con compradores, no se pueden atribuir tasas de conversión ni cuantificar retorno. No se realizó un pentest ni una medición válida de Core Web Vitals. La guía privada RANKEAR no pudo leerse. La investigación justifica las prioridades propuestas; los resultados deben validarse con datos reales.
