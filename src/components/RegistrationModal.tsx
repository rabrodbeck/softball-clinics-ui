import React, { useState } from 'react';
import type { Event } from '../types/event';
import { apiService } from '../services/apiService';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface RegistrationModalProps {
  event: Event | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

/**
 * Modal form for registering a player for a clinic session.
 * Handles validation and displays backend business rule rejection messages.
 */
export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  event,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic client-side validation
    if (!name.trim()) {
      setErrorMessage('Please enter the player full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid contact email address.');
      return;
    }

    setLoading(true);
    try {
      await apiService.registerAttendee(event.id, {
        name: name.trim(),
        email: email.trim(),
      });
      onSuccess(`Successfully registered ${name.trim()} for ${event.title}!`);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to register attendee. Please try again.');
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
          <h2 className="modal-title">Register Player</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Event Summary Pill */}
            <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clinic Session:</div>
              <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{event.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                {event.remainingSpots} spot(s) remaining of {event.maxCapacity}
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="alert alert-danger">
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Name Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="player-name">
                Player Full Name <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="player-name"
                  type="text"
                  placeholder="e.g., Maya Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="parent-email">
                Parent / Guardian Email <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="parent-email"
                  type="email"
                  placeholder="e.g., parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-hint">
                Note: Parents can register multiple siblings under the same email address.
              </div>
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
                  <div className="spinner" /> Registering...
                </>
              ) : (
                <>
                  <CheckCircle size={16} /> Confirm Registration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};