"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Activity, Check, X } from "lucide-react";

export interface ActivityItem {
  id: string;
  timestamp: string;
  workflowName: string;
  status: "completed" | "running" | "failed";
  connection?: string;
}

export interface LiveActivityFeedProps {
  items?: ActivityItem[];
  loading?: boolean;
  className?: string;
}

export function LiveActivityFeed({ items = [], loading, className }: LiveActivityFeedProps) {
  if (loading) {
    return (
      <Card className={cn("p-5 border-border/30 bg-card/20 shadow-sm rounded-xl", className)}>
        <div className="mb-4">
          <h3 className="font-semibold text-foreground/90 tracking-tight">Live Feed</h3>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted/30 animate-pulse rounded" />
          ))}
        </div>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="size-3" />;
      case "failed":
        return <X className="size-3" />;
      case "running":
        return <Activity className="size-3" />;
      default:
        return <Activity className="size-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-success/90 bg-success/10";
      case "failed":
        return "text-destructive/90 bg-destructive/10";
      case "running":
        return "text-warning/90 bg-warning/10";
      default:
        return "text-muted-foreground/60 bg-muted/10";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <Card className={cn("p-5 border-border/30 bg-card/20 shadow-sm rounded-xl flex flex-col", className)}>
      <div className="mb-4">
        <h3 className="font-semibold text-foreground/90 tracking-tight">Live Feed</h3>
        <p className="text-xs text-muted-foreground/60 mt-1">Recent workflow activity</p>
      </div>

      {items.length > 0 ? (
        <ul role="list" className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 pb-3 border-b border-border/20 last:border-0 last:pb-0">
              <div className="flex-shrink-0 mt-0.5">
                <div
                  className={cn(
                    "flex items-center justify-center size-6 rounded-full border border-border/40",
                    getStatusColor(item.status)
                  )}
                >
                  {getStatusIcon(item.status)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground/70">
                  <span className="text-foreground/60">{formatTime(item.timestamp)}</span>
                  {" "}-{" "}
                  <span className="text-foreground/80">
                    Workflow <span className="font-medium">"{item.workflowName}"</span>{" "}
                    <span className="text-muted-foreground/70">{item.status}</span>
                  </span>
                </p>
                {item.connection && (
                  <p className="text-[10px] text-muted-foreground/50 font-mono mt-1">
                    Connection: {item.connection}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground/70">No recent activity</p>
      )}
    </Card>
  );
}
