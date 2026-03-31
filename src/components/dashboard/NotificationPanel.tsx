/**
 * @file NotificationPanel.tsx
 *
 * Polished notification dropdown that renders inline beneath the bell icon
 * in the GameDashboard header.  Consumes `GameNotification[]` directly from
 * the caller — no internal state for open/close; that lives in GameDashboard.
 *
 * Design system tokens used:
 *   - bg-card / bg-background / bg-accent
 *   - border-border, text-foreground, text-muted-foreground
 *   - font-serif (Fraunces) for the panel title
 *   - text-[10px] uppercase tracking-widest for section labels
 *   - rounded-xl, rounded-lg, shadow-lg (var(--shadow-lg))
 *   - Type-specific accent colours via CSS variables where possible
 */

import React from "react";
import {
  Bell,
  X,
  Trash2,
  Trophy,
  AlertTriangle,
  ShoppingCart,
  Zap,
  Star,
  CalendarDays,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GameNotification, NotificationType } from "@/types/game";

// ─── Type metadata ────────────────────────────────────────────────────────────

interface TypeMeta {
  /** Tailwind classes for the left accent dot / pill */
  pill: string;
  /** Tailwind classes for the icon wrapper background */
  iconBg: string;
  /** Icon to render inside the wrapper */
  icon: React.ReactNode;
  /** Human-readable label */
  label: string;
}

const TYPE_META: Record<NotificationType, TypeMeta> = {
  achievement: {
    pill: "bg-amber-500/12 text-amber-700 border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: <Trophy className="w-3.5 h-3.5" />,
    label: "Achievement",
  },
  alert: {
    pill: "bg-rose-500/12 text-rose-700 border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-400",
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    label: "Alert",
  },
  purchase: {
    pill: "bg-emerald-500/12 text-emerald-700 border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    icon: <ShoppingCart className="w-3.5 h-3.5" />,
    label: "Purchase",
  },
  event: {
    pill: "bg-violet-500/12 text-violet-700 border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-400",
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    icon: <CalendarDays className="w-3.5 h-3.5" />,
    label: "Event",
  },
  milestone: {
    pill: "bg-sky-500/12 text-sky-700 border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-400",
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    icon: <Star className="w-3.5 h-3.5" />,
    label: "Milestone",
  },
  levelup: {
    pill: "bg-primary/12 text-primary border-primary/30",
    iconBg: "bg-primary/10 text-primary",
    icon: <Zap className="w-3.5 h-3.5" />,
    label: "Level Up",
  },
};

// ─── Time helper ──────────────────────────────────────────────────────────────

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationPanelProps {
  notifications: GameNotification[];
  onClose: () => void;
  onClearAll: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onClose,
  onClearAll,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const visible = notifications.slice(0, 20);
  const isEmpty = visible.length === 0;

  return (
    /*
     * Wrapper: fixed width, appears below the bell button.
     * Use the card token for the surface so it adapts to dark mode automatically.
     */
    <div
      className={cn(
        "absolute right-0 top-full mt-2 w-[22rem] z-50",
        "bg-card border border-border rounded-xl shadow-lg overflow-hidden",
        // Entrance animation – reuse existing fadeInUp utility
        "animate-fade-in-up",
      )}
      style={{ animationDuration: "0.2s" }}
      role="dialog"
      aria-label="Notifications"
    >
      {/* ── Panel header ──────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest leading-none">
            Notifications
          </p>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold tabular-nums">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {!isEmpty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-7 px-2 gap-1 text-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/8 rounded-lg"
              aria-label="Clear all notifications"
            >
              <Trash2 className="w-3 h-3" />
              Clear all
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
            aria-label="Close notifications"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Notification list ─────────────────────────────────────────── */}
      <div className="overflow-y-auto max-h-[22rem] scrollbar-hide">
        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-12 px-6 gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <Bell className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-0.5">
                All caught up
              </p>
              <p className="text-xs text-muted-foreground">
                No notifications to show
              </p>
            </div>
          </div>
        ) : (
          <ul role="list">
            {visible.map((notification, index) => {
              const meta = TYPE_META[notification.type] ?? {
                pill: "bg-muted text-muted-foreground border-border",
                iconBg: "bg-accent text-muted-foreground",
                icon: <Info className="w-3.5 h-3.5" />,
                label: notification.type,
              };

              const isLast = index === visible.length - 1;

              return (
                <li
                  key={notification.id}
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3.5 transition-colors duration-150",
                    "hover:bg-accent/50",
                    !isLast && "border-b border-border/50",
                    !notification.read && "bg-accent/20",
                  )}
                >
                  {/* Left: type icon */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5",
                      meta.iconBg,
                    )}
                    aria-hidden="true"
                  >
                    {notification.icon ? (
                      <span className="text-sm leading-none">
                        {notification.icon}
                      </span>
                    ) : (
                      meta.icon
                    )}
                  </div>

                  {/* Center: content */}
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <span className="text-sm font-medium text-foreground leading-snug">
                        {notification.title}
                      </span>
                      {/* Unread indicator */}
                      {!notification.read && (
                        <span
                          className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary"
                          aria-label="Unread"
                        />
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                      {notification.description}
                    </p>

                    {/* Footer: type pill + timestamp */}
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase tracking-wider",
                          meta.pill,
                        )}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 font-mono tabular-nums">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Panel footer (only when list is non-empty) ────────────────── */}
      {!isEmpty && (
        <div className="px-4 py-2.5 border-t border-border/60 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground/60 font-mono tabular-nums">
            {notifications.length} total · {unreadCount} unread
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
