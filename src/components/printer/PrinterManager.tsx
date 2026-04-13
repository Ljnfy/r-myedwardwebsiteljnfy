import React, { useState, useEffect } from "react";
import { Device, PrintJob } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Printer, List, Settings2, Play, Trash2, Droplets } from "lucide-react";
import { toast } from "sonner";

interface PrinterManagerProps {
  device: Device;
}

export const PrinterManager: React.FC<PrinterManagerProps> = ({ device }) => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/printer/${device.id}/jobs`);
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      toast.error("Failed to fetch print queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [device.id]);

  const addJob = async () => {
    try {
      const res = await fetch(`/api/printer/${device.id}/print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: "Test_Page.pdf", pages: 1 })
      });
      if (res.ok) {
        toast.success("Print job sent to queue.");
        fetchJobs();
      }
    } catch (err) {
      toast.error("Failed to send print job.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border bg-card/30">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" /> Consumables
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                <span>Black Ink (K)</span>
                <span className="text-blue-400">{device.inkLevel}</span>
              </div>
              <Progress value={parseInt(device.inkLevel || "0")} className="h-1.5" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                <span>Color (CMY)</span>
                <span className="text-pink-400">82%</span>
              </div>
              <Progress value={82} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/30">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-zinc-400" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-[10px] h-8" onClick={addJob}>
              <Play className="w-3 h-3 mr-1" /> Test Print
            </Button>
            <Button variant="outline" size="sm" className="text-[10px] h-8">
              <Trash2 className="w-3 h-3 mr-1" /> Clear Queue
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card/30">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <List className="w-4 h-4 text-blue-500" /> Print Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-48">
            <div className="divide-y divide-border/50">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded bg-muted/50 ${job.status === 'printing' ? 'animate-pulse' : ''}`}>
                      <Printer className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">{job.document}</p>
                      <p className="text-[10px] text-muted-foreground">{job.user} • {job.pages} pages</p>
                    </div>
                  </div>
                  <Badge variant={job.status === 'printing' ? 'default' : 'secondary'} className="text-[10px] h-5">
                    {job.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
