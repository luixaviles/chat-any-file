import { Injectable } from '@angular/core';

export interface CachedFile {
  filename: string;
  timestamp?: number;
}

const CACHE_KEY = 'chat';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor() {}

  getUUI(): string {
    let uuid = localStorage.getItem(CACHE_KEY);
    if(!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem(CACHE_KEY, uuid);
    }

    return uuid;
  }

  getCachedFiles(): CachedFile[] {
    const files = localStorage.getItem(this.getUUI());
    return files? JSON.parse(files): [];
  }

  getCachedFile(filename: string): CachedFile | undefined {
    const cachedFiles = this.getCachedFiles() || [];
    return cachedFiles.find(f => f.filename === filename);
  }

  cacheFile(filename: string) {
    const timestamp = new Date().getTime();
    const cachedFiles = this.getCachedFiles();
    cachedFiles.push({
      filename,
      timestamp
    });
    this.setCachedFiles(cachedFiles);
  }

  setCachedFiles(files: CachedFile[]) {
    localStorage.setItem(this.getUUI(), JSON.stringify(files));
  }

  deleteCacheFile(filename: string) {
    const files = this.getCachedFiles();
    const index = files.findIndex(f => f.filename === filename);
    files.splice(index);
    this.setCachedFiles(files);
  }

  public clear() {
    localStorage.clear();
  }
}
