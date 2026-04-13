import React, { useState, useEffect } from "react";
import { Device, FileItem } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Folder, File, HardDrive, ExternalLink, Unlink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface StorageManagerProps {
  device: Device;
}

export const StorageManager: React.FC<StorageManagerProps> = ({ device }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(device.isMounted ?? true);
  const [currentPath, setCurrentPath] = useState<string>("root");

  const fetchFiles = async () => {
    if (!isMounted) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/storage/${device.id}/files?path=${currentPath}`);
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      toast.error("Failed to fetch file system.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [device.id, isMounted, currentPath]);

  const handleFolderClick = (folderName: string) => {
    const newPath = currentPath === "root" ? folderName : `${currentPath}/${folderName}`;
    setCurrentPath(newPath);
  };

  const goBack = () => {
    if (currentPath === "root") return;
    const parts = currentPath.split("/");
    parts.pop();
    setCurrentPath(parts.length === 0 ? "root" : parts.join("/"));
  };

  const toggleMount = async () => {
    const action = isMounted ? "unmount" : "mount";
    try {
      const res = await fetch(`/api/storage/${device.id}/${action}`, { method: "POST" });
      if (res.ok) {
        setIsMounted(!isMounted);
        toast.success(`Device ${isMounted ? "unmounted" : "mounted"} successfully.`);
      }
    } catch (err) {
      toast.error(`Failed to ${action} device.`);
    }
  };

  return (
    <Card className="border-border bg-card/30">
      <CardHeader className="flex flex-col gap-2 py-3">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-500" /> Storage Explorer
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={toggleMount}>
              {isMounted ? <Unlink className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
              {isMounted ? "Unmount" : "Mount"}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchFiles} disabled={!isMounted || loading}>
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {isMounted && (
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground bg-black/20 p-1.5 rounded border border-border/50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4" 
              onClick={goBack} 
              disabled={currentPath === "root"}
            >
              <Folder className="w-2 h-2 rotate-180" />
            </Button>
            <span className="opacity-50">/</span>
            {currentPath.split("/").map((part, i) => (
              <React.Fragment key={i}>
                <span className={i === currentPath.split("/").length - 1 ? "text-blue-400" : ""}>{part}</span>
                {i < currentPath.split("/").length - 1 && <span className="opacity-50">/</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {!isMounted ? (
          <div className="py-12 text-center space-y-2">
            <Unlink className="w-8 h-8 text-muted-foreground mx-auto opacity-20" />
            <p className="text-xs text-muted-foreground">Volume is currently unmounted.</p>
            <Button variant="link" size="sm" className="text-blue-500" onClick={toggleMount}>Mount Volume</Button>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="divide-y divide-border/50">
              {files.length === 0 && (
                <div className="p-8 text-center text-xs text-muted-foreground">This folder is empty.</div>
              )}
              {files.map((file, i) => (
                <div 
                  key={i} 
                  className={`flex items-center justify-between p-3 hover:bg-muted/30 transition-colors group ${file.type === "directory" ? "cursor-pointer" : ""}`}
                  onClick={() => file.type === "directory" && handleFolderClick(file.name)}
                >
                  <div className="flex items-center gap-3">
                    {file.type === "directory" ? (
                      <Folder className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                    ) : (
                      <File className="w-4 h-4 text-blue-400" />
                    )}
                    <div>
                      <p className="text-xs font-medium">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{file.modified}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-muted-foreground">{file.size}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
