import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MaintenanceVisitChecklistEntryCreate,
  MaintenanceVisitPhoto,
  MaintenanceVisitService,
} from '../../../../core/services/maintenance-visit.service';
import { DraftItem } from '../../visit-form.data';

/** Cuerpo de la ficha de un equipo en el formulario de visitas: estado,
 * checklists, observaciones y fotos. Lo usan los equipos de la sucursal y los
 * no registrados. Solo muestra y avisa: subir y borrar fotos lo hace el formulario. */
@Component({
  selector: 'app-visit-item-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visit-item-card.component.html',
  styleUrl: './visit-item-card.component.css',
})
export class VisitItemCardComponent {
  private visitService = inject(MaintenanceVisitService);

  @Input({ required: true }) item!: DraftItem;
  /** Sufijo unico para los nombres de los campos de esta ficha. */
  @Input({ required: true }) fieldKey!: string;

  @Output() photosSelected = new EventEmitter<Event>();
  @Output() removeNewPhoto = new EventEmitter<number>();
  @Output() removeSavedPhoto = new EventEmitter<MaintenanceVisitPhoto>();

  entriesByCategory(category: string): MaintenanceVisitChecklistEntryCreate[] {
    return (this.item.checklist_entries || []).filter(e => e.category === category);
  }

  photoUrl(path: string): string {
    return this.visitService.photoUrl(path);
  }
}
