import React, { useState, useEffect } from 'react';
import type { Event, CreateEventPayload, UpdateEventPayload } from '../types/event';
import { apiService } from '../services/apiService';
import { X, PlusCircle, Save, AlertCircle } from 'lucide-react';

interface EventFormModalProps {
  isOpen: boolean;
  eventToEdit: Event | null; // null for Create mode, Event object for Edit mode
  onClose: () => void;
  onSuccess: (message: string) => void;
}

/**
 * Modal form for creating a new clinic event or updating an existing session.
 */
export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  eventToEdit,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to format ISO date string to datetime-local input value (YYYY-MM-DDTHH:MM)
  const formatForDateTimeInput = (isoString?: string) => {
    if (!isoString) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 16);
    }
    const d = new Date(isoString);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description);
      setDate(formatForDateTimeInput(eventToEdit.date));
      setMaxCapacity(eventToEdit.maxCapacity);
    } else {
      setTitle('');
      setDescription('');
      setDate(formatForDateTimeInput());
      setMaxCapacity(20);
    }
    setErrorMessage(null);
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (title.trim().length < 3) {
      setErrorMessage('Title must be at least 3 characters long.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please enter a description for the clinic.');
      return;
    }
    if (!date) {
      setErrorMessage('Please select an event date and time.');
      return;
    }
    if (maxCapacity < 1 || maxCapacity > 500) {
      setErrorMessage('Capacity must be between 1 and 500 players.');
      return;
    }

    setLoading(true);
    const isoDate = new Date(date).toISOString();

    try {
      if (eventToEdit) {
        // Edit Mode
        const payload: UpdateEventPayload = {
          title: title.trim(),
          description: description.trim(),
          date: isoDate,
          maxCapacity: Number(maxCapacity),
        };
        await apiService.updateEvent(eventToEdit.id, payload);
        onSuccess(`Updated "${title.trim()}" successfully!`);
      } else {
        // Create Mode
        const payload: CreateEventPayload = {
          title: title.trim(),
          description: description.trim(),
          date: isoDate,
          maxCapacity: Number(maxCapacity),
        };
        await apiService.createEvent(payload);
        onSuccess(`Created "${title.trim()}" successfully!`);
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to save clinic event.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {eventToEdit ? 'Edit Clinic Session' : 'Create New Clinic'}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMessage && (
              <div className="alert alert-danger">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="clinic-title">
                Clinic Title <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="clinic-title"
                type="text"
                placeholder="e.g., 10u Spring Warmup Clinic"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <div className="form-hint">Tip: Include division (8u, 10u, 12u, 14u) for automatic badging.</div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="clinic-desc">
                Description <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <textarea
                id="clinic-desc"
                rows={3}
                placeholder="Details about drills covered, equipment needed, and skill levels."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Date & Time */}
            <div className="form-group">
              <label className="form-label" htmlFor="clinic-date">
                Date & Time <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="clinic-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Max Capacity */}
            <div className="form-group">
              <label className="form-label" htmlFor="clinic-capacity">
                Maximum Player Capacity <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="clinic-capacity"
                type="number"
                min={1}
                max={500}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                disabled={loading}
              />
              {eventToEdit && (
                <div className="form-hint">
                  Current registered players: {eventToEdit.registeredCount}. Max capacity cannot be lower than registered count.
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" /> Saving...
                </>
              ) : eventToEdit ? (
                <>
                  <Save size={16} /> Save Changes
                </>
              ) : (
                <>
                  <PlusCircle size={16} /> Create Clinic
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};