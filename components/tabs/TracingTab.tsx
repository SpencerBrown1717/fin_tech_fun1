'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock, FileText, MessageSquare, Search, Shield } from 'lucide-react'

// Decision trace interface
interface DecisionTrace {
  id: string
  timestamp: string
  type: string
  status: 'compliant' | 'non-compliant' | 'review'
  confidence: number
  summary: string
  details: string[]
  agentActions: {
    agent: string
    action: string
    reasoning: string
    confidence: number
  }[]
}

// Sample decision traces
const decisionTraces: DecisionTrace[] = [
  {
    id: 'TR-2023-06-15-001',
    timestamp: '2023-06-15 09:23:45',
    type: 'Trade Review',
    status: 'compliant',
    confidence: 94,
    summary: 'Options trade within approved client risk profile',
    details: [
      'Client risk profile: Aggressive Growth (Level 4/5)',
      'Trade type: Covered call options strategy',
      'Asset class: Equity derivatives',
      'Position size: 3.2% of portfolio (within 5% limit)',
      'Suitability score: 87/100'
    ],
    agentActions: [
      {
        agent: 'Risk Profile Agent',
        action: 'Verified client risk tolerance',
        reasoning: 'Client onboarding documentation from 2023-01-10 confirms Level 4 risk tolerance with options trading approval',
        confidence: 98
      },
      {
        agent: 'Trade Verification Agent',
        action: 'Validated trade parameters',
        reasoning: 'Covered call strategy is within approved strategies for this client. Position sizing is within firm guidelines.',
        confidence: 95
      },
      {
        agent: 'Compliance Agent',
        action: 'Approved transaction',
        reasoning: 'All parameters within acceptable thresholds. No regulatory flags detected.',
        confidence: 92
      }
    ]
  },
  {
    id: 'TR-2023-06-14-089',
    timestamp: '2023-06-14 15:47:12',
    type: 'Client Communication',
    status: 'non-compliant',
    confidence: 89,
    summary: 'Potential unauthorized performance guarantee in email',
    details: [
      'Communication channel: Email',
      'Advisor: James Wilson',
      'Client: REDACTED',
      'Flag: Potential performance guarantee',
      'Flagged text: "I can guarantee this fund will outperform the market"',
      'Regulatory violation: SEC Rule 206(4)-1'
    ],
    agentActions: [
      {
        agent: 'Communication Analysis Agent',
        action: 'Flagged prohibited language',
        reasoning: 'Detected explicit performance guarantee which violates SEC marketing rules',
        confidence: 96
      },
      {
        agent: 'Regulatory Agent',
        action: 'Identified SEC Rule violation',
        reasoning: 'Language constitutes a prohibited performance guarantee under SEC Rule 206(4)-1',
        confidence: 91
      },
      {
        agent: 'Remediation Agent',
        action: 'Generated remediation plan',
        reasoning: 'Recommended email retraction, client disclosure, and advisor training',
        confidence: 87
      }
    ]
  },
  {
    id: 'TR-2023-06-13-042',
    timestamp: '2023-06-13 11:05:33',
    type: 'KYC Verification',
    status: 'review',
    confidence: 76,
    summary: 'Inconsistent client information requires human review',
    details: [
      'Client ID: REDACTED',
      'Account type: Individual retirement account',
      'Issue: Inconsistent employment information',
      'System of record: CRM shows "Retired"',
      'New document: Recent application shows "Part-time consultant"',
      'Last KYC update: 2022-11-08'
    ],
    agentActions: [
      {
        agent: 'Document Analysis Agent',
        action: 'Detected information discrepancy',
        reasoning: 'Employment status differs between CRM record and new application form',
        confidence: 99
      },
      {
        agent: 'Risk Assessment Agent',
        action: 'Evaluated AML/KYC impact',
        reasoning: 'Change in employment status requires updated income verification and source of funds',
        confidence: 85
      },
      {
        agent: 'Workflow Agent',
        action: 'Escalated to human review',
        reasoning: 'Confidence below 80% threshold for automated resolution due to potential regulatory implications',
        confidence: 78
      }
    ]
  }
]

// Trace card component
interface TraceCardProps {
  trace: DecisionTrace
}

const TraceCard: React.FC<TraceCardProps> = ({ trace }) => {
  const [expanded, setExpanded] = useState(false)

  // Status styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'compliant':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          icon: <CheckCircle size={16} className="text-green-600" />
        }
      case 'non-compliant':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          icon: <AlertTriangle size={16} className="text-red-600" />
        }
      default:
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          icon: <Clock size={16} className="text-yellow-600" />
        }
    }
  }

  // Get icon for trace type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Trade Review':
        return <FileText size={16} className="mr-1" />
      case 'Client Communication':
        return <MessageSquare size={16} className="mr-1" />
      case 'KYC Verification':
        return <Shield size={16} className="mr-1" />
      default:
        return <Search size={16} className="mr-1" />
    }
  }

  const statusStyle = getStatusStyle(trace.status)

  return (
    <div className="bg-white rounded-lg border border-slate-200 mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
      <div 
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          <div className={`${statusStyle.bg} p-2 rounded-full`}>
            {statusStyle.icon}
          </div>
          <div>
            <div className="flex items-center">
              <span className="text-slate-500 text-sm flex items-center mr-2">
                {getTypeIcon(trace.type)}
                {trace.type}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                {trace.status.replace('-', ' ')}
              </span>
            </div>
            <h3 className="font-medium text-slate-800">{trace.summary}</h3>
            <div className="flex items-center text-xs text-slate-500 mt-1">
              <span className="mr-3">ID: {trace.id}</span>
              <span className="mr-3">{trace.timestamp}</span>
              <span>Confidence: {trace.confidence}%</span>
            </div>
          </div>
        </div>
        <div>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 pt-0 border-t border-slate-100">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Details</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              {trace.details.map((detail, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Agent Actions & Reasoning</h4>
            <div className="space-y-3">
              {trace.agentActions.map((action, index) => (
                <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-blue-700">{action.agent}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {action.confidence}% confidence
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-700 mb-1">{action.action}</div>
                  <div className="text-xs text-slate-600">{action.reasoning}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const TracingTab: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 text-slate-800">Decision Intelligence Tracing</h2>
        <p className="text-slate-600 max-w-3xl">
          Our agentic system provides complete transparency into compliance decisions with detailed reasoning and confidence scores. All decisions are auditable and regulatory-compliant.
        </p>
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span className="text-sm text-slate-600">Compliant</span>
          </div>
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span className="text-sm text-slate-600">Non-Compliant</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
            <span className="text-sm text-slate-600">Needs Review</span>
          </div>
        </div>
        
        <div className="text-sm text-blue-600 bg-blue-50 p-1 px-3 rounded-full font-medium">
          100% Auditable
        </div>
      </div>
      
      <div>
        {decisionTraces.map((trace) => (
          <TraceCard key={trace.id} trace={trace} />
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          View All Decision Traces
        </button>
        <p className="text-xs text-slate-500 mt-2">
          All decision traces are securely stored for 7 years in compliance with SEC Rule 17a-4
        </p>
      </div>
    </div>
  )
}
