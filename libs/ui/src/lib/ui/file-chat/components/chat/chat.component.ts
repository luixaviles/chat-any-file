import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, viewChild } from '@angular/core';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ChipComponent } from '../../../shared/chip/chip.component';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { SplitterModule } from 'primeng/splitter';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';


import { ConfirmationService, MessageService } from 'primeng/api';

import { MarkdownModule } from 'ngx-markdown';
import { PdfJsViewerModule } from "ng2-pdfjs-viewer";


import {
  ChatContentState,
  ClientChatContent
} from '../../types/client-chat-content';
import { ChatService } from '../../services/chat.service';

import {
  BehaviorSubject,
  catchError,
  EMPTY,
  filter,
  finalize,
  map, scan, switchMap,
  tap,
  throwError
} from 'rxjs';
import { CacheService } from '../../services/cache.service';
import { FileHandlerService } from '../../services/file-handler.service';
import { ChatHeaderComponent } from '../chat-header/chat-header.component';
type LabelOption = {label: string, value: string};
type MobileNavOption = 'preview' | 'chat';
const INITIAL_QUERIES: LabelOption[] = [
  {
    label: 'Summarize',
    value: 'Summarize the key topics and arguments presented in this PDF. Also, identify the main sections or chapters and their purpose',
  },
  {
    label: 'Extract key keywords',
    value: 'Extract the key keywords and phrases that best represent the topics covered in this PDF document.',
  },
];

@Component({
    selector: 'app-chat',
    imports: [
        CommonModule,
        ...[
            ButtonModule,
            DividerModule,
            CardModule,
            InputTextModule,
            SkeletonModule,
            ProgressSpinnerModule,
            ConfirmPopupModule,
            ToastModule,
            MessagesModule,
            SplitterModule,
            ToggleButtonModule,
            TooltipModule,
            PdfJsViewerModule,
            DialogModule
        ],
        MatIconModule,
        FormsModule,
        RouterModule,
        MarkdownModule,
        ChipComponent,
        ChatHeaderComponent,
    ],
    providers: [...[ConfirmationService, MessageService]],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  private chatService = inject(ChatService);
  private cacheService = inject(CacheService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fileHandlerService = inject(FileHandlerService);

  chatContentState = ChatContentState;
  message = '';
  contents: ClientChatContent[] = [];
  filename = this.route.snapshot.queryParamMap.get('file');
  initialAction: string | null = null;
  loadingShortQuestions = false;
  loadingPreview = signal(true);
  textOnlyMode = true;
  // Enabled by default for all file types
  advancedModeEnabled = true;
  tooltipAdvancedMode = 'Advanced mode may work better on documents with images, charts or complex layouts.';
  fileType$ = this.fileHandlerService.getFileType(this.filename as string).pipe(
    tap(fileType => {
      if (fileType === 'document') {
        // Disable advanced mode for documents
        this.advancedModeEnabled = false;
      }
    }),
    catchError(error => {
      this.router.navigate(['/']);
      return throwError(() => error)
    })
  );
  fileURL$ = this.fileHandlerService.getFileURL(this.filename as string).pipe(
    tap((url) => {
      this.loadingPreview.set(false);
    }),
    switchMap((url) => this.fileHandlerService.readBlobFile(this.filename as string)),
  );

  shortQuestionsSubject$ = new BehaviorSubject<LabelOption[]>([]);
  shortQuestionsAdded$ = this.shortQuestionsSubject$.asObservable();
  shortQuestions$ = this.fileType$.pipe(
    map(fileType => {
      if (fileType === 'document') {
        return INITIAL_QUERIES;
      }
      return [];
    }),
    switchMap(initialQuestions => 
      this.shortQuestionsAdded$.pipe(
        scan((acc, newQuestions) => [
          ...acc,
          ...newQuestions,
        ], initialQuestions)
      )
    )
  );

  mobileNavOption: MobileNavOption = 'chat';

  ngOnInit(): void {
    this.initialAction = history.state.initialAction as string | null;
    if (!this.initialAction) {
      // Generate short questions for the user as suggestions.
      if (!this.filename) {
        return;
      }

      const uuid = this.cacheService.getUUI();
      this.loadingShortQuestions = true;
      
      this.fileType$
        .pipe(
          filter((filetype) => !!filetype),
          switchMap((fileType) =>
            this.chatService
              .generateShortQuestions(`${uuid}/${this.filename}`, fileType)
              .pipe(
                map((value) =>
                  value.questions.map((item) => ({
                    label: item.question,
                    value: item.questionDetail,
                  }))
                ),
                tap((questions) => {
                  this.shortQuestionsSubject$.next(questions);
                }),
                finalize(() => {
                  this.loadingShortQuestions = false;
                })
              )
          )
        )
        .subscribe();
      return;
    }

    this.sendMessage(this.initialAction);
  }

  async sendMessage(message: string) {
    if (!this.filename) {
      return;
    }

    const uuid = this.cacheService.getUUI();
    const chatContent: ClientChatContent = {
      agent: 'user',
      message,
      filename: `${uuid}/${this.filename}`,
      options: {
        mode: this.advancedModeEnabled ? 'advanced' : 'text-only'
      }
    };

    this.contents.push(chatContent);
    const modelResponse: ClientChatContent = {
      agent: 'model',
      message: '',
      state: ChatContentState.WAITING,
    };

    this.contents.push(modelResponse);
    this.message = '';
    const streamResult = await this.chatService.chatStream(chatContent);

    streamResult
      .pipe(
        tap((chunk) => {
          modelResponse.message += chunk;
          modelResponse.state = ChatContentState.GENERATING;
        }),
        finalize(() => {
          modelResponse.state = ChatContentState.DONE;
        }),
        catchError((error) => {
          // Remove the waiting message when there's an error
          this.contents = this.contents.slice(0, -2);
          this.message = message;

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An error occurred while processing your request.',
            life: 5000,
          });
          return EMPTY;
        })
      )
      .subscribe();
  }

  confirmDeleteFile(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmed',
          detail: 'The File has been deleted.',
          life: 3000,
        });
        if (!this.filename) {
          return;
        }
        this.deleteFile(this.filename);
      },
    });
  }

  private deleteFile(filename: string) {
    this.fileHandlerService
      .deleteFile(filename)
      .pipe(
        tap(() => {
          console.log('file deleted: ', filename);
          this.router.navigate(['/']);
        })
      )
      .subscribe();
  }
}
