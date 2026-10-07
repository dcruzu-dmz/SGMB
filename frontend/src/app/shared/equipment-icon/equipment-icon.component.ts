import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { equipmentCategory } from '../../core/utils/equipment-category';

// Ilustraciones planas a color, una por categoria de equipo. Aceptan tanto el
// campo libre "type" de un equipo como el nombre de una categoria ("CPU",
// "Monitores"...) y el valor especial "Todos".
@Component({
  selector: 'app-equipment-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg class="eq-icon" viewBox="0 0 64 64" [attr.width]="size" [attr.height]="size" aria-hidden="true" [ngSwitch]="kind">

      <g *ngSwitchCase="'CPU'">
        <rect x="16" y="5" width="32" height="54" rx="5" fill="#475569"/>
        <rect x="19" y="8" width="26" height="48" rx="3" fill="#64748b"/>
        <rect x="23" y="13" width="18" height="5" rx="1.5" fill="#cbd5e1"/>
        <rect x="23" y="21" width="18" height="5" rx="1.5" fill="#cbd5e1"/>
        <rect x="23" y="29" width="18" height="2" rx="1" fill="#94a3b8"/>
        <rect x="23" y="33" width="18" height="2" rx="1" fill="#94a3b8"/>
        <circle cx="32" cy="46" r="4.5" fill="#0f172a"/>
        <circle cx="32" cy="46" r="2.5" fill="#2dd4bf"/>
      </g>

      <g *ngSwitchCase="'Monitores'">
        <rect x="5" y="8" width="54" height="36" rx="5" fill="#334155"/>
        <rect x="9" y="12" width="46" height="28" rx="2.5" fill="#38bdf8"/>
        <path d="M9 30 L26 12 H40 L9 40 Z" fill="#7dd3fc" opacity=".55"/>
        <rect x="28" y="44" width="8" height="8" fill="#94a3b8"/>
        <rect x="19" y="51" width="26" height="5" rx="2.5" fill="#64748b"/>
      </g>

      <g *ngSwitchCase="'Impresoras'">
        <rect x="17" y="6" width="30" height="18" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="6" y="22" width="52" height="24" rx="5" fill="#64748b"/>
        <rect x="6" y="22" width="52" height="8" rx="4" fill="#94a3b8"/>
        <circle cx="48" cy="36" r="2.5" fill="#4ade80"/>
        <rect x="14" y="38" width="36" height="20" rx="2" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="19" y="44" width="22" height="2.5" rx="1" fill="#cbd5e1"/>
        <rect x="19" y="50" width="16" height="2.5" rx="1" fill="#cbd5e1"/>
      </g>

      <g *ngSwitchCase="'DVR'">
        <rect x="4" y="18" width="56" height="28" rx="5" fill="#334155"/>
        <rect x="9" y="23" width="20" height="12" rx="2" fill="#0f172a"/>
        <rect x="12" y="27" width="10" height="2.5" rx="1" fill="#4ade80"/>
        <rect x="12" y="31" width="6" height="2" rx="1" fill="#4ade80" opacity=".6"/>
        <circle cx="38" cy="29" r="2.5" fill="#ef4444"/>
        <circle cx="46" cy="29" r="2.5" fill="#94a3b8"/>
        <circle cx="53" cy="29" r="2.5" fill="#94a3b8"/>
        <rect x="34" y="37" width="20" height="3" rx="1.5" fill="#64748b"/>
        <rect x="12" y="46" width="6" height="4" rx="1" fill="#475569"/>
        <rect x="46" y="46" width="6" height="4" rx="1" fill="#475569"/>
      </g>

      <g *ngSwitchCase="'Cámaras'">
        <rect x="22" y="6" width="20" height="8" rx="2" fill="#94a3b8"/>
        <path d="M8 42 A24 24 0 0 1 56 42 Z" fill="#e2e8f0"/>
        <path d="M8 42 A24 24 0 0 1 20 21 L26 42 Z" fill="#fff" opacity=".6"/>
        <circle cx="32" cy="35" r="10" fill="#1e293b"/>
        <circle cx="32" cy="35" r="6" fill="#38bdf8"/>
        <circle cx="29.5" cy="32.5" r="2" fill="#fff" opacity=".85"/>
        <rect x="6" y="42" width="52" height="7" rx="3.5" fill="#94a3b8"/>
        <circle cx="50" cy="45.5" r="1.8" fill="#ef4444"/>
      </g>

      <g *ngSwitchCase="'Escáneres'">
        <rect x="6" y="9" width="40" height="19" rx="6" fill="#475569"/>
        <rect x="11" y="14" width="30" height="9" rx="3" fill="#fecaca"/>
        <rect x="11" y="17.5" width="30" height="2" fill="#ef4444"/>
        <path d="M24 26 H40 L38 56 Q38 59 35 59 H29 Q26 59 26 56 Z" fill="#64748b"/>
        <rect x="30" y="34" width="6" height="9" rx="3" fill="#cbd5e1"/>
        <path d="M44 12 L56 6 M45 18 L58 18 M44 24 L56 30" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
      </g>

      <g *ngSwitchCase="'Lectores de huella'">
        <rect x="11" y="5" width="42" height="54" rx="9" fill="#334155"/>
        <rect x="17" y="11" width="30" height="9" rx="3" fill="#0f172a"/>
        <circle cx="25" cy="15.5" r="2" fill="#4ade80"/>
        <circle cx="32" cy="38" r="15" fill="#0f172a"/>
        <g fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round">
          <path d="M21 38 A11 11 0 0 1 43 38"/>
          <path d="M25 40 A7 7 0 0 1 39 40"/>
          <path d="M29 42 A3 3 0 0 1 35 42"/>
          <path d="M32 44 V48"/>
          <path d="M23.5 45 Q22 40 24 36"/>
          <path d="M40.5 45 Q42 41 41 37"/>
        </g>
      </g>

      <g *ngSwitchCase="'Teclados'">
        <rect x="3" y="15" width="58" height="34" rx="6" fill="#475569"/>
        <g fill="#e2e8f0">
          <rect x="8" y="20" width="6" height="6" rx="1.5"/><rect x="16" y="20" width="6" height="6" rx="1.5"/>
          <rect x="24" y="20" width="6" height="6" rx="1.5"/><rect x="32" y="20" width="6" height="6" rx="1.5"/>
          <rect x="40" y="20" width="6" height="6" rx="1.5"/><rect x="48" y="20" width="6" height="6" rx="1.5"/>
          <rect x="11" y="28" width="6" height="6" rx="1.5"/><rect x="19" y="28" width="6" height="6" rx="1.5"/>
          <rect x="27" y="28" width="6" height="6" rx="1.5"/><rect x="35" y="28" width="6" height="6" rx="1.5"/>
          <rect x="43" y="28" width="6" height="6" rx="1.5"/>
          <rect x="16" y="36" width="32" height="6" rx="1.5"/>
        </g>
      </g>

      <g *ngSwitchCase="'Mouse'">
        <rect x="18" y="6" width="28" height="52" rx="14" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
        <path d="M18 26 H46 V20 A14 14 0 0 0 32 6 A14 14 0 0 0 18 20 Z" fill="#cbd5e1"/>
        <line x1="32" y1="6" x2="32" y2="26" stroke="#94a3b8" stroke-width="2"/>
        <rect x="29.5" y="12" width="5" height="9" rx="2.5" fill="#475569"/>
        <circle cx="32" cy="40" r="3" fill="#38bdf8"/>
      </g>

      <g *ngSwitchCase="'UPS'">
        <rect x="8" y="10" width="48" height="44" rx="6" fill="#334155"/>
        <rect x="13" y="15" width="38" height="14" rx="3" fill="#0f172a"/>
        <rect x="16" y="18" width="7" height="8" rx="1" fill="#4ade80"/>
        <rect x="25" y="18" width="7" height="8" rx="1" fill="#4ade80"/>
        <rect x="34" y="18" width="7" height="8" rx="1" fill="#facc15"/>
        <path d="M47 16 L42 24 H46 L43 29 L50 21 H46 Z" fill="#facc15"/>
        <circle cx="20" cy="40" r="4" fill="#0f172a"/><circle cx="32" cy="40" r="4" fill="#0f172a"/><circle cx="44" cy="40" r="4" fill="#0f172a"/>
        <rect x="19" y="39" width="2" height="2" fill="#64748b"/><rect x="31" y="39" width="2" height="2" fill="#64748b"/><rect x="43" y="39" width="2" height="2" fill="#64748b"/>
        <rect x="14" y="54" width="6" height="4" rx="1" fill="#475569"/><rect x="44" y="54" width="6" height="4" rx="1" fill="#475569"/>
      </g>

      <g *ngSwitchCase="'Switch/Red'">
        <path d="M14 48 V57 M26 48 V57 M38 48 V57 M50 48 V57" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
        <path d="M20 48 V54 M32 48 V54 M44 48 V54" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
        <rect x="3" y="18" width="58" height="30" rx="5" fill="#475569"/>
        <rect x="3" y="18" width="58" height="9" rx="4.5" fill="#64748b"/>
        <g fill="#4ade80"><circle cx="12" cy="22.5" r="1.8"/><circle cx="20" cy="22.5" r="1.8"/><circle cx="28" cy="22.5" r="1.8"/><circle cx="36" cy="22.5" r="1.8"/></g>
        <g fill="#0f172a">
          <rect x="9" y="32" width="9" height="11" rx="1.5"/><rect x="21" y="32" width="9" height="11" rx="1.5"/>
          <rect x="33" y="32" width="9" height="11" rx="1.5"/><rect x="45" y="32" width="9" height="11" rx="1.5"/>
        </g>
      </g>

      <g *ngSwitchCase="'Todos'">
        <rect x="6" y="6" width="23" height="23" rx="6" fill="#38bdf8"/>
        <rect x="35" y="6" width="23" height="23" rx="6" fill="#4ade80"/>
        <rect x="6" y="35" width="23" height="23" rx="6" fill="#f59e0b"/>
        <rect x="35" y="35" width="23" height="23" rx="6" fill="#a78bfa"/>
      </g>

      <g *ngSwitchDefault>
        <path d="M32 6 L56 19 V45 L32 58 L8 45 V19 Z" fill="#64748b"/>
        <path d="M32 6 L56 19 L32 32 L8 19 Z" fill="#94a3b8"/>
        <path d="M32 32 V58 L8 45 V19 Z" fill="#475569"/>
        <circle cx="32" cy="32" r="3" fill="#e2e8f0"/>
      </g>
    </svg>
  `,
  styles: [`
    :host { display: inline-flex; flex-shrink: 0; }
    .eq-icon { display: block; }
  `],
})
export class EquipmentIconComponent {
  @Input() type: string | null | undefined = '';
  @Input() size = 24;

  get kind(): string {
    if (this.type === 'Todos') return 'Todos';
    return equipmentCategory(this.type);
  }
}
