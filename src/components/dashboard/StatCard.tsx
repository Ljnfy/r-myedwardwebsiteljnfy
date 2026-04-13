import React from "react";
import { Card, CardContent } from "../ui/card";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue: string;
  progress?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, progress }) => {
  return (
    <Card className="border-border bg-card/50 hover:bg-card transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-muted/50">
            {icon}
          </div>
          {progress !== undefined && (
            <div className="w-12 h-12 relative">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="stroke-zinc-800"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-blue-500"
                  strokeWidth="3"
                  strokeDasharray={`${progress}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                {progress}%
              </div>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{subValue}</p>
        </div>
      </CardContent>
    </Card>
  );
};
