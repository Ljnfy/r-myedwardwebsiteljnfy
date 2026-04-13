import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Play, Film, Music, Image as ImageIcon, Search, Filter, MoreVertical, Download, Share2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface MediaItem {
  name: string;
  type: string;
  size: string;
  modified: string;
  duration?: string;
  thumbnail?: string;
}

export const MediaServer: React.FC = () => {
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "movies" | "music" | "photos">("all");

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media/library");
      const data = await res.json();
      setLibrary(data);
    } catch (err) {
      toast.error("Failed to load media library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const filteredLibrary = library.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "movies") return item.name.endsWith(".mp4") || item.name.endsWith(".mkv");
    if (activeTab === "music") return item.name.endsWith(".mp3");
    if (activeTab === "photos") return item.name.endsWith(".jpg") || item.name.endsWith(".png");
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-purple-500" /> Media Server
          </h2>
          <p className="text-sm text-muted-foreground">Stream high-definition content across your local network.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Search className="w-4 h-4" /> Search
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-muted/30 rounded-lg w-fit">
        <Button 
          variant={activeTab === "all" ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setActiveTab("all")}
          className="text-xs"
        >
          All Media
        </Button>
        <Button 
          variant={activeTab === "movies" ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setActiveTab("movies")}
          className="text-xs gap-2"
        >
          <Film className="w-3 h-3" /> Movies
        </Button>
        <Button 
          variant={activeTab === "music" ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setActiveTab("music")}
          className="text-xs gap-2"
        >
          <Music className="w-3 h-3" /> Music
        </Button>
        <Button 
          variant={activeTab === "photos" ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setActiveTab("photos")}
          className="text-xs gap-2"
        >
          <ImageIcon className="w-3 h-3" /> Photos
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-muted/20 animate-pulse rounded-xl border border-border" />
          ))
        ) : filteredLibrary.length === 0 ? (
          <div className="col-span-full py-24 text-center space-y-4 opacity-50">
            <Film className="w-12 h-12 mx-auto text-muted-foreground" />
            <p>No media found in this category.</p>
          </div>
        ) : (
          filteredLibrary.map((item, i) => (
            <Card key={i} className="group overflow-hidden border-border bg-card/30 hover:bg-card/50 transition-all hover:scale-[1.02]">
              <div className="aspect-[2/3] relative">
                <img 
                  src={item.thumbnail || `https://picsum.photos/seed/${item.name}/400/600`} 
                  alt={item.name}
                  className="object-cover w-full h-full grayscale-[0.2] group-hover:grayscale-0 transition-all"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="icon" className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-600/20">
                    <Play className="w-6 h-6 fill-white" />
                  </Button>
                </div>
                {item.duration && (
                  <Badge className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md border-none text-[10px]">
                    {item.duration}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">{item.name.split('.')[0].replace(/_/g, ' ')}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{item.size} • {item.type}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] gap-2">
                    <Download className="w-3 h-3" /> Download
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] gap-2">
                    <Share2 className="w-3 h-3" /> DLNA
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
