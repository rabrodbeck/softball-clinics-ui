import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Event } from './types/event';
import { apiService } from './services/apiService';
import { ClinicCard } from './components/ClinicCard';
import { RegistrationModal } from './components/RegistrationModal';
import { RosterModal } from './components/RosterModal';
import { EventFormModal } from './components/EventFormModal';
import {
  Plus,
  Search,
  Users,
  Calendar,
  Sparkles,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import './App.css';

// Filter tab options
type FilterTab = 'all' | 'upcoming' | 'past';

// Toast message interface
interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error';
}

/**
 * Main application component for the Softball Clinics Event Management application.
 * Manages event list state, search filtering, tab selection, modal lifecycles, and toast notifications.
 */
export function App() {
  // Event state
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filter & Search state
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [registeringEvent, setRegisteringEvent] = useState<Event | null>(null);
  const [viewingRosterEvent, setViewingRosterEvent] = useState<Event | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Trigger a floating toast notification
  const addToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch events from backend API
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await apiService.getEvents(true); // Fetch all events (including past)
      setEvents(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('Unable to connect to the backend API. Please ensure the server is running on http://localhost:5124.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle clinic deletion
  const handleDeleteClinic = async (id: string, title: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await apiService.deleteEvent(id);
      addToast(`Deleted "${title}" successfully.`);
      fetchEvents();
    } catch (err: unknown) {
      if (err instanceof Error) {
        addToast(err.message, 'error');
      } else {
        addToast('Failed to delete clinic.', 'error');
      }
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (event: Event) => {
    setEditingEvent(event);
    setIsFormModalOpen(true);
  };

  // Calculate live summary stats
  const stats = useMemo(() => {
    const totalClinics = events.length;
    const upcomingClinics = events.filter((e) => !e.isPast);
    const totalOpenSpots = upcomingClinics.reduce((sum, e) => sum + e.remainingSpots, 0);
    const totalRegistered = events.reduce((sum, e) => sum + e.registeredCount, 0);

    return { totalClinics, totalOpenSpots, totalRegistered };
  }, [events]);

  // Filter events based on active tab and search query
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Tab filter
      if (activeTab === 'upcoming' && event.isPast) return false;
      if (activeTab === 'past' && !event.isPast) return false;

      // Search filter (matches title or description)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesDesc = event.description.toLowerCase().includes(query);
        return matchesTitle || matchesDesc;
      }

      return true;
    });
  }, [events, activeTab, searchQuery]);

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="brand-title">Softball Clinics Hub</h1>
            <p className="brand-subtitle">Player Registration & Session Management</p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={18} />
          Create New Clinic
        </button>
      </header>

      {/* Hero Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--color-primary-light)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Clinics</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.totalClinics}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--color-secondary-light)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--color-secondary)' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available Open Spots</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>{stats.totalOpenSpots}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#ec4899' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Registered Players</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.totalRegistered}</div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Tab Filters */}
      <div className="toolbar">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Clinics ({events.length})
          </button>
          <button
            className={`filter-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Sessions ({events.filter((e) => !e.isPast).length})
          </button>
          <button
            className={`filter-tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Archives ({events.filter((e) => e.isPast).length})
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', minWidth: '280px', flex: '1', maxWidth: '400px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
          />
          <input
            type="text"
            placeholder="Search clinics by division, title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
      </div>

      {/* API Connection Error Banner */}
      {apiError && (
        <div className="alert alert-danger" style={{ marginBottom: '2rem' }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong>Backend Connection Failed:</strong> {apiError}
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            onClick={fetchEvents}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Main Clinic Cards Grid */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
          <span>Loading clinic sessions...</span>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="cards-grid">
          {filteredEvents.map((event) => (
            <ClinicCard
              key={event.id}
              event={event}
              onRegister={(ev) => setRegisteringEvent(ev)}
              onViewRoster={(ev) => setViewingRosterEvent(ev)}
              onEdit={(ev) => handleOpenEditModal(ev)}
              onDelete={(id, title) => handleDeleteClinic(id, title)}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No clinics found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {searchQuery ? `No sessions match "${searchQuery}".` : 'No clinics match the selected tab filter.'}
          </p>
        </div>
      )}

      {/* Registration Modal */}
      {registeringEvent && (
        <RegistrationModal
          event={registeringEvent}
          onClose={() => setRegisteringEvent(null)}
          onSuccess={(msg) => {
            addToast(msg, 'success');
            fetchEvents();
          }}
        />
      )}

      {/* Roster Modal */}
      {viewingRosterEvent && (
        <RosterModal
          event={viewingRosterEvent}
          onClose={() => setViewingRosterEvent(null)}
          onRosterUpdated={() => fetchEvents()}
          onSuccess={(msg) => addToast(msg, 'success')}
        />
      )}

      {/* Create / Edit Clinic Form Modal */}
      <EventFormModal
        isOpen={isFormModalOpen}
        eventToEdit={editingEvent}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingEvent(null);
        }}
        onSuccess={(msg) => {
          addToast(msg, 'success');
          fetchEvents();
        }}
      />

      {/* Floating Toast Notification Stack */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;