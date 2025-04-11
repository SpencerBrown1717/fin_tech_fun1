'use client'

import React, { useState } from 'react';
import { ArchitectureTab } from './tabs/ArchitectureTab';
import { MetricsTab } from './tabs/MetricsTab';
import { MCPIntegrationTab } from './tabs/MCPIntegrationTab';
import { BarChart2, Shield, Code } from 'lucide-react';

const ComplianceAutomation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('mcp');

  const tabs = [
    {
      id: 'mcp',
      label: 'Compliance Tools',
      icon: <Shield size={18} className="mr-2" />
    },
    {
      id: 'architecture',
      label: 'System Architecture',
      icon: <Code size={18} className="mr-2" />
    },
    {
      id: 'metrics',
      label: 'Performance Metrics',
      icon: <BarChart2 size={18} className="mr-2" />
    }
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg">
      {/* Simplified Navigation Tabs */}
      <div className="border-b">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-0">
        {activeTab === 'mcp' && <MCPIntegrationTab />}
        {activeTab === 'architecture' && <ArchitectureTab />}
        {activeTab === 'metrics' && <MetricsTab />}
      </div>
    </div>
  );
};

export default ComplianceAutomation;
