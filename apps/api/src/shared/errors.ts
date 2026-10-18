/**
 * ==============================================================================
 * Typed Domain Errors
 *
 * Traceability:
 *   - TD-06: start moving away from mapping HTTP codes by message text
 *   - TD-05 / ADR-PERSISTENCE-01 rev 1: conflicting concurrent status update -> 409
 * ==============================================================================
 */

/** Another writer changed the resource after it was read; the client must reload. */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
