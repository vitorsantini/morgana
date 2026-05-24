import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotesService, Note } from '../../../core/services/notes.service';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h1 class="text-xl font-semibold">Notas</h1>
        <button (click)="createNote()" class="btn-primary">+ Nova nota</button>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar: folders & tags -->
        <div class="w-48 border-r border-gray-200 dark:border-gray-800 p-4 shrink-0 overflow-y-auto">
          <div class="mb-4">
            <input
              [(ngModel)]="search"
              (ngModelChange)="onSearch()"
              class="input text-sm"
              placeholder="Buscar notas..."
            />
          </div>

          <div class="space-y-1">
            <button
              (click)="setFilter(null, null)"
              class="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              [class.font-semibold]="!activeFolder() && !activeTag()"
            >
              Todas as notas
            </button>
            <button
              (click)="setFilter('__templates__', null)"
              class="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Templates
            </button>
          </div>

          @if (folders().length > 0) {
            <div class="mt-4">
              <p class="text-xs font-semibold text-gray-400 uppercase mb-1">Pastas</p>
              @for (folder of folders(); track folder) {
                <button
                  (click)="setFilter(folder, null)"
                  class="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  [class.text-primary-600]="activeFolder() === folder"
                >
                  {{ folder }}
                </button>
              }
            </div>
          }

          @if (tags().length > 0) {
            <div class="mt-4">
              <p class="text-xs font-semibold text-gray-400 uppercase mb-1">Tags</p>
              <div class="flex flex-wrap gap-1">
                @for (tag of tags(); track tag) {
                  <button
                    (click)="setFilter(null, tag)"
                    class="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-primary-100"
                    [class.bg-primary-100]="activeTag() === tag"
                  >
                    #{{ tag }}
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <!-- Notes list -->
        <div class="flex-1 overflow-y-auto p-4">
          @if (notesService.notes().length === 0) {
            <div class="text-center text-gray-400 mt-12">
              <p>Nenhuma nota encontrada</p>
              <button (click)="createNote()" class="btn-primary mt-3">Criar primeira nota</button>
            </div>
          }
          <div class="grid gap-3">
            @for (note of notesService.notes(); track note.id) {
              <div
                class="card p-4 cursor-pointer hover:shadow-md transition-shadow"
                (click)="openNote(note)"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-medium text-gray-900 dark:text-gray-100 truncate">{{ note.title }}</h3>
                    <div class="flex items-center gap-2 mt-1">
                      @if (note.folder) {
                        <span class="text-xs text-gray-400">{{ note.folder }}</span>
                      }
                      @if (note.isTemplate) {
                        <span class="badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs">template</span>
                      }
                    </div>
                    <div class="flex flex-wrap gap-1 mt-1">
                      @for (tag of note.tags; track tag) {
                        <span class="badge bg-gray-100 dark:bg-gray-800 text-gray-500">#{{ tag }}</span>
                      }
                    </div>
                  </div>
                  <span class="text-xs text-gray-400 shrink-0">{{ formatDate(note.updatedAt) }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotesListComponent implements OnInit {
  readonly folders = signal<string[]>([]);
  readonly tags = signal<string[]>([]);
  readonly activeFolder = signal<string | null>(null);
  readonly activeTag = signal<string | null>(null);
  search = '';

  constructor(
    readonly notesService: NotesService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadNotes();
    this.notesService.getFolders().subscribe((res) => this.folders.set(res.data));
    this.notesService.getTags().subscribe((res) => this.tags.set(res.data));
  }

  loadNotes(): void {
    const isTemplate = this.activeFolder() === '__templates__' ? true : undefined;
    const folder = this.activeFolder() && this.activeFolder() !== '__templates__' ? this.activeFolder()! : undefined;
    this.notesService.loadAll({
      folder,
      tag: this.activeTag() ?? undefined,
      template: isTemplate,
      search: this.search || undefined,
    }).subscribe();
  }

  setFilter(folder: string | null, tag: string | null): void {
    this.activeFolder.set(folder);
    this.activeTag.set(tag);
    this.loadNotes();
  }

  onSearch(): void {
    this.loadNotes();
  }

  openNote(note: Note): void {
    this.router.navigate(['/notes', note.id]);
  }

  createNote(): void {
    this.notesService.create({ title: 'Nova nota', content: '' }).subscribe((res) => {
      this.router.navigate(['/notes', res.data.id]);
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }
}
