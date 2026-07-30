export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  payload: Record<string, unknown>;
  metadata: EventMetadata;
  version: number;
  timestamp: Date;
}

export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  userId?: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface EventHandler {
  handle(event: DomainEvent): Promise<void>;
}

export class EventPublisher {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    await Promise.all(handlers.map(h => h.handle(event)));
  }
}

export const eventPublisher = new EventPublisher();

export function createDomainEvent<T extends Record<string, unknown>>(
  eventType: string,
  aggregateId: string,
  aggregateType: string,
  payload: T,
  metadata: EventMetadata = {}
): DomainEvent {
  return {
    eventId: crypto.randomUUID(),
    eventType,
    aggregateId,
    aggregateType,
    payload,
    metadata,
    version: 1,
    timestamp: new Date(),
  };
}