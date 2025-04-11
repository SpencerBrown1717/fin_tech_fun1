'use client'

import React from 'react'
import { FileText, Activity, CheckCircle, Shield, Database, Cpu, Network, Lock } from 'lucide-react'

// Reusable component for architecture section
interface ArchSectionProps {
  title: string
  icon: React.ReactNode
  iconColor: string
  children: React.ReactNode
}

const ArchSection: React.FC<ArchSectionProps> = ({ title, icon, iconColor, children }) => (
  <div className="flex-1 bg-slate-50 p-5 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md border border-slate-200">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      <span className={`mr-2 ${iconColor}`}>{icon}</span>
      {title}
    </h3>
    {children}
  </div>
)

// Reusable component for feature box
interface FeatureBoxProps {
  title: string
  color: string
  children: React.ReactNode
}

const FeatureBox: React.FC<FeatureBoxProps> = ({ title, color, children }) => (
  <div className="bg-white p-4 rounded-lg border border-slate-200 mb-3 transition-all duration-200 hover:border-slate-300 hover:shadow-sm">
    <span className={`inline-block ${color} px-2 py-1 rounded text-sm mb-2 font-medium`}>
      {title}
    </span>
    {children}
  </div>
)

export const ArchitectureTab: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 text-slate-800">Enterprise Agentic Compliance Architecture</h2>
        <p className="text-slate-600 max-w-3xl">
          Our enterprise-grade architecture orchestrates specialized AI agents to deliver continuous compliance monitoring with unprecedented accuracy and auditability.
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <ArchSection 
          title="Multi-Modal Input Layer" 
          icon={<Database size={20} />} 
          iconColor="text-blue-600"
        >
          <FeatureBox title="Call Recordings" color="bg-blue-100 text-blue-800">
            <p className="text-sm text-slate-600">Speech-to-text + sentiment analysis with 98.5% accuracy</p>
            <div className="mt-2 text-xs text-slate-500 flex items-center">
              <Lock size={12} className="mr-1" /> End-to-end encrypted
            </div>
          </FeatureBox>
          <FeatureBox title="Trade Data" color="bg-blue-100 text-blue-800">
            <p className="text-sm text-slate-600">Transaction details + real-time market data integration</p>
            <div className="mt-2 text-xs text-slate-500 flex items-center">
              <Network size={12} className="mr-1" /> API-connected to 18 exchanges
            </div>
          </FeatureBox>
          <FeatureBox title="Client Communications" color="bg-blue-100 text-blue-800">
            <p className="text-sm text-slate-600">Multi-channel analysis across email, chat, and form submissions</p>
            <div className="mt-2 text-xs text-slate-500 flex items-center">
              <Shield size={12} className="mr-1" /> PII redaction built-in
            </div>
          </FeatureBox>
        </ArchSection>
        
        <ArchSection 
          title="Agentic Processing Layer" 
          icon={<Cpu size={20} />} 
          iconColor="text-purple-600"
        >
          <FeatureBox title="Specialized AI Agents" color="bg-purple-100 text-purple-800">
            <ul className="text-sm text-slate-600 list-disc ml-5">
              <li>Call Analysis Agent (GPT-4 Turbo)</li>
              <li>Trade Verification Agent (Claude 3)</li>
              <li>Complaint Resolution Agent (Ensemble)</li>
            </ul>
            <div className="mt-2 text-xs text-slate-500">
              Agent orchestration with dynamic routing
            </div>
          </FeatureBox>
          <FeatureBox title="Enterprise ML Models" color="bg-purple-100 text-purple-800">
            <ul className="text-sm text-slate-600 list-disc ml-5">
              <li>Anomaly detection (99.2% precision)</li>
              <li>Pattern recognition across historical data</li>
              <li>Risk scoring with confidence intervals</li>
            </ul>
            <div className="mt-2 text-xs text-slate-500">
              Continuous learning with human feedback loops
            </div>
          </FeatureBox>
        </ArchSection>
        
        <ArchSection 
          title="Decision Intelligence Layer" 
          icon={<CheckCircle size={20} />} 
          iconColor="text-green-600"
        >
          <FeatureBox title="Confidence Scoring" color="bg-green-100 text-green-800">
            <p className="text-sm text-slate-600">Multi-model consensus with dynamic risk-based thresholds</p>
            <div className="mt-2 text-xs text-slate-500">
              Configurable by compliance officers
            </div>
          </FeatureBox>
          <FeatureBox title="Human-in-the-Loop" color="bg-green-100 text-green-800">
            <p className="text-sm text-slate-600">Intelligent routing for low-confidence cases (≤85%)</p>
            <div className="mt-2 text-xs text-slate-500">
              Prioritized queue with risk-based sorting
            </div>
          </FeatureBox>
          <FeatureBox title="Audit Trail" color="bg-green-100 text-green-800">
            <p className="text-sm text-slate-600">Blockchain-verified decision trails with natural language explanations</p>
            <div className="mt-2 text-xs text-slate-500">
              SEC, FINRA, and MiFID II compliant
            </div>
          </FeatureBox>
        </ArchSection>
      </div>
    </div>
  )
}
