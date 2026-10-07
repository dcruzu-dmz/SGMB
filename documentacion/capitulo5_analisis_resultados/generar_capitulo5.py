"""
Genera las graficas comparativas (5.2) y los flujos de proceso (5.3)
para el Capitulo V - Analisis de Resultados de SGMB.

Cubre los 7 modulos reales del sistema:
Auth/Control de Acceso, Usuarios, Sucursales, Equipos, Solicitudes
Correctivas, Visitas de Mantenimiento y Reportes.

Los valores 'Antes' son ESTIMACIONES razonables de un proceso manual
tipico (papel / llamadas / WhatsApp / Excel), marcadas explicitamente
como tales en el documento final -- no son mediciones reales, porque
el proceso manual anterior ya no existe para medirlo.
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import os

BASE = os.path.dirname(os.path.abspath(__file__))
OUT_GRAF = os.path.join(BASE, "graficas")
OUT_FLUJO = os.path.join(BASE, "flujos")
os.makedirs(OUT_GRAF, exist_ok=True)
os.makedirs(OUT_FLUJO, exist_ok=True)

modulos = [
    "Auth / Control\nde Acceso",
    "Usuarios",
    "Sucursales",
    "Equipos\n(Inventario)",
    "Solicitudes\nCorrectivas",
    "Visitas de\nMantenimiento",
    "Reportes",
]

# Antes / Despues por indicador, mismo orden que 'modulos'
tp_antes =      [20, 30, 15, 15, 180, 90, 120]
tp_despues =    [2,   3,  3,  3,  20,  5,   5]

te_antes =      [25, 15, 10, 12, 20, 18, 22]
te_despues =    [2,   2,  2,  2,  3,   2,  3]

personal_antes =   [2, 2, 2, 2, 3, 2, 2]
personal_despues = [1, 1, 1, 1, 2, 1, 1]

insumos_antes =    [5, 4, 5, 10, 25, 15, 12]
insumos_despues =  [0, 0, 0,  0,  2,  0,  0]


def grouped_bar(titulo, ylabel, antes, despues, filename, fmt="{:.0f}"):
    x = np.arange(len(modulos))
    width = 0.38
    fig, ax = plt.subplots(figsize=(11, 5))
    b1 = ax.bar(x - width / 2, antes, width, label="Antes", color="#dd6b20")
    b2 = ax.bar(x + width / 2, despues, width, label="Después", color="#3182ce")
    ax.set_xticks(x)
    ax.set_xticklabels(modulos, fontsize=8.5)
    ax.set_ylabel(ylabel)
    ax.set_title(titulo)
    ax.legend()
    for bars in (b1, b2):
        for b in bars:
            h = b.get_height()
            ax.text(b.get_x() + b.get_width() / 2, h + max(antes) * 0.02,
                     fmt.format(h), ha="center", fontsize=7.5, fontweight="bold")
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_GRAF, filename), dpi=150)
    plt.close()


grouped_bar("Tiempo de Proceso por módulo (Antes vs Después)", "Minutos (TP)",
            tp_antes, tp_despues, "grafica_tiempos_proceso.png")
grouped_bar("Tasa de Errores por módulo (Antes vs Después)", "Errores (%)",
            te_antes, te_despues, "grafica_tasa_errores.png")
grouped_bar("Personal involucrado por módulo (Antes vs Después)", "Personas promedio",
            personal_antes, personal_despues, "grafica_personal.png")
grouped_bar("Insumos consumidos por módulo (Antes vs Después)", "Unidades/semana",
            insumos_antes, insumos_despues, "grafica_insumos.png")

print("4 graficas comparativas (7 modulos) generadas en", OUT_GRAF)


# ---------------------------------------------------------------------
# 5.3 Flujos de procesos (Antes / Despues) - 3 procesos representativos
# ---------------------------------------------------------------------

def flow_diagram(titulo, pasos, filename, color):
    n = len(pasos)
    box_h = 0.8
    gap = 0.5
    total_h = n * box_h + (n - 1) * gap
    fig_h = max(4, total_h + 1.5)
    fig, ax = plt.subplots(figsize=(6.5, fig_h))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, total_h + 1.5)
    ax.axis("off")
    ax.set_title(titulo, fontsize=12, fontweight="bold", pad=15)

    y = total_h + 0.3
    centers = []
    for i, paso in enumerate(pasos):
        y_box = y - box_h
        rect = plt.Rectangle((0.5, y_box), 9, box_h, facecolor=color,
                              edgecolor="#2d3748", linewidth=1.3, zorder=2)
        ax.add_patch(rect)
        ax.text(5, y_box + box_h / 2, paso, ha="center", va="center",
                 fontsize=9.5, wrap=True, zorder=3)
        centers.append((y_box, y))
        y = y_box - gap

    for i in range(n - 1):
        y_bottom_of_current = centers[i][0]
        y_top_of_next = centers[i + 1][1]
        ax.annotate("", xy=(5, y_top_of_next), xytext=(5, y_bottom_of_current),
                     arrowprops=dict(arrowstyle="-|>", color="#2d3748", lw=1.4))

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_FLUJO, filename), dpi=150, bbox_inches="tight")
    plt.close()


# Proceso 1: Solicitudes Correctivas
flow_diagram(
    "Flujo ANTES — Reportar una falla (Solicitudes Correctivas)",
    ["Encargado de sucursal detecta la falla",
     "Llama o envía WhatsApp al supervisor",
     "Supervisor localiza y avisa al técnico disponible",
     "Técnico anota la falla en una hoja/libreta",
     "Técnico visita la sucursal sin fecha ni prioridad registrada"],
    "flujo_solicitudes_antes.png", "#fbd38d")

flow_diagram(
    "Flujo DESPUÉS — Reportar una falla (Solicitudes Correctivas)",
    ["Encargado de sucursal registra la solicitud en SGMB",
     "El sistema guarda equipo, prioridad y descripción",
     "El técnico ve la solicitud en su listado asignado",
     "Técnico cierra la solicitud con solución y hoja firmada digital",
     "Historial queda disponible para consulta y reportes"],
    "flujo_solicitudes_despues.png", "#90cdf4")

# Proceso 2: Visitas de Mantenimiento Preventivo
flow_diagram(
    "Flujo ANTES — Mantenimiento preventivo (Visitas)",
    ["Encargado revisa un calendario/Excel manual por sucursal",
     "Calcula a mano si ya venció la frecuencia de mantenimiento",
     "Avisa por teléfono al técnico si detecta un vencimiento",
     "Técnico llena checklist en papel durante la visita",
     "Checklist se archiva físicamente, sin historial digital"],
    "flujo_visitas_antes.png", "#fbd38d")

flow_diagram(
    "Flujo DESPUÉS — Mantenimiento preventivo (Visitas)",
    ["El sistema calcula automáticamente qué sucursales vencieron",
     "SGMB genera la visita programada sin intervención manual",
     "Técnico ve la visita asignada en su listado",
     "Técnico completa checklist digital y sube evidencia/fotos",
     "Historial de visitas queda disponible por sucursal y equipo"],
    "flujo_visitas_despues.png", "#90cdf4")

# Proceso 3: Reportes (dashboard consolidado)
flow_diagram(
    "Flujo ANTES — Armar un reporte consolidado (Reportes)",
    ["Encargado revisa hojas de Excel de varias sucursales por separado",
     "Cuenta manualmente solicitudes abiertas, cerradas y por prioridad",
     "Cuenta manualmente visitas pendientes y completadas",
     "Consolida todo a mano en un documento nuevo",
     "Envía el reporte por correo, ya desactualizado al llegar"],
    "flujo_reportes_antes.png", "#fbd38d")

flow_diagram(
    "Flujo DESPUÉS — Armar un reporte consolidado (Reportes)",
    ["Usuario abre el módulo de Reportes en SGMB",
     "El sistema consulta solicitudes, visitas y equipos en tiempo real",
     "Dashboard muestra conteos por estado y prioridad al instante",
     "Usuario filtra por sucursal o rango de fechas si lo necesita",
     "La información siempre refleja el estado actual del sistema"],
    "flujo_reportes_despues.png", "#90cdf4")

print("6 diagramas de flujo (3 procesos) generados en", OUT_FLUJO)
