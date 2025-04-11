import { NextApiRequest, NextApiResponse } from 'next';
import { complianceToolsSchema } from './schema';

// MCP Server endpoint for agentic AI tools
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle OPTIONS requests for CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  
  // Handle schema requests
  if (req.method === 'GET') {
    return res.status(200).json({
      schema: complianceToolsSchema,
      version: '1.0.0',
      provider: 'FinGuard AI'
    });
  }
  
  // Handle tool execution requests
  if (req.method === 'POST') {
    try {
      const { tool, parameters } = req.body;
      
      if (!tool) {
        return res.status(400).json({ error: 'Missing tool identifier' });
      }
      
      // Route the request to the appropriate tool endpoint
      let response;
      switch (tool) {
        case 'analyze_transaction':
          response = await executeToolRequest('/api/compliance/transaction', parameters);
          break;
        case 'verify_customer_kyc':
          response = await executeToolRequest('/api/compliance/kyc', parameters);
          break;
        case 'analyze_communication':
          response = await executeToolRequest('/api/compliance/communication', parameters);
          break;
        case 'get_regulatory_updates':
          response = await executeToolRequest('/api/compliance/regulations', parameters, 'GET');
          break;
        case 'generate_compliance_report':
          response = await executeToolRequest('/api/compliance/report', parameters);
          break;
        default:
          return res.status(400).json({ error: 'Unknown tool identifier' });
      }
      
      return res.status(200).json({
        tool,
        result: response,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      console.error('Error executing tool:', error);
      return res.status(500).json({ 
        error: 'Error executing tool', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}

// Helper function to execute tool requests
async function executeToolRequest(endpoint: string, parameters: any, method: string = 'POST') {
  // For local development, we'll simulate the API call
  // In production, this would make an actual HTTP request to the endpoint
  
  // Get the API handler for the endpoint
  let apiHandler;
  try {
    // Dynamic import of the API handler
    apiHandler = require(`..${endpoint}`).default;
  } catch (error) {
    throw new Error(`API handler not found for endpoint: ${endpoint}`);
  }
  
  // Create a mock request and response
  const mockReq: Partial<NextApiRequest> = {
    method,
    body: parameters,
    query: method === 'GET' ? parameters : {},
    headers: {
      'content-type': 'application/json'
    }
  };
  
  let responseData = null;
  
  // Create a properly typed mock response object with a simpler approach
  const mockRes = {
    status: function(statusCode: number) {
      return {
        json: function(data: any) {
          responseData = data;
          return {} as any;
        },
        end: function() {
          return {} as any;
        }
      };
    },
    setHeader: function() { return this; },
    json: function(data: any) {
      responseData = data;
      return this;
    },
    end: function() { return this; }
  } as unknown as NextApiResponse;
  
  // Call the API handler
  await apiHandler(mockReq as NextApiRequest, mockRes);
  
  return responseData;
}
