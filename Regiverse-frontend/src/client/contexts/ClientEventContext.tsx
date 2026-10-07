import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export interface ClientConference {
  _id: string;
  name: string;
  title: string;
  slug: string;
  delegates: number;
  isActive: boolean;
  createdAt?: string;
}

interface ClientEventContextType {
  events: ClientConference[];
  selectedEvent: ClientConference | null;
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  loadingEvents: boolean;
  refreshEvents: () => Promise<void>;
  switching: boolean;
  getAuthHeaders: () => Record<string, string>;
}

const ClientEventContext = createContext<ClientEventContextType | null>(null);

export const ClientEventProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const [events, setEvents] = useState<ClientConference[]>([]);
  const [selectedEventId, setSelectedEventIdState] = useState<string>("");
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [switching, setSwitching] = useState<boolean>(false);

  const getAuthHeaders = useCallback(() => {
    const email = user?.email || "client@gmail.com";
    const role = user?.role || "client";
    return {
      "x-client-email": email,
      "x-client-role": role,
    };
  }, [user]);

  // Fetch conferences accessible to this client
  const refreshEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conferences/client`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Failed to load events: HTTP ${res.status}`);
      }

      const list: ClientConference[] = await res.json();
      setEvents(list);

      // Determine initial selection
      // Priority 1: URL path param :eventId
      // Priority 2: Query param ?eventId=...
      // Priority 3: LocalStorage saved event
      // Priority 4: First authorized event
      const urlMatch = location.pathname.match(/\/client\/events\/([^/]+)/);
      const pathEventId = urlMatch ? urlMatch[1] : params.eventId;
      const searchParams = new URLSearchParams(location.search);
      const queryEventId = searchParams.get("eventId");
      const savedEventId = localStorage.getItem("regiverse_client_selected_event_id");

      let targetId = "";
      if (pathEventId && list.some((e) => e._id === pathEventId || e.slug === pathEventId)) {
        targetId = list.find((e) => e._id === pathEventId || e.slug === pathEventId)!._id;
      } else if (queryEventId && list.some((e) => e._id === queryEventId || e.slug === queryEventId)) {
        targetId = list.find((e) => e._id === queryEventId || e.slug === queryEventId)!._id;
      } else if (savedEventId && list.some((e) => e._id === savedEventId || e.slug === savedEventId)) {
        targetId = list.find((e) => e._id === savedEventId || e.slug === savedEventId)!._id;
      } else if (list.length > 0) {
        targetId = list[0]._id;
      }

      if (targetId) {
        setSelectedEventIdState(targetId);
        localStorage.setItem("regiverse_client_selected_event_id", targetId);
      } else {
        setSelectedEventIdState("");
      }
    } catch (err) {
      console.error("Error loading client events:", err);
      setEvents([]);
      setSelectedEventIdState("");
    } finally {
      setLoadingEvents(false);
    }
  }, [getAuthHeaders, location.pathname, location.search, params.eventId]);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  // Handle event switching
  const setSelectedEventId = (id: string) => {
    if (!id || id === selectedEventId) return;

    setSwitching(true);
    setSelectedEventIdState(id);
    localStorage.setItem("regiverse_client_selected_event_id", id);

    // If currently on an event-aware route (e.g., /client/events/:id/dashboard), update URL
    const eventRouteMatch = location.pathname.match(/\/client\/events\/[^/]+(\/.*)?$/);
    if (eventRouteMatch) {
      const subPath = eventRouteMatch[1] || "/dashboard";
      navigate(`/client/events/${id}${subPath}`);
    }

    setTimeout(() => {
      setSwitching(false);
    }, 250);
  };

  const selectedEvent = events.find((e) => e._id === selectedEventId || e.slug === selectedEventId) || null;

  return (
    <ClientEventContext.Provider
      value={{
        events,
        selectedEvent,
        selectedEventId,
        setSelectedEventId,
        loadingEvents,
        refreshEvents,
        switching,
        getAuthHeaders,
      }}
    >
      {children}
    </ClientEventContext.Provider>
  );
};

export const useClientEvent = () => {
  const ctx = useContext(ClientEventContext);
  if (!ctx) {
    throw new Error("useClientEvent must be used within a ClientEventProvider");
  }
  return ctx;
};
