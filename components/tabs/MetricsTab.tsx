'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { confidenceData, processTimeData } from '../ComplianceAutomation'
import { TrendingUp, Clock, DollarSign, Users } from 'lucide-react'

// Custom tooltip component for better visualization
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-md rounded-md">
        <p className="font-medium text-slate-800">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${entry.value}${entry.name.includes('Time') ? ' min' : '%'}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Additional business impact data
const costSavingsData = [
  { name: 'Personnel', value: 65 },
  { name: 'Technology', value: 15 },
  { name: 'Training', value: 10 },
  { name: 'Operations', value: 10 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

// Metric card component
interface MetricCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, icon, trend, trendUp }) => (
  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <h3 className="text-slate-600 font-medium text-sm">{title}</h3>
      <span className="text-blue-600">{icon}</span>
    </div>
    <div className="flex items-end mb-2">
      <span className="text-2xl font-bold text-slate-800">{value}</span>
      {trend && (
        <span className={`ml-2 text-sm flex items-center ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
      )}
    </div>
    <p className="text-xs text-slate-500">{description}</p>
  </div>
)

export const MetricsTab: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 text-slate-800">Enterprise Performance Metrics</h2>
        <p className="text-slate-600 max-w-3xl">
          Our agentic AI system delivers measurable business impact with significant improvements in accuracy, efficiency, and cost reduction.
        </p>
      </div>
      
      {/* Key metrics dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <MetricCard 
          title="AVERAGE PROCESSING TIME" 
          value="3 min"
          description="88% reduction compared to manual review (26 min)"
          icon={<Clock size={20} />}
          trend="88% faster"
          trendUp={true}
        />
        <MetricCard 
          title="CONFIDENCE SCORE" 
          value="88%"
          description="95% of human analyst accuracy with continuous improvement"
          icon={<TrendingUp size={20} />}
          trend="2.5% monthly improvement"
          trendUp={true}
        />
        <MetricCard 
          title="COST SAVINGS" 
          value="$1.2M"
          description="Annual savings for mid-sized financial institution"
          icon={<DollarSign size={20} />}
          trend="32% ROI"
          trendUp={true}
        />
        <MetricCard 
          title="COMPLIANCE STAFF EFFICIENCY" 
          value="8x"
          description="Increase in cases handled per compliance officer"
          icon={<Users size={20} />}
          trend="Reallocated to high-value tasks"
          trendUp={true}
        />
      </div>
      
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Confidence Scores by Process Type (%)</h3>
          <div className="text-sm text-blue-600 bg-blue-50 p-1 px-3 rounded-full font-medium">
            Enterprise-grade accuracy
          </div>
        </div>
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={confidenceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: '#475569' }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#475569' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="automated" name="Agentic AI System" fill="#3182ce" radius={[4, 4, 0, 0]} />
              <Bar dataKey="human" name="Human Analyst" fill="#805ad5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-slate-600 italic">
          The agentic AI system achieves 95% of human accuracy while handling 8x the volume of cases
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Processing Time (minutes)</h3>
            <div className="text-sm text-green-600 bg-green-50 p-1 px-3 rounded-full font-medium">
              88% time reduction
            </div>
          </div>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processTimeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fill: '#475569' }} />
                <YAxis tick={{ fill: '#475569' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="automated" name="Agentic AI System" fill="#38a169" radius={[4, 4, 0, 0]} />
                <Bar dataKey="human" name="Human Analyst" fill="#dd6b20" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-600 italic">
            Real-time processing enables immediate compliance interventions, reducing risk exposure
          </p>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Cost Savings Breakdown</h3>
            <div className="text-sm text-purple-600 bg-purple-50 p-1 px-3 rounded-full font-medium">
              $1.2M annual savings
            </div>
          </div>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costSavingsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {costSavingsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-600 italic">
            Primary savings come from personnel efficiency and reallocation to higher-value tasks
          </p>
        </div>
      </div>
    </div>
  )
}
