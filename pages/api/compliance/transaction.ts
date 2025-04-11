import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

// Mock database for transaction history (in a real app, this would be a proper database)
const transactionHistory: Record<string, any>[] = [];

// Analyze transaction API endpoint
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      transaction_id, 
      amount, 
      sender, 
      recipient, 
      transaction_type,
      transaction_date = new Date().toISOString(),
      transaction_purpose,
      transaction_details,
      related_transactions = [],
      risk_profile = 'standard',
      analyze_patterns = false
    } = req.body;
    
    // Validation
    if (!transaction_id || !amount || !sender || !recipient || !transaction_type) {
      return res.status(400).json({ error: 'Missing required transaction parameters' });
    }
    
    // Risk scoring algorithm (enhanced)
    const riskFactors: string[] = [];
    let riskScore = 0;
    
    // Store transaction for future pattern analysis
    const transactionRecord = {
      id: transaction_id,
      amount,
      sender,
      recipient,
      type: transaction_type,
      date: transaction_date,
      purpose: transaction_purpose,
      details: transaction_details
    };
    
    transactionHistory.push(transactionRecord);
    
    // 1. Amount-based risk assessment (enhanced)
    if (amount > 10000) {
      riskScore += 0.2;
      riskFactors.push('High value transaction');
      
      if (amount > 50000) {
        riskScore += 0.2;
        riskFactors.push('Very high value transaction - requires enhanced due diligence');
      }
    }
    
    // 2. Transaction type risk assessment (enhanced)
    const typeRiskMap: Record<string, number> = {
      'international': 0.15,
      'wire': 0.1,
      'ach': 0.05,
      'internal': 0,
      'domestic': 0.02
    };
    
    if (typeRiskMap[transaction_type]) {
      riskScore += typeRiskMap[transaction_type];
      if (transaction_type === 'international') {
        riskFactors.push('International transaction');
      } else if (transaction_type === 'wire') {
        riskFactors.push('Wire transfer');
      }
    }
    
    // 3. Jurisdiction risk assessment (enhanced)
    const highRiskCountries = ['CountryA', 'CountryB', 'CountryC', 'CountryD', 'CountryE'];
    const mediumRiskCountries = ['CountryF', 'CountryG', 'CountryH'];
    
    if (highRiskCountries.includes(sender.country)) {
      riskScore += 0.3;
      riskFactors.push(`High-risk jurisdiction involved (sender: ${sender.country})`);
    } else if (mediumRiskCountries.includes(sender.country)) {
      riskScore += 0.15;
      riskFactors.push(`Medium-risk jurisdiction involved (sender: ${sender.country})`);
    }
    
    if (highRiskCountries.includes(recipient.country)) {
      riskScore += 0.3;
      riskFactors.push(`High-risk jurisdiction involved (recipient: ${recipient.country})`);
    } else if (mediumRiskCountries.includes(recipient.country)) {
      riskScore += 0.15;
      riskFactors.push(`Medium-risk jurisdiction involved (recipient: ${recipient.country})`);
    }
    
    // 4. Sender/Recipient risk assessment
    const highRiskEntities = ['Entity1', 'Entity2', 'Entity3'];
    if (highRiskEntities.includes(sender.name) || highRiskEntities.includes(recipient.name)) {
      riskScore += 0.25;
      riskFactors.push('Transaction involves high-risk entity');
    }
    
    // 5. Transaction purpose risk assessment
    if (transaction_purpose) {
      const highRiskPurposes = ['investment', 'real estate', 'cryptocurrency', 'consulting fees'];
      if (highRiskPurposes.some(purpose => transaction_purpose.toLowerCase().includes(purpose))) {
        riskScore += 0.15;
        riskFactors.push(`High-risk transaction purpose: ${transaction_purpose}`);
      }
    }
    
    // 6. Pattern detection (if requested)
    if (analyze_patterns) {
      const patternAnalysis = analyzeTransactionPatterns(
        transaction_id, 
        sender.id, 
        recipient.id, 
        amount,
        related_transactions
      );
      
      riskScore += patternAnalysis.additionalRiskScore;
      riskFactors.push(...patternAnalysis.riskFactors);
    }
    
    // 7. Risk profile adjustment
    const riskProfileMultiplier: Record<string, number> = {
      'low': 0.8,
      'standard': 1.0,
      'high': 1.2
    };
    
    riskScore = riskScore * (riskProfileMultiplier[risk_profile] || 1.0);
    
    // 8. Generate compliance recommendations
    const recommendations = generateComplianceRecommendations(riskScore, riskFactors);
    
    // 9. Determine compliance status with more granular categories
    let complianceStatus;
    if (riskScore < 0.3) {
      complianceStatus = 'COMPLIANT';
    } else if (riskScore < 0.6) {
      complianceStatus = 'REVIEW_REQUIRED';
    } else if (riskScore < 0.8) {
      complianceStatus = 'HIGH_RISK';
    } else {
      complianceStatus = 'POTENTIALLY_NON_COMPLIANT';
    }
    
    // 10. Generate a unique analysis ID for audit trail
    const analysisId = uuidv4();
    
    // Return enhanced analysis result
    return res.status(200).json({
      analysis_id: analysisId,
      transaction_id,
      risk_score: parseFloat(riskScore.toFixed(2)),
      compliance_status: complianceStatus,
      risk_factors: riskFactors,
      recommendations,
      risk_breakdown: {
        amount_risk: amount > 10000 ? (amount > 50000 ? 'high' : 'medium') : 'low',
        jurisdiction_risk: highRiskCountries.includes(sender.country) || highRiskCountries.includes(recipient.country) ? 'high' : 
                          (mediumRiskCountries.includes(sender.country) || mediumRiskCountries.includes(recipient.country) ? 'medium' : 'low'),
        transaction_type_risk: transaction_type === 'international' ? 'medium' : (transaction_type === 'wire' ? 'medium-low' : 'low'),
        entity_risk: highRiskEntities.includes(sender.name) || highRiskEntities.includes(recipient.name) ? 'high' : 'low',
        pattern_risk: analyze_patterns ? (riskScore > 0.5 ? 'high' : 'low') : 'not_analyzed'
      },
      timestamp: new Date().toISOString(),
      audit_trail: {
        analysis_id: analysisId,
        analysis_date: new Date().toISOString(),
        analysis_version: '2.0',
        analyzed_by: 'FinGuard AI System'
      }
    });
  } catch (error) {
    console.error('Error analyzing transaction:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to analyze transaction patterns
function analyzeTransactionPatterns(
  currentTransactionId: string,
  senderId: string,
  recipientId: string,
  amount: number,
  relatedTransactions: any[] = []
): { additionalRiskScore: number; riskFactors: string[] } {
  const riskFactors: string[] = [];
  let additionalRiskScore = 0;
  
  // Combine related transactions with transaction history for analysis
  const allTransactions = [...transactionHistory, ...relatedTransactions];
  
  // Filter transactions involving the same sender or recipient
  const relatedByEntity = allTransactions.filter(
    t => (t.sender?.id === senderId || t.recipient?.id === recipientId) && t.id !== currentTransactionId
  );
  
  // Check for structuring (multiple smaller transactions)
  if (relatedByEntity.length > 2) {
    const last30DaysTransactions = relatedByEntity.filter(
      t => new Date(t.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    if (last30DaysTransactions.length >= 3) {
      const totalAmount = last30DaysTransactions.reduce((sum, t) => sum + t.amount, 0) + amount;
      
      if (totalAmount > 10000 && last30DaysTransactions.every(t => t.amount < 10000)) {
        additionalRiskScore += 0.4;
        riskFactors.push('Potential structuring detected: Multiple transactions below reporting threshold');
      }
    }
  }
  
  // Check for velocity (sudden increase in transaction frequency)
  const last7DaysTransactions = relatedByEntity.filter(
    t => new Date(t.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  
  const previous7DaysTransactions = relatedByEntity.filter(
    t => new Date(t.date) >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) && 
        new Date(t.date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  
  if (last7DaysTransactions.length > 0 && previous7DaysTransactions.length > 0) {
    if (last7DaysTransactions.length >= previous7DaysTransactions.length * 2) {
      additionalRiskScore += 0.2;
      riskFactors.push('Unusual transaction velocity: Significant increase in transaction frequency');
    }
  }
  
  // Check for round amounts (often associated with money laundering)
  if (amount % 1000 === 0 && amount >= 10000) {
    additionalRiskScore += 0.1;
    riskFactors.push('Round amount transaction: Potential indicator of money laundering');
  }
  
  return { additionalRiskScore, riskFactors };
}

// Helper function to generate compliance recommendations
function generateComplianceRecommendations(riskScore: number, riskFactors: string[]): string[] {
  const recommendations: string[] = [];
  
  if (riskScore >= 0.6) {
    recommendations.push('Conduct enhanced due diligence (EDD) on transaction participants');
    recommendations.push('Escalate to compliance officer for review');
  }
  
  if (riskScore >= 0.4) {
    recommendations.push('Verify source of funds documentation');
  }
  
  if (riskFactors.some(factor => factor.includes('High-risk jurisdiction'))) {
    recommendations.push('Perform additional sanctions screening');
  }
  
  if (riskFactors.some(factor => factor.includes('structuring'))) {
    recommendations.push('File Suspicious Activity Report (SAR)');
  }
  
  if (riskFactors.some(factor => factor.includes('velocity'))) {
    recommendations.push('Review recent transaction history for additional suspicious patterns');
  }
  
  return recommendations;
}
