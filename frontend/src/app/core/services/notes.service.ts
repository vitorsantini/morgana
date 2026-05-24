import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Note {
  id: string;
  title: string;
  content?: string;
  folder: string | null;
  tags: string[];
  isTemplate: boolean;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly _notes = signal<Note[]>([]);
  readonly notes = this._notes.asReadonly();

  private readonly url = `${environment.apiUrl}/notes`;

  constructor(private readonly http: HttpClient) {}

  loadAll(params?: { folder?: string; tag?: string; template?: boolean; search?: string }): Observable<{ data: Note[] }> {
    const queryParams: Record<string, string> = {};
    if (params?.folder) queryParams['folder'] = params.folder;
    if (params?.tag) queryParams['tag'] = params.tag;
    if (params?.template !== undefined) queryParams['template'] = String(params.template);
    if (params?.search) queryParams['search'] = params.search;

    return this.http
      .get<{ data: Note[] }>(this.url, { params: queryParams })
      .pipe(tap((res) => this._notes.set(res.data)));
  }

  getOne(id: string): Observable<{ data: Note }> {
    return this.http.get<{ data: Note }>(`${this.url}/${id}`);
  }

  create(data: Partial<Note> & { title: string }): Observable<{ data: Note }> {
    return this.http
      .post<{ data: Note }>(this.url, data)
      .pipe(tap((res) => this._notes.update((n) => [res.data, ...n])));
  }

  update(id: string, changes: Partial<Note>): Observable<{ data: Note }> {
    return this.http
      .patch<{ data: Note }>(`${this.url}/${id}`, changes)
      .pipe(tap((res) => this._notes.update((n) => n.map((x) => (x.id === id ? res.data : x)))));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/${id}`)
      .pipe(tap(() => this._notes.update((n) => n.filter((x) => x.id !== id))));
  }

  getFolders(): Observable<{ data: string[] }> {
    return this.http.get<{ data: string[] }>(`${this.url}/meta/folders`);
  }

  getTags(): Observable<{ data: string[] }> {
    return this.http.get<{ data: string[] }>(`${this.url}/meta/tags`);
  }
}
