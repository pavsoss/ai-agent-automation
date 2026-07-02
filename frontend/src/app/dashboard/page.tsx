"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { MetricCard } from "@/components/ui/metric-card";
import { MetricCardSkeleton, ListSkeleton } from "@/components/ui/skeletons";
import { ExecutionChart } from "@/components/dashboard/execution-chart";
import { SystemHealthPanel } from "@/components/dashboard/system-health";
import { LiveActivityFeed } from "@/components/dashboard/live-activity-feed";
import { Activity, Workflow, ListChecks, Bot, Calendar, Copy, Loader2, Check, X, Plus, FileText, Wand2, Link2 } from "lucide-react";
import { useAssistantContext } from "@/context/assistant-context";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { apiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

/* -----------------------------
   Types
------------------------------ */

type DashboardStats = {
  workflows: number;
  tasks: number;
  runningTasks: number;
  agents: number;
  schedules: number;
};

type Task = {
  _id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: string;
  metadata?: {
    runningBy?: string;
  };
};

/* -----------------------------
   Page
------------------------------ */

function DashboardPageInner() {
  const router = useRouter();
  const { addToast } = useToast();
  const { setContext, clearContext } = useAssistantContext();
  
  // Hydration safety fixes restored
  const [now, setNow] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [cloningId, setCloningId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      setNow(Date.now());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const { data: stats, loading: statsLoading } = useApi<DashboardStats>("/dashboard/stats");
  const { data: tasks, loading: tasksLoading } = useApi<Task[]>("/tasks");
  const { data: workflowsResponse, loading: workflowsLoading } = useApi<any>("/workflows");

  // Safely extract arrays from backend payload
  const workflowsArray = Array.isArray(workflowsResponse) 
    ? workflowsResponse 
    : (workflowsResponse?.data || workflowsResponse?.workflows || []);

  const recentTasks = useMemo(() => tasks?.slice(0, 8) ?? [], [tasks]);

  /* -----------------------------
     Assistant context
  ------------------------------ */
  useEffect(() => {
    if (!stats || statsLoading) return;

    setContext({
      page: "dashboard",
      dashboardStats: stats,
      recentActivity: recentTasks.slice(0, 5).map((task) => ({
        type: "task",
        name: task.name,
        status: task.status,
      })),
    });

    return () => clearContext();
  }, [stats, recentTasks, statsLoading, setContext, clearContext]);

  /* -----------------------------
     Helpers
  ------------------------------ */
  const timeAgo = useCallback((dateString: string) => {
    if (!now) return "";
    const diff = now - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }, [now]);

  const getStatusColor = useCallback((status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-success/20 text-success border-success/30";
      case "running":
        return "bg-warning/20 text-warning border-warning/30";
      case "failed":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  }, []);

  const handleCloneWorkflow = async (workflowId: string) => {
    try {
      setCloningId(workflowId);
      
      const token = localStorage.getItem("token");
      
      const response = await fetch(apiUrl(`/workflows/${workflowId}/clone`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to clone workflow");
      }

      const data = await response.json();

      addToast({
        type: "success",
        title: "Workflow Duplicated",
        description: "Successfully cloned the workflow.",
      });

      if (data.workflow?._id) {
        router.push(`/workflows/${data.workflow._id}/builder`);
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to duplicate the workflow.",
      });
    } finally {
      setCloningId(null);
    }
  };

  const statsUI = useMemo(() => [
    { label: "Total Workflows", value: stats?.workflows ?? 0, icon: Workflow },
    { label: "Total Tasks", value: stats?.tasks ?? 0, icon: ListChecks },
    { label: "Running Tasks", value: stats?.runningTasks ?? 0, icon: Activity },
    { label: "Active Agents", value: stats?.agents ?? 0, icon: Bot },
    { label: "Schedules", value: stats?.schedules ?? 0, icon: Calendar },
  ], [stats]);

  /* -----------------------------
     UI
  ------------------------------ */
  if (!isMounted) return null;

  // Generate mock execution chart data
  const chartData = [
    { date: "Mon", executions: 342, success: 336, failed: 6 },
    { date: "Tue", executions: 298, success: 293, failed: 5 },
    { date: "Wed", executions: 315, success: 310, failed: 5 },
    { date: "Thu", executions: 310, success: 305, failed: 5 },
    { date: "Fri", executions: 398, success: 392, failed: 6 },
    { date: "Sat", executions: 289, success: 285, failed: 4 },
    { date: "Sun", executions: 512, success: 503, failed: 9 },
  ];

  return (
    <>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your AI automation workflows" 
      />
      <div className="flex flex-col gap-4">
        {/* Compact Metrics Bar */}
        <div className="flex flex-wrap gap-2">
          {stats
            ? statsUI.map((stat) => (
                <MetricCard
                  key={stat.label}
                  title={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  variant="badge"
                />
              ))
            : Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 py-3 rounded-lg border border-border/20 bg-muted/10">
                  <div className="h-3 w-12 bg-muted/50 animate-pulse rounded mb-1" />
                  <div className="h-5 w-16 bg-muted/50 animate-pulse rounded" />
                </div>
              ))}
        </div>

        {/* Charts and System Status Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Execution Chart */}
          <div className="lg:col-span-2">
            <ExecutionChart
              data={chartData}
              loading={statsLoading}
            />
          </div>
          {/* System Health */}
          <div className="lg:col-span-1">
            <SystemHealthPanel loading={statsLoading} />
          </div>
        </div>

        {/* Main Content: Workflows Table and Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left Side: Recently Modified (Workflows) */}
          <div className="lg:col-span-2 flex">
            <Card className="flex-1 flex flex-col border-border/30 bg-card/20 shadow-sm rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border/20">
                <h2 className="font-semibold text-foreground/90 tracking-tight">Recently Modified</h2>
                <Link href="/workflows" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  View all
                </Link>
              </div>
              
              <div className="flex-1 p-0 overflow-x-auto">
                <div className="min-w-[500px]">
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border/20 bg-muted/20 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-6">Workflow Name</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-3 text-right">Actions</div>
                  </div>
                  
                  <div className="divide-y divide-border/20">
                    {workflowsLoading ? (
                      <ListSkeleton rows={3} className="border-none divide-none" />
                    ) : workflowsArray.length === 0 ? (
                      <div className="p-5 text-sm text-muted-foreground opacity-70">No workflows yet</div>
                    ) : (
                      workflowsArray.slice(0, 5).map((wf: any) => (
                        <div key={wf._id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center group hover:bg-accent/20 transition-colors">
                          <div className="col-span-6 flex items-center gap-3">
                            <Workflow className="size-4 text-muted-foreground/50" />
                            <span className="font-medium text-sm text-foreground/90">{wf.name}</span>
                          </div>
                          <div className="col-span-3">
                            <StatusBadge
                              status={(wf.status || "draft").toLowerCase() as any}
                              variant="subtle"
                              className="uppercase text-[10px]"
                            >
                              {wf.status || "DRAFT"}
                            </StatusBadge>
                          </div>
                          <div className="col-span-3 flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCloneWorkflow(wf._id)}
                              disabled={cloningId === wf._id}
                              title="Duplicate Workflow"
                              className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {cloningId === wf._id ? (
                                <Loader2 className="size-3 animate-spin text-muted-foreground" />
                              ) : (
                                <Copy className="size-3 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side: Live Feed (Activity) */}
          <div className="lg:col-span-1 flex">
            <LiveActivityFeed
              items={recentTasks.map((task) => ({
                id: task._id,
                timestamp: task.startedAt,
                workflowName: task.name,
                status: task.status,
                connection: task.metadata?.runningBy,
              }))}
              loading={tasksLoading}
            />
          </div>
          
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "New Workflow", desc: "Start from a blank canvas", icon: Plus, href: "/workflows" },
            { title: "Upload Document", desc: "Ingest PDF, TST, or JSON", icon: FileText, href: "/documents" },
            { title: "AI Agent Generator", desc: "Generate agent management", icon: Wand2, href: "/agents" },
            { title: "Manage Connections", desc: "Manage connection tokens", icon: Link2, href: "/settings" }
          ].map((action, i) => (
            <Link href={action.href} key={i}>
              <Card className="p-4 flex items-center gap-4 border-border/30 bg-card/20 shadow-sm rounded-xl hover:bg-card/40 hover:border-border/50 transition-all cursor-pointer group h-full">
                <div className="flex items-center justify-center size-10 rounded-md bg-muted/30 border border-border/30 group-hover:bg-primary/10 transition-colors">
                  <action.icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground/90">{action.title}</p>
                  <p className="text-xs text-muted-foreground/60">{action.desc}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <AuthenticatedLayout>
      <DashboardPageInner />
    </AuthenticatedLayout>
  );
}
