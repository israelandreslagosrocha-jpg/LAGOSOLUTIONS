// ==========================================================================
// LAGOSOLUTIONS CRM — OPERATOR LOGIC (FASE 1)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Estado en Memoria Inicial (Cargado de Base de Datos o Semillas)
    const state = {
        leads: [
            {
                id: 'lead_01',
                company_name: 'Servicios Industriales Norte SpA',
                full_name: 'Rodrigo Valenzuela',
                contact_value: '+56987654321',
                preferred_channel: 'WhatsApp',
                acquisition_source: 'GOOGLE_ORGANIC_SEO',
                pipeline_stage: '02_CONTACTO_INICIADO',
                classification: 'ALTA_PRIORIDAD',
                next_action: 'Llamada de contexto y confirmación de agenda para diagnóstico',
                next_action_date: new Date().toISOString().split('T')[0],
                next_action_owner_name: 'Israel Lagos',
                ttr_minutes: 30,
                created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
                initial_declared_goal: 'VENTAS — Mejorar seguimiento y tiempos de cotización',
                initial_context_statement: 'Tenemos muchas solicitudes de cotización semanales por correo y WhatsApp pero tardamos hasta 4 días en enviar el presupuesto formal.',
                is_action_overdue: false,
                history: [
                    { time: 'Hace 2 horas', text: 'Formulario web recibido (Fuente: Google SEO).' },
                    { time: 'Hace 90 min', text: 'Primer contacto WhatsApp enviado (TTR: 30 min).' }
                ]
            },
            {
                id: 'lead_02',
                company_name: 'Consultores Ambientales Sur',
                full_name: 'Camila Soto',
                contact_value: 'contacto@ambientalsur.cl',
                preferred_channel: 'Email',
                acquisition_source: 'REFERRAL_CLIENT',
                pipeline_stage: '05_DIAGNOSTICO_EN_PROCESO',
                classification: 'ALTA_PRIORIDAD',
                next_action: 'Entregar informe de diagnóstico con hallazgos en planillas Excel',
                next_action_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
                next_action_owner_name: 'Israel Lagos',
                ttr_minutes: 45,
                created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
                initial_declared_goal: 'DATOS — Ordenar información dispersa para decidir mejor',
                initial_context_statement: 'Llevamos 6 años facturando con clientes recurrentes pero toda la información está en 14 planillas Excel distintas sin cruzar.',
                is_action_overdue: false,
                history: [
                    { time: 'Ayer', text: 'Formulario web recibido (Fuente: Referido).' },
                    { time: 'Ayer', text: 'Sesión de indagación realizada. Levantada evidencia E2 en 8 archivos Excel.' }
                ]
            },
            {
                id: 'lead_03',
                company_name: 'Transportes & Carga Central',
                full_name: 'Manuel Morales',
                contact_value: '+56911223344',
                preferred_channel: 'WhatsApp',
                acquisition_source: 'UNKNOWN',
                pipeline_stage: '01_NUEVO_CONTACTO',
                classification: 'REQUIERE_INFORMACION',
                next_action: 'Revisar solicitud web y realizar primer contacto',
                next_action_date: new Date().toISOString().split('T')[0],
                next_action_owner_name: 'Israel Lagos',
                ttr_minutes: null,
                created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
                initial_declared_goal: '⭐ No estoy seguro. Quiero entender primero qué necesita mi empresa',
                initial_context_statement: 'Queremos ordenar la captación de clientes de flotas para empresas mineras.',
                is_action_overdue: true,
                history: [
                    { time: 'Hace 4 horas', text: 'Formulario web recibido (Fuente: Unknown). Pendiente de contacto inicial.' }
                ]
            }
        ],
        diagnostics: [
            {
                id: 'diag_01',
                company_name: 'Consultores Ambientales Sur',
                status: 'IN_REVIEW',
                type: 'FREE_INITIAL_CONVERSATION',
                declared: 'El cliente indica que pierde tiempo consolidando reportes mensuales para la gerencia (E0).',
                observed: 'Se auditaron 14 planillas Excel. 3 personas dedican 12 horas mensuales a copiar celdas entre archivos (E2).',
                finding: 'Unificar la base de registros en PostgreSQL y automatizar el tablero mensual. Ahorro de ~36 horas hombre mensuales.',
                verdict: 'ADAPTAR',
                justification: 'No requiere reconstruir el software contable existente; solo adaptar la ingesta de planillas hacia un repositorio centralizado.'
            }
        ]
    };

    // 2. Navegación entre Vistas
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.crm-view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));

            item.classList.add('active');
            const targetView = item.getAttribute('data-view');
            const viewElement = document.getElementById(`view-${targetView}`);
            if (viewElement) viewElement.classList.add('active');
        });
    });

    // 3. Renderizado de la Tabla de Acciones Priorizadas (Dashboard)
    const renderDueActionsTable = () => {
        const tbody = document.getElementById('tbody-due-actions');
        if (!tbody) return;

        tbody.innerHTML = '';
        state.leads.forEach(lead => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${lead.company_name}</strong></td>
                <td>${lead.full_name}</td>
                <td><span class="badge-stage">${lead.pipeline_stage.replace(/_/g, ' ')}</span></td>
                <td><strong>${lead.next_action}</strong></td>
                <td><span style="${lead.is_action_overdue ? 'color: var(--crm-urgent); font-weight: bold;' : ''}">${lead.next_action_date}</span></td>
                <td>${lead.next_action_owner_name}</td>
                <td><button type="button" class="btn-sm-action" onclick="viewLeadDetail('${lead.id}')">Ver Ficha</button></td>
            `;
            tbody.appendChild(tr);
        });
    };

    // 4. Renderizado del Pipeline Completo
    const renderPipelineTable = () => {
        const tbody = document.getElementById('tbody-pipeline');
        if (!tbody) return;

        tbody.innerHTML = '';
        state.leads.forEach(lead => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${lead.company_name}</strong></td>
                <td>${lead.full_name} (${lead.contact_value})</td>
                <td>${lead.preferred_channel}</td>
                <td><span class="badge-tag">${lead.acquisition_source}</span></td>
                <td><span class="badge-priority badge-${lead.classification.toLowerCase().replace(/_/g, '-')}">${lead.classification}</span></td>
                <td><span class="badge-stage">${lead.pipeline_stage}</span></td>
                <td>${lead.ttr_minutes !== null ? `${lead.ttr_minutes} min` : '<em style="color: red;">Sin contacto</em>'}</td>
                <td><button type="button" class="btn-sm-action" onclick="viewLeadDetail('${lead.id}')">Gestionar</button></td>
            `;
            tbody.appendChild(tr);
        });
    };

    // 5. Renderizado de Expedientes de Diagnóstico (E0-E4)
    const renderDiagnostics = () => {
        const container = document.getElementById('diagnostic-cards-container');
        if (!container) return;

        container.innerHTML = '';
        state.diagnostics.forEach(diag => {
            const card = document.createElement('div');
            card.className = 'diagnostic-card';
            card.innerHTML = `
                <div class="box-header">
                    <h3>${diag.company_name}</h3>
                    <span class="badge-tag">${diag.type}</span>
                </div>
                <div class="diag-evidence-box">
                    <span class="evidence-pill pill-e0">E0 DECLARADO</span>
                    <p style="font-size: 0.85rem; margin-top: 6px;">${diag.declared}</p>
                </div>
                <div class="diag-evidence-box">
                    <span class="evidence-pill pill-e2">E2 REGISTRO OBSERVADO</span>
                    <p style="font-size: 0.85rem; margin-top: 6px;">${diag.observed}</p>
                </div>
                <div style="background-color: #e8f4f0; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    <strong style="color: #137752; font-size: 0.8rem;">HALLAZGO & OPORTUNIDAD:</strong>
                    <p style="font-size: 0.85rem; margin-top: 4px;">${diag.finding}</p>
                </div>
                <p><strong>Veredicto Metodológico:</strong> <span class="badge-tag" style="background-color: #060f22; color: #fff;">${diag.verdict}</span></p>
                <p style="font-size: 0.8rem; color: #64748b; margin-top: 6px;"><em>${diag.justification}</em></p>
            `;
            container.appendChild(card);
        });
    };

    // 6. Modal de Ficha de Lead y Bitácora
    const modal = document.getElementById('lead-detail-modal');
    const btnCloseModal = document.getElementById('btn-close-lead-modal');

    window.viewLeadDetail = (leadId) => {
        const lead = state.leads.find(l => l.id === leadId);
        if (!lead || !modal) return;

        document.getElementById('modal-lead-company').textContent = lead.company_name;
        const content = document.getElementById('modal-lead-content');
        
        let historyHtml = lead.history.map(h => `<li style="font-size: 0.85rem; margin-bottom: 6px;"><strong>${h.time}:</strong> ${h.text}</li>`).join('');

        content.innerHTML = `
            <p><strong>Contacto:</strong> ${lead.full_name} (${lead.contact_value})</p>
            <p><strong>Canal Preferido:</strong> ${lead.preferred_channel}</p>
            <p><strong>Fuente de Captación:</strong> ${lead.acquisition_source}</p>
            <p><strong>Objetivo Declarado:</strong> ${lead.initial_declared_goal}</p>
            <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; margin: 10px 0;">
                <strong>Contexto:</strong>
                <p style="font-size: 0.85rem;">${lead.initial_context_statement}</p>
            </div>
            <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e2e8f0;">
            <h4 style="margin-bottom: 8px;">Próxima Acción (Obligatoria):</h4>
            <p><strong>Acción:</strong> ${lead.next_action}</p>
            <p><strong>Fecha Límite:</strong> ${lead.next_action_date} | <strong>Responsable:</strong> ${lead.next_action_owner_name}</p>
            <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e2e8f0;">
            <h4 style="margin-bottom: 8px;">Historial Cronológico (Memoria):</h4>
            <ul style="padding-left: 20px;">
                ${historyHtml}
            </ul>
        `;

        modal.showModal();
    };

    if (btnCloseModal && modal) {
        btnCloseModal.addEventListener('click', () => modal.close());
    }

    // Inicializar Tablas
    renderDueActionsTable();
    renderPipelineTable();
    renderDiagnostics();
});
