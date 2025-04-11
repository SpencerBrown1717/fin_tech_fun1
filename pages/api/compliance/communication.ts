import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

// Mock database for communication analysis history
const communicationAnalysisHistory: Record<string, any>[] = [];

// Analyze communication API endpoint
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      communication_id, 
      content, 
      sender, 
      recipient, 
      channel, 
      timestamp = new Date().toISOString(),
      metadata = {},
      context = {},
      previous_communications = [],
      analyze_sentiment = true,
      detect_intent = true,
      check_regulatory_compliance = true
    } = req.body;
    
    // Validation
    if (!communication_id || !content || !sender || !recipient || !channel) {
      return res.status(400).json({ error: 'Missing required communication parameters' });
    }
    
    // Analysis logic (enhanced)
    const flaggedTerms: {term: string; context: string; severity: string}[] = [];
    const sensitiveDataPatterns: {type: string; count: number; redacted: boolean}[] = [];
    const regulatoryIssues: {regulation: string; description: string; severity: string}[] = [];
    const sentimentAnalysis = analyze_sentiment ? analyzeSentiment(content) : null;
    const intentAnalysis = detect_intent ? detectIntent(content) : null;
    const contextualAnalysis = analyzeContext(content, context, previous_communications);
    
    let complianceStatus = 'COMPLIANT';
    let riskScore = 0;
    
    // 1. Check for flagged terms with context and severity
    const flaggedTermsMap: Record<string, {severity: string; category: string}> = {
      'guarantee': {severity: 'medium', category: 'investment_advice'},
      'guaranteed return': {severity: 'high', category: 'investment_advice'},
      'risk-free': {severity: 'high', category: 'investment_advice'},
      'insider': {severity: 'high', category: 'market_abuse'},
      'off the record': {severity: 'medium', category: 'disclosure'},
      'unofficial': {severity: 'medium', category: 'disclosure'},
      'between us': {severity: 'medium', category: 'disclosure'},
      'sure thing': {severity: 'high', category: 'investment_advice'},
      'guaranteed profit': {severity: 'high', category: 'investment_advice'},
      'no risk': {severity: 'high', category: 'investment_advice'},
      'inside information': {severity: 'high', category: 'market_abuse'},
      'confidential information': {severity: 'medium', category: 'disclosure'},
      'not financial advice': {severity: 'low', category: 'disclaimer'},
      'avoid taxes': {severity: 'high', category: 'tax_evasion'},
      'tax-free': {severity: 'medium', category: 'tax_advice'},
      'circumvent': {severity: 'medium', category: 'regulatory_avoidance'},
      'bypass regulation': {severity: 'high', category: 'regulatory_avoidance'},
      'under the table': {severity: 'high', category: 'illicit_activity'},
      'cash only': {severity: 'medium', category: 'money_laundering'},
      'no paperwork': {severity: 'medium', category: 'regulatory_avoidance'}
    };
    
    // Enhanced flagged term detection with context
    for (const [term, info] of Object.entries(flaggedTermsMap)) {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        // Get surrounding context (20 chars before and after)
        const termIndex = content.toLowerCase().indexOf(term.toLowerCase());
        const startIndex = Math.max(0, termIndex - 20);
        const endIndex = Math.min(content.length, termIndex + term.length + 20);
        const termContext = content.substring(startIndex, endIndex);
        
        flaggedTerms.push({
          term,
          context: termContext,
          severity: info.severity
        });
        
        // Adjust risk score based on severity
        if (info.severity === 'high') {
          riskScore += 0.3;
        } else if (info.severity === 'medium') {
          riskScore += 0.15;
        } else {
          riskScore += 0.05;
        }
      }
    }
    
    // 2. Enhanced sensitive data pattern detection
    const sensitivePatterns = [
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/, type: 'SSN', severity: 'high' },
      { pattern: /\b\d{16}\b/, type: 'Credit Card', severity: 'high' },
      { pattern: /password|credentials|login/i, type: 'Authentication Data', severity: 'medium' },
      { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, type: 'Email Address', severity: 'low' },
      { pattern: /\b\d{10}\b/, type: 'Phone Number', severity: 'low' },
      { pattern: /\b\d{9}\b/, type: 'Account Number', severity: 'medium' },
      { pattern: /passport\s+number|passport\s+#|passport\s+no/i, type: 'Passport Number', severity: 'high' },
      { pattern: /driver'?s?\s+licen[cs]e|driving\s+licen[cs]e/i, type: 'Driver\'s License', severity: 'high' },
      { pattern: /\bpin\b|\bpins\b|security\s+code/i, type: 'PIN/Security Code', severity: 'high' },
      { pattern: /\bdob\b|date\s+of\s+birth|birth\s+date/i, type: 'Date of Birth', severity: 'medium' }
    ];
    
    for (const pattern of sensitivePatterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        sensitiveDataPatterns.push({
          type: pattern.type,
          count: matches.length,
          redacted: true
        });
        
        // Adjust risk score based on severity
        if (pattern.severity === 'high') {
          riskScore += 0.25;
        } else if (pattern.severity === 'medium') {
          riskScore += 0.15;
        } else {
          riskScore += 0.05;
        }
      }
    }
    
    // 3. Regulatory compliance checking
    if (check_regulatory_compliance) {
      const regulatoryChecks = checkRegulatoryCompliance(content, channel, sender, recipient);
      regulatoryIssues.push(...regulatoryChecks.issues);
      riskScore += regulatoryChecks.additionalRiskScore;
    }
    
    // 4. Sentiment analysis impact
    if (sentimentAnalysis) {
      if (sentimentAnalysis.sentiment === 'negative' && sentimentAnalysis.score < -0.7) {
        riskScore += 0.1;
      }
      
      if (sentimentAnalysis.emotions.anger > 0.6 || sentimentAnalysis.emotions.frustration > 0.6) {
        riskScore += 0.15;
      }
    }
    
    // 5. Intent analysis impact
    if (intentAnalysis && ['persuasion', 'pressure', 'deception'].includes(intentAnalysis.primary_intent)) {
      riskScore += 0.2;
    }
    
    // 6. Contextual analysis impact
    if (contextualAnalysis.escalation_detected) {
      riskScore += 0.15;
    }
    
    if (contextualAnalysis.topic_shift_suspicious) {
      riskScore += 0.1;
    }
    
    // 7. Channel-specific risk adjustment
    const channelRiskMultiplier: Record<string, number> = {
      'email': 1.0,
      'chat': 1.1,
      'phone': 1.2,
      'in_person': 1.3,
      'social_media': 1.4,
      'encrypted_messaging': 1.5
    };
    
    riskScore = riskScore * (channelRiskMultiplier[channel] || 1.0);
    
    // 8. Determine compliance status with more granular categories
    if (riskScore < 0.3) {
      complianceStatus = 'COMPLIANT';
    } else if (riskScore < 0.6) {
      complianceStatus = 'REVIEW_REQUIRED';
    } else if (riskScore < 0.8) {
      complianceStatus = 'HIGH_RISK';
    } else {
      complianceStatus = 'POTENTIALLY_NON_COMPLIANT';
    }
    
    // 9. Generate recommendations
    const recommendations = generateCommunicationRecommendations(
      riskScore, 
      flaggedTerms, 
      sensitiveDataPatterns, 
      regulatoryIssues,
      sentimentAnalysis,
      intentAnalysis
    );
    
    // 10. Generate a unique analysis ID for audit trail
    const analysisId = uuidv4();
    
    // Store analysis record
    const analysisRecord = {
      analysis_id: analysisId,
      communication_id,
      analysis_date: new Date().toISOString(),
      compliance_status: complianceStatus,
      risk_score: parseFloat(riskScore.toFixed(2)),
      flagged_terms: flaggedTerms.map(item => item.term),
      sensitive_data_detected: sensitiveDataPatterns.map(item => item.type)
    };
    
    communicationAnalysisHistory.push(analysisRecord);
    
    // Return enhanced analysis result
    return res.status(200).json({
      analysis_id: analysisId,
      communication_id,
      compliance_status: complianceStatus,
      risk_score: parseFloat(riskScore.toFixed(2)),
      flagged_terms: flaggedTerms,
      sensitive_data_detected: sensitiveDataPatterns,
      regulatory_issues: regulatoryIssues,
      sentiment_analysis: sentimentAnalysis,
      intent_analysis: intentAnalysis,
      contextual_analysis: contextualAnalysis,
      recommendations,
      channel,
      risk_breakdown: {
        flagged_terms_risk: flaggedTerms.length > 0 ? (flaggedTerms.some(t => t.severity === 'high') ? 'high' : 'medium') : 'low',
        sensitive_data_risk: sensitiveDataPatterns.length > 0 ? 'high' : 'low',
        regulatory_risk: regulatoryIssues.length > 0 ? 'high' : 'low',
        sentiment_risk: sentimentAnalysis ? (sentimentAnalysis.sentiment === 'negative' ? 'medium' : 'low') : 'not_analyzed',
        intent_risk: intentAnalysis ? (intentAnalysis.confidence > 0.7 ? 'high' : 'medium') : 'not_analyzed',
        context_risk: contextualAnalysis.escalation_detected ? 'high' : 'low'
      },
      analysis_timestamp: new Date().toISOString(),
      audit_trail: {
        analysis_id: analysisId,
        analysis_date: new Date().toISOString(),
        analysis_version: '2.0',
        analyzed_by: 'FinGuard AI System'
      }
    });
  } catch (error) {
    console.error('Error analyzing communication:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to analyze sentiment
function analyzeSentiment(content: string): {
  sentiment: string;
  score: number;
  emotions: Record<string, number>;
} {
  // In a real implementation, this would use a proper NLP library or API
  // For demo purposes, we'll use a simple keyword-based approach
  
  const positiveWords = ['happy', 'glad', 'pleased', 'satisfied', 'excellent', 'great', 'good'];
  const negativeWords = ['angry', 'upset', 'disappointed', 'frustrated', 'bad', 'terrible', 'poor'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  const contentLower = content.toLowerCase();
  
  for (const word of positiveWords) {
    if (contentLower.includes(word)) {
      positiveCount++;
    }
  }
  
  for (const word of negativeWords) {
    if (contentLower.includes(word)) {
      negativeCount++;
    }
  }
  
  const totalWords = content.split(/\s+/).length;
  const sentimentScore = (positiveCount - negativeCount) / Math.max(1, Math.min(totalWords, 20));
  
  // Detect emotions (simplified)
  const emotions: Record<string, number> = {
    happiness: 0,
    anger: 0,
    frustration: 0,
    urgency: 0,
    confusion: 0
  };
  
  // Simple emotion detection
  if (contentLower.includes('happy') || contentLower.includes('glad')) emotions.happiness += 0.6;
  if (contentLower.includes('angry') || contentLower.includes('mad')) emotions.anger += 0.7;
  if (contentLower.includes('frustrated') || contentLower.includes('annoyed')) emotions.frustration += 0.6;
  if (contentLower.includes('urgent') || contentLower.includes('immediately')) emotions.urgency += 0.7;
  if (contentLower.includes('confused') || contentLower.includes('unclear')) emotions.confusion += 0.6;
  
  // Exclamation marks indicate emotion intensity
  const exclamationCount = (content.match(/!/g) || []).length;
  if (exclamationCount > 0) {
    emotions.urgency += Math.min(0.3, exclamationCount * 0.1);
    emotions.anger += Math.min(0.3, exclamationCount * 0.05);
  }
  
  // ALL CAPS indicates shouting/emotion
  const capsWords = content.split(/\s+/).filter(word => word.length > 3 && word === word.toUpperCase()).length;
  if (capsWords > 0) {
    emotions.anger += Math.min(0.4, capsWords * 0.1);
    emotions.urgency += Math.min(0.3, capsWords * 0.1);
  }
  
  let sentiment: string;
  if (sentimentScore > 0.2) {
    sentiment = 'positive';
  } else if (sentimentScore < -0.2) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }
  
  return {
    sentiment,
    score: sentimentScore,
    emotions
  };
}

// Helper function to detect intent
function detectIntent(content: string): {
  primary_intent: string;
  secondary_intent: string | null;
  confidence: number;
} {
  // In a real implementation, this would use a proper NLP library or API
  // For demo purposes, we'll use a simple rule-based approach
  
  const contentLower = content.toLowerCase();
  
  const intentPatterns: Record<string, RegExp[]> = {
    'information_seeking': [/can you tell me|how do i|what is|where can i|when will/i],
    'complaint': [/complaint|dissatisfied|unhappy with|problem with|issue with/i],
    'request': [/please|could you|would you|i need|i want|i'd like/i],
    'persuasion': [/you should|you need to|you must|consider|think about/i],
    'pressure': [/urgent|immediately|as soon as possible|right away|deadline|limited time/i],
    'deception': [/between us|don't tell|keep this|secret|confidential|off the record/i],
    'disclosure': [/i'm telling you|just so you know|fyi|for your information|heads up/i],
    'instruction': [/follow these steps|do this|instructions|procedure is|process is/i]
  };
  
  const matches: Record<string, number> = {};
  
  // Check each intent pattern
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    matches[intent] = 0;
    for (const pattern of patterns) {
      const matchCount = (contentLower.match(pattern) || []).length;
      matches[intent] += matchCount;
    }
  }
  
  // Find primary and secondary intents
  let primaryIntent = 'neutral';
  let secondaryIntent = null;
  let maxMatches = 0;
  let secondMaxMatches = 0;
  
  for (const [intent, count] of Object.entries(matches)) {
    if (count > maxMatches) {
      secondaryIntent = primaryIntent;
      secondMaxMatches = maxMatches;
      primaryIntent = intent;
      maxMatches = count;
    } else if (count > secondMaxMatches) {
      secondaryIntent = intent;
      secondMaxMatches = count;
    }
  }
  
  // Calculate confidence
  const totalMatches = Object.values(matches).reduce((sum, count) => sum + count, 0);
  const confidence = totalMatches > 0 ? maxMatches / totalMatches : 0;
  
  return {
    primary_intent: primaryIntent,
    secondary_intent: secondaryIntent,
    confidence
  };
}

// Helper function to analyze context
function analyzeContext(
  content: string,
  context: Record<string, any>,
  previousCommunications: any[]
): {
  escalation_detected: boolean;
  topic_shift_suspicious: boolean;
  relationship_duration: string;
  communication_frequency: string;
} {
  // Default values
  let escalationDetected = false;
  let topicShiftSuspicious = false;
  let relationshipDuration = 'unknown';
  let communicationFrequency = 'low';
  
  // Check for escalation in tone/urgency compared to previous communications
  if (previousCommunications && previousCommunications.length > 0) {
    // Sort by timestamp
    const sortedComms = [...previousCommunications].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Check the most recent communications
    const recentComms = sortedComms.slice(-3);
    
    // Look for escalation patterns
    const urgencyTerms = ['urgent', 'immediately', 'asap', 'right away', 'now'];
    const currentHasUrgency = urgencyTerms.some(term => content.toLowerCase().includes(term));
    
    if (currentHasUrgency) {
      const previousHadUrgency = recentComms.some(comm => 
        urgencyTerms.some(term => comm.content.toLowerCase().includes(term))
      );
      
      if (!previousHadUrgency) {
        escalationDetected = true;
      }
    }
    
    // Analyze relationship duration and communication frequency
    if (sortedComms.length > 0) {
      const firstCommDate = new Date(sortedComms[0].timestamp);
      const lastCommDate = new Date(sortedComms[sortedComms.length - 1].timestamp);
      const currentDate = new Date();
      
      const durationDays = Math.floor((currentDate.getTime() - firstCommDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (durationDays < 7) {
        relationshipDuration = 'very_short';
      } else if (durationDays < 30) {
        relationshipDuration = 'short';
      } else if (durationDays < 180) {
        relationshipDuration = 'medium';
      } else {
        relationshipDuration = 'long';
      }
      
      // Calculate frequency
      const commCount = sortedComms.length;
      const frequencyPerDay = commCount / Math.max(1, durationDays);
      
      if (frequencyPerDay < 0.1) {
        communicationFrequency = 'very_low';
      } else if (frequencyPerDay < 0.5) {
        communicationFrequency = 'low';
      } else if (frequencyPerDay < 2) {
        communicationFrequency = 'medium';
      } else {
        communicationFrequency = 'high';
      }
      
      // Detect suspicious topic shifts
      if (recentComms.length > 0) {
        const financialTerms = ['money', 'payment', 'transfer', 'account', 'bank', 'invest'];
        const currentHasFinancial = financialTerms.some(term => content.toLowerCase().includes(term));
        
        const previousHadFinancial = recentComms.some(comm => 
          financialTerms.some(term => comm.content.toLowerCase().includes(term))
        );
        
        if (currentHasFinancial && !previousHadFinancial && relationshipDuration === 'very_short') {
          topicShiftSuspicious = true;
        }
      }
    }
  }
  
  return {
    escalation_detected: escalationDetected,
    topic_shift_suspicious: topicShiftSuspicious,
    relationship_duration: relationshipDuration,
    communication_frequency: communicationFrequency
  };
}

// Helper function to check regulatory compliance
function checkRegulatoryCompliance(
  content: string,
  channel: string,
  sender: any,
  recipient: any
): {
  issues: {regulation: string; description: string; severity: string}[];
  additionalRiskScore: number;
} {
  const issues: {regulation: string; description: string; severity: string}[] = [];
  let additionalRiskScore = 0;
  
  // Check for investment advice without disclaimers
  if (/invest|investment|stock|bond|fund|portfolio/i.test(content)) {
    if (!/not financial advice|not investment advice|consult.*advisor|seek professional|disclaimer/i.test(content)) {
      issues.push({
        regulation: 'Investment Advisers Act',
        description: 'Potential unregistered investment advice without proper disclaimers',
        severity: 'high'
      });
      additionalRiskScore += 0.3;
    }
  }
  
  // Check for potential insider trading discussions
  if (/insider|non-public|confidential information|before announcement|not yet public/i.test(content)) {
    issues.push({
      regulation: 'Securities Exchange Act',
      description: 'Potential discussion of material non-public information',
      severity: 'critical'
    });
    additionalRiskScore += 0.5;
  }
  
  // Check for privacy violations
  if (channel === 'email' || channel === 'chat') {
    if (/ssn|social security|credit card|account number/i.test(content)) {
      issues.push({
        regulation: 'Gramm-Leach-Bliley Act',
        description: 'Sharing of protected financial information over insecure channel',
        severity: 'high'
      });
      additionalRiskScore += 0.3;
    }
  }
  
  // Check for potential market manipulation
  if (/pump|dump|artificially|manipulate|inflate price|drive up stock/i.test(content)) {
    issues.push({
      regulation: 'Market Manipulation Regulations',
      description: 'Potential discussion of market manipulation tactics',
      severity: 'critical'
    });
    additionalRiskScore += 0.5;
  }
  
  // Check for potential money laundering discussions
  if (/launder|clean money|offshore|shell company|hide (funds|money|assets)/i.test(content)) {
    issues.push({
      regulation: 'Bank Secrecy Act / Anti-Money Laundering',
      description: 'Potential discussion of money laundering activities',
      severity: 'critical'
    });
    additionalRiskScore += 0.5;
  }
  
  return {
    issues,
    additionalRiskScore
  };
}

// Helper function to generate communication recommendations
function generateCommunicationRecommendations(
  riskScore: number,
  flaggedTerms: {term: string; context: string; severity: string}[],
  sensitiveDataPatterns: {type: string; count: number; redacted: boolean}[],
  regulatoryIssues: {regulation: string; description: string; severity: string}[],
  sentimentAnalysis: {sentiment: string; score: number; emotions: Record<string, number>} | null,
  intentAnalysis: {primary_intent: string; secondary_intent: string | null; confidence: number} | null
): string[] {
  const recommendations: string[] = [];
  
  // High risk score recommendations
  if (riskScore >= 0.6) {
    recommendations.push('Escalate to compliance officer for review');
    recommendations.push('Document communication in compliance monitoring system');
  }
  
  // Flagged terms recommendations
  if (flaggedTerms.some(term => term.severity === 'high')) {
    recommendations.push('Review all communications with this customer for similar high-risk language');
    recommendations.push('Consider refresher training for staff on prohibited language');
  }
  
  // Sensitive data recommendations
  if (sensitiveDataPatterns.length > 0) {
    recommendations.push('Ensure all sensitive data is properly redacted in records');
    recommendations.push('Remind staff about secure communication channels for sensitive information');
  }
  
  // Regulatory issue recommendations
  for (const issue of regulatoryIssues) {
    if (issue.severity === 'critical') {
      recommendations.push(`Immediate action required: ${issue.description}`);
    } else if (issue.severity === 'high') {
      recommendations.push(`High priority: Address ${issue.regulation} compliance concerns`);
    }
  }
  
  // Sentiment-based recommendations
  if (sentimentAnalysis && sentimentAnalysis.sentiment === 'negative' && sentimentAnalysis.score < -0.5) {
    recommendations.push('Customer appears dissatisfied - consider service recovery actions');
  }
  
  if (sentimentAnalysis && sentimentAnalysis.emotions.anger > 0.6) {
    recommendations.push('Communication shows signs of customer frustration - prioritize response');
  }
  
  // Intent-based recommendations
  if (intentAnalysis && intentAnalysis.primary_intent === 'complaint' && intentAnalysis.confidence > 0.6) {
    recommendations.push('Treat as formal complaint and follow complaint handling procedures');
  }
  
  if (intentAnalysis && intentAnalysis.primary_intent === 'pressure' && intentAnalysis.confidence > 0.6) {
    recommendations.push('Customer may be applying undue pressure - ensure staff follow standard procedures');
  }
  
  return recommendations;
}
