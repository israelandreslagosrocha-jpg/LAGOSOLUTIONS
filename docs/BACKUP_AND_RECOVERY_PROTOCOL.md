# LAGOSOLUTIONS — PROTOCOLO DE RESPALDO, RECUPERACIÓN Y RETENCIÓN (FASE 1)
`docs/BACKUP_AND_RECOVERY_PROTOCOL.md`

> **ESTADO DEL DOCUMENTO:** Manual Operativo de Continuidad de Negocio y Protección de Datos.  
> **FECHA DE APROBACIÓN:** 29 de Agosto de 2026  
> **OBJETIVO:** Garantizar la integridad absoluta de la base de datos comercial, recuperación comprobada ante desastres y políticas de retención sin inventar sobrecargas legales.

---

## 1. ESTRATEGIA DE RESPALDO AUTOMÁTICO (BACKUP)

La base de datos de LAGOSOLUTIONS (PostgreSQL alojado en Supabase / Cloudflare D1) cuenta con una estrategia de respaldo por capas:

1. **Respaldos Diarios Automatizados (Automated Daily Backups):**
   - Frecuencia: Cada 24 horas a las 03:00 UTC.
   - Retención básica: 7 días de instantáneas completas en frío.
2. **Point-In-Time Recovery (PITR):**
   - Activado para bases de datos de producción con escritura transaccional continua (Write-Ahead Logging - WAL).
   - Permite restaurar el estado exacto de la base de datos a cualquier segundo específico de los últimos 7 días.
3. **Exportación Manual Semanal de Seguridad (`pg_dump`):**
   - Script programado para generar un archivo cifrado `.sql.gz` fuera del proveedor principal.

```bash
# Comando de exportación manual segura (Solo para ADMIN):
pg_dump -h db.lagosolutions.supabase.co -U postgres -d postgres -F c -b -v -f "lagosolutions_backup_$(date +%Y%m%d).dump"
```

---

## 2. PROCEDIMIENTO DE RESTAURACIÓN Y PRUEBA DE RECUPERACIÓN

Ante una corrupción de datos, falla del proveedor o eliminación accidental, se ejecuta el siguiente protocolo:

### Paso a Paso de Restauración:
1. **Aislamiento:** Detener temporalmente las peticiones entrantes del endpoint de ingesta activando el modo mantenimiento en Cloudflare / Edge Function.
2. **Creación de Instancia de Respaldo:** Restaurar el dump en un schema temporal (`staging_restore`) para no sobrescribir la base activa a ciegas.
3. **Verificación de Integridad:**
   ```sql
   -- Comprobar conteo de registros clave antes de conmutar
   SELECT count(*) FROM staging_restore.lead_contacts;
   SELECT count(*) FROM staging_restore.diagnostic_case_files;
   ```
4. **Conmutación:** Si la verificación es exitosa, promover el schema restaurado a producción (`public`).
5. **Reanudación:** Reactivar la API y comprobar el envío de un lead de prueba.

---

## 3. POLÍTICA DE RETENCIÓN, ELIMINACIÓN Y ANONIMIZACIÓN

### Reglas de Gestión del Ciclo de Vida del Lead:
- **Leads en Proceso / Ganados:** Se conservan indefinidamente como memoria histórica del cliente y expedientes de diagnóstico.
- **Leads No Cualificados / Spam / Duplicados:** Se marcan con `is_archived = TRUE` y se purgan automáticamente tras **90 días**.
- **Derecho de Supresión / Anonimización:** Si un contacto solicita la eliminación de sus datos personales, se ejecuta la función de anonimización:
  ```sql
  -- Anonimización sin romper la integridad estadística del aprendizaje
  UPDATE public.lead_contacts 
  SET 
      full_name = 'Anonimizado',
      contact_value = 'eliminado@anonimo.local',
      website_url = NULL,
      anonymized_at = NOW()
  WHERE id = '<LEAD_UUID>';
  ```

---

## 4. PROTECCIÓN CONTRA ELIMINACIÓN ACCIDENTAL

1. **Soft-Delete por Defecto:** Las interfaces de usuario nunca ejecutan `DELETE FROM lead_contacts`. Modifican el flag `is_archived = TRUE`.
2. **Restricción RLS:** La eliminación física (`DELETE`) está bloqueada a nivel de PostgreSQL para el rol `CONSULTOR` y solo está permitida para el rol `ADMIN` bajo confirmación explícita.
