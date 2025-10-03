import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Payment, GraphNode, GraphEdge, PaymentStatus } from '../types';
import { NetworkIcon } from './Icons';

interface LedgerVisualizerProps {
    payments: Payment[];
    onTransactionClick: (payment: Payment) => void;
    highlightedNodeIds: string[];
    selectedNodeId: string | null;
    onNodeSelect: (nodeId: string | null) => void;
}

const statusColors: Record<PaymentStatus, string> = {
    [PaymentStatus.SETTLED]: '#22c55e', // green-500
    [PaymentStatus.PROCESSING]: '#0ea5e9', // sky-500
    [PaymentStatus.PENDING]: '#f59e0b', // amber-500
    [PaymentStatus.FAILED]: '#ef4444', // red-500
    [PaymentStatus.CANCELED]: '#64748b', // slate-500
};

const SIMULATION_CONFIG = {
    charge: -300,
    linkDistance: 120,
    gravity: 0.05,
    friction: 0.8,
};

export const LedgerVisualizer: React.FC<LedgerVisualizerProps> = ({ 
    payments, 
    onTransactionClick, 
    highlightedNodeIds,
    selectedNodeId,
    onNodeSelect,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

    const nodesRef = useRef<Map<string, GraphNode>>(new Map());
    const edgesRef = useRef<GraphEdge[]>([]);

    useEffect(() => {
        if (svgRef.current) {
            setDimensions({
                width: svgRef.current.clientWidth,
                height: svgRef.current.clientHeight,
            });
        }
    }, []);

    useEffect(() => {
        const nodesMap = nodesRef.current;
        const { width, height } = dimensions;

        payments.forEach(p => {
            if (!nodesMap.has(p.user.id)) {
                nodesMap.set(p.user.id, {
                    id: p.user.id, label: p.user.name, type: 'user',
                    x: width / 2 + (Math.random() - 0.5) * 100,
                    y: height / 2 + (Math.random() - 0.5) * 100,
                    vx: 0, vy: 0,
                });
            }
            if (!nodesMap.has(p.description)) {
                nodesMap.set(p.description, {
                    id: p.description, label: p.description, type: 'retailer',
                    x: width / 2 + (Math.random() - 0.5) * 100,
                    y: height / 2 + (Math.random() - 0.5) * 100,
                    vx: 0, vy: 0,
                });
            }
        });

        const existingEdgeIds = new Set(edgesRef.current.map(e => e.id));
        edgesRef.current = payments.map(p => ({
            id: p.id,
            source: p.user.id,
            target: p.description,
            payment: p,
            isNew: !existingEdgeIds.has(p.id) && p.isLive,
        }));
    }, [payments, dimensions]);

    useEffect(() => {
        const nodes: GraphNode[] = Array.from(nodesRef.current.values());
        nodes.forEach(node => {
            node.isHighlighted = highlightedNodeIds.includes(node.id);
        });
    }, [highlightedNodeIds]);

    useEffect(() => {
        let animationFrameId: number;

        const simulationLoop = () => {
            const nodes: GraphNode[] = Array.from(nodesRef.current.values());
            const edges = edgesRef.current;
            const { width, height } = dimensions;
            if (width === 0) {
                animationFrameId = requestAnimationFrame(simulationLoop);
                return;
            }

            // --- Physics Calculations ---
            nodes.forEach(nodeA => {
                nodes.forEach(nodeB => {
                    if (nodeA === nodeB) return;
                    const dx = nodeB.x - nodeA.x;
                    const dy = nodeB.y - nodeA.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance > 0) {
                        const force = SIMULATION_CONFIG.charge / (distance * distance);
                        nodeA.vx += (dx / distance) * force;
                        nodeA.vy += (dy / distance) * force;
                    }
                });
                nodeA.vx += (width / 2 - nodeA.x) * SIMULATION_CONFIG.gravity;
                nodeA.vy += (height / 2 - nodeA.y) * SIMULATION_CONFIG.gravity;
            });

            edges.forEach(edge => {
                const source = nodesRef.current.get(edge.source);
                const target = nodesRef.current.get(edge.target);
                if (!source || !target) return;
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const force = (distance - SIMULATION_CONFIG.linkDistance) * 0.01;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;
                source.vx += fx; source.vy += fy;
                target.vx -= fx; target.vy -= fy;
            });

            nodes.forEach(node => {
                node.vx *= SIMULATION_CONFIG.friction;
                node.vy *= SIMULATION_CONFIG.friction;
                node.x += node.vx;
                node.y += node.vy;
                node.x = Math.max(15, Math.min(width - 15, node.x));
                node.y = Math.max(15, Math.min(height - 15, node.y));
            });

            // --- Re-render ---
            if (svgRef.current) {
              svgRef.current.innerHTML = ''; // Clear SVG
              
              const connectedNodeIds = new Set<string>();
              if (selectedNodeId) {
                  connectedNodeIds.add(selectedNodeId);
                  edges.forEach(edge => {
                      if (edge.source === selectedNodeId) connectedNodeIds.add(edge.target);
                      if (edge.target === selectedNodeId) connectedNodeIds.add(edge.source);
                  });
              }

              svgRef.current.onclick = (e) => {
                if (e.target === svgRef.current) onNodeSelect(null);
              };
              
              edges.forEach(edge => {
                const source = nodesRef.current.get(edge.source);
                const target = nodesRef.current.get(edge.target);
                if (!source || !target) return;
                
                const isFocused = !selectedNodeId || edge.source === selectedNodeId || edge.target === selectedNodeId;
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', String(source.x));
                line.setAttribute('y1', String(source.y));
                line.setAttribute('x2', String(target.x));
                line.setAttribute('y2', String(target.y));
                line.setAttribute('stroke', statusColors[edge.payment.status]);
                line.setAttribute('stroke-width', isFocused && selectedNodeId ? '2.5' : '1.5');
                line.setAttribute('stroke-opacity', isFocused ? '0.6' : '0.1');
                line.classList.add('cursor-pointer', 'transition-all', 'duration-200');
                if (isFocused) line.classList.add('hover:stroke-cyan-400', 'hover:!stroke-opacity-100');
                line.onclick = () => onTransactionClick(edge.payment);

                if (edge.isNew) {
                    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                    animate.setAttribute('attributeName', 'stroke-opacity');
                    animate.setAttribute('values', '0.1;0.8;0.1');
                    animate.setAttribute('dur', '1.5s');
                    animate.setAttribute('repeatCount', '1');
                    line.appendChild(animate);
                    edge.isNew = false;
                }
                
                svgRef.current?.appendChild(line);
              });

              nodes.forEach(node => {
                const isNodeFocused = !selectedNodeId || connectedNodeIds.has(node.id);

                const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
                g.setAttribute('opacity', isNodeFocused ? '1' : '0.2');
                g.classList.add('cursor-pointer', 'transition-opacity');
                g.onmouseenter = () => setHoveredNode(node);
                g.onmouseleave = () => setHoveredNode(null);
                g.onclick = (e) => {
                    e.stopPropagation();
                    onNodeSelect(node.id === selectedNodeId ? null : node.id);
                };

                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('r', node.id === selectedNodeId ? '14' : (node.type === 'user' ? '12' : '8'));
                circle.setAttribute('fill', node.type === 'user' ? '#083344' : '#1e293b');
                circle.setAttribute('stroke', node.type === 'user' ? '#06b6d4' : '#64748b');
                circle.setAttribute('stroke-width', node.id === selectedNodeId ? '3' : '2');
                circle.classList.add('transition-all');
                if (node.isHighlighted) {
                    circle.classList.add('animate-pulse');
                    circle.setAttribute('stroke', '#22d3ee');
                    circle.setAttribute('stroke-width', '3');
                }
                g.appendChild(circle);
                svgRef.current?.appendChild(g);
              });
            }

            animationFrameId = requestAnimationFrame(simulationLoop);
        };
        
        simulationLoop();

        return () => cancelAnimationFrame(animationFrameId);
    }, [dimensions, payments, onTransactionClick, selectedNodeId, onNodeSelect, highlightedNodeIds]);

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-3 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <NetworkIcon className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-xl font-semibold text-slate-300">Quantum Ledger Visualizer</h2>
              </div>
              {selectedNodeId && (
                  <button 
                      onClick={() => onNodeSelect(null)}
                      className="text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1 rounded-md transition-colors"
                  >
                      Clear Focus
                  </button>
              )}
            </div>
            <div className="flex-grow relative min-h-[300px]">
                <svg ref={svgRef} className="w-full h-full rounded-md bg-slate-950/50 border border-slate-800/50"></svg>
                {hoveredNode && (
                    <div 
                        className="absolute bg-slate-950 p-2 rounded-md border border-slate-700 text-xs shadow-lg pointer-events-none"
                        style={{ left: hoveredNode.x + 15, top: hoveredNode.y - 15 }}
                    >
                        <p className="font-bold text-slate-100">{hoveredNode.label}</p>
                        <p className="text-slate-400 capitalize">{hoveredNode.type}</p>
                    </div>
                )}
            </div>
        </div>
    );
};