import { NextApiRequest, NextApiResponse } from 'next';

// Analyze transaction API endpoint
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transaction_id, amount, sender, recipient, transaction_type } = req.body;
    
    // Validation
    if (!transaction_id || !amount || !sender || !recipient || !transaction_type) {
      return res.status(400).json({ error: 'Missing required transaction parameters' });
    }
    
    // Risk scoring algorithm (simplified for demo)
    const riskFactors = [];
    let riskScore = 0;
    
    // Check amount threshold
    if (amount > 10000) {
      riskScore += 0.2;
      riskFactors.push('High value transaction');
    }
    
    // Check transaction type
    if (transaction_type === 'international') {
      riskScore += 0.1;
      riskFactors.push('International transaction');
    }
    
    // Check for high-risk countries
    const highRiskCountries = ['CountryA', 'CountryB', 'CountryC'];
    if (highRiskCountries.includes(sender.country) || highRiskCountries.includes(recipient.country)) {
      riskScore += 0.3;
      riskFactors.push('High-risk jurisdiction involved');
    }
    
    // Determine compliance status
    const complianceStatus = riskScore < 0.5 ? 'COMPLIANT' : 'REVIEW_REQUIRED';
    
    // Return analysis result
    return res.status(200).json({
      transaction_id,
      risk_score: parseFloat(riskScore.toFixed(2)),
      compliance_status: complianceStatus,
      risk_factors: riskFactors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing transaction:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
