import React, { useEffect, useState, useCallback } from 'react';
import type { Event, EventDetail } from '../types/event';
import { apiService } from '../services/apiService';
import { X, UserMinus, Users, AlertCircle } from 'lucide-react';

interface RosterModalProps {
  event: Event | null;
  onClose: () => void;
  onRosterUpdated: () => void;
  onSuccess: (message: string) => void;
}

/**
 * Modal for viewing the registered attendee list of a clinic session.
 * Allows unregistering attendees to release capacity.
 */
export const RosterModal: React.FC<RosterModalProps> = ({
  event,
  onClose,
  onRosterUpdated,
  onSuccess,
}) => {
  const [detail, setDetail] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRoster = useCallback(async () => {
    if (!event) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await apiService.getEventById(event.id);
      setDetail(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to load attendee roster.');
      }
    } finally {
      setLoading(false);
    }
  }, [event]);

  useEffect(() => {
    if (event) {
      fetchRoster();
    }
  }, [event, fetchRoster]);

  if (!event) return null;

  const handleUnregister = async (attendeeName: string, attendeeEmail: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to unregister ${attendeeName}? This will release their spot.`
    );
    if (!confirmed) return;

    setActionLoading(attendeeName);
    setErrorMessage(null);

    try {
      const updated = await apiService.unregisterAttendee(event.id, {
        name: attendeeName,
        email: attendeeEmail,
      });
      setDetail(updated);
      onRosterUpdated();
      onSuccess(`Unregistered ${attendeeName} and released 1 spot.`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to unregister attendee.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Clinic Attendee Roster</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {event.title}
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Capacity Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <Users size={16} color="var(--color-primary)" />
              <span>
                <strong>{detail ? detail.registeredCount : event.registeredCount}</strong> / {event.maxCapacity} Players Registered
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: (detail ? detail.isFull : event.isFull) ? 'var(--color-danger)' : 'var(--color-primary)' }}>
              {(detail ? detail.isFull : event.isFull) ? 'Clinic Full' : `${detail ? detail.remainingSpots : event.remainingSpots} spots open`}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="alert alert-danger">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Roster Content */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 0', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <div className="spinner" />
              <span>Loading roster...</span>
            </div>
          ) : detail && detail.attendees.length > 0 ? (
            <div className="roster-list">
              {detail.attendees.map((attendee) => {
                const regDate = new Date(attendee.registeredAt);
                return (
                  <div key={attendee.id} className="roster-item">
                    <div className="roster-info">
                      <span className="roster-name">{attendee.name}</span>
                      <span className="roster-email">{attendee.email}</span>
                      <span className="roster-date">
                        Registered: {regDate.toLocaleDateString()} at {regDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderColor: 'var(--color-danger)', color: '#fca5a5' }}
                      disabled={actionLoading === attendee.name}
                      onClick={() => handleUnregister(attendee.name, attendee.email)}
                    >
                      {actionLoading === attendee.name ? (
                        <>
                          <div className="spinner" /> Removing...
                        </>
                      ) : (
                        <>
                          <UserMinus size={14} /> Unregister
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="roster-empty">
              <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p>No players are currently registered for this session.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};