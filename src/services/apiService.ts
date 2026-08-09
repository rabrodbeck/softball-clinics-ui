import type {
  Event,
  EventDetail,
  CreateEventPayload,
  UpdateEventPayload,
  RegisterPayload,
  UnregisterPayload,
  ProblemDetails,
} from '../types/event';

// Base API URL configured from environment variable or fallback default
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5124/api';

/**
 * Helper function to handle API responses and extract meaningful error messages
 * from standard ASP.NET Core ProblemDetails payloads.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  // If request succeeded with No Content (204)
  if (response.status === 204) {
    return {} as T;
  }

  // Parse JSON response body
  const data = await response.json().catch(() => null);

  // If response is not in 200-299 range, extract error message
  if (!response.ok) {
    const problem = data as ProblemDetails | null;
    let errorMessage = 'An unexpected error occurred.';

    if (problem?.detail) {
      errorMessage = problem.detail;
    } else if (problem?.title) {
      errorMessage = problem.title;
    } else if (problem?.errors) {
      // Model validation errors array
      const firstKey = Object.keys(problem.errors)[0];
      errorMessage = problem.errors[firstKey][0] || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return data as T;
}

/**
 * Service providing typed methods for all Softball Clinics API endpoints.
 */
export const apiService = {
  /**
   * Retrieves all clinic events, optionally filtered by upcoming status.
   * @param includePast If true (default), returns all events; if false, returns only upcoming events.
   */
  async getEvents(includePast = true): Promise<Event[]> {
    const response = await fetch(
      `${API_BASE_URL}/Events?includePast=${includePast}`,
      {
        headers: { Accept: 'application/json' },
      }
    );
    return handleResponse<Event[]>(response);
  },

  /**
   * Retrieves detailed information for a specific event, including its registered attendee roster.
   * @param id The unique GUID of the event.
   */
  async getEventById(id: string): Promise<EventDetail> {
    const response = await fetch(`${API_BASE_URL}/Events/${id}`, {
      headers: { Accept: 'application/json' },
    });
    return handleResponse<EventDetail>(response);
  },

  /**
   * Creates a new softball clinic event.
   * @param payload Creation payload with title, description, date, and maxCapacity.
   */
  async createEvent(payload: CreateEventPayload): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/Events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<Event>(response);
  },

  /**
   * Updates an existing clinic event's title, description, date, or max capacity.
   * @param id The unique GUID of the event.
   * @param payload Updated event details.
   */
  async updateEvent(id: string, payload: UpdateEventPayload): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/Events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<Event>(response);
  },

  /**
   * Deletes a clinic event by its ID.
   * @param id The unique GUID of the event to delete.
   */
  async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/Events/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  /**
   * Registers a player for a clinic session (Name + Email).
   * @param eventId The unique GUID of the clinic event.
   * @param payload The player registration details.
   */
  async registerAttendee(
    eventId: string,
    payload: RegisterPayload
  ): Promise<EventDetail> {
    const response = await fetch(`${API_BASE_URL}/Events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<EventDetail>(response);
  },

  /**
   * Unregisters a player from a clinic session and releases their spot.
   * @param eventId The unique GUID of the clinic event.
   * @param payload The player unregistration details (Name + Email).
   */
  async unregisterAttendee(
    eventId: string,
    payload: UnregisterPayload
  ): Promise<EventDetail> {
    const response = await fetch(
      `${API_BASE_URL}/Events/${eventId}/unregister`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
    return handleResponse<EventDetail>(response);
  },
};