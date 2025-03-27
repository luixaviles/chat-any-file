import { Injectable } from '@nestjs/common';

@Injectable()
export class AnonymousTrackerService {
  private anonymousInteractions = new Map<string, number>();

  private readonly MAX_ANONYMOUS_INTERACTIONS = 3;

  trackAnonymousInteraction(clientId: string): void {
    const currentCount = this.anonymousInteractions.get(clientId) || 0;
    this.anonymousInteractions.set(clientId, currentCount + 1);
  }

  getAnonymousInteractionCount(clientId: string): number {
    return this.anonymousInteractions.get(clientId) || 0;
  }

  hasExceededAnonymousLimit(clientId: string): boolean {
    return this.getAnonymousInteractionCount(clientId) > this.MAX_ANONYMOUS_INTERACTIONS;
  }

  removeInteraction(clientId: string): void {
    this.anonymousInteractions.delete(clientId);
  }
}