import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, ViewChild, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopup, ConfirmPopupModule } from 'primeng/confirmpopup';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';

import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUpload } from '../../directives/file-upload';
import { FileUploadDirective } from '../../directives/file-upload.directive';
import { FileHandlerService } from '../../services/file-handler.service';

import { Router, RouterModule } from '@angular/router';
import { isSupportedContentType } from '@app/shared';
import { StorageReference } from 'firebase/storage';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { EMPTY, Observable, Subject, tap, throwError } from 'rxjs';
import { catchError, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { CacheService } from '../../services/cache.service';
import { ChatService } from '../../services/chat.service';
interface FileState {
  uploadingFile: boolean;
  loadingFileList: boolean;
}

interface UploadURLResponse {
  filename: string;
}

@Component({
  selector: 'app-file-upload',
  imports: [
    CommonModule,
    ProgressBarModule,
    DividerModule,
    ButtonModule,
    ConfirmPopupModule,
    ToastModule,
    InputTextModule,
    MatIconModule,
    FormsModule,
    RouterModule,
    FileUploadDirective,
    ReactiveFormsModule,
    ProgressSpinnerModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
})
export class FileUploadComponent implements OnDestroy {
  private readonly chatService = inject(ChatService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly fileHandlerService = inject(FileHandlerService);
  private readonly cacheService = inject(CacheService);
  private readonly router = inject(Router);
  private readonly FILE_SIZE_LIMITS = {
    maxSizeInMB: 20,
    maxSizeInBytes: 20 * 1024 * 1024
  } as const;
  private pendingFile: File | null = null;

  @ViewChild(ConfirmPopup) confirmPopup!: ConfirmPopup;
  fileURL = new FormControl('', [
    Validators.required,
    Validators.pattern(
      '^(http(s)?://)?([\\w-]+\\.)+[\\w-]+(/[\\w- ;,./?%&=]*)?$'
    ),
  ]);
  private readonly destroy$ = new Subject<void>();
  private readonly fileToUpload$ = new Subject<File>();

  fileUpload$ = this.fileToUpload$.pipe(
    tap(() => {
      this.fileState.uploadingFile = true;
    }),
    switchMap(file => {
      if (!this.validateFile(file)) {
        this.resetFileInput();
        return EMPTY;
      }
      return this.fileHandlerService.uploadFile(file).pipe(
        tap((fileRef) => {
          this.pendingFile = null;
          this.resetFileInput();
          this.cacheFile(fileRef.name);
          this.fileHandlerService.refreshFileList();
          this.navigateToChat(fileRef.name);
        }),
        catchError((error) => {
          this.handleUploadError(error);
          return EMPTY;
        }),
        finalize(() => {
          this.fileState.uploadingFile = false;
        })
      );
    }),
    takeUntil(this.destroy$)
  );

  fileList$ = this.fileHandlerService.readFiles().pipe(
    tap((list) => {
      if (!list) {
        return;
      }
      this.fileState.loadingFileList = false;
    }),
    catchError((error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load file list'
      });
      return EMPTY;
    }),
    takeUntil(this.destroy$)
  );


  inputFile = viewChild<HTMLInputElement>('inputFile');

  fileState: FileState = {
    uploadingFile: false,
    loadingFileList: true
  };

  
  constructor() {
    this.fileUpload$.subscribe();
  }

  onDropFiles(files: FileUpload[]): void {
    if (files.length > 0) {
      this.pendingFile = files[0].file;
      this.fileToUpload$.next(files[0].file);
    }
  }

  selectFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.item(0);
    if (file) {
      this.pendingFile = file;
      this.fileToUpload$.next(file);
    }
  }
  
  private validateFile(file: File): boolean {
    if (!isSupportedContentType(file.type)) {
      this.showErrorMessage('File type is not supported');
      return false;
    }
    if (file.size > this.FILE_SIZE_LIMITS.maxSizeInBytes) {
      this.showErrorMessage(`File size exceeds ${this.FILE_SIZE_LIMITS.maxSizeInMB}MB`);
      return false;
    }
    return true;
  }

  deleteFile(file: StorageReference): Observable<boolean> {
    this.fileState.loadingFileList = true;
    
    return this.fileHandlerService.deleteFile(file.name).pipe(
      switchMap(() => {
        const uuid = this.cacheService.getUUI();
        const chatSession = `${uuid}/${file.name}`;
        return this.chatService.deleteSession(chatSession);
      }),
      takeUntil(this.destroy$),
      catchError((error) => {
        this.showErrorMessage(`Error while deleting the file. Please try again later.`);
        return throwError(() => error);
      }),
      finalize(() => {
        this.fileState.loadingFileList = false;
        this.cleanupAfterDeleteFile(file.name);
      })
    );
  }

  onDeleteFile(file: StorageReference): void {
    this.deleteFile(file).subscribe({
      error: (error) => {
        console.error('Error deleting file:', error);
      }
    });
  }

  showLoadByURLPopup(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Load by using a File URL',
    });
  }


  loadByURL(url: string): Observable<UploadURLResponse> {
    if (!this.validateURL(url)) {
      return EMPTY;
    }

    this.fileURL.reset('');
    this.fileState.uploadingFile = true;
    this.confirmPopup.hide();

    return this.fileHandlerService.uploadFileByURL(url).pipe(
      takeUntil(this.destroy$),
      tap(({ filename }) => {
        this.cacheFile(filename);
        this.navigateToChat(filename);
      }),
      catchError((error) => {
        this.handleUploadError(error);
        return EMPTY;
      }),
      finalize(() => {
        this.fileState.uploadingFile = false;
      })
    );
  }

  onLoadByURL(url: string): void {
    this.loadByURL(url).subscribe();
  }

  onSuccessSignIn() {
    if (this.pendingFile) {
      this.fileToUpload$.next(this.pendingFile);
    }
  }

  private handleUploadError(error: any): void {
    this.pendingFile = null;
      this.showErrorMessage('Failed to upload file. Please try again later.');
    this.resetFileInput();
  }

  private showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  private validateURL(url: string): boolean {
    if (!url || this.fileURL.invalid) {
      this.showErrorMessage('Please provide a valid URL');
      return false;
    }
    return true;
  }

  private navigateToChat(fileName: string): void {
    this.router.navigate(['chat'], {
      queryParams: { file: fileName },
    });
  }

  private cacheFile(fileName: string): void {
    this.cacheService.cacheFile(fileName);
  }

  private cleanupAfterDeleteFile(fileName: string): void {
    this.cacheService.deleteCacheFile(fileName);
    this.fileHandlerService.refreshFileList();
  }

  private resetFileInput(): void {
    if (this.inputFile()) {
      this.inputFile()!.value = '';
    }
  }

  ngOnDestroy() {
    this.pendingFile = null;
    this.destroy$.next();
    this.destroy$.complete();
  }
}
