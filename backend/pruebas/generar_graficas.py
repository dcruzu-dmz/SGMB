"""Genera las graficas de la seccion 4.4 a partir de los resultados reales
de las 50 ejecuciones (10 pruebas x 5 repeticiones)."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ids = ['U01', 'U02', 'U03', 'INT01', 'INT02', 'INT03', 'INT04', 'SIS01', 'SIS02', 'ACEP01']
success = [100] * 10
duration_ms = [458, 0.3, 10, 234, 294, 458, 270, 860, 1280, 1200]

fig, ax = plt.subplots(figsize=(10, 4.5))
bars = ax.bar(ids, success, color="#2f855a")
ax.set_ylim(0, 110)
ax.set_ylabel("% OK")
ax.set_title("% de pruebas OK por cada una de las 10 pruebas (5 repeticiones c/u)")
for b, v in zip(bars, success):
    ax.text(b.get_x() + b.get_width() / 2, v + 2, f"{v}%", ha="center", fontweight="bold")
plt.tight_layout()
plt.savefig("pruebas/screenshots/grafica_exito_por_prueba.png", dpi=150)
plt.close()

fig, ax = plt.subplots(figsize=(10, 4.5))
bars = ax.bar(ids, duration_ms, color="#c05621")
ax.set_ylabel("ms")
ax.set_title("Duración promedio de ejecución por prueba (ms)")
for b, v in zip(bars, duration_ms):
    ax.text(b.get_x() + b.get_width() / 2, v + max(duration_ms) * 0.02, f"{v} ms", ha="center", fontweight="bold", fontsize=8)
plt.tight_layout()
plt.savefig("pruebas/screenshots/grafica_duracion_por_prueba.png", dpi=150)
plt.close()

print("Graficas generadas.")
