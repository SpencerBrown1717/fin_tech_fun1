import { NextApiRequest, NextApiResponse } from 'next';

// Analyze communication API endpoint
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { communication_id, content, sender, recipient, channel, timestamp } = req.body;
    
    // Validation
    if (!communication_id || !content || !sender || !recipient || !channel) {
      return res.status(400).json({ error: 'Missing required communication parameters' });
    }
    
    // Analysis logic (simplified for demo)
    const flaggedTerms = [];
    const sensitiveDataPatterns = [];
    let complianceStatus = 'COMPLIANT';
    
    // Check for flagged terms
    const flaggedTermsList = [
      'guarantee', 'guaranteed return', 'risk-free', 'insider', 
      'off the record', 'unofficial', 'between us'
    ];
    
    for (const term of flaggedTermsList) {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        flaggedTerms.push(term);
      }
    }
    
    // Check for sensitive data patterns
    const sensitivePatterns = [
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/, type: 'SSN' },
      { pattern: /\b\d{16}\b/, type: 'Credit Card' },
      { pattern: /password|credentials|login/i, type: 'Authentication Data' }
    ];
    
    for (const pattern of sensitivePatterns) {
      if (pattern.pattern.test(content)) {
        sensitiveDataPatterns.push(pattern.type);
      }
    }
    
    // Determine compliance status
    if (flaggedTerms.length > 0 || sensitiveDataPatterns.length > 0) {
      complianceStatus = 'REVIEW_REQUIRED';
    }
    
    // Return analysis result
    return res.status(200).json({
      communication_id,
      compliance_status: complianceStatus,
      flagged_terms: flaggedTerms,
      sensitive_data_detected: sensitiveDataPatterns,
      channel: channel,
      analysis_timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing communication:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
