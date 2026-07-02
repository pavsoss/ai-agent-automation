"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Database, Zap, Cloud, HardDrive, Users } from "lucide-react";

export interface SystemComponent {
  name: string;
  status: "healthy" | "warning" | "critical";
  icon: React.ReactNode;
}

export interface SystemHealthPanelProps {
  components?: SystemComponent[];
  loading?: boolean;
  className?: string;
}

export function SystemHealthPanel({
  components = [
    { name: "API", status: "healthy", icon: <Zap className="size-4" /> },
    { name: "Database", status: "healthy", icon: <Database className="size-4" /> },
    { name: "Storage", status: "healthy", icon: <HardDrive className="size-4" /> },
    { name: "Queue", status: "healthy", icon: <Cloud className="size-4" /> },
    { name: "Workers", status: "healthy", icon: <Users className="size-4" /> },
  ],
  loading,
  className,
}: SystemHealthPanelProps) {
  if (loading) {
    return (
      <Card className={cn("p-5 border-border/30 bg-card/20 shadow-sm rounded-xl", className)}>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 bg-muted/30 animate-pulse rounded" />
          ))}
        </div>
      </Card>
    );
  }

  const allHealthy = components.every((c) => c.status === "healthy");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-success/90";
      case "warning":
        return "text-warning/90";
      case "critical":
        return "text-destructive/90";
      default:
        return "text-muted-foreground/60";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-success/90";
      case "warning":
        return "bg-warning/90";
      case "critical":
        return "bg-destructive/90";
      default:
        return "bg-muted-foreground/40";
    }
  };

  return (
    <Card className={cn("p-5 border-border/30 bg-card/20 shadow-sm rounded-xl flex flex-col", className)}>
      <div className="mb-4">
        <h3 className="font-semibold text-foreground/90 tracking-tight">System Health</h3>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {allHealthy ? "All systems operational" : "Some systems require attention"}
        </p>
      </div>

      <div className="space-y-3">
        {components.map((component) => (
          <div key={component.name} className="flex items-center gap-3">
            <div className={cn("flex items-center justify-center text-muted-foreground/50", getStatusColor(component.status))}>
              {component.icon}
            </div>
            <div className="flex-1 flex items-center justify-between">
              <span className="text-sm text-foreground/80">{component.name}</span>
              <div className="flex items-center gap-2">
                <div className={cn("size-2 rounded-full", getStatusDotColor(component.status))} aria-hidden="true" />
                <span className={cn("text-xs font-medium", getStatusColor(component.status))}>
                  {component.status === "healthy" ? "Healthy" : component.status === "warning" ? "Warning" : "Critical"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
