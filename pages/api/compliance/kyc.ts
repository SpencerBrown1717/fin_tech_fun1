import { NextApiRequest, NextApiResponse } from 'next';

// Verify customer KYC API endpoint
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customer_id, name, date_of_birth, address, document_type, document_id } = req.body;
    
    // Validation
    if (!customer_id || !name || !date_of_birth || !address || !document_type || !document_id) {
      return res.status(400).json({ error: 'Missing required customer parameters' });
    }
    
    // Verification logic (simplified for demo)
    const verificationChecks = {
      identity_verified: true,
      address_verified: true,
      document_verified: true,
      sanctions_check: 'passed',
      pep_check: 'not_found'
    };
    
    // Determine verification level based on provided information
    let verificationLevel = 'STANDARD';
    
    if (document_type === 'passport' || document_type === 'national_id') {
      verificationLevel = 'ENHANCED';
    }
    
    if (req.body.additional_documents && req.body.additional_documents.length > 1) {
      verificationLevel = 'ENHANCED';
    }
    
    // Return verification result
    return res.status(200).json({
      customer_id,
      kyc_status: 'VERIFIED',
      verification_level: verificationLevel,
      verification_checks: verificationChecks,
      expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error verifying customer KYC:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
