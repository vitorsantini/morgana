import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Column {
  id: string;
  title: string;
  order: number;
  color: string | null;
}

export interface ProjectColumn extends Column {
  hidden: boolean;
}

@Injectable({ providedIn: 'root' })
export class ColumnsService {
  private readonly _columns = signal<Column[]>([]);
  readonly columns = this._columns.asReadonly();

  private readonly url = `${environment.apiUrl}/columns`;

  constructor(private readonly http: HttpClient) {}

  loadAll(): Observable<{ data: Column[] }> {
    return this.http
      .get<{ data: Column[] }>(this.url)
      .pipe(tap((res) => this._columns.set(res.data)));
  }

  create(title: string, color?: string): Observable<{ data: Column }> {
    return this.http
      .post<{ data: Column }>(this.url, { title, color })
      .pipe(tap((res) => this._columns.update((c) => [...c, res.data].sort((a, b) => a.order - b.order))));
  }

  update(id: string, changes: Partial<Column>): Observable<{ data: Column }> {
    return this.http
      .patch<{ data: Column }>(`${this.url}/${id}`, changes)
      .pipe(tap((res) => this._columns.update((c) => c.map((x) => (x.id === id ? res.data : x)))));
  }

  reorder(orderedIds: string[]): Observable<unknown> {
    return this.http.patch(`${this.url}/reorder`, { orderedIds });
  }

  toggleVisibility(projectId: string, columnId: string, hidden: boolean): Observable<unknown> {
    return this.http.patch(
      `${this.url}/projects/${projectId}/columns/${columnId}/visibility`,
      { hidden },
    );
  }
}
