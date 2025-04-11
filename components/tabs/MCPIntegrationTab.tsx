'use client'

import React, { useState } from 'react'
import { Shield, Code, Terminal, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react'

// Simple interface for tool cards
interface ToolCard {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  endpoint: string;
  sampleParams: any;
}

export const MCPIntegrationTab: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [demoStatus, setDemoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [demoResult, setDemoResult] = useState<string | null>(null);
  const [showIntegrationInfo, setShowIntegrationInfo] = useState<boolean>(false);

  // Simplified tool definitions with sample parameters
  const tools: ToolCard[] = [
    {
      name: "analyze_transaction",
      description: "Analyzes financial transactions for compliance issues",
      icon: <Shield size={20} />,
      color: "bg-blue-100 text-blue-700",
      endpoint: "/api/compliance/transaction",
      sampleParams: {
        transaction_id: "TX" + Date.now(),
        amount: 12000,
        sender: {
          id: "SENDER123",
          name: "John Smith",
          country: "US"
        },
        recipient: {
          id: "RECIP456",
          name: "ABC Corp",
          country: "CountryB"
        },
        transaction_type: "international"
      }
    },
    {
      name: "verify_customer_kyc",
      description: "Verifies KYC compliance for customers",
      icon: <CheckCircle size={20} />,
      color: "bg-green-100 text-green-700",
      endpoint: "/api/compliance/kyc",
      sampleParams: {
        customer_id: "CUST" + Date.now(),
        name: "Jane Doe",
        date_of_birth: "1980-05-15",
        address: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          postal_code: "10001",
          country: "US"
        },
        document_type: "passport",
        document_id: "P12345678"
      }
    },
    {
      name: "analyze_communication",
      description: "Analyzes communications for compliance issues",
      icon: <Terminal size={20} />,
      color: "bg-purple-100 text-purple-700",
      endpoint: "/api/compliance/communication",
      sampleParams: {
        communication_id: "COMM" + Date.now(),
        content: "Let's discuss the investment opportunity. I can guarantee a 15% return with no risk.",
        sender: {
          id: "EMP001",
          name: "Employee Name",
          role: "Advisor"
        },
        recipient: {
          id: "CLIENT002",
          name: "Client Name",
          role: "Client"
        },
        channel: "email",
        timestamp: new Date().toISOString()
      }
    },
    {
      name: "get_regulatory_updates",
      description: "Retrieves latest regulatory updates",
      icon: <RefreshCw size={20} />,
      color: "bg-amber-100 text-amber-700",
      endpoint: "/api/compliance/regulations",
      sampleParams: {
        region: "US",
        industry: "finance",
        date_from: "2025-01-01"
      }
    },
    {
      name: "generate_compliance_report",
      description: "Generates compliance reports for entities",
      icon: <Code size={20} />,
      color: "bg-rose-100 text-rose-700",
      endpoint: "/api/compliance/report",
      sampleParams: {
        entity_id: "ENTITY123",
        report_type: "detailed",
        time_period: {
          start_date: "2025-01-01",
          end_date: "2025-03-31"
        },
        include_details: true
      }
    }
  ];

  // Function to handle running a demo
  const handleRunDemo = async (toolName: string) => {
    setActiveDemo(toolName);
    setDemoStatus('loading');
    
    try {
      const tool = tools.find(t => t.name === toolName);
      
      if (!tool) {
        throw new Error('Tool not found');
      }
      
      // Make actual API call
      const response = await fetch(tool.endpoint, {
        method: tool.name === 'get_regulatory_updates' ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: tool.name === 'get_regulatory_updates' 
          ? undefined 
          : JSON.stringify(tool.sampleParams)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setDemoResult(JSON.stringify(data, null, 2));
      setDemoStatus('success');
    } catch (error: unknown) {
      console.error('Error running demo:', error);
      setDemoStatus('error');
      setDemoResult(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }, null, 2));
    }
  };

  // Function to get MCP tool schema
  const handleViewMCPSchema = async () => {
    setShowIntegrationInfo(true);
    setActiveDemo('mcp_schema');
    setDemoStatus('loading');
    
    try {
      const response = await fetch('/api/mcp');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setDemoResult(JSON.stringify(data, null, 2));
      setDemoStatus('success');
    } catch (error: unknown) {
      console.error('Error fetching MCP schema:', error);
      setDemoStatus('error');
      setDemoResult(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }, null, 2));
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Financial Compliance Tools</h2>
        <p className="text-gray-600">
          These compliance tools can be integrated with LLMs through the Model Context Protocol.
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {tools.map((tool) => (
          <div 
            key={tool.name} 
            className="border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => handleRunDemo(tool.name)}
          >
            <div className="flex items-center mb-3">
              <div className={`p-2 rounded-md ${tool.color} mr-3`}>
                {tool.icon}
              </div>
              <h3 className="font-medium">{tool.name}</h3>
            </div>
            <p className="text-gray-600 text-sm">{tool.description}</p>
            <div className="mt-3 text-xs text-gray-500">
              Endpoint: {tool.endpoint}
            </div>
          </div>
        ))}
        
        {/* MCP Schema Card */}
        <div 
          className="border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
          onClick={handleViewMCPSchema}
        >
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-md bg-indigo-100 text-indigo-700 mr-3">
              <Info size={20} />
            </div>
            <h3 className="font-medium">MCP Schema</h3>
          </div>
          <p className="text-gray-600 text-sm">View the complete MCP schema for all compliance tools</p>
          <div className="mt-3 text-xs text-gray-500">
            Endpoint: /api/mcp
          </div>
        </div>
      </div>

      {/* Result Display */}
      {activeDemo && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Tool: {activeDemo}</h3>
            <div className={`px-2 py-1 rounded-full text-xs ${
              demoStatus === 'loading' ? 'bg-blue-100 text-blue-700' :
              demoStatus === 'success' ? 'bg-green-100 text-green-700' :
              demoStatus === 'error' ? 'bg-red-100 text-red-700' : ''
            }`}>
              {demoStatus === 'loading' ? 'Processing...' :
               demoStatus === 'success' ? 'Success' :
               demoStatus === 'error' ? 'Error' : ''}
            </div>
          </div>
          
          {demoStatus === 'loading' && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {demoStatus === 'success' && demoResult && (
            <div className="bg-gray-50 p-3 rounded-md">
              <pre className="font-mono text-sm overflow-x-auto">{demoResult}</pre>
            </div>
          )}
          
          {demoStatus === 'error' && (
            <div className="bg-red-50 p-3 rounded-md text-red-700 text-sm">
              Error processing request. Please try again.
              {demoResult && <pre className="font-mono mt-2 text-xs">{demoResult}</pre>}
            </div>
          )}
        </div>
      )}

      {/* Integration Guide */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Integration Guide</h3>
          <button 
            onClick={() => setShowIntegrationInfo(!showIntegrationInfo)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showIntegrationInfo ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          To integrate these tools with an LLM, define the tool schema and point to the MCP server endpoints.
        </p>
        
        {showIntegrationInfo && (
          <>
            <div className="bg-white p-3 rounded border text-xs font-mono mb-3">
{`// Basic integration example
{
  "name": "${activeDemo || 'tool_name'}",
  "description": "${activeDemo ? tools.find(t => t.name === activeDemo)?.description || 'Tool description' : 'Tool description'}",
  "endpoint": "${activeDemo ? tools.find(t => t.name === activeDemo)?.endpoint || '/api/compliance/endpoint' : '/api/compliance/endpoint'}"
}`}
            </div>
            
            <div className="bg-white p-3 rounded border text-xs font-mono">
{`// Example API call
const response = await fetch("/api/mcp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tool: "${activeDemo || 'tool_name'}",
    parameters: ${activeDemo ? JSON.stringify(tools.find(t => t.name === activeDemo)?.sampleParams || {}, null, 2) : '{}'}
  })
});

const result = await response.json();`}
            </div>
            
            <div className="mt-3">
              <a 
                href="/docs/agentic-workflow.md" 
                target="_blank" 
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                View complete agentic workflow documentation
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
