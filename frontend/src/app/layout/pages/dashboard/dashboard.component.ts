import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CorrectiveRequestService, CorrectiveRequest } from '../../../core/services/corrective-requests.service';
import { AssetsService, Asset } from '../../../core/services/assets.service';
import { UsersService, User } from '../../../core/services/users.service';
import { BranchesService, Branch } from '../../../core/services/branches.service';
import { MaintenanceVisitService, MaintenanceVisit } from '../../../core/services/maintenance-visit.service';
import { LabelPipe } from '../../../core/pipes/label.pipe';

interface CalendarDay {
  date: string | null;
  dayNumber: number | null;
  inMonth: boolean;
  isToday: boolean;
  items: MaintenanceVisit[];
}

interface ActivityEntry {
  kind: 'request' | 'visit';
  title: string;
  subtitle: string;
  date: string;
}

const WEEKDAYS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LabelPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private correctiveService = inject(CorrectiveRequestService);
  private assetsService = inject(AssetsService);
  private usersService = inject(UsersService);
  private branchesService = inject(BranchesService);
  private visitService = inject(MaintenanceVisitService);

  loading = false;

  correctiveRequests: CorrectiveRequest[] = [];
  assets: Asset[] = [];
  users: User[] = [];
  branches: Branch[] = [];
  visits: MaintenanceVisit[] = [];

  weekdays = WEEKDAYS;
  viewYear = new Date().getFullYear();
  viewMonth = new Date().getMonth();
  calendarWeeks: CalendarDay[][] = [];
  selectedDay: CalendarDay | null = null;

  activity: ActivityEntry[] = [];

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      requests: this.correctiveService.getCorrectiveRequest(),
      assets: this.assetsService.getAssets(),
      users: this.usersService.getUsers(),
      branches: this.branchesService.getBranches(),
      visits: this.visitService.getVisits(),
    }).subscribe({
      next: (res) => {
        this.correctiveRequests = res.requests;
        this.assets = res.assets;
        this.users = res.users;
        this.branches = res.branches;
        this.visits = res.visits;
        this.buildCalendar();
        this.buildActivity();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ---- Stat cards ----

  get openRequestsCount(): number {
    return this.correctiveRequests.filter(r => r.status !== 'cerrada').length;
  }

  get assetsInMaintenanceCount(): number {
    return this.assets.filter(a => a.status === 'en_mantenimiento').length;
  }

  get todayVisitsCount(): number {
    const today = this.toIsoDate(new Date());
    return this.visits.filter(v => v.visit_date === today).length;
  }

  get visitCompletionRate(): number {
    if (this.visits.length === 0) return 0;
    const done = this.visits.filter(v => v.status === 'completado').length;
    return Math.round((done / this.visits.length) * 100);
  }

  // ---- Calendar ----

  private toIsoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  get calendarLabel(): string {
    return `${MONTH_NAMES[this.viewMonth]} ${this.viewYear}`;
  }

  buildCalendar(): void {
    const firstOfMonth = new Date(this.viewYear, this.viewMonth, 1);
    const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const todayIso = this.toIsoDate(new Date());

    const cells: CalendarDay[] = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push({ date: null, dayNumber: null, inMonth: false, isToday: false, items: [] });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${this.viewYear}-${String(this.viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        date,
        dayNumber: day,
        inMonth: true,
        isToday: date === todayIso,
        items: this.visits.filter(v => v.visit_date === date),
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ date: null, dayNumber: null, inMonth: false, isToday: false, items: [] });
    }

    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    this.calendarWeeks = weeks;

    if (this.selectedDay?.date) {
      const stillVisible = cells.find(c => c.date === this.selectedDay?.date);
      this.selectedDay = stillVisible?.inMonth ? stillVisible : null;
    }
  }

  prevMonth(): void {
    this.viewMonth -= 1;
    if (this.viewMonth < 0) {
      this.viewMonth = 11;
      this.viewYear -= 1;
    }
    this.buildCalendar();
  }

  nextMonth(): void {
    this.viewMonth += 1;
    if (this.viewMonth > 11) {
      this.viewMonth = 0;
      this.viewYear += 1;
    }
    this.buildCalendar();
  }

  goToday(): void {
    const now = new Date();
    this.viewYear = now.getFullYear();
    this.viewMonth = now.getMonth();
    this.buildCalendar();
    const todayIso = this.toIsoDate(now);
    for (const week of this.calendarWeeks) {
      const found = week.find(c => c.date === todayIso);
      if (found) {
        this.selectedDay = found;
        break;
      }
    }
  }

  selectDay(day: CalendarDay): void {
    if (!day.inMonth) return;
    this.selectedDay = this.selectedDay?.date === day.date ? null : day;
  }

  getAssetName(id: number): string {
    return this.assets.find(a => a.id === id)?.name || 'Desconocido';
  }

  getUserName(id: number | null): string {
    if (!id) return 'Sin asignar';
    return this.users.find(u => u.id === id)?.name || 'Desconocido';
  }

  getBranchName(id: number): string {
    return this.branches.find(b => b.id === id)?.name || 'Desconocida';
  }

  // ---- Activity feed ----

  buildActivity(): void {
    const fromRequests: ActivityEntry[] = this.correctiveRequests.map(r => ({
      kind: 'request',
      title: `Solicitud #${r.id} · ${r.priority}`,
      subtitle: `${this.getAssetName(r.asset_id)} · ${r.status}`,
      date: r.created_at,
    }));

    const fromVisits: ActivityEntry[] = this.visits.map(v => ({
      kind: 'visit',
      title: `Visita · ${this.getBranchName(v.branch_id)}`,
      subtitle: `Programada ${v.visit_date} · ${v.status}`,
      date: v.created_at,
    }));

    this.activity = [...fromRequests, ...fromVisits]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  }

  // ---- Critical requests table ----

  get criticalRequests(): CorrectiveRequest[] {
    const order: Record<string, number> = { alta: 0, media: 1, baja: 2 };
    return this.correctiveRequests
      .filter(r => r.status !== 'cerrada')
      .sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3));
  }

  get topCriticalRequest(): CorrectiveRequest | null {
    return this.criticalRequests.find(r => r.priority === 'alta') || null;
  }
}
