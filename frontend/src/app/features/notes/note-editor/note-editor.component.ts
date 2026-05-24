import { Component, OnInit, OnDestroy, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, debounceTime } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotesService, Note } from '../../../core/services/notes.service';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Toolbar -->
      <div class="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-3 flex-1">
          <button (click)="back()" class="btn-ghost">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <input
            [(ngModel)]="title"
            (ngModelChange)="onTitleChange()"
            class="flex-1 text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-gray-100"
            placeholder="Título da nota..."
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400">{{ saving() ? 'Salvando...' : 'Salvo' }}</span>

          <!-- View toggle -->
          <div class="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <button
              (click)="editorMode.set('edit')"
              [class.bg-primary-50]="editorMode() === 'edit'"
              class="px-2 py-1 text-xs transition-colors"
            >Editar</button>
            <button
              (click)="editorMode.set('preview')"
              [class.bg-primary-50]="editorMode() === 'preview'"
              class="px-2 py-1 text-xs border-l border-gray-200 dark:border-gray-800 transition-colors"
            >Preview</button>
            <button
              (click)="editorMode.set('split')"
              [class.bg-primary-50]="editorMode() === 'split'"
              class="px-2 py-1 text-xs border-l border-gray-200 dark:border-gray-800 transition-colors"
            >Split</button>
          </div>

          <button (click)="deleteNote()" class="btn-ghost text-red-500 hover:text-red-700 text-sm">Excluir</button>
        </div>
      </div>

      <!-- Tags & folder -->
      <div class="flex items-center gap-2 px-6 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          [(ngModel)]="folder"
          (ngModelChange)="onMetaChange()"
          class="text-xs bg-transparent border-none outline-none text-gray-400"
          placeholder="Pasta (ex: trabalho)..."
        />
        <span class="text-gray-300">|</span>
        <input
          [(ngModel)]="tagsInput"
          (ngModelChange)="onMetaChange()"
          class="text-xs bg-transparent border-none outline-none text-gray-400 flex-1"
          placeholder="Tags separadas por vírgula..."
        />
      </div>

      <!-- Editor area -->
      <div class="flex-1 overflow-hidden flex">
        <!-- Edit pane -->
        @if (editorMode() === 'edit' || editorMode() === 'split') {
          <div [class.w-1/2]="editorMode() === 'split'" [class.w-full]="editorMode() === 'edit'" class="flex flex-col">
            <textarea
              [(ngModel)]="content"
              (ngModelChange)="onContentChange()"
              class="flex-1 w-full p-6 resize-none bg-transparent outline-none font-mono text-sm text-gray-800 dark:text-gray-200 leading-relaxed"
              placeholder="Escreva em Markdown..."
              spellcheck="false"
            ></textarea>
          </div>
        }

        <!-- Divider -->
        @if (editorMode() === 'split') {
          <div class="w-px bg-gray-200 dark:bg-gray-800"></div>
        }

        <!-- Preview pane -->
        @if (editorMode() === 'preview' || editorMode() === 'split') {
          <div
            [class.w-1/2]="editorMode() === 'split'"
            [class.w-full]="editorMode() === 'preview'"
            class="flex-1 overflow-y-auto p-6 prose prose-sm dark:prose-invert max-w-none"
            [innerHTML]="renderedContent()"
          ></div>
        }
      </div>
    </div>
  `,
})
export class NoteEditorComponent implements OnInit, OnDestroy {
  readonly id = input.required<string>();

  title = '';
  content = '';
  folder = '';
  tagsInput = '';

  readonly editorMode = signal<'edit' | 'preview' | 'split'>('split');
  readonly saving = signal(false);
  readonly renderedContent = signal<SafeHtml>('');

  private readonly destroy$ = new Subject<void>();
  private readonly saveSubject = new Subject<void>();

  constructor(
    private readonly notesService: NotesService,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.notesService.getOne(this.id()).subscribe((res) => {
      const note = res.data;
      this.title = note.title;
      this.content = note.content ?? '';
      this.folder = note.folder ?? '';
      this.tagsInput = (note.tags ?? []).join(', ');
      this.updatePreview();
    });

    // Debounced auto-save
    this.saveSubject
      .pipe(debounceTime(800), takeUntil(this.destroy$))
      .subscribe(() => this.save());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTitleChange(): void {
    this.saveSubject.next();
  }

  onContentChange(): void {
    this.updatePreview();
    this.saveSubject.next();
  }

  onMetaChange(): void {
    this.saveSubject.next();
  }

  private updatePreview(): void {
    // RF-062: resolve [[note-title]] links
    const processedContent = this.content.replace(
      /\[\[([^\]]+)\]\]/g,
      (_match, noteTitle) => `[${noteTitle}](#)`,
    );
    const html = marked.parse(processedContent) as string;
    this.renderedContent.set(this.sanitizer.bypassSecurityTrustHtml(html));
  }

  private save(): void {
    this.saving.set(true);
    const tags = this.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    this.notesService
      .update(this.id(), {
        title: this.title,
        content: this.content,
        folder: this.folder || undefined,
        tags,
      })
      .subscribe({ next: () => this.saving.set(false) });
  }

  deleteNote(): void {
    this.notesService.delete(this.id()).subscribe({ next: () => this.back() });
  }

  back(): void {
    this.router.navigate(['/notes']);
  }
}
