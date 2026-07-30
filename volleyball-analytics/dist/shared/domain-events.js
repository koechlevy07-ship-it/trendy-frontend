"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventPublisher = exports.EventPublisher = void 0;
exports.createDomainEvent = createDomainEvent;
class EventPublisher {
    constructor() {
        this.handlers = new Map();
    }
    subscribe(eventType, handler) {
        const handlers = this.handlers.get(eventType) || [];
        handlers.push(handler);
        this.handlers.set(eventType, handlers);
    }
    async publish(event) {
        const handlers = this.handlers.get(event.eventType) || [];
        await Promise.all(handlers.map(h => h.handle(event)));
    }
}
exports.EventPublisher = EventPublisher;
exports.eventPublisher = new EventPublisher();
function createDomainEvent(eventType, aggregateId, aggregateType, payload, metadata = {}) {
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
//# sourceMappingURL=domain-events.js.map