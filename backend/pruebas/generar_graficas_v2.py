"""Genera las 6 graficas por modulo para test_units_v2.py, a partir de
los resultados reales de las 50 ejecuciones (10 pruebas x 5 repeticiones)."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import os

OUT = os.path.join(os.path.dirname(__file__), "screenshots")

# (modulo, ids, % OK, duracion promedio ms, prefijo de archivo)
modulos = [
    ("Auth / Control de Acceso", ["AUTH-U01", "AUTH-U02", "AUTH-U03", "RBAC-U01", "RBAC-U02"],
     [100, 100, 100, 100, 100], [431.206, 445.592, 0.011, 0.033, 0.032], "auth"),
    ("Visitas de Mantenimiento", ["VIS-U01", "VIS-U02", "VIS-U03"],
     [100, 100, 100], [0.032, 0.034, 1.737], "visitas"),
    ("Solicitudes Correctivas", ["SOL-U01", "SOL-U02"],
     [100, 100], [0.015, 0.036], "solicitudes"),
]

for titulo, ids, ok, dur, prefijo in modulos:
    fig, ax = plt.subplots(figsize=(7, 4))
    bars = ax.bar(ids, ok, color="#2f855a")
    ax.set_ylim(0, 110)
    ax.set_ylabel("% OK")
    ax.set_title(f"% de pruebas OK — {titulo} (5 repeticiones c/u)")
    for b, v in zip(bars, ok):
        ax.text(b.get_x() + b.get_width() / 2, v + 2, f"{v}%", ha="center", fontweight="bold")
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, f"graf_ok_{prefijo}.png"), dpi=150)
    plt.close()

    fig, ax = plt.subplots(figsize=(7, 4))
    bars = ax.bar(ids, dur, color="#c05621")
    ax.set_ylabel("ms")
    ax.set_title(f"Duración promedio de ejecución (ms) — {titulo}")
    for b, v in zip(bars, dur):
        ax.text(b.get_x() + b.get_width() / 2, v + max(dur) * 0.02, f"{v:.2f} ms",
                 ha="center", fontweight="bold", fontsize=8)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, f"graf_dur_{prefijo}.png"), dpi=150)
    plt.close()

print("6 graficas generadas en", OUT)
