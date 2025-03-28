import { Injectable, inject } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytesResumable,
  listAll,
  StorageReference,
  deleteObject,
  getDownloadURL,
  getMetadata,
  FullMetadata,
  getBlob,
} from '@angular/fire/storage';
import { BehaviorSubject, defer, map, Observable, switchMap, throwError } from 'rxjs';
import { CacheService } from './cache.service';
import { HttpClient } from '@angular/common/http';
import { FileType, getFileType } from '@app/shared';
import { environment } from '@lib/environments';

const FOLDER_PATH = 'docs';
@Injectable({
  providedIn: 'root',
})
export class FileHandlerService {
  private storage = inject(Storage);
  private cacheService = inject(CacheService);
  private httpClient = inject(HttpClient);
  private refreshTrigger = new BehaviorSubject<void>(undefined);
  
  private getStorageRef(path: string): StorageReference {
    return ref(this.storage, path);
  }

  uploadFile(file: File): Observable<StorageReference> {
    return defer(() => this.canUploadFile()).pipe(
      switchMap((canUpload) => {
        if (!canUpload) {
          return throwError(() => new Error('Cannot upload file'));
        }

        const uuid = this.cacheService.getUUI();
        const storageRef = this.getStorageRef(
          `${FOLDER_PATH}/${uuid}/${file.name}`
        );

        return new Observable<StorageReference>((subscriber) => {
          uploadBytesResumable(storageRef, file)
            .then((snapshot) => {
              const storageRef = snapshot.task.snapshot.ref;
              subscriber.next(storageRef);
              subscriber.complete();
            })
            .catch((error) => {
              subscriber.error(error);
            });
        });
      })
    );
  }

  uploadFileByURL(url: string): Observable<{ filename: string }> {
    return defer(() => this.canUploadFile()).pipe(
      switchMap((canUpload) => {
        if (!canUpload) {
          return throwError(() => new Error('Cannot upload file'));
        }

        const apiHost = environment.apiHost;
        const uuid = this.cacheService.getUUI();
        return this.httpClient.post<{ filename: string }>(
          `${apiHost}/upload-file-url`,
          { uuid, url }
        );
      })
    );
  }

  getFileURL(filename: string): Observable<string> {
    const uuid = this.cacheService.getUUI();
    const fileRef = this.getStorageRef(`${FOLDER_PATH}/${uuid}/${filename}`);
    return defer(() => getDownloadURL(fileRef));
  }

  readBlobFile(filename: string): Observable<Blob> {
    const uuid = this.cacheService.getUUI();
    const fileRef = this.getStorageRef(`${FOLDER_PATH}/${uuid}/${filename}`);
    return defer(() => getBlob(fileRef));
  }

  getFileMetadata(filename: string): Observable<FullMetadata> {
    const uuid = this.cacheService.getUUI();
    const fileRef = this.getStorageRef(`${FOLDER_PATH}/${uuid}/${filename}`);

    return defer(() => getMetadata(fileRef));
  }

  getFileType(filename: string): Observable<FileType | undefined> {
    return this.getFileMetadata(filename).pipe(
      map((metadata) => getFileType(metadata.contentType))
    );
  }

  readFiles(): Observable<StorageReference[]> {
    const uuid = this.cacheService.getUUI();
    const listRef = this.getStorageRef(`${FOLDER_PATH}/${uuid}`);
    return this.refreshTrigger.pipe(
      switchMap(() => {
        return defer(() => listAll(listRef)).pipe(map((result) => result.items));
      })
    )
  }
  
  refreshFileList(): void {
    this.refreshTrigger.next();
  }

  deleteFile(filename: string): Observable<void> {
    const uuid = this.cacheService.getUUI();
    const fileRef = this.getStorageRef(`${FOLDER_PATH}/${uuid}/${filename}`);

    return defer(() => deleteObject(fileRef));
  }

  private async canUploadFile(): Promise<boolean> {
    // Add any condition before uploading a file.
    return true;
  }
}
