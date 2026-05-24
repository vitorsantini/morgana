import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ProjectsService } from '../../core/services/projects.service';
import { ColumnsService } from '../../core/services/columns.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex h-screen bg-white dark:bg-gray-950 overflow-hidden">
      <app-sidebar />
      <main class="flex-1 overflow-auto">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent implements OnInit {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly columnsService: ColumnsService,
  ) {}

  ngOnInit(): void {
    this.projectsService.loadAll().subscribe();
    this.columnsService.loadAll().subscribe();
  }
}
