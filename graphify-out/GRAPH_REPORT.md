# Graph Report - SGMB  (2026-10-08)

## Corpus Check
- 123 files · ~75,804 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 34 file(s) not represented in the graph (top: .css 21, (none) 6, .log 3)

## Summary
- 1111 nodes · 2586 edges · 72 communities (45 shown, 27 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 228 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bf76fc17`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Branch
- CorrectiveRequestListComponent
- routers/corrective_request.py
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
- test_authz.py
- routers/asset.py
- VisitFormComponent
- ReportsDashboardComponent
- branches-list.component.ts
- visit-form.component.ts
- Plan: scheduler preventivo sin visitas duplicadas (auditoría, punto 18)
- Resultados de Pruebas SGMB
- ToastService
- Capítulo V Análisis de Resultados SGMB
- MaintenanceVisitService
- CorrectiveRequestService
- backend requirements.txt
- Resultados de Pruebas Unitarias v2
- BranchesListComponent
- users-list.component.ts
- datetime
- Flujo DESPUES - Dashboard de Reportes en SGMB
- generar_capitulo5.py
- Spec: rendimiento de los listados (auditoría, punto 15)
- test_units.py
- CorrectiveRequestPrintComponent
- UsersService
- VisitDetailComponent
- AppShell layout template
- Dashboard template
- tsconfig.app.json
- Average Duration per Test (10 tests) Chart
- test_visit_sync.py
- EquipmentIconComponent
- App root template
- SlowAddSession
- Assets List Template (Equipos)
- Logo BOFASA 40 anos (Distribuyendo Bienestar desde 1986)
- _pending_visits
- VisitPrintComponent
- Solicitudes Unit Test Duration Chart
- Visitas Unit Test Duration Chart
- cleanup.sh
- seed.sh
- BulkBranchAssetsComponent
- Pagination template
- sqlalchemy
- CLAUDE.md
- @angular/core
- VisitListComponent
- equipmentCategory
- Asset
- assets-list.component.ts
- dependencies
- app.config.ts
- devDependencies
- scripts
- @playwright/test

## God Nodes (most connected - your core abstractions)
1. `User` - 83 edges
2. `@angular/core` - 49 edges
3. `AssetsListComponent` - 44 edges
4. `MaintenanceVisit` - 36 edges
5. `Asset` - 36 edges
6. `CorrectiveRequestListComponent` - 36 edges
7. `Branch` - 34 edges
8. `VisitFormComponent` - 34 edges
9. `@angular/common` - 31 edges
10. `User` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Diseño de la opción A` --references--> `run_preventive_check()`  [INFERRED]
  tasks/plan.md → backend/app/services/preventive_scheduler.py
- `Estrategia de testing` --references--> `get_current_user()`  [INFERRED]
  SPEC.md → backend/app/utils/dependencies.py
- `Estilo de código` --references--> `update_asset()`  [INFERRED]
  SPEC.md → backend/app/routers/asset.py
- `Por qué puede duplicar` --references--> `lifespan()`  [INFERRED]
  tasks/plan.md → backend/app/main.py
- `Estructura y archivos afectados` --references--> `_check_visit_read()`  [INFERRED]
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

## Communities (72 total, 27 thin omitted)

### Community 0 - "Branch"
Cohesion: 0.18
Nodes (11): Branch, create_branch(), get_branch(), get_branches(), update_branch(), update_branch_status(), BranchBase, BranchCreate (+3 more)

### Community 1 - "CorrectiveRequestListComponent"
Cohesion: 0.06
Nodes (3): CorrectiveRequest, CorrectiveRequestListComponent, DashboardComponent

### Community 2 - "routers/corrective_request.py"
Cohesion: 0.15
Nodes (16): CorrectiveRequest, _can_read_request(), change_corrective_request_status(), _check_request_read(), _check_request_work(), create_correctiverequest(), delete_signed_report(), get_corrective_request() (+8 more)

### Community 3 - "package.json"
Cohesion: 0.14
Nodes (13): name, packageManager, private, version, @angular/build, @angular/cli, @angular/compiler, @angular/compiler-cli (+5 more)

### Community 4 - "app.routes.ts"
Cohesion: 0.18
Nodes (12): authGuard(), roleGuard(), Branch, MaintenanceVisit, User, Visit Schedule Template, VisitScheduleComponent, ActivityEntry (+4 more)

### Community 5 - "User"
Cohesion: 0.07
Nodes (57): MaintenanceVisit, MaintenanceVisitChecklistEntry, MaintenanceVisitItem, User, me(), add_checklist_entries(), add_visit_item(), _check_entries_belong_to_visit() (+49 more)

### Community 6 - "frontend"
Cohesion: 0.05
Nodes (38): build, serve, test, builder, configurations, defaultConfiguration, options, cli (+30 more)

### Community 7 - "test_scheduler_lock.py"
Cohesion: 0.09
Nodes (12): lifespan(), read_root(), preventive_check_loop(), run_preventive_check(), run_preventive_check_locked(), test_SCH05_el_loop_usa_la_version_con_candado(), test_U03_preventive_check_crea_visita_programada_si_vencida(), test_VIS_U03_preventive_check_no_genera_visita_si_no_esta_vencida() (+4 more)

### Community 8 - "corrective-requests-list.component.ts"
Cohesion: 0.19
Nodes (9): API_BASE_URL, AssetsService, CorrectiveRequestCreate, CorrectiveRequestUpdate, MaintenanceVisitChecklistEntry, MaintenanceVisitCreate, ClientRow, @angular/common (+1 more)

### Community 9 - "assigned-tasks-list.component.ts"
Cohesion: 0.11
Nodes (13): AssignedTaskCreate, AssignedTasksService, TASK_TYPE_INVENTORY, TASK_TYPE_LABELS, AuthService, CurrentUser, LoginRequest, LoginResponse (+5 more)

### Community 10 - "test_units_v2.py"
Cohesion: 0.07
Nodes (23): login(), _recent_failures(), LoginRequest, create_access_token(), hash_password(), verify_password(), verify_token(), db() (+15 more)

### Community 12 - "AssignedTasksListComponent"
Cohesion: 0.12
Nodes (3): AssignedTask, AssignedTasksListComponent, AppShellComponent

### Community 13 - "AssetsListComponent"
Cohesion: 0.12
Nodes (3): isCpuType(), isDvrType(), AssetsListComponent

### Community 16 - "routers/asset.py"
Cohesion: 0.07
Nodes (27): Asset, AssignedTask, _can_create_in_branch(), _can_edit_asset(), create_asset(), get_asset(), get_assets(), update_asset() (+19 more)

### Community 19 - "branches-list.component.ts"
Cohesion: 0.18
Nodes (5): BRANCH_CHAINS, BranchCreate, BranchesService, BranchUpdate, SearchService

### Community 20 - "visit-form.component.ts"
Cohesion: 0.16
Nodes (13): MaintenanceVisitChecklistEntryCreate, MaintenanceVisitItemCreate, MaintenanceVisitPhoto, CHECKLIST_TEMPLATE, ChecklistGroup, CLEANING_CHECKLISTS, CPU_CLEANING_ITEMS, CPU_TYPES (+5 more)

### Community 21 - "Plan: scheduler preventivo sin visitas duplicadas (auditoría, punto 18)"
Cohesion: 0.40
Nodes (4): Diseño de la opción A, Opciones, Plan: scheduler preventivo sin visitas duplicadas (auditoría, punto 18), Riesgos

### Community 22 - "Resultados de Pruebas SGMB"
Cohesion: 0.22
Nodes (15): ACEP01 Technician closes request with signed PDF, Deprecation findings (Pydantic class Config, .dict(), on_event startup), Resultados de Pruebas SGMB, INT01 Login against real Postgres, INT02 Create corrective request persisted, INT03 Block access to another technician's request, INT04 Visit with nested items and checklist, PostgreSQL mantenimiento_db (+7 more)

### Community 23 - "ToastService"
Cohesion: 0.29
Nodes (3): Toast, ToastService, ToastType

### Community 24 - "Capítulo V Análisis de Resultados SGMB"
Cohesion: 0.23
Nodes (14): BOFASA, Capítulo V Análisis de Resultados SGMB, Flujo 3 Reportes dashboard, Flujo 1 Solicitudes Correctivas, Flujo 2 Visitas Preventivo, Hipótesis: SGMB reduce tiempos, errores e insumos, Métricas TP, TE, Personal, Insumos, Módulo Auth / Control de Acceso (+6 more)

### Community 27 - "backend requirements.txt"
Cohesion: 0.15
Nodes (12): hash_password / verify_password, U01 Password hash/verify, alembic, email-validator, FastAPI, backend requirements.txt, passlib[bcrypt], psycopg2-binary (+4 more)

### Community 28 - "Resultados de Pruebas Unitarias v2"
Cohesion: 0.19
Nodes (12): AUTH-U03 verify_token invalid returns None, _check_request_access, _check_visit_access, CorrectiveRequestCreate schema, Resultados de Pruebas Unitarias v2, SOL-U01 CorrectiveRequestCreate requires description, SOL-U02 _check_request_access denies, verify_token (+4 more)

### Community 30 - "users-list.component.ts"
Cohesion: 0.12
Nodes (7): ConfirmOptions, ConfirmService, ConfirmState, UserCreate, UserUpdate, ConfirmDialogComponent, PaginationComponent

### Community 31 - "datetime"
Cohesion: 0.18
Nodes (8): AssignedTaskCreate, AssignedTaskResponse, Token, PasswordReset, UserBase, UserCreate, UserResponse, UserUpdate

### Community 32 - "Flujo DESPUES - Dashboard de Reportes en SGMB"
Cohesion: 0.20
Nodes (12): Flujo ANTES - Reporte consolidado manual (Reportes), Flujo DESPUES - Dashboard de Reportes en SGMB, Flujo ANTES - Reporte de falla manual (Solicitudes Correctivas), Hoja firmada digital de cierre, Flujo DESPUES - Solicitud correctiva en SGMB, Flujo ANTES - Mantenimiento preventivo manual (Visitas), Programacion automatica de mantenimiento preventivo por frecuencia, Flujo DESPUES - Visita preventiva automatica en SGMB (+4 more)

### Community 34 - "Spec: rendimiento de los listados (auditoría, punto 15)"
Cohesion: 0.17
Nodes (11): Alcance, Comandos, Criterios de éxito, Estilo de código, Estrategia de verificación, Estructura y archivos afectados, Límites, Objetivo (+3 more)

### Community 35 - "test_units.py"
Cohesion: 0.26
Nodes (4): get_db(), get_current_user(), require_roles(), test_U02_require_roles_denies_non_matching_role()

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

### Community 43 - "test_visit_sync.py"
Cohesion: 0.14
Nodes (8): MaintenanceVisitPhoto, auth_headers(), test_INT01_login_valido_devuelve_token(), test_INT02_crear_solicitud_persiste_en_bd(), test_INT03_tecnico_no_asignado_no_puede_ver_solicitud_ajena(), test_INT04_crear_visita_con_equipos_y_checklist(), env(), test_SYNC01_guardar_de_nuevo_actualiza_crea_y_borra_sin_duplicar()

### Community 44 - "EquipmentIconComponent"
Cohesion: 0.25
Nodes (12): Corrective Request Print Template, Corrective Requests List Template, Visit Detail Template, Branch Equipment Summary, Equipment Change and Delivery, Signed Report Sheet (Hoja firmada), Visit Form Template, Visit List Template (+4 more)

### Community 45 - "App root template"
Cohesion: 0.40
Nodes (6): App root template, ConfirmService (state/respond), ConfirmDialog template, ToastContainer template, ToastService (toasts/dismiss), index.html (app-root host)

### Community 47 - "Assets List Template (Equipos)"
Cohesion: 0.38
Nodes (7): Asset Decommission (Baja) Approval, Modal CRUD Form Pattern, Assets List Template (Equipos), Bulk Branch Assets Template, Assigned Tasks List Template, Branches List Template (Sucursales), Users List Template

### Community 48 - "Logo BOFASA 40 anos (Distribuyendo Bienestar desde 1986)"
Cohesion: 0.67
Nodes (3): Logo BOFASA 40 anos (Distribuyendo Bienestar desde 1986), Icono BOFASA 40 anos, Logos de marcas del grupo (Bodega Farmaceutica, Meykos, Cruz Verde, Farmacias del Ahorro)

### Community 49 - "_pending_visits"
Cohesion: 0.22
Nodes (8): _check_preventive_client(), factory(), _pending_visits(), _run_concurrently(), test_SCH01_dos_corridas_simultaneas_crean_una_sola_visita(), test_SCH02_sin_candado_la_carrera_duplica(), test_SCH03_boton_manual_se_salta_si_otra_corrida_tiene_el_candado(), test_SCH04_boton_manual_crea_la_visita_con_el_candado_libre()

### Community 60 - "sqlalchemy"
Cohesion: 0.13
Nodes (6): run_migrations_offline(), run_migrations_online(), upgrade(), downgrade(), upgrade(), Settings

### Community 62 - "@angular/core"
Cohesion: 0.07
Nodes (6): App, ThemeService, LoginComponent, Login Template, ToastContainerComponent, @angular/core

### Community 64 - "equipmentCategory"
Cohesion: 0.20
Nodes (3): equipmentCategory(), groupByEquipmentCategory(), isMonitorType()

### Community 66 - "assets-list.component.ts"
Cohesion: 0.24
Nodes (7): LabelPipe, AssetUpdate, CATEGORY_KEYWORDS, EQUIPMENT_CATEGORY_ORDER, EQUIPMENT_DEFAULT_TYPE, CountEntry, @angular/forms

### Community 67 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, rxjs (+2 more)

### Community 68 - "app.config.ts"
Cohesion: 0.29
Nodes (6): appConfig, routes, authInterceptor(), withReadableDetail(), @angular/platform-browser, zone.js

### Community 69 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @angular/build, @angular/cli, @angular/compiler-cli, jsdom, @playwright/test, prettier, typescript (+1 more)

### Community 70 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, ng, start, test, watch

## Knowledge Gaps
- **151 isolated node(s):** `$schema`, `version`, `packageManager`, `analytics`, `newProjectRoot` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 455 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `Branch`, `routers/corrective_request.py`, `test_units.py`, `test_scheduler_lock.py`, `test_units_v2.py`, `test_visit_sync.py`, `test_authz.py`, `routers/asset.py`, `_pending_visits`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Are the 59 inferred relationships involving `User` (e.g. with `_can_create_in_branch()` and `_can_edit_asset()`) actually correct?**
  _`User` has 59 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CorrectiveRequestListComponent` be split into smaller, more focused modules?**
  _Cohesion score 0.061495457721872815 - nodes in this community are weakly interconnected._
- **Why does `@angular/core` connect `@angular/core` to `assets-list.component.ts`, `package.json`, `app.config.ts`, `app.routes.ts`, `corrective-requests-list.component.ts`, `assigned-tasks-list.component.ts`, `branches-list.component.ts`, `visit-form.component.ts`, `ToastService`, `users-list.component.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `MaintenanceVisit` (e.g. with `add_checklist_entries()` and `add_visit_item()`) actually correct?**
  _`MaintenanceVisit` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._