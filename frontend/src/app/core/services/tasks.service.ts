import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  priority: Priority;
  order: number;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly _tasks = signal<Task[]>([]);
  readonly tasks = this._tasks.asReadonly();

  private readonly url = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  loadByProject(projectId: string): Observable<{ data: Task[] }> {
    return this.http
      .get<{ data: Task[] }>(`${this.url}/projects/${projectId}/tasks`)
      .pipe(tap((res) => this._tasks.set(res.data)));
  }

  loadAll(): Observable<{ data: Task[] }> {
    return this.http
      .get<{ data: Task[] }>(`${this.url}/tasks`)
      .pipe(tap((res) => this._tasks.set(res.data)));
  }

  getOne(projectId: string, id: string): Observable<{ data: Task }> {
    return this.http.get<{ data: Task }>(`${this.url}/projects/${projectId}/tasks/${id}`);
  }

  create(
    projectId: string,
    data: { title: string; columnId: string; priority?: Priority },
  ): Observable<{ data: Task }> {
    return this.http
      .post<{ data: Task }>(`${this.url}/projects/${projectId}/tasks`, data)
      .pipe(tap((res) => this._tasks.update((t) => [...t, res.data])));
  }

  update(projectId: string, id: string, changes: Partial<Task>): Observable<{ data: Task }> {
    return this.http
      .patch<{ data: Task }>(`${this.url}/projects/${projectId}/tasks/${id}`, changes)
      .pipe(tap((res) => this._tasks.update((t) => t.map((x) => (x.id === id ? res.data : x)))));
  }

  move(id: string, columnId: string, order?: number): Observable<{ data: Task }> {
    return this.http
      .patch<{ data: Task }>(`${this.url}/tasks/${id}/move`, { columnId, order })
      .pipe(tap((res) => this._tasks.update((t) => t.map((x) => (x.id === id ? res.data : x)))));
  }

  reorder(columnId: string, orderedIds: string[]): Observable<unknown> {
    return this.http.patch(`${this.url}/tasks/reorder`, { columnId, orderedIds });
  }

  delete(projectId: string, id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/projects/${projectId}/tasks/${id}`)
      .pipe(tap(() => this._tasks.update((t) => t.filter((x) => x.id !== id))));
  }

  // Subtasks
  addSubtask(taskId: string, title: string): Observable<{ data: Subtask }> {
    return this.http
      .post<{ data: Subtask }>(`${this.url}/tasks/${taskId}/subtasks`, { title })
      .pipe(
        tap((res) =>
          this._tasks.update((tasks) =>
            tasks.map((t) =>
              t.id === taskId ? { ...t, subtasks: [...t.subtasks, res.data] } : t,
            ),
          ),
        ),
      );
  }

  toggleSubtask(
    taskId: string,
    subtaskId: string,
    done: boolean,
  ): Observable<{ data: { autoAdvanced: boolean } }> {
    return this.http
      .patch<{ data: { autoAdvanced: boolean } }>(
        `${this.url}/tasks/${taskId}/subtasks/${subtaskId}/toggle`,
        { done },
      )
      .pipe(
        tap(() =>
          this._tasks.update((tasks) =>
            tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    subtasks: t.subtasks.map((s) =>
                      s.id === subtaskId ? { ...s, done } : s,
                    ),
                  }
                : t,
            ),
          ),
        ),
      );
  }

  deleteSubtask(taskId: string, subtaskId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/tasks/${taskId}/subtasks/${subtaskId}`)
      .pipe(
        tap(() =>
          this._tasks.update((tasks) =>
            tasks.map((t) =>
              t.id === taskId
                ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }
                : t,
            ),
          ),
        ),
      );
  }
}
