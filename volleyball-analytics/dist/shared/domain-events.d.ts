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
export declare class EventPublisher {
    private handlers;
    subscribe(eventType: string, handler: EventHandler): void;
    publish(event: DomainEvent): Promise<void>;
}
export declare const eventPublisher: EventPublisher;
export declare function createDomainEvent<T extends Record<string, unknown>>(eventType: string, aggregateId: string, aggregateType: string, payload: T, metadata?: EventMetadata): DomainEvent;
//# sourceMappingURL=domain-events.d.ts.map