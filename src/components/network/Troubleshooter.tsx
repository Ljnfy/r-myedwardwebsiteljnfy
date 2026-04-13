import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { Device } from "../../lib/types";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Sparkles, Loader2, Wrench, ChevronRight, Activity } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface TroubleshooterProps {
  device: Device;
}

export const Troubleshooter: React.FC<TroubleshooterProps> = ({ device }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/troubleshoot/${device.id}`);
      const data = await res.json();
      setLogs(data.logs);

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a network engineer. Analyze the following logs for device "${device.name}" (${device.type}, OS: ${device.os}) and provide a concise troubleshooting guide. Use technical jargon where appropriate but keep it actionable.
        
        Logs:
        ${data.logs.join("\n")}
        
        Format the response with:
        1. Root Cause Analysis
        2. Recommended Fixes
        3. Prevention Steps`,
      });

      setAnalysis(response.text || "Failed to generate analysis.");
    } catch (err) {
      console.error(err);
      setAnalysis("Error: AI analysis failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-500" /> AI Troubleshooting
          </h3>
          <p className="text-sm text-muted-foreground">Analyze logs and get intelligent fix recommendations.</p>
        </div>
        <Button onClick={analyze} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Run Diagnostic
        </Button>
      </div>

      {logs.length > 0 && (
        <Card className="bg-zinc-950 border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">System Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              {logs.map((log, i) => (
                <div key={i} className="text-[10px] font-mono mb-1 text-zinc-400 border-l-2 border-zinc-800 pl-2">
                  {log}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-full bg-blue-500/20">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm font-bold text-blue-400 uppercase tracking-wider">Gemini Intelligence Report</span>
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
      
      {!analysis && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-50">
          <div className="p-4 rounded-full bg-muted/20">
            <Activity className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm">Click "Run Diagnostic" to start AI log analysis.</p>
        </div>
      )}
    </div>
  );
};
