import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CorrectiveRequestService, CorrectiveRequest } from '../../../../core/services/corrective-requests.service';
import { AssetsService, Asset } from '../../../../core/services/assets.service';
import { BranchesService, Branch } from '../../../../core/services/branches.service';
import { UsersService, User } from '../../../../core/services/users.service';
import { API_BASE_URL } from '../../../../core/config/api-config';

@Component({
  selector: 'app-corrective-request-print',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './corrective-request-print.component.html',
  styleUrl: './corrective-request-print.component.css',
})
export class CorrectiveRequestPrintComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private correctiveRequestsService = inject(CorrectiveRequestService);
  private assetsService = inject(AssetsService);
  private branchesService = inject(BranchesService);
  private usersService = inject(UsersService);

  request: CorrectiveRequest | null = null;
  assets: Asset[] = [];
  branches: Branch[] = [];
  users: User[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;

    this.assetsService.getAssets().subscribe({ next: res => this.assets = res });
    this.branchesService.getBranches().subscribe({ next: res => this.branches = res });
    this.usersService.getUsers().subscribe({ next: res => this.users = res });

    this.correctiveRequestsService.getCorrectiveRequest_by_id(id).subscribe({
      next: res => {
        this.request = res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la solicitud';
        this.loading = false;
      },
    });
  }

  get asset(): Asset | undefined {
    return this.assets.find(a => a.id === this.request?.asset_id);
  }

  get branchName(): string {
    return this.branches.find(b => b.id === this.asset?.branch_id)?.name || '—';
  }

  get requesterName(): string {
    return this.users.find(u => u.id === this.request?.requester_id)?.name || '—';
  }

  get technicianName(): string {
    if (!this.request?.assigned_id) return 'Sin asignar';
    return this.users.find(u => u.id === this.request?.assigned_id)?.name || '—';
  }

  reportUrl(path: string): string {
    return `${API_BASE_URL}${path}`;
  }

  today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  print(): void {
    window.print();
  }
}
