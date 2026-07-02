"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ExecutionChartProps {
  data: Array<{
    date: string;
    executions: number;
    success: number;
    failed: number;
  }>;
  loading?: boolean;
  className?: string;
}

export function ExecutionChart({ data, loading, className }: ExecutionChartProps) {
  if (loading) {
    return (
      <Card className={cn("p-5 border-border/30 bg-card/20 shadow-sm rounded-xl", className)}>
        <div className="h-64 bg-muted/30 animate-pulse rounded" />
      </Card>
    );
  }

  const successRate = data.length > 0
    ? Math.round((data.reduce((sum, d) => sum + d.success, 0) / data.reduce((sum, d) => sum + d.executions, 0)) * 100)
    : 0;

  const avgDuration = "1m 42s"; // Could be calculated from actual data

  return (
    <Card className={cn("p-5 border-border/30 bg-card/20 shadow-sm rounded-xl flex flex-col", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground/90 tracking-tight">Workflow Executions (Last 7 Days)</h3>
          <p className="text-xs text-muted-foreground/60 mt-1">Total executions and success rate</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground/60">Success Rate</p>
            <p className="text-lg font-semibold text-success/90">{successRate}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground/60">Avg Duration</p>
            <p className="text-lg font-semibold text-foreground/90">{avgDuration}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 -mx-5 -mb-5 mt-4">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border) / 0.2)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              stroke="hsl(var(--color-muted-foreground) / 0.5)"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              stroke="hsl(var(--color-muted-foreground) / 0.5)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--color-background))",
                border: "1px solid hsl(var(--color-border) / 0.5)",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "hsl(var(--color-foreground))" }}
              cursor={{ stroke: "hsl(var(--color-border))" }}
            />
            <Line
              type="monotone"
              dataKey="executions"
              stroke="hsl(var(--color-primary))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
