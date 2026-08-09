/**
 * Represents summary information for a softball clinic event session.
 * Mirros the backend EventDto.
 */
export interface Event {
    id: string;
    title: string;
    description: string;
    date: string; // ISO 8601 string (ex: "2026-10-04T10:00:00+00:00")
    maxCapacity: number;
    registeredCount: number;
    remainingSport: number;
    isFull: boolean;
    isPast: boolean;
}

/**
 * Represents a registered attendee on a clinic roster
 * Mirrors the backend AttendeeDto.
 */
export interface Attendee {
    id: string;
    name: string;
    email: string;
    registeredAt: string;
}

/**
 * Represents full details for an event including the registered attendee roster.
 * Mirrors the backend EventDetailDto.
 */
export interface EventDetail extends Event {
    attendees: Attendee[];
}

/**
 * Request payload for creating a new clinic event.
 * Mirrors the backend CreateEventDto.
 */
export interface CreateEventPayload {
    title: string;
    description: string;
    date: string;
    maxCapacity: number;
}

/**
 * Request payload for updating an existing clinic event.
 * Mirrors the backend UpdateEventDto.
 */
export interface UpdateEventPayload {
    title: string;
    description: string;
    date: string;
    maxCapacity: number;
}

/**
 * Request payload for registering a player for a clinic session.
 * Mirrors the backend RegisterAttendeeDto.
 */
export interface RegisterPayload {
    name: string;
    email: string;
}

/**
 * Request payload for unregistering a player from a clinic session.
 * Mirrors the backend UnregisterAttendeeDto.
 */
export interface UnregisterPayload {
    name: string;
    email: string;
}

/**
 * RFC 7807 Problem Detail structure returned by ASP.NET Core on error response.
 */
export interface ProblemDetails {
    type?: string;
    title?: string;
    status?: string;
    detail?: string;
    instance?: string;
    errors?: Record<string, string[]>;
}