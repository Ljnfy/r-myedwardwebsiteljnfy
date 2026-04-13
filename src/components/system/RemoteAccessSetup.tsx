import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Globe, ShieldCheck, Key, Terminal, ExternalLink, Info, ChevronDown, AlertTriangle, Shield } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "../ui/dropdown-menu";

export const RemoteAccessSetup: React.FC = () => {
  const [protocol, setProtocol] = useState<"SSH" | "Telnet">("SSH");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-500" /> Secure Remote Access
          </h2>
          <p className="text-sm text-muted-foreground">Configure encrypted tunnels for cross-network management.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" className="gap-2" />}>
              {protocol === "SSH" ? <Shield className="w-4 h-4 text-blue-500" /> : <AlertTriangle className="w-4 h-4 text-yellow-500" />}
              Protocol: {protocol}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Select Protocol</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setProtocol("SSH")} className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2 font-bold">
                  <Shield className="w-3 h-3 text-blue-500" /> SSH (Recommended)
                </div>
                <span className="text-[10px] text-muted-foreground">Secure, encrypted, most compatible.</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setProtocol("Telnet")} className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-3 h-3 text-yellow-500" /> Telnet (Legacy)
                </div>
                <span className="text-[10px] text-red-500">Unencrypted. Least secure. Use only for legacy hardware.</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs font-mono text-green-500">VPN ACTIVE</span>
          </div>
        </div>
      </div>

      {protocol === "Telnet" && (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-yellow-500">Security Warning: Telnet Detected</p>
            <p className="text-xs text-muted-foreground">Telnet transmits data in plain text. Passwords and commands can be intercepted by anyone on the network. We strongly recommend using SSH instead.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Public Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-mono font-bold text-blue-400">hub.edward.net</p>
            <p className="text-[10px] text-muted-foreground mt-1">Port: {protocol === "SSH" ? "22" : "23"} ({protocol})</p>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Encryption</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-mono font-bold">{protocol === "SSH" ? "AES-256-GCM" : "NONE"}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Protocol: {protocol}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-mono font-bold">02</p>
            <p className="text-[10px] text-muted-foreground mt-1">Authorized Users Only</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Setup Instructions ({protocol})</CardTitle>
          <CardDescription>Follow these steps to connect to your hub from an external network.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion className="w-full">
            <AccordionItem value="step-1">
              <AccordionTrigger className="text-sm font-medium">
                1. Connection Command
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground space-y-3">
                <p>Use the following command in your terminal to establish a connection:</p>
                <div className="bg-black p-3 rounded-lg font-mono text-blue-400 flex justify-between items-center">
                  <span>{protocol === "SSH" ? "ssh admin@hub.edward.net" : "telnet hub.edward.net"}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6"><Terminal className="w-3 h-3" /></Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="step-2">
              <AccordionTrigger className="text-sm font-medium">
                2. Firewall Configuration
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground space-y-2">
                <p>Ensure port {protocol === "SSH" ? "22" : "23"} is open on your router's firewall and mapped to the Hub's internal IP.</p>
                <div className="p-3 rounded-lg bg-muted/30 border border-border flex items-center gap-3">
                  <Info className="w-4 h-4 text-blue-500 shrink-0" />
                  <p>For {protocol === "SSH" ? "SSH" : "Telnet"}, we recommend using non-standard ports (e.g., 2222) to reduce automated brute-force attacks.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            {protocol === "SSH" && (
              <AccordionItem value="step-3">
                <AccordionTrigger className="text-sm font-medium">
                  3. Key Authentication (SSH Only)
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground space-y-3">
                  <p>For maximum security, disable password login and use public key authentication.</p>
                  <Button className="w-full gap-2 text-xs">
                    <Key className="w-3 h-3" /> Upload Public Key (.pub)
                  </Button>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 gap-2">
          <Terminal className="w-4 h-4" /> View Access Logs
        </Button>
        <Button className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
          <ShieldCheck className="w-4 h-4" /> {protocol === "SSH" ? "Regenerate Keys" : "Enable SSH"}
        </Button>
      </div>
    </div>
  );
};
