# Graph Report - SGMB  (2026-10-07)

## Corpus Check
- 116 files · ~70,400 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .css 21, (none) 6, .log 3)

## Summary
- 1040 nodes · 2367 edges · 67 communities (39 shown, 28 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 214 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `13e93cfd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- routers/branch.py
- CorrectiveRequestListComponent
- ToastService
- package.json
- app.routes.ts
- User
- frontend
- confirm.service.ts
- assets-list.component.ts
- assigned-tasks-list.component.ts
- routers/corrective_request.py
- UsersListComponent
- AssignedTasksListComponent
- AssetsListComponent
- test_authz.py
- routers/asset.py
- VisitFormComponent
- ReportsDashboardComponent
- users.py
- visit-form.component.ts
- test_units_v2.py
- Resultados de Pruebas SGMB
- Asset
- Capítulo V Análisis de Resultados SGMB
- MaintenanceVisitService
- corrective-requests-list.component.ts
- backend requirements.txt
- Resultados de Pruebas Unitarias v2
- Branch
- Tareas: endurecer el contrato de usuarios
- routers/auth.py
- Flujo DESPUES - Dashboard de Reportes en SGMB
- generar_capitulo5.py
- test_subida_hoja_firmada_valida_tipo_y_tamano
- routers/assigned_task.py
- CorrectiveRequestPrintComponent
- User
- VisitPrintComponent
- AppShell layout template
- Dashboard template
- tsconfig.app.json
- Average Duration per Test (10 tests) Chart
- auth_headers
- config.py
- App root template
- EquipmentIconComponent
- Spec: Endurecer autorización y subida de archivos (auditoría, puntos 1–4)
- Logo BOFASA 40 anos (Distribuyendo Bienestar desde 1986)
- PaginationComponent
- VisitDetailComponent
- Solicitudes Unit Test Duration Chart
- Visitas Unit Test Duration Chart
- cleanup.sh
- seed.sh
- Pagination template
- BulkBranchAssetsComponent
- CLAUDE.md
- @angular/core
- VisitListComponent
- equipment-category.ts
- VisitScheduleComponent
- LoginComponent

## God Nodes (most connected - your core abstractions)
1. `User` - 75 edges
2. `@angular/core` - 49 edges
3. `AssetsListComponent` - 44 edges
4. `Asset` - 36 edges
5. `CorrectiveRequestListComponent` - 36 edges
6. `Branch` - 34 edges
7. `@angular/common` - 31 edges
8. `VisitFormComponent` - 31 edges
9. `User` - 30 edges
10. `MaintenanceVisit` - 29 edges

## Surprising Connections (you probably didn't know these)
- `Estrategia de testing` --references--> `get_current_user()`  [INFERRED]
  SPEC.md → backend/app/utils/dependencies.py
- `Fuera de alcance` --references--> `UserRole`  [INFERRED]
  tasks/plan.md → frontend/src/app/core/services/users.service.ts
- `Estilo de código` --references--> `update_asset()`  [INFERRED]
  SPEC.md → backend/app/routers/asset.py
- `Estructura y archivos afectados` --references--> `_check_visit_read()`  [INFERRED]
  SPEC.md → backend/app/routers/maintenance_visit.py
- `Estructura y archivos afectados` --references--> `update_visit()`  [INFERRED]
  SPEC.md → backend/app/routers/maintenance_visit.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Flujos digitalizados con SGMB con historial compartido** — documentacion_capitulo5_analisis_resultados_flujos_flujo_reportes_despues_sgmb_reports_dashboard_flow, documentacion_capitulo5_analisis_resultados_flujos_flujo_solicitudes_despues_sgmb_corrective_request_flow, documentacion_capitulo5_analisis_resultados_flujos_flujo_visitas_despues_automatic_preventive_visit_flow [EXTRACTED 1.00]
- **Indicadores Antes vs Despues por modulo (tiempo, errores, personal, insumos)** — documentacion_capitulo5_analisis_resultados_graficas_grafica_tiempos_proceso_process_time_chart, documentacion_capitulo5_analisis_resultados_graficas_grafica_tasa_errores_error_rate_chart, documentacion_capitulo5_analisis_resultados_graficas_grafica_personal_staff_chart, documentacion_capitulo5_analisis_resultados_graficas_grafica_insumos_supplies_chart [EXTRACTED 1.00]
- **Global app-root overlays and services** — frontend_src_app_app_template, frontend_src_app_shared_confirm_dialog_confirm_dialog_component_template, frontend_src_app_shared_toast_container_toast_container_component_template, frontend_src_app_shared_confirm_dialog_confirm_dialog_component_confirmservice, frontend_src_app_shared_toast_container_toast_container_component_toastservice [EXTRACTED 1.00]
- **Formal test cycle across U/INT/SIS/ACEP levels** — backend_pruebas_resultados_pruebas_u01, backend_pruebas_resultados_pruebas_int01, backend_pruebas_resultados_pruebas_sis01, backend_pruebas_resultados_pruebas_acep01, backend_pruebas_resultados_pruebas_pytest, backend_pruebas_resultados_pruebas_playwright [EXTRACTED 1.00]
- **Role/ownership access-control checks** — backend_pruebas_resultados_pruebas_require_roles, backend_pruebas_resultados_unitarios_check_visit_access, backend_pruebas_resultados_unitarios_check_request_access, backend_pruebas_resultados_pruebas_int03 [INFERRED 0.85]
- **Procesos manuales previos (Excel, papel, telefono)** — documentacion_capitulo5_analisis_resultados_flujos_flujo_reportes_antes_manual_report_consolidation_flow, documentacion_capitulo5_analisis_resultados_flujos_flujo_solicitudes_antes_manual_fault_reporting_flow, documentacion_capitulo5_analisis_resultados_flujos_flujo_visitas_antes_manual_preventive_maintenance_flow [INFERRED 0.85]
- **E2E corrective request flow: login, create, close** — backend_pruebas_screenshots_sis01_login_admin_dashboard, backend_pruebas_screenshots_sis02_crear_solicitud_solicitudes_page, backend_pruebas_screenshots_acep01_cerrar_solicitud_closed_request_list [INFERRED 0.85]
- **Maintenance Visit Lifecycle** — frontend_src_app_features_maintenance_visits_pages_visit_schedule_visit_schedule_component_template, frontend_src_app_features_maintenance_visits_pages_visit_list_visit_list_component_template, frontend_src_app_features_maintenance_visits_pages_visit_form_visit_form_component_template, frontend_src_app_features_maintenance_visits_pages_visit_detail_visit_detail_component_template, frontend_src_app_features_maintenance_visits_pages_visit_print_visit_print_component_template [INFERRED 0.85]
- **Printable Signed Report Flow** — frontend_src_app_features_maintenance_visits_pages_visit_form_visit_form_component_template, frontend_src_app_features_maintenance_visits_pages_visit_print_visit_print_component_template, frontend_src_app_features_maintenance_visits_pages_visit_detail_visit_detail_component_template, frontend_src_app_features_maintenance_visits_pages_visit_form_visit_form_component_signed_report_sheet [INFERRED 0.85]
- **Per-module unit test duration charts** — backend_pruebas_screenshots_graf_dur_auth_auth_duration_chart, backend_pruebas_screenshots_graf_dur_solicitudes_solicitudes_duration_chart, backend_pruebas_screenshots_graf_dur_visitas_visitas_duration_chart [INFERRED 0.95]
- **Per-module unit test success charts (5 reps, 100% OK)** — backend_pruebas_screenshots_graf_ok_auth_auth_success_chart, backend_pruebas_screenshots_graf_ok_solicitudes_solicitudes_success_chart, backend_pruebas_screenshots_graf_ok_visitas_visitas_success_chart [INFERRED 0.95]

## Communities (67 total, 28 thin omitted)

### Community 0 - "routers/branch.py"
Cohesion: 0.18
Nodes (11): Branch, create_branch(), get_branch(), get_branches(), update_branch(), update_branch_status(), BranchBase, BranchCreate (+3 more)

### Community 1 - "CorrectiveRequestListComponent"
Cohesion: 0.06
Nodes (3): CorrectiveRequest, CorrectiveRequestListComponent, DashboardComponent

### Community 2 - "ToastService"
Cohesion: 0.29
Nodes (3): Toast, ToastService, ToastType

### Community 3 - "package.json"
Cohesion: 0.04
Nodes (42): dependencies, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, rxjs (+34 more)

### Community 4 - "app.routes.ts"
Cohesion: 0.18
Nodes (14): routes, authGuard(), roleGuard(), authInterceptor(), withReadableDetail(), MaintenanceVisit, ClientRow, ActivityEntry (+6 more)

### Community 5 - "User"
Cohesion: 0.08
Nodes (49): MaintenanceVisit, MaintenanceVisitChecklistEntry, MaintenanceVisitItem, User, me(), add_checklist_entries(), add_visit_item(), _check_entries_belong_to_visit() (+41 more)

### Community 6 - "frontend"
Cohesion: 0.05
Nodes (38): build, serve, test, builder, configurations, defaultConfiguration, options, cli (+30 more)

### Community 7 - "confirm.service.ts"
Cohesion: 0.24
Nodes (4): ConfirmOptions, ConfirmService, ConfirmState, ConfirmDialogComponent

### Community 8 - "assets-list.component.ts"
Cohesion: 0.13
Nodes (9): LabelPipe, AssetUpdate, BRANCH_CHAINS, BranchCreate, BranchesService, BranchUpdate, SearchService, EQUIPMENT_CATEGORY_ORDER (+1 more)

### Community 9 - "assigned-tasks-list.component.ts"
Cohesion: 0.10
Nodes (14): AssignedTaskCreate, AssignedTasksService, TASK_TYPE_INVENTORY, TASK_TYPE_LABELS, AuthService, CurrentUser, LoginRequest, LoginResponse (+6 more)

### Community 10 - "routers/corrective_request.py"
Cohesion: 0.13
Nodes (17): CorrectiveRequest, _can_read_request(), change_corrective_request_status(), _check_request_read(), _check_request_work(), create_correctiverequest(), delete_signed_report(), get_corrective_request() (+9 more)

### Community 12 - "AssignedTasksListComponent"
Cohesion: 0.12
Nodes (3): AssignedTask, AssignedTasksListComponent, AppShellComponent

### Community 15 - "test_authz.py"
Cohesion: 0.12
Nodes (5): lifespan(), read_root(), MaintenanceVisitPhoto, preventive_check_loop(), test_INT01_login_valido_devuelve_token()

### Community 16 - "routers/asset.py"
Cohesion: 0.16
Nodes (14): Asset, _can_create_in_branch(), _can_edit_asset(), create_asset(), get_asset(), get_assets(), update_asset(), update_asset_status() (+6 more)

### Community 19 - "users.py"
Cohesion: 0.09
Nodes (24): create_user(), _ensure_admin_access_kept(), get_user(), get_users(), reset_user_password(), toggle_user_status(), update_user(), _visible_user() (+16 more)

### Community 20 - "visit-form.component.ts"
Cohesion: 0.14
Nodes (15): MaintenanceVisitChecklistEntry, MaintenanceVisitChecklistEntryCreate, MaintenanceVisitCreate, MaintenanceVisitItemCreate, MaintenanceVisitPhoto, CHECKLIST_TEMPLATE, ChecklistGroup, CLEANING_CHECKLISTS (+7 more)

### Community 21 - "test_units_v2.py"
Cohesion: 0.13
Nodes (11): require_roles(), hash_password(), verify_password(), test_U01_hash_and_verify_password_roundtrip(), test_U02_require_roles_denies_non_matching_role(), _fake_user(), test_AUTH_U01_hash_and_verify_password_roundtrip(), test_AUTH_U02_verify_password_rejects_wrong_password() (+3 more)

### Community 22 - "Resultados de Pruebas SGMB"
Cohesion: 0.22
Nodes (15): ACEP01 Technician closes request with signed PDF, Deprecation findings (Pydantic class Config, .dict(), on_event startup), Resultados de Pruebas SGMB, INT01 Login against real Postgres, INT02 Create corrective request persisted, INT03 Block access to another technician's request, INT04 Visit with nested items and checklist, PostgreSQL mantenimiento_db (+7 more)

### Community 24 - "Capítulo V Análisis de Resultados SGMB"
Cohesion: 0.23
Nodes (14): BOFASA, Capítulo V Análisis de Resultados SGMB, Flujo 3 Reportes dashboard, Flujo 1 Solicitudes Correctivas, Flujo 2 Visitas Preventivo, Hipótesis: SGMB reduce tiempos, errores e insumos, Métricas TP, TE, Personal, Insumos, Módulo Auth / Control de Acceso (+6 more)

### Community 26 - "corrective-requests-list.component.ts"
Cohesion: 0.13
Nodes (5): API_BASE_URL, AssetsService, CorrectiveRequestCreate, CorrectiveRequestService, CorrectiveRequestUpdate

### Community 27 - "backend requirements.txt"
Cohesion: 0.15
Nodes (12): hash_password / verify_password, U01 Password hash/verify, alembic, email-validator, FastAPI, backend requirements.txt, passlib[bcrypt], psycopg2-binary (+4 more)

### Community 28 - "Resultados de Pruebas Unitarias v2"
Cohesion: 0.19
Nodes (12): AUTH-U03 verify_token invalid returns None, _check_request_access, _check_visit_access, CorrectiveRequestCreate schema, Resultados de Pruebas Unitarias v2, SOL-U01 CorrectiveRequestCreate requires description, SOL-U02 _check_request_access denies, verify_token (+4 more)

### Community 30 - "Tareas: endurecer el contrato de usuarios"
Cohesion: 0.50
Nodes (3): Checkpoint, Fase 1, Tareas: endurecer el contrato de usuarios

### Community 31 - "routers/auth.py"
Cohesion: 0.14
Nodes (7): get_db(), login(), _recent_failures(), get_current_user(), create_access_token(), verify_token(), test_AUTH_U03_verify_token_returns_none_for_invalid_token()

### Community 32 - "Flujo DESPUES - Dashboard de Reportes en SGMB"
Cohesion: 0.20
Nodes (12): Flujo ANTES - Reporte consolidado manual (Reportes), Flujo DESPUES - Dashboard de Reportes en SGMB, Flujo ANTES - Reporte de falla manual (Solicitudes Correctivas), Hoja firmada digital de cierre, Flujo DESPUES - Solicitud correctiva en SGMB, Flujo ANTES - Mantenimiento preventivo manual (Visitas), Programacion automatica de mantenimiento preventivo por frecuencia, Flujo DESPUES - Visita preventiva automatica en SGMB (+4 more)

### Community 35 - "routers/assigned_task.py"
Cohesion: 0.20
Nodes (4): AssignedTask, close_assigned_task(), create_assigned_task(), get_assigned_tasks()

### Community 37 - "User"
Cohesion: 0.20
Nodes (5): User, UserCreate, UsersService, UserUpdate, @angular/forms

### Community 39 - "AppShell layout template"
Cohesion: 0.25
Nodes (8): require_roles, U02 Role rejection require_roles, RBAC-U01 require_roles allows admin, Technician assigned-task notifications, Global search box, Sidebar navItems (role-based nav), AppShell layout template, ThemeService toggle/dark

### Community 40 - "Dashboard template"
Cohesion: 0.25
Nodes (8): run_preventive_check, U03 Overdue preventive visit generation, Recent activity feed, Critical corrective requests panel, Dashboard KPIs (open requests, completion rate, assets in maintenance), Overdue visits panel, Dashboard template, Maintenance visits calendar

### Community 41 - "tsconfig.app.json"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, types, exclude, extends, include, ./tsconfig.json

### Community 42 - "Average Duration per Test (10 tests) Chart"
Cohesion: 0.38
Nodes (7): ACEP01 Closed Corrective Request (Tecnico view), Auth/RBAC Unit Test Duration Chart, Auth/RBAC Unit Test Success Chart, Average Duration per Test (10 tests) Chart, Success Rate per Test (10 tests) Chart, SIS01 Login -> Admin Dashboard, SIS02 Create Request - Solicitudes Correctivas Page

### Community 43 - "auth_headers"
Cohesion: 0.29
Nodes (4): auth_headers(), test_INT02_crear_solicitud_persiste_en_bd(), test_INT03_tecnico_no_asignado_no_puede_ver_solicitud_ajena(), test_INT04_crear_visita_con_equipos_y_checklist()

### Community 45 - "App root template"
Cohesion: 0.40
Nodes (6): App root template, ConfirmService (state/respond), ConfirmDialog template, ToastContainer template, ToastService (toasts/dismiss), index.html (app-root host)

### Community 46 - "EquipmentIconComponent"
Cohesion: 0.23
Nodes (12): Corrective Request Print Template, Corrective Requests List Template, Visit Detail Template, Branch Equipment Summary, Equipment Change and Delivery, Signed Report Sheet (Hoja firmada), Visit Form Template, Visit List Template (+4 more)

### Community 47 - "Spec: Endurecer autorización y subida de archivos (auditoría, puntos 1–4)"
Cohesion: 0.20
Nodes (9): Comandos, Criterios de éxito, Decisiones (antes "Preguntas abiertas"), Estrategia de testing, Límites, Matriz de permisos propuesta, Objetivo, Spec: Endurecer autorización y subida de archivos (auditoría, puntos 1–4) (+1 more)

### Community 48 - "Logo BOFASA 40 anos (Distribuyendo Bienestar desde 1986)"
Cohesion: 0.67
Nodes (3): Logo BOFASA 40 anos (Distribuyendo Bienestar desde 1986), Icono BOFASA 40 anos, Logos de marcas del grupo (Bodega Farmaceutica, Meykos, Cruz Verde, Farmacias del Ahorro)

### Community 49 - "PaginationComponent"
Cohesion: 0.22
Nodes (8): Asset Decommission (Baja) Approval, Modal CRUD Form Pattern, Assets List Template (Equipos), Bulk Branch Assets Template, Assigned Tasks List Template, Branches List Template (Sucursales), Users List Template, PaginationComponent

### Community 62 - "@angular/core"
Cohesion: 0.08
Nodes (4): App, ThemeService, ToastContainerComponent, @angular/core

### Community 64 - "equipment-category.ts"
Cohesion: 0.14
Nodes (7): CATEGORY_KEYWORDS, EQUIPMENT_DEFAULT_TYPE, equipmentCategory(), groupByEquipmentCategory(), isCpuType(), isDvrType(), isMonitorType()

## Knowledge Gaps
- **142 isolated node(s):** `$schema`, `version`, `packageManager`, `analytics`, `newProjectRoot` (+137 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 428 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserRole` connect `assigned-tasks-list.component.ts` to `users.py`, `UsersListComponent`, `User`?**
  _High betweenness centrality (0.379) - this node is a cross-community bridge._
- **Are the 57 inferred relationships involving `User` (e.g. with `_can_create_in_branch()` and `_can_edit_asset()`) actually correct?**
  _`User` has 57 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _142 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CorrectiveRequestListComponent` be split into smaller, more focused modules?**
  _Cohesion score 0.061495457721872815 - nodes in this community are weakly interconnected._
- **Why does `Fuera de alcance` connect `users.py` to `assigned-tasks-list.component.ts`?**
  _High betweenness centrality (0.376) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Should `User` be split into smaller, more focused modules?**
  _Cohesion score 0.07711711711711712 - nodes in this community are weakly interconnected._