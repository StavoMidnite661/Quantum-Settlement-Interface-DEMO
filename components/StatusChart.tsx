import React, { useState } from 'react';
import { PaymentStatus } from '../types';

interface StatusChartProps {
    stats: {
        total: number;
        pending: number;
        processing: number;
        settled: number;
        failed: number;
        canceled: number;
    };
}

const statusConfig: Record<keyof Omit<StatusChartProps['stats'], 'total' | 'progress'>, { color: string; label: string }> = {
    settled: { color: 'stroke-green-500', label: 'Settled' },
    processing: { color: 'stroke-sky-500', label: 'Processing' },
    pending: { color: 'stroke-amber-500', label: 'Pending' },
    failed: { color: 'stroke-red-500', label: 'Failed' },
    canceled: { color: 'stroke-slate-500', label: 'Canceled' },
};

export const StatusChart: React.FC<StatusChartProps> = ({ stats }) => {
    const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

    const data = [
        { status: 'settled', value: stats.settled },
        { status: 'processing', value: stats.processing },
        { status: 'pending', value: stats.pending },
        { status: 'failed', value: stats.failed },
        { status: 'canceled', value: stats.canceled },
    ].filter(d => d.value > 0);

    const radius = 60;
    const strokeWidth = 12;
    const innerRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * innerRadius;

    let accumulatedPercentage = 0;

    const segments = data.map(({ status, value }) => {
        const percentage = stats.total > 0 ? (value / stats.total) * 100 : 0;
        const strokeDashoffset = circumference - (accumulatedPercentage / 100) * circumference;
        const rotation = (accumulatedPercentage / 100) * 360;
        
        const segment = {
            status,
            value,
            percentage,
            strokeDasharray: `${(percentage / 100) * circumference} ${circumference}`,
            strokeDashoffset,
            rotation
        };
        accumulatedPercentage += percentage;
        return segment;
    });

    const hoveredData = hoveredSegment ? data.find(d => d.status === hoveredSegment) : null;
    const hoveredConfig = hoveredSegment ? statusConfig[hoveredSegment as keyof typeof statusConfig] : null;

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <div className="relative w-40 h-40">
                <svg viewBox="0 0 120 120" className="-rotate-90">
                    {segments.map(seg => (
                        <circle
                            key={seg.status}
                            cx="60"
                            cy="60"
                            r={innerRadius}
                            fill="none"
                            strokeWidth={strokeWidth}
                            className={`
                                ${statusConfig[seg.status as keyof typeof statusConfig].color}
                                transition-all duration-300
                                ${hoveredSegment === seg.status ? 'opacity-100' : 'opacity-70'}
                            `}
                            strokeDasharray={seg.strokeDasharray}
                            strokeDashoffset={0}
                            transform={`rotate(${seg.rotation} 60 60)`}
                            onMouseEnter={() => setHoveredSegment(seg.status)}
                            onMouseLeave={() => setHoveredSegment(null)}
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    {hoveredData && hoveredConfig ? (
                        <>
                            <span className="text-2xl font-bold text-slate-100">{hoveredData.value}</span>
                            <span className="text-sm text-slate-400">{hoveredConfig.label}</span>
                        </>
                    ) : (
                        <>
                            <span className="text-3xl font-bold text-cyan-400">{stats.total}</span>
                            <span className="text-sm text-slate-400">Total Payments</span>
                        </>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {Object.entries(statusConfig).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${config.color.replace('stroke', 'bg')}`}></div>
                        <span className="text-slate-400">{config.label}:</span>
                        <span className="font-semibold text-slate-200">{stats[key as keyof typeof stats]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
