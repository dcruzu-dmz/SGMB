# Graph Report - SGMB  (2026-10-06)

## Corpus Check
- 155 files · ~65,870 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 36 file(s) not represented in the graph (top: .css 21, (none) 10, .log 3)

## Summary
- 970 nodes · 2191 edges · 60 communities (36 shown, 24 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 187 edges (avg confidence: 0.92)
- Token cost: 198,231 input · 0 output

## Community Hubs (Navigation)
- Visit Models & Preventive Check
- Corrective Requests List UI
- Asset Bulk Creation UI
- Frontend NPM Dependencies
- Frontend API Services
- Visits API Router
- Angular Build Config
- Frontend Specs & Theme
- Labels, Confirm & Branch Types
- Auth & Task Services
- Corrective Requests API
- Asset & Task Schemas
- Assigned Tasks UI
- Assets List UI
- DB & Auth Dependencies
- Visit Detail UI
- Assets API & Models
- Visit Form UI
- Reports Dashboard UI
- Users API
- Assets Service & Checklists
- Branches List UI
- Formal Test Results
- Asset Status Actions
- Thesis Chapter V Analysis
- Visit Service (Frontend)
- Assigned Tasks API
- Backend Dependencies & Hashing
- Unit Test Results
- Search & Equipment Categories
- Users List UI
- App Startup & Scheduler
- Before/After Process Flows
- Chart Generation Scripts
- Routing, Guards & Interceptor
- Branches API
- Corrective Request Print
- Login & JWT Security
- Corrective Request Service
- Role-Based Shell Navigation
- Dashboard Panels
- TS App Config
- E2E Test Charts
- Integration Tests
- Users Service
- App Root Overlays
- Backend Settings
- Login Page
- BOFASA Branding
- Checklist Grouping
- CPU Type Helpers
- Solicitudes Test Charts
- Visitas Test Charts
- Cleanup Script
- Seed Script
- Pagination Template

## God Nodes (most connected - your core abstractions)
1. `User` - 66 edges
2. `@angular/core` - 48 edges
3. `AssetsListComponent` - 44 edges
4. `Asset` - 35 edges
5. `CorrectiveRequestListComponent` - 35 edges
6. `Branch` - 34 edges
7. `@angular/common` - 31 edges
8. `User` - 29 edges
9. `VisitFormComponent` - 29 edges
10. `ReportsDashboardComponent` - 28 edges

## Surprising Connections (you probably didn't know these)
- `Maintenance visits calendar` --conceptually_related_to--> `Módulo Visitas de Mantenimiento`  [INFERRED]
  frontend/src/app/layout/pages/dashboard/dashboard.component.html → documentacion/capitulo5_analisis_resultados/Capitulo_V_Analisis_de_Resultados_SGMB.md
- `Assets List Template (Equipos)` --references--> `AssetsListComponent`  [INFERRED]
  frontend/src/app/features/assets/pages/assets-list/assets-list.component.html → frontend/src/app/features/assets/pages/assets-list/assets-list.component.ts
- `Assigned Tasks List Template` --references--> `AssignedTasksListComponent`  [INFERRED]
  frontend/src/app/features/assigned-tasks/pages/assigned-tasks-list/assigned-tasks-list.component.html → frontend/src/app/features/assigned-tasks/pages/assigned-tasks-list/assigned-tasks-list.component.ts
- `Login Template` --references--> `LoginComponent`  [INFERRED]
  frontend/src/app/features/auth/pages/login/login.component.html → frontend/src/app/features/auth/pages/login/login.component.ts
- `Branches List Template (Sucursales)` --references--> `BranchesListComponent`  [INFERRED]
  frontend/src/app/features/branches/pages/branches-list/branches-list.component.html → frontend/src/app/features/branches/pages/branches-list/branches-list.component.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Formal test cycle across U/INT/SIS/ACEP levels** — backend_pruebas_resultados_pruebas_u01, backend_pruebas_resultados_pruebas_int01, backend_pruebas_resultados_pruebas_sis01, backend_pruebas_resultados_pruebas_acep01, backend_pruebas_resultados_pruebas_pytest, backend_pruebas_resultados_pruebas_playwright [EXTRACTED 1.00]
- **Role/ownership access-control checks** — backend_pruebas_resultados_pruebas_require_roles, backend_pruebas_resultados_unitarios_check_visit_access, backend_pruebas_resultados_unitarios_check_request_access, backend_pruebas_resultados_pruebas_int03 [INFERRED 0.85]
- **Global app-root overlays and services** — frontend_src_app_app_template, frontend_src_app_shared_confirm_dialog_confirm_dialog_component_template, frontend_src_app_shared_toast_container_toast_container_component_template, frontend_src_app_shared_confirm_dialog_confirm_dialog_component_confirmservice, frontend_src_app_shared_toast_container_toast_container_component_toastservice [EXTRACTED 1.00]
- **Printable Signed Report Flow** — frontend_src_app_features_maintenance_visits_pages_visit_form_visit_form_component_template, frontend_src_app_features_maintenance_visits_pages_visit_print_visit_print_component_template, frontend_src_app_features_maintenance_visits_pages_visit_detail_visit_detail_component_template, frontend_src_app_features_maintenance_visits_pages_visit_form_visit_form_component_signed_report_sheet [INFERRED 0.85]
- **Maintenance Visit Lifecycle** — frontend_src_app_features_maintenance_visits_pages_visit_schedule_visit_schedule_component_template, frontend_src_app_features_maintenance_visits_pages_visit_list_visit_list_component_template, frontend_src_app_features_maintenance_visits_pages_visit_form_visit_form_component_template, frontend_src_app_features_maintenance_visits_pages_visit_detail_visit_detail_component_template, frontend_src_app_features_maintenance_visits_pages_visit_print_visit_print_component_template [INFERRED 0.85]
- **E2E corrective request flow: login, create, close** — backend_pruebas_screenshots_sis01_login_admin_dashboard, backend_pruebas_screenshots_sis02_crear_solicitud_solicitudes_page, backend_pruebas_screenshots_acep01_cerrar_solicitud_closed_request_list [INFERRED 0.85]
- **Per-module unit test success charts (5 reps, 100% OK)** — backend_pruebas_screenshots_graf_ok_auth_auth_success_chart, backend_pruebas_screenshots_graf_ok_solicitudes_solicitudes_success_chart, backend_pruebas_screenshots_graf_ok_visitas_visitas_success_chart [INFERRED 0.95]
- **Per-module unit test duration charts** — backend_pruebas_screenshots_graf_dur_auth_auth_duration_chart, backend_pruebas_screenshots_graf_dur_solicitudes_solicitudes_duration_chart, backend_pruebas_screenshots_graf_dur_visitas_visitas_duration_chart [INFERRED 0.95]
- **Procesos manuales previos (Excel, papel, telefono)** — documentacion_capitulo5_analisis_resultados_flujos_flujo_reportes_antes_manual_report_consolidation_flow, documentacion_capitulo5_analisis_resultados_flujos_flujo_solicitudes_antes_manual_fault_reporting_flow, documentacion_capitulo5_analisis_resultados_flujos_flujo_visitas_antes_manual_preventive_maintenance_flow [INFERRED 0.85]
- **Flujos digitalizados con SGMB con historial compartido** — documentacion_capitulo5_analisis_resultados_flujos_flujo_reportes_despues_sgmb_reports_dashboard_flow, documentacion_capitulo5_analisis_resultados_flujos_flujo_solicitudes_despues_sgmb_corrective_request_flow, documentacion_capitulo5_analisis_resultados_flujos_flujo_visitas_despues_automatic_preventive_visit_flow [EXTRACTED 1.00]
- **Indicadores Antes vs Despues por modulo (tiempo, errores, personal, insumos)** — documentacion_capitulo5_analisis_resultados_graficas_grafica_tiempos_proceso_process_time_chart, documentacion_capitulo5_analisis_resultados_graficas_grafica_tasa_errores_error_rate_chart, documentacion_capitulo5_analisis_resultados_graficas_grafica_personal_staff_chart, documentacion_capitulo5_analisis_resultados_graficas_grafica_insumos_supplies_chart [EXTRACTED 1.00]

## Communities (60 total, 24 thin omitted)

### Community 0 - "Visit Models & Preventive Check"
Cohesion: 0.08
Nodes (25): Branch, MaintenanceVisit, MaintenanceVisitChecklistEntry, MaintenanceVisitItem, MaintenanceVisitPhoto, run_preventive_check(), require_roles(), hash_password() (+17 more)

### Community 1 - "Corrective Requests List UI"
Cohesion: 0.06
Nodes (3): CorrectiveRequest, CorrectiveRequestListComponent, DashboardComponent

### Community 2 - "Asset Bulk Creation UI"
Cohesion: 0.06
Nodes (25): AssetCreate, Asset Decommission (Baja) Approval, Modal CRUD Form Pattern, Assets List Template (Equipos), BulkBranchAssetsComponent, Bulk Branch Assets Template, Assigned Tasks List Template, Branches List Template (Sucursales) (+17 more)

### Community 3 - "Frontend NPM Dependencies"
Cohesion: 0.04
Nodes (43): dependencies, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, rxjs (+35 more)

### Community 4 - "Frontend API Services"
Cohesion: 0.16
Nodes (19): API_BASE_URL, AssignedTaskCreate, Branch, BranchesService, CorrectiveRequestCreate, CorrectiveRequestUpdate, MaintenanceVisit, MaintenanceVisitChecklistEntry (+11 more)

### Community 5 - "Visits API Router"
Cohesion: 0.14
Nodes (31): add_checklist_entries(), add_visit_item(), check_preventive(), _check_visit_access(), create_visit(), delete_photo(), delete_signed_report(), delete_visit() (+23 more)

### Community 6 - "Angular Build Config"
Cohesion: 0.05
Nodes (38): build, serve, test, builder, configurations, defaultConfiguration, options, cli (+30 more)

### Community 7 - "Frontend Specs & Theme"
Cohesion: 0.08
Nodes (4): ThemeService, ConfirmDialogComponent, ToastContainerComponent, @angular/core

### Community 8 - "Labels, Confirm & Branch Types"
Cohesion: 0.10
Nodes (12): LabelPipe, BRANCH_CHAINS, BranchCreate, BranchUpdate, ConfirmOptions, ConfirmService, ConfirmState, Toast (+4 more)

### Community 9 - "Auth & Task Services"
Cohesion: 0.10
Nodes (12): AssignedTasksService, TASK_TYPE_INVENTORY, TASK_TYPE_LABELS, AuthService, CurrentUser, LoginRequest, LoginResponse, ALL_NAV_ITEMS (+4 more)

### Community 10 - "Corrective Requests API"
Cohesion: 0.16
Nodes (15): CorrectiveRequest, change_corrective_request_status(), _check_request_access(), create_correctiverequest(), delete_signed_report(), get_corrective_request(), get_corrective_request_by_id(), update_corrective_request() (+7 more)

### Community 11 - "Asset & Task Schemas"
Cohesion: 0.11
Nodes (16): AssetBase, AssetCreate, AssetResponse, AssetUpdate, Config, AssignedTaskCreate, AssignedTaskResponse, Config (+8 more)

### Community 12 - "Assigned Tasks UI"
Cohesion: 0.12
Nodes (3): AssignedTask, AssignedTasksListComponent, AppShellComponent

### Community 13 - "Assets List UI"
Cohesion: 0.11
Nodes (3): isDvrType(), isMonitorType(), AssetsListComponent

### Community 14 - "DB & Auth Dependencies"
Cohesion: 0.23
Nodes (4): get_db(), get_current_user(), verify_token(), test_AUTH_U03_verify_token_returns_none_for_invalid_token()

### Community 15 - "Visit Detail UI"
Cohesion: 0.09
Nodes (3): MaintenanceVisitItem, VisitDetailComponent, VisitPrintComponent

### Community 16 - "Assets API & Models"
Cohesion: 0.20
Nodes (11): Asset, User, _can_create_in_branch(), _can_edit_asset(), create_asset(), get_asset(), get_assets(), update_asset() (+3 more)

### Community 19 - "Users API"
Cohesion: 0.20
Nodes (10): create_user(), get_user(), get_users(), toggle_user_status(), update_user(), Config, UserBase, UserCreate (+2 more)

### Community 20 - "Assets Service & Checklists"
Cohesion: 0.12
Nodes (11): AssetsService, MaintenanceVisitItemCreate, CHECKLIST_TEMPLATE, CLEANING_CHECKLISTS, CPU_CLEANING_ITEMS, CPU_TYPES, DraftItem, EQUIPMENT_TYPES (+3 more)

### Community 22 - "Formal Test Results"
Cohesion: 0.22
Nodes (15): ACEP01 Technician closes request with signed PDF, Deprecation findings (Pydantic class Config, .dict(), on_event startup), Resultados de Pruebas SGMB, INT01 Login against real Postgres, INT02 Create corrective request persisted, INT03 Block access to another technician's request, INT04 Visit with nested items and checklist, PostgreSQL mantenimiento_db (+7 more)

### Community 24 - "Thesis Chapter V Analysis"
Cohesion: 0.23
Nodes (14): BOFASA, Capítulo V Análisis de Resultados SGMB, Flujo 3 Reportes dashboard, Flujo 1 Solicitudes Correctivas, Flujo 2 Visitas Preventivo, Hipótesis: SGMB reduce tiempos, errores e insumos, Métricas TP, TE, Personal, Insumos, Módulo Auth / Control de Acceso (+6 more)

### Community 26 - "Assigned Tasks API"
Cohesion: 0.18
Nodes (4): AssignedTask, close_assigned_task(), create_assigned_task(), get_assigned_tasks()

### Community 27 - "Backend Dependencies & Hashing"
Cohesion: 0.15
Nodes (12): hash_password / verify_password, U01 Password hash/verify, alembic, email-validator, FastAPI, backend requirements.txt, passlib[bcrypt], psycopg2-binary (+4 more)

### Community 28 - "Unit Test Results"
Cohesion: 0.19
Nodes (12): AUTH-U03 verify_token invalid returns None, _check_request_access, _check_visit_access, CorrectiveRequestCreate schema, Resultados de Pruebas Unitarias v2, SOL-U01 CorrectiveRequestCreate requires description, SOL-U02 _check_request_access denies, verify_token (+4 more)

### Community 29 - "Search & Equipment Categories"
Cohesion: 0.26
Nodes (7): AssetUpdate, SearchService, CATEGORY_KEYWORDS, EQUIPMENT_CATEGORY_ORDER, EQUIPMENT_DEFAULT_TYPE, equipmentCategory(), groupByEquipmentCategory()

### Community 31 - "App Startup & Scheduler"
Cohesion: 0.24
Nodes (3): read_root(), start_background_jobs(), preventive_check_loop()

### Community 32 - "Before/After Process Flows"
Cohesion: 0.20
Nodes (12): Flujo ANTES - Reporte consolidado manual (Reportes), Flujo DESPUES - Dashboard de Reportes en SGMB, Flujo ANTES - Reporte de falla manual (Solicitudes Correctivas), Hoja firmada digital de cierre, Flujo DESPUES - Solicitud correctiva en SGMB, Flujo ANTES - Mantenimiento preventivo manual (Visitas), Programacion automatica de mantenimiento preventivo por frecuencia, Flujo DESPUES - Visita preventiva automatica en SGMB (+4 more)

### Community 34 - "Routing, Guards & Interceptor"
Cohesion: 0.35
Nodes (5): routes, authGuard(), roleGuard(), authInterceptor(), @angular/router

### Community 35 - "Branches API"
Cohesion: 0.22
Nodes (5): create_branch(), get_branch(), get_branches(), update_branch(), update_branch_status()

### Community 39 - "Role-Based Shell Navigation"
Cohesion: 0.25
Nodes (8): require_roles, U02 Role rejection require_roles, RBAC-U01 require_roles allows admin, Technician assigned-task notifications, Global search box, Sidebar navItems (role-based nav), AppShell layout template, ThemeService toggle/dark

### Community 40 - "Dashboard Panels"
Cohesion: 0.25
Nodes (8): run_preventive_check, U03 Overdue preventive visit generation, Recent activity feed, Critical corrective requests panel, Dashboard KPIs (open requests, completion rate, assets in maintenance), Overdue visits panel, Dashboard template, Maintenance visits calendar

### Community 41 - "TS App Config"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, types, exclude, extends, include, ./tsconfig.json

### Community 42 - "E2E Test Charts"
Cohesion: 0.38
Nodes (7): ACEP01 Closed Corrective Request (Tecnico view), Auth/RBAC Unit Test Duration Chart, Auth/RBAC Unit Test Success Chart, Average Duration per Test (10 tests) Chart, Success Rate per Test (10 tests) Chart, SIS01 Login -> Admin Dashboard, SIS02 Create Request - Solicitudes Correctivas Page

### Community 43 - "Integration Tests"
Cohesion: 0.29
Nodes (4): auth_headers(), test_INT02_crear_solicitud_persiste_en_bd(), test_INT03_tecnico_no_asignado_no_puede_ver_solicitud_ajena(), test_INT04_crear_visita_con_equipos_y_checklist()

### Community 45 - "App Root Overlays"
Cohesion: 0.40
Nodes (6): App root template, ConfirmService (state/respond), ConfirmDialog template, ToastContainer template, ToastService (toasts/dismiss), index.html (app-root host)

### Community 48 - "BOFASA Branding"
Cohesion: 0.67
Nodes (3): Logo BOFASA 40 anos (Distribuyendo Bienestar desde 1986), Icono BOFASA 40 anos, Logos de marcas del grupo (Bodega Farmaceutica, Meykos, Cruz Verde, Farmacias del Ahorro)

## Knowledge Gaps
- **135 isolated node(s):** `Config`, `Config`, `Config`, `Config`, `Config` (+130 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 395 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@angular/core` connect `Frontend Specs & Theme` to `Routing, Guards & Interceptor`, `Frontend NPM Dependencies`, `Frontend API Services`, `Labels, Confirm & Branch Types`, `Auth & Task Services`, `Assets Service & Checklists`, `Search & Equipment Categories`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Are the 49 inferred relationships involving `User` (e.g. with `_can_create_in_branch()` and `_can_edit_asset()`) actually correct?**
  _`User` has 49 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Config`, `Config`, `Config` to the rest of the system?**
  _135 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Visit Models & Preventive Check` be split into smaller, more focused modules?**
  _Cohesion score 0.07581453634085213 - nodes in this community are weakly interconnected._
- **Why does `Branch` connect `Frontend API Services` to `Corrective Requests List UI`, `Asset Bulk Creation UI`, `Corrective Request Print`, `Labels, Confirm & Branch Types`, `Auth & Task Services`, `Assigned Tasks UI`, `Assets List UI`, `Visit Detail UI`, `Visit Form UI`, `Reports Dashboard UI`, `Assets Service & Checklists`, `Branches List UI`, `Search & Equipment Categories`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `Corrective Requests List UI` be split into smaller, more focused modules?**
  _Cohesion score 0.06313497822931785 - nodes in this community are weakly interconnected._
- **Why does `AssetsListComponent` connect `Assets List UI` to `Corrective Requests List UI`, `Routing, Guards & Interceptor`, `Asset Bulk Creation UI`, `Frontend API Services`, `Auth & Task Services`, `CPU Type Helpers`, `Asset Status Actions`, `Search & Equipment Categories`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._