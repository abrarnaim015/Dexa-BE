import { Injectable } from '@nestjs/common';

type EventHandler = (payload: any) => Promise<void> | void;

@Injectable()
export class QueueService {
  private handlers: Record<string, EventHandler[]> = {};

  publish(event: string, payload: any) {
    const handlers = this.handlers[event] || [];
    handlers.forEach((handler) => {
      setTimeout(() => handler(payload), 0); // async mock
    });
  }

  subscribe(event: string, handler: EventHandler) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }
}
