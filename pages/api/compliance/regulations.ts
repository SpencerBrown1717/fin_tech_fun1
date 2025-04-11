import { NextApiRequest, NextApiResponse } from 'next';

// Get regulatory updates API endpoint
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { region, industry, date_from } = req.query;
    
    // Mock regulatory updates database
    const regulatoryUpdates = [
      {
        id: 'REG-2025-001',
        regulation: 'SEC Regulation Best Interest',
        description: 'Enhanced standards for broker-dealer conduct when making recommendations to retail customers',
        effective_date: '2025-06-30',
        regions: ['US'],
        industries: ['finance', 'investment'],
        url: 'https://www.sec.gov/regulation-best-interest'
      },
      {
        id: 'REG-2025-002',
        regulation: 'EU Digital Operational Resilience Act (DORA)',
        description: 'Framework for ensuring financial entities can withstand ICT-related disruptions and threats',
        effective_date: '2025-07-15',
        regions: ['EU'],
        industries: ['finance', 'banking', 'insurance'],
        url: 'https://ec.europa.eu/dora'
      },
      {
        id: 'REG-2025-003',
        regulation: 'FINRA Rule 4370 Update',
        description: 'Updated business continuity planning requirements for broker-dealers',
        effective_date: '2025-08-01',
        regions: ['US'],
        industries: ['finance', 'broker-dealer'],
        url: 'https://www.finra.org/rules-guidance/rulebooks/finra-rules/4370'
      },
      {
        id: 'REG-2025-004',
        regulation: 'Basel IV Implementation',
        description: 'Final phase of Basel IV capital requirements implementation',
        effective_date: '2025-09-30',
        regions: ['Global'],
        industries: ['banking'],
        url: 'https://www.bis.org/basel_framework'
      }
    ];
    
    // Filter updates based on query parameters
    let filteredUpdates = [...regulatoryUpdates];
    
    if (region) {
      filteredUpdates = filteredUpdates.filter(update => 
        update.regions.some(r => r.toLowerCase() === (region as string).toLowerCase())
      );
    }
    
    if (industry) {
      filteredUpdates = filteredUpdates.filter(update => 
        update.industries.some(i => i.toLowerCase() === (industry as string).toLowerCase())
      );
    }
    
    if (date_from) {
      const fromDate = new Date(date_from as string);
      filteredUpdates = filteredUpdates.filter(update => 
        new Date(update.effective_date) >= fromDate
      );
    }
    
    // Return regulatory updates
    return res.status(200).json({
      updates: filteredUpdates,
      total_count: filteredUpdates.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrieving regulatory updates:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
