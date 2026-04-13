import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Device } from "../../lib/types";

interface NetworkMapProps {
  devices: Device[];
  onSelectDevice: (device: Device) => void;
  selectedDeviceId?: string;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({ devices, onSelectDevice, selectedDeviceId }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || devices.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const currentWidth = svgRef.current.clientWidth || 800;
    const currentHeight = svgRef.current.clientHeight || 600;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    const container = svg
      .append("g");

    // Create nodes and links
    const nodes = devices.map(d => ({ ...d }));
    const links = devices
      .filter(d => d.type !== "Router")
      .map(d => ({
        source: devices.find(r => r.type === "Router")?.id || devices[0].id,
        target: d.id
      }));

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(180))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(currentWidth / 2, currentHeight / 2))
      .force("collision", d3.forceCollide().radius(60));

    const link = container.append("g")
      .attr("stroke", "#3b82f6")
      .attr("stroke-opacity", 0.3)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    const node = container.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .on("click", (event, d: any) => onSelectDevice(d))
      .style("cursor", "pointer")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Add a glow/highlight for the selected device
    node.append("circle")
      .attr("r", (d: any) => (d.type === "Router" ? 32 : 25))
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 4)
      .attr("stroke-opacity", (d: any) => d.id === selectedDeviceId ? 0.6 : 0)
      .attr("class", "selected-highlight")
      .style("filter", "blur(4px)");

    node.append("circle")
      .attr("r", (d: any) => d.type === "Router" ? 25 : 18)
      .attr("fill", (d: any) => d.status === "online" ? "#22c55e" : "#ef4444")
      .attr("stroke", (d: any) => d.id === selectedDeviceId ? "#ffffff" : "#0a0a0b")
      .attr("stroke-width", (d: any) => d.id === selectedDeviceId ? 4 : 3);

    node.append("text")
      .text((d: any) => d.name)
      .attr("x", 0)
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .attr("fill", (d: any) => d.id === selectedDeviceId ? "#3b82f6" : "#fafafa")
      .attr("font-weight", (d: any) => d.id === selectedDeviceId ? "bold" : "normal")
      .attr("font-size", "12px")
      .attr("font-family", "Inter, sans-serif");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [devices, selectedDeviceId]);

  return (
    <div className="w-full h-[600px] bg-card rounded-xl border border-border overflow-hidden tech-grid relative">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Live Topology Map</h3>
      </div>
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
