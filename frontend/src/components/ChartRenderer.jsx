import React from 'react';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis
} from 'recharts';
import { Download } from 'lucide-react';

import { useSettings } from '../context/SettingsContext';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

const ChartRenderer = ({ chartConfig }) => {
    const { theme } = useSettings();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Dynamic Chart Styles
    const gridColor = isDark ? '#333' : '#e5e7eb'; // zinc-800 vs zinc-200
    const axisColor = isDark ? '#a1a1aa' : '#71717a'; // zinc-400 vs zinc-500
    const tooltipStyle = {
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        borderColor: isDark ? '#333' : '#e5e7eb',
        color: isDark ? '#fff' : '#000'
    };
    const tooltipItemStyle = {
        color: isDark ? '#fff' : '#18181b'
    };

    // 1. Handle Array (Multi-Chart)
    if (Array.isArray(chartConfig)) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {chartConfig.map((config, idx) => (
                    <ChartRenderer key={idx} chartConfig={config} />
                ))}
            </div>
        );
    }

    if (!chartConfig || !chartConfig.data || chartConfig.data.length === 0) return null;

    const { type, data, xKey, seriesKeys, title, description } = chartConfig;

    const renderChart = () => {
        switch (type) {
            case 'bar':
            case 'histogram':
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey={xKey} stroke={axisColor} style={{ fontSize: '10px' }} />
                        <YAxis stroke={axisColor} style={{ fontSize: '10px' }} />
                        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} cursor={{ fill: isDark ? '#333' : '#f4f4f5' }} />
                        <Legend wrapperStyle={{ color: axisColor }} />
                        {seriesKeys.map((key, index) => (
                            <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
                        ))}
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey={xKey} stroke={axisColor} style={{ fontSize: '10px' }} />
                        <YAxis stroke={axisColor} style={{ fontSize: '10px' }} />
                        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                        <Legend wrapperStyle={{ color: axisColor }} />
                        {seriesKeys.map((key, index) => (
                            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={2} dot={{ r: 2 }} />
                        ))}
                    </LineChart>
                );
            case 'scatter':
                return (
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis type="number" dataKey={xKey} name={xKey} stroke={axisColor} style={{ fontSize: '10px' }} />
                        <YAxis type="number" dataKey={seriesKeys[0]} name={seriesKeys[0]} stroke={axisColor} style={{ fontSize: '10px' }} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                        <Legend wrapperStyle={{ color: axisColor }} />
                        {seriesKeys.map((key, index) => (
                            <Scatter key={key} name={key} data={data} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </ScatterChart>
                );
            case 'area':
                return (
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey={xKey} stroke={axisColor} style={{ fontSize: '10px' }} />
                        <YAxis stroke={axisColor} style={{ fontSize: '10px' }} />
                        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                        <Legend wrapperStyle={{ color: axisColor }} />
                        {seriesKeys.map((key, index) => (
                            <Area key={key} type="monotone" dataKey={key} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} fillOpacity={0.3} />
                        ))}
                    </AreaChart>
                );
            case 'pie': {
                const dataKey = seriesKeys[0];
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey={dataKey}
                            nameKey={xKey}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                        <Legend wrapperStyle={{ color: axisColor }} />
                    </PieChart>
                );
            }
            default:
                return <div className="text-red-400 text-xs p-2">Unsupported chart type: {type}</div>;
        }
    };

    const containerRef = React.useRef(null);

    const handleDownload = () => {
        if (!containerRef.current) return;
        const svg = containerRef.current.querySelector('svg');
        if (!svg) return;

        // Serialize SVG
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        // Trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title || 'chart'}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div ref={containerRef} className="my-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 w-full h-full min-h-[350px] flex flex-col shadow-sm relative group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 mr-4">
                    {title && <h3 className="text-md font-bold text-zinc-900 dark:text-white mb-1 truncate" title={title}>{title}</h3>}
                    {description && <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2" title={description}>{description}</p>}
                </div>
                <button
                    onClick={handleDownload}
                    className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Download SVG"
                >
                    <Download size={16} />
                </button>
            </div>

            <div className="w-full flex-1 min-h-[300px]" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ChartRenderer;
