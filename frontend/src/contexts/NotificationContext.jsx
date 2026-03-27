import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "mmis_transfer_notifications";
const MAX_ITEMS = 30;

const NotificationContext = createContext(null);

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(loadStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      /* ignore quota */
    }
  }, [notifications]);

  const addNotification = useCallback((message) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setNotifications((prev) =>
      [{ id, message: String(message), ts: Date.now(), read: false }, ...prev].slice(0, MAX_ITEMS)
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      addNotification,
      markAllRead,
      clearAll,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
    [notifications, addNotification, markAllRead, clearAll]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      notifications: [],
      addNotification: () => {},
      markAllRead: () => {},
      clearAll: () => {},
      unreadCount: 0,
    };
  }
  return ctx;
}
