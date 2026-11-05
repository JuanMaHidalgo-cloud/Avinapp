import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';

export const TrendCharts = ({ data, themeColors }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={themeColors[0]} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={themeColors[0]} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <RechartsTooltip 
          contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px'}}
        />
        <Area type="monotone" dataKey="requests" stroke={themeColors[0]} fillOpacity={1} fill="url(#colorRequests)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const ComparativeCharts = ({ data, themeColors }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <RechartsTooltip 
          cursor={{fill: 'hsl(var(--muted))'}} 
          contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px'}}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }}/>
        <Bar dataKey="current" name="Current" fill={themeColors[0]} radius={[4, 4, 0, 0]} />
        <Bar dataKey="previous" name="Previous" fill={themeColors[1] || 'hsl(var(--muted))'} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const FunnelSimulationChart = ({ data, themeColors }) => {
  // Simulating a funnel using a vertical bar chart sorted descending
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis dataKey="stage" type="category" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} fontWeight="500" />
        <RechartsTooltip 
          cursor={{fill: 'hsl(var(--muted))'}} 
          contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px'}}
        />
        <Bar dataKey="count" fill={themeColors[0]} radius={[0, 4, 4, 0]} barSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const ScatterAnalytics = ({ data, themeColors }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" dataKey="amount" name="Amount ($)" unit="$" stroke="hsl(var(--muted-foreground))" />
        <YAxis type="number" dataKey="days" name="Time (Days)" unit="d" stroke="hsl(var(--muted-foreground))" />
        <ZAxis type="number" range={[50, 400]} />
        <RechartsTooltip 
          cursor={{strokeDasharray: '3 3'}}
          contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px'}}
        />
        <Scatter name="Requests" data={data} fill={themeColors[0]} fillOpacity={0.6} />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default { TrendCharts, ComparativeCharts, FunnelSimulationChart, ScatterAnalytics };