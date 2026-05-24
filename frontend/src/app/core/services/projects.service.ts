import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Project {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly _projects = signal<Project[]>([]);
  readonly projects = this._projects.asReadonly();

  private readonly url = `${environment.apiUrl}/projects`;

  constructor(private readonly http: HttpClient) {}

  loadAll(includeArchived = false): Observable<{ data: Project[] }> {
    return this.http
      .get<{ data: Project[] }>(this.url, {
        params: includeArchived ? { includeArchived: 'true' } : {},
      })
      .pipe(tap((res) => this._projects.set(res.data)));
  }

  create(name: string, color?: string, icon?: string): Observable<{ data: Project }> {
    return this.http
      .post<{ data: Project }>(this.url, { name, color, icon })
      .pipe(tap((res) => this._projects.update((p) => [...p, res.data])));
  }

  update(id: string, changes: Partial<Pick<Project, 'name' | 'color' | 'icon'>>): Observable<{ data: Project }> {
    return this.http
      .patch<{ data: Project }>(`${this.url}/${id}`, changes)
      .pipe(tap((res) => this._projects.update((p) => p.map((x) => (x.id === id ? res.data : x)))));
  }

  archive(id: string, archived: boolean): Observable<{ data: Project }> {
    return this.http
      .patch<{ data: Project }>(`${this.url}/${id}/archive`, { archived })
      .pipe(tap((res) => this._projects.update((p) => p.map((x) => (x.id === id ? res.data : x)))));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/${id}`)
      .pipe(tap(() => this._projects.update((p) => p.filter((x) => x.id !== id))));
  }
}
