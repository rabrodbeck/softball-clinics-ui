import React from 'react';
import type { Event } from '../types/event';
import { Calendar, Users, Edit2, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ClinicCardProps {
  event: Event;
  onRegister: (event: Event) => void;
  onViewRoster: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDelete: (id: string, title: string) => void;
}

/**
 * Visual card representing a softball clinic session.
 * Displays date, capacity progress meter, division badges, and action buttons.
 */
export const ClinicCard: React.FC<ClinicCardProps> = ({
  event,
  onRegister,
  onViewRoster,
  onEdit,
  onDelete,
}) => {
  // Format clinic date and time for clean display
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  // Extract division badge (8u, 10u, 12u, 14u) from title
  const getDivisionBadge = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('8u')) return <span className="badge badge-8u">8U Division</span>;
    if (lower.includes('10u')) return <span className="badge badge-10u">10U Division</span>;
    if (lower.includes('12u')) return <span className="badge badge-12u">12U Division</span>;
    if (lower.includes('14u')) return <span className="badge badge-14u">14U Division</span>;
    return <span className="badge badge-default">Softball Clinic</span>;
  };

  // Determine progress meter fill percentage and status styling
  const fillPercentage = Math.min(100, Math.round((event.registeredCount / event.maxCapacity) * 100));
  const isNearCapacity = event.remainingSpots <= 3 && !event.isFull;

  const getCapacityStatus = () => {
    if (event.isPast) return { label: 'Event Past', class: 'full' };
    if (event.isFull) return { label: 'Clinic Full', class: 'full' };
    if (isNearCapacity) return { label: `${event.remainingSpots} spots left!`, class: 'warning' };
    return { label: `${event.remainingSpots} spots open`, class: 'open' };
  };

  const status = getCapacityStatus();

  return (
    <div className={`clinic-card ${event.isPast ? 'is-past' : ''}`}>
      <div>
        {/* Card Header: Badges & Admin Actions */}
        <div className="card-header">
          <div className="card-badges">
            {getDivisionBadge(event.title)}
            {event.isPast && <span className="badge badge-past">Past Event</span>}
            {!event.isPast && event.isFull && <span className="badge badge-full">Full</span>}
            {!event.isPast && !event.isFull && <span className="badge badge-open">Open</span>}
          </div>

          <div className="card-admin-actions">
            <button
              className="btn-icon"
              title="Edit Clinic"
              onClick={() => onEdit(event)}
              aria-label="Edit Clinic"
            >
              <Edit2 size={16} />
            </button>
            <button
              className="btn-icon btn-icon-danger"
              title="Delete Clinic"
              onClick={() => onDelete(event.id, event.title)}
              aria-label="Delete Clinic"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="card-title">{event.title}</h3>
        <p className="card-description">{event.description}</p>

        {/* Date & Time Metadata */}
        <div className="card-meta">
          <div className="meta-item">
            <Calendar size={15} />
            <span>{formattedDate} at {formattedTime}</span>
          </div>
          <div className="meta-item">
            <Users size={15} />
            <span>Standard Max: {event.maxCapacity} Players</span>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="capacity-container">
          <div className="capacity-labels">
            <span className="capacity-text">
              {event.registeredCount} / {event.maxCapacity} Players Registered
            </span>
            <span className={`capacity-spots ${status.class}`}>
              {status.label}
            </span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${status.class}`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card-actions">
        <button
          className="btn btn-secondary"
          onClick={() => onViewRoster(event)}
        >
          <Users size={15} />
          View Roster ({event.registeredCount})
        </button>

        <button
          className="btn btn-primary"
          disabled={event.isPast || event.isFull}
          onClick={() => onRegister(event)}
          title={
            event.isPast
              ? 'Cannot register for a past event'
              : event.isFull
              ? 'Clinic is full'
              : 'Register Player'
          }
        >
          {event.isPast ? (
            <>
              <Clock size={15} /> Closed
            </>
          ) : event.isFull ? (
            <>
              <AlertCircle size={15} /> Full
            </>
          ) : (
            <>
              <CheckCircle size={15} /> Register
            </>
          )}
        </button>
      </div>
    </div>
  );
};