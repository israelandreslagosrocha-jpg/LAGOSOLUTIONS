# LAGOSOLUTIONS — GUÍA TÉCNICA DE MIGRACIÓN AL DOMINIO OFICIAL `lagosolutions.cl`
`docs/DOMAIN_MIGRATION_GUIDE.md`

> **PROPÓSITO:** Lista de verificación técnica para actualizar la identidad pública de la web cuando se adquiera o configure el dominio definitivo `lagosolutions.cl`.  
> **ESTADO ACTUAL:** Operativo en GitHub Pages (`https://israelandreslagosrocha-jpg.github.io/LAGOSOLUTIONS/`).  
> **ESTADO FUTURO:** Dominio principal `https://lagosolutions.cl` (GitHub Pages como infraestructura transparente).

---

## 1. CHECKLIST DE ACTUALIZACIÓN DE CÓDIGO Y METADATOS

Cuando el dominio `lagosolutions.cl` esté activo en NIC Chile y vinculado en los DNS de GitHub Pages / Cloudflare, se deben actualizar los siguientes archivos:

| Archivo | Elemento a Modificar | Valor Actual | Valor Nuevo |
|---|---|---|---|
| **`index.html`** | `<link rel="canonical">` | `https://israelandreslagosrocha-jpg.github.io/LAGOSOLUTIONS/` | `https://lagosolutions.cl/` |
| **`index.html`** | `<meta property="og:url">` | `https://israelandreslagosrocha-jpg.github.io/LAGOSOLUTIONS/` | `https://lagosolutions.cl/` |
| **`index.html`** | `<meta property="og:image">` | `.../LAGOSOLUTIONS/businessman_city_sunrise.jpg` | `https://lagosolutions.cl/businessman_city_sunrise.jpg` |
| **`index.html`** | `Schema.org JSON-LD` (`"url"`, `"logo"`) | URL de GitHub Pages | `https://lagosolutions.cl/` |
| **`sitemap.xml`** | `<loc>` | `https://israelandreslagosrocha-jpg.github.io/LAGOSOLUTIONS/` | `https://lagosolutions.cl/` |
| **`robots.txt`** | `Sitemap:` | `https://israelandreslagosrocha-jpg.github.io/LAGOSOLUTIONS/sitemap.xml` | `https://lagosolutions.cl/sitemap.xml` |
| **`CNAME`** | Archivo en la raíz del repo | *(Inexistente)* | `lagosolutions.cl` |

---

## 2. CONFIGURACIÓN DNS EN CLOUDFLARE / NIC CHILE

1. **Registros A (GitHub Pages):**
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
2. **Registro CNAME (Subdominio `www`):**
   - `www` $\rightarrow$ `israelandreslagosrocha-jpg.github.io.`
3. **Certificado SSL / HTTPS:**
   - Activar *"Enforce HTTPS"* en GitHub Settings $\rightarrow$ Pages tras la propagación de DNS.
