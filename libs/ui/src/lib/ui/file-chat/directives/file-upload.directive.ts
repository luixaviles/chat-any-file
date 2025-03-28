import {
  Directive,
  HostBinding,
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FileUpload } from './file-upload';

enum DropColor {
  Default = '#e2e8f0',
  Over = '#cbd5e1',
}

@Directive({
  selector: '[appFileUpload]',
  standalone: true,
})
export class FileUploadDirective {
  @Output() dropFiles: EventEmitter<FileUpload[]> = new EventEmitter();
  @HostBinding('style.background') backgroundColor = DropColor.Default;

  constructor(private sanitizer: DomSanitizer) {}

  @HostListener('dragover', ['$event']) public dragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.backgroundColor = DropColor.Over;
  }

  @HostListener('dragleave', ['$event']) public dragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.backgroundColor = DropColor.Default;
  }

  @HostListener('drop', ['$event']) public drop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.backgroundColor = DropColor.Default;

    let fileList = event?.dataTransfer?.files;
    let files: FileUpload[] = [];

    if (!fileList) {
      return;
    }

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const url = this.sanitizer.bypassSecurityTrustUrl(
        window.URL.createObjectURL(file)
      );
      files.push({ file, url });
    }
    if (files.length > 0) {
      this.dropFiles.emit(files);
    }
  }
}
