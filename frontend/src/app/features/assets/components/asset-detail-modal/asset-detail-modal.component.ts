import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Asset } from '../../../../core/services/assets.service';
import { CorrectiveRequest } from '../../../../core/services/corrective-requests.service';
import { LabelPipe } from '../../../../core/pipes/label.pipe';
import { EquipmentIconComponent } from '../../../../shared/equipment-icon/equipment-icon.component';
import { isCpuType, isDvrType, isMonitorType } from '../../../../core/utils/equipment-category';

/** Ventana de solo lectura con el detalle de un equipo y su historial de fallas. */
@Component({
  selector: 'app-asset-detail-modal',
  standalone: true,
  imports: [CommonModule, LabelPipe, EquipmentIconComponent],
  templateUrl: './asset-detail-modal.component.html',
  styleUrl: './asset-detail-modal.component.css',
})
export class AssetDetailModalComponent {
  @Input({ required: true }) asset!: Asset;
  /** Solicitudes correctivas del equipo (historial de fallas). */
  @Input({ required: true }) requests!: CorrectiveRequest[];
  @Input({ required: true }) branchName!: string;
  @Input({ required: true }) technicianName!: (id: number | null) => string;

  @Output() closed = new EventEmitter<void>();

  readonly isCpu = isCpuType;
  readonly isDvr = isDvrType;
  readonly isMonitor = isMonitorType;
}
