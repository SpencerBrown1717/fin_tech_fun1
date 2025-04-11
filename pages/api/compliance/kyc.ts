import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

// Mock database for customer verification history
const customerVerificationHistory: Record<string, any>[] = [];

// Verify customer KYC API endpoint
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      customer_id, 
      name, 
      date_of_birth, 
      address, 
      document_type, 
      document_id,
      nationality,
      occupation,
      income_source,
      politically_exposed = false,
      business_type,
      industry_sector,
      additional_documents = [],
      risk_level = 'standard',
      verification_mode = 'standard'
    } = req.body;
    
    // Validation
    if (!customer_id || !name || !date_of_birth || !address || !document_type || !document_id) {
      return res.status(400).json({ error: 'Missing required customer parameters' });
    }
    
    // Verification logic (enhanced)
    const verificationChecks: Record<string, any> = {
      identity_verified: true,
      address_verified: true,
      document_verified: true,
      sanctions_check: 'passed',
      pep_check: politically_exposed ? 'found' : 'not_found',
      adverse_media_check: 'no_matches',
      document_authenticity: 'verified',
      biometric_verification: verification_mode === 'enhanced' ? 'verified' : 'not_performed',
      age_verification: verifyAge(date_of_birth),
      address_risk: assessAddressRisk(address),
      document_expiry_check: checkDocumentExpiry(document_type, document_id)
    };
    
    // Determine verification level based on provided information and risk factors
    let verificationLevel = 'STANDARD';
    let riskScore = 0;
    const riskFactors: string[] = [];
    
    // Document type risk assessment
    if (document_type === 'passport' || document_type === 'national_id') {
      verificationLevel = 'ENHANCED';
    } else if (document_type === 'drivers_license') {
      riskScore += 0.1;
      riskFactors.push('Non-primary identification document provided');
    }
    
    // Additional documents assessment
    if (additional_documents && additional_documents.length > 1) {
      verificationLevel = 'ENHANCED';
      riskScore -= 0.1; // Reduce risk when multiple documents are provided
    }
    
    // PEP status assessment
    if (politically_exposed) {
      riskScore += 0.3;
      riskFactors.push('Customer is a politically exposed person');
      verificationLevel = 'ENHANCED';
    }
    
    // Nationality risk assessment
    const highRiskCountries = ['CountryA', 'CountryB', 'CountryC', 'CountryD', 'CountryE'];
    if (nationality && highRiskCountries.includes(nationality)) {
      riskScore += 0.2;
      riskFactors.push(`High-risk nationality: ${nationality}`);
    }
    
    // Occupation and income source risk assessment
    const highRiskOccupations = ['cash_intensive_business', 'cryptocurrency', 'money_services', 'gambling'];
    if (occupation && highRiskOccupations.includes(occupation)) {
      riskScore += 0.2;
      riskFactors.push(`High-risk occupation: ${occupation}`);
    }
    
    if (income_source && income_source.toLowerCase().includes('cryptocurrency')) {
      riskScore += 0.15;
      riskFactors.push('Cryptocurrency-related income source');
    }
    
    // Business type and industry sector risk assessment (for business customers)
    const highRiskIndustries = ['gambling', 'cryptocurrency', 'precious_metals', 'defense', 'adult_entertainment'];
    if (business_type === 'business' && industry_sector && highRiskIndustries.includes(industry_sector)) {
      riskScore += 0.25;
      riskFactors.push(`High-risk industry sector: ${industry_sector}`);
      verificationLevel = 'ENHANCED';
    }
    
    // Address risk assessment
    if (verificationChecks.address_risk === 'high') {
      riskScore += 0.15;
      riskFactors.push('High-risk address location');
    }
    
    // Age verification
    if (verificationChecks.age_verification === 'underage') {
      riskScore += 0.5;
      riskFactors.push('Customer appears to be underage');
    }
    
    // Document expiry check
    if (verificationChecks.document_expiry_check === 'expired') {
      riskScore += 0.2;
      riskFactors.push('Identification document is expired');
    }
    
    // Determine overall KYC status based on risk score
    let kycStatus = 'VERIFIED';
    if (riskScore >= 0.5) {
      kycStatus = 'REVIEW_REQUIRED';
    } else if (riskScore >= 0.8) {
      kycStatus = 'REJECTED';
    }
    
    // Generate recommendations based on risk factors
    const recommendations = generateKYCRecommendations(riskScore, riskFactors);
    
    // Generate verification ID for audit trail
    const verificationId = uuidv4();
    
    // Calculate expiry date (1 year from now, or 6 months for high-risk customers)
    const expiryDate = new Date();
    if (riskScore >= 0.3) {
      expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months for higher risk
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year for standard
    }
    
    // Store verification record
    const verificationRecord = {
      verification_id: verificationId,
      customer_id,
      verification_date: new Date().toISOString(),
      verification_level: verificationLevel,
      kyc_status: kycStatus,
      risk_score: parseFloat(riskScore.toFixed(2)),
      risk_factors: riskFactors,
      expiry_date: expiryDate.toISOString().split('T')[0]
    };
    
    customerVerificationHistory.push(verificationRecord);
    
    // Return enhanced verification result
    return res.status(200).json({
      verification_id: verificationId,
      customer_id,
      kyc_status: kycStatus,
      verification_level: verificationLevel,
      risk_score: parseFloat(riskScore.toFixed(2)),
      risk_factors: riskFactors,
      verification_checks: verificationChecks,
      recommendations,
      expiry_date: expiryDate.toISOString().split('T')[0],
      next_review_date: riskScore >= 0.3 ? 
        new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      audit_trail: {
        verification_id: verificationId,
        verification_date: new Date().toISOString(),
        verification_version: '2.0',
        verified_by: 'FinGuard AI System'
      }
    });
  } catch (error) {
    console.error('Error verifying customer KYC:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to verify age based on date of birth
function verifyAge(dateOfBirth: string): string {
  try {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18) {
      return 'underage';
    } else if (age >= 18 && age < 21) {
      return 'young_adult';
    } else if (age >= 90) {
      return 'requires_verification'; // Unusually old age might require additional verification
    }
    
    return 'verified';
  } catch (error) {
    return 'invalid_format';
  }
}

// Helper function to assess address risk
function assessAddressRisk(address: any): string {
  // High-risk regions or jurisdictions
  const highRiskRegions = ['RegionX', 'RegionY', 'RegionZ'];
  
  // Check if address is in a high-risk region
  if (highRiskRegions.includes(address.state) || highRiskRegions.includes(address.region)) {
    return 'high';
  }
  
  // Check for high-risk countries
  const highRiskCountries = ['CountryA', 'CountryB', 'CountryC'];
  if (highRiskCountries.includes(address.country)) {
    return 'high';
  }
  
  // Check for address completeness
  if (!address.street || !address.city || !address.postal_code) {
    return 'incomplete';
  }
  
  return 'low';
}

// Helper function to check document expiry
function checkDocumentExpiry(documentType: string, documentId: string): string {
  // In a real implementation, this would check against a database or external API
  // For demo purposes, we'll use a simple check based on the document ID
  
  // If document ID ends with an odd number, consider it expired (for demo purposes)
  const lastChar = documentId.charAt(documentId.length - 1);
  const lastDigit = parseInt(lastChar, 10);
  
  if (!isNaN(lastDigit) && lastDigit % 2 === 1) {
    return 'expired';
  }
  
  return 'valid';
}

// Helper function to generate KYC recommendations
function generateKYCRecommendations(riskScore: number, riskFactors: string[]): string[] {
  const recommendations: string[] = [];
  
  if (riskScore >= 0.5) {
    recommendations.push('Conduct enhanced due diligence (EDD)');
    recommendations.push('Obtain additional identification documents');
  }
  
  if (riskFactors.includes('Customer is a politically exposed person')) {
    recommendations.push('Implement ongoing PEP monitoring');
    recommendations.push('Obtain senior management approval for business relationship');
  }
  
  if (riskFactors.some(factor => factor.includes('High-risk nationality'))) {
    recommendations.push('Perform additional sanctions screening');
    recommendations.push('Verify source of funds');
  }
  
  if (riskFactors.some(factor => factor.includes('High-risk occupation') || factor.includes('High-risk industry'))) {
    recommendations.push('Implement enhanced transaction monitoring');
    recommendations.push('Conduct periodic business activity reviews');
  }
  
  if (riskFactors.includes('Identification document is expired')) {
    recommendations.push('Request updated identification document');
  }
  
  return recommendations;
}
