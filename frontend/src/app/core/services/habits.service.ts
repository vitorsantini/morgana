import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  entries: HabitEntry[];
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class HabitsService {
  private readonly _habits = signal<Habit[]>([]);
  readonly habits = this._habits.asReadonly();

  private readonly url = `${environment.apiUrl}/habits`;

  constructor(private readonly http: HttpClient) {}

  loadAll(): Observable<{ data: Habit[] }> {
    return this.http
      .get<{ data: Habit[] }>(this.url)
      .pipe(tap((res) => this._habits.set(res.data)));
  }

  create(name: string): Observable<{ data: Habit }> {
    return this.http
      .post<{ data: Habit }>(this.url, { name })
      .pipe(tap((res) => this._habits.update((h) => [...h, res.data])));
  }

  logEntry(habitId: string, date?: Date): Observable<{ data: HabitEntry }> {
    const dateStr = (date ?? new Date()).toISOString().split('T')[0];
    return this.http.post<{ data: HabitEntry }>(`${this.url}/${habitId}/entries`, { date: dateStr });
  }

  removeEntry(habitId: string, date: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${habitId}/entries/${date}`);
  }

  getHeatmap(habitId: string, year?: number): Observable<{ data: string[] }> {
    const y = year ?? new Date().getFullYear();
    return this.http.get<{ data: string[] }>(`${this.url}/${habitId}/heatmap`, {
      params: { year: String(y) },
    });
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/${id}`)
      .pipe(tap(() => this._habits.update((h) => h.filter((x) => x.id !== id))));
  }
}
