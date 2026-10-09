# Graph Report - SGMB  (2026-10-08)

## Corpus Check
- 122 files · ~73,790 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 34 file(s) not represented in the graph (top: .css 21, (none) 6, .log 3)

## Summary
- 1094 nodes · 2515 edges · 60 communities (41 shown, 19 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 221 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `38fd47b2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- schemas/asset.py
- CorrectiveRequestListComponent
- @angular/core
- package.json
- app.routes.ts
- User
- frontend
- test_scheduler_lock.py
- corrective-requests-list.component.ts
- assigned-tasks-list.component.ts
- test_units_v2.py
- UsersListComponent
- AssignedTasksListComponent
- AssetsListComponent
- test_units.py
- AssignedTask
- VisitFormComponent
- ReportsDashboardComponent
- schemas/user.py
- visit-form.component.ts
- Plan: scheduler preventivo sin visitas duplicadas (auditoría, punto 18)
- Resultados de Pruebas SGMB
- Asset
- Capítulo V Análisis de Resultados SGMB
- MaintenanceVisitService
- CorrectiveRequestService
- backend requirements.txt
- Resultados de Pruebas Unitarias v2
- Branch
- test_authz.py
- test_token_identity.py
- Flujo DESPUES - Dashboard de Reportes en SGMB
- generar_capitulo5.py
- Spec: rendimiento de los listados (auditoría, punto 15)
- routers/asset.py
- CorrectiveRequestPrintComponent
- @angular/common
- VisitDetailComponent
- AppShell layout template
- Dashboard template
- tsconfig.app.json
- Average Duration per Test (10 tests) Chart
- test_integration.py
- hash_password
- App root template
- SlowAddSession
- Logo BOFASA 40 anos (Distribuyendo Bienestar desde 1986)
- _pending_visits
- Solicitudes Unit Test Duration Chart
- Visitas Unit Test Duration Chart
- cleanup.sh
- seed.sh
- Pagination template
- CLAUDE.md
- app.ts
- assets-list.component.ts

## God Nodes (most connected - your core abstractions)
1. `User` - 81 edges
2. `@angular/core` - 49 edges
3. `AssetsListComponent` - 44 edges
4. `Asset` - 36 edges
5. `CorrectiveRequestListComponent` - 36 edges
6. `Branch` - 34 edges
7. `MaintenanceVisit` - 32 edges
8. `@angular/common` - 31 edges
9. `VisitFormComponent` - 31 edges
10. `User` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Diseño de la opción A` --references--> `run_preventive_check()`  [INFERRED]
  tasks/plan.md → backend/app/services/preventive_scheduler.py
- `Estrategia de testing` --references--> `get_current_user()`  [INFERRED]
  SPEC.md → backend/app/utils/dependencies.py
- `Por qué puede duplicar` --references--> `lifespan()`  [INFERRED]
  tasks/plan.md → backend/app/main.py
- `Estilo de código` --references--> `update_asset()`  [INFERRED]
  SPEC.md → backend/app/routers/asset.py
- `Tareas: scheduler preventivo sin duplicados (punto 18)` --references--> `preventive_check_loop()`  [INFERRED]
  tasks/todo.md → backend/app/services/preventive_scheduler.py

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

## Communities (60 total, 19 thin omitted)

### Community 0 - "schemas/asset.py"
Cohesion: 0.08
Nodes (18): upgrade(), downgrade(), upgrade(), create_branch(), get_branch(), get_branches(), update_branch(), update_branch_status() (+10 more)

### Community 1 - "CorrectiveRequestListComponent"
Cohesion: 0.06
Nodes (3): CorrectiveRequest, CorrectiveRequestListComponent, DashboardComponent

### Community 2 - "@angular/core"
Cohesion: 0.10
Nodes (3): LoginComponent, Login Template, @angular/core

### Community 3 - "package.json"
Cohesion: 0.05
Nodes (39): dependencies, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, rxjs (+31 more)

### Community 4 - "app.routes.ts"
Cohesion: 0.23
Nodes (9): appConfig, routes, authGuard(), roleGuard(), authInterceptor(), withReadableDetail(), @angular/platform-browser, @angular/router (+1 more)

### Community 5 - "User"
Cohesion: 0.07
Nodes (54): CorrectiveRequest, User, me(), _can_read_request(), change_corrective_request_status(), _check_request_read(), _check_request_work(), create_correctiverequest() (+46 more)

### Community 6 - "frontend"
Cohesion: 0.05
Nodes (38): build, serve, test, builder, configurations, defaultConfiguration, options, cli (+30 more)

### Community 7 - "test_scheduler_lock.py"
Cohesion: 0.13
Nodes (4): lifespan(), read_root(), preventive_check_loop(), test_SCH05_el_loop_usa_la_version_con_candado()

### Community 8 - "corrective-requests-list.component.ts"
Cohesion: 0.12
Nodes (11): API_BASE_URL, AssetsService, BRANCH_CHAINS, BranchCreate, BranchesService, BranchUpdate, CorrectiveRequestCreate, CorrectiveRequestUpdate (+3 more)

### Community 9 - "assigned-tasks-list.component.ts"
Cohesion: 0.10
Nodes (14): AssignedTaskCreate, AssignedTasksService, TASK_TYPE_INVENTORY, TASK_TYPE_LABELS, AuthService, CurrentUser, LoginRequest, LoginResponse (+6 more)

### Community 10 - "test_units_v2.py"
Cohesion: 0.08
Nodes (20): Branch, MaintenanceVisit, run_preventive_check(), run_preventive_check_locked(), factory(), db_session(), test_U02_require_roles_denies_non_matching_role(), test_U03_preventive_check_crea_visita_programada_si_vencida() (+12 more)

### Community 11 - "UsersListComponent"
Cohesion: 0.08
Nodes (11): AssetCreate, Asset Decommission (Baja) Approval, Modal CRUD Form Pattern, Assets List Template (Equipos), BulkBranchAssetsComponent, Bulk Branch Assets Template, Assigned Tasks List Template, Branches List Template (Sucursales) (+3 more)

### Community 12 - "AssignedTasksListComponent"
Cohesion: 0.12
Nodes (3): AssignedTask, AssignedTasksListComponent, AppShellComponent

### Community 13 - "AssetsListComponent"
Cohesion: 0.10
Nodes (4): isCpuType(), isDvrType(), isMonitorType(), AssetsListComponent

### Community 15 - "test_units.py"
Cohesion: 0.20
Nodes (3): run_migrations_offline(), run_migrations_online(), Settings

### Community 16 - "AssignedTask"
Cohesion: 0.06
Nodes (22): AssignedTask, _can_create_in_branch(), _can_edit_asset(), create_asset(), get_asset(), get_assets(), update_asset(), update_asset_status() (+14 more)

### Community 18 - "ReportsDashboardComponent"
Cohesion: 0.11
Nodes (3): Report Export Preview / CSV Export, ReportsDashboardComponent, Reports Dashboard Template

### Community 19 - "schemas/user.py"
Cohesion: 0.16
Nodes (12): _ensure_admin_access_kept(), get_user(), get_users(), reset_user_password(), toggle_user_status(), update_user(), _visible_user(), PasswordReset (+4 more)

### Community 20 - "visit-form.component.ts"
Cohesion: 0.11
Nodes (15): MaintenanceVisitChecklistEntryCreate, MaintenanceVisitItemCreate, Toast, ToastService, ToastType, CHECKLIST_TEMPLATE, ChecklistGroup, CLEANING_CHECKLISTS (+7 more)

### Community 21 - "Plan: scheduler preventivo sin visitas duplicadas (auditoría, punto 18)"
Cohesion: 0.40
Nodes (4): Diseño de la opción A, Opciones, Plan: scheduler preventivo sin visitas duplicadas (auditoría, punto 18), Riesgos

### Community 22 - "Resultados de Pruebas SGMB"
Cohesion: 0.22
Nodes (15): ACEP01 Technician closes request with signed PDF, Deprecation findings (Pydantic class Config, .dict(), on_event startup), Resultados de Pruebas SGMB, INT01 Login against real Postgres, INT02 Create corrective request persisted, INT03 Block access to another technician's request, INT04 Visit with nested items and checklist, PostgreSQL mantenimiento_db (+7 more)

### Community 24 - "Capítulo V Análisis de Resultados SGMB"
Cohesion: 0.23
Nodes (14): BOFASA, Capítulo V Análisis de Resultados SGMB, Flujo 3 Reportes dashboard, Flujo 1 Solicitudes Correctivas, Flujo 2 Visitas Preventivo, Hipótesis: SGMB reduce tiempos, errores e insumos, Métricas TP, TE, Personal, Insumos, Módulo Auth / Control de Acceso (+6 more)

### Community 27 - "backend requirements.txt"
Cohesion: 0.15
Nodes (12): hash_password / verify_password, U01 Password hash/verify, alembic, email-validator, FastAPI, backend requirements.txt, passlib[bcrypt], psycopg2-binary (+4 more)

### Community 28 - "Resultados de Pruebas Unitarias v2"
Cohesion: 0.19
Nodes (12): AUTH-U03 verify_token invalid returns None, _check_request_access, _check_visit_access, CorrectiveRequestCreate schema, Resultados de Pruebas Unitarias v2, SOL-U01 CorrectiveRequestCreate requires description, SOL-U02 _check_request_access denies, verify_token (+4 more)

### Community 31 - "test_token_identity.py"
Cohesion: 0.11
Nodes (10): login(), _recent_failures(), create_access_token(), verify_token(), db(), FakeRequest, test_TOK01_token_de_login_sigue_identificando_al_usuario_si_su_correo_se_reasigna(), test_TOK02_token_antiguo_con_correo_en_sub_se_rechaza() (+2 more)

### Community 32 - "Flujo DESPUES - Dashboard de Reportes en SGMB"
Cohesion: 0.20
Nodes (12): Flujo ANTES - Reporte consolidado manual (Reportes), Flujo DESPUES - Dashboard de Reportes en SGMB, Flujo ANTES - Reporte de falla manual (Solicitudes Correctivas), Hoja firmada digital de cierre, Flujo DESPUES - Solicitud correctiva en SGMB, Flujo ANTES - Mantenimiento preventivo manual (Visitas), Programacion automatica de mantenimiento preventivo por frecuencia, Flujo DESPUES - Visita preventiva automatica en SGMB (+4 more)

### Community 34 - "Spec: rendimiento de los listados (auditoría, punto 15)"
Cohesion: 0.17
Nodes (11): Alcance, Comandos, Criterios de éxito, Estilo de código, Estrategia de verificación, Estructura y archivos afectados, Límites, Objetivo (+3 more)

### Community 35 - "routers/asset.py"
Cohesion: 0.25
Nodes (5): get_db(), LoginRequest, Token, get_current_user(), require_roles()

### Community 37 - "@angular/common"
Cohesion: 0.14
Nodes (13): MaintenanceVisit, MaintenanceVisitChecklistEntry, MaintenanceVisitCreate, MaintenanceVisitPhoto, User, UserCreate, UsersService, UserUpdate (+5 more)

### Community 38 - "VisitDetailComponent"
Cohesion: 0.06
Nodes (15): MaintenanceVisitItem, Corrective Request Print Template, Corrective Requests List Template, Visit Detail Template, VisitDetailComponent, Branch Equipment Summary, Equipment Change and Delivery, Signed Report Sheet (Hoja firmada) (+7 more)

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

### Community 43 - "test_integration.py"
Cohesion: 0.13
Nodes (12): Asset, MaintenanceVisitChecklistEntry, MaintenanceVisitItem, MaintenanceVisitPhoto, env(), auth_headers(), db(), seed() (+4 more)

### Community 44 - "hash_password"
Cohesion: 0.24
Nodes (6): create_user(), hash_password(), verify_password(), test_U01_hash_and_verify_password_roundtrip(), test_AUTH_U01_hash_and_verify_password_roundtrip(), test_AUTH_U02_verify_password_rejects_wrong_password()

### Community 45 - "App root template"
Cohesion: 0.40
Nodes (6): App root template, ConfirmService (state/respond), ConfirmDialog template, ToastContainer template, ToastService (toasts/dismiss), index.html (app-root host)

### Community 48 - "Logo BOFASA 40 anos (Distribuyendo Bienestar desde 1986)"
Cohesion: 0.67
Nodes (3): Logo BOFASA 40 anos (Distribuyendo Bienestar desde 1986), Icono BOFASA 40 anos, Logos de marcas del grupo (Bodega Farmaceutica, Meykos, Cruz Verde, Farmacias del Ahorro)

### Community 49 - "_pending_visits"
Cohesion: 0.27
Nodes (7): _check_preventive_client(), _pending_visits(), _run_concurrently(), test_SCH01_dos_corridas_simultaneas_crean_una_sola_visita(), test_SCH02_sin_candado_la_carrera_duplica(), test_SCH03_boton_manual_se_salta_si_otra_corrida_tiene_el_candado(), test_SCH04_boton_manual_crea_la_visita_con_el_candado_libre()

### Community 62 - "app.ts"
Cohesion: 0.11
Nodes (7): App, ConfirmOptions, ConfirmService, ConfirmState, ThemeService, ConfirmDialogComponent, ToastContainerComponent

### Community 64 - "assets-list.component.ts"
Cohesion: 0.20
Nodes (9): LabelPipe, AssetUpdate, CATEGORY_KEYWORDS, EQUIPMENT_CATEGORY_ORDER, EQUIPMENT_DEFAULT_TYPE, equipmentCategory(), groupByEquipmentCategory(), CountEntry (+1 more)

## Knowledge Gaps
- **151 isolated node(s):** `$schema`, `version`, `packageManager`, `analytics`, `newProjectRoot` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 452 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `schemas/asset.py`, `routers/asset.py`, `test_scheduler_lock.py`, `test_units_v2.py`, `test_integration.py`, `hash_password`, `test_units.py`, `AssignedTask`, `_pending_visits`, `schemas/user.py`, `test_authz.py`, `test_token_identity.py`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Are the 58 inferred relationships involving `User` (e.g. with `_can_create_in_branch()` and `_can_edit_asset()`) actually correct?**
  _`User` has 58 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schemas/asset.py` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._
- **Why does `@angular/core` connect `@angular/core` to `assets-list.component.ts`, `package.json`, `app.routes.ts`, `@angular/common`, `corrective-requests-list.component.ts`, `assigned-tasks-list.component.ts`, `visit-form.component.ts`, `app.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Should `CorrectiveRequestListComponent` be split into smaller, more focused modules?**
  _Cohesion score 0.061495457721872815 - nodes in this community are weakly interconnected._
- **Why does `VisitFormComponent` connect `VisitFormComponent` to `app.routes.ts`, `@angular/common`, `VisitDetailComponent`, `visit-form.component.ts`, `Asset`, `Branch`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._