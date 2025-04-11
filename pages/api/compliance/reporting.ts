import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

// Mock database for compliance reports
const complianceReportsDB: Record<string, any>[] = [];

// Mock database for report templates
const reportTemplatesDB: Record<string, any>[] = [
  {
    id: 'template-001',
    name: 'Suspicious Activity Report (SAR)',
    type: 'regulatory_filing',
    description: 'Template for filing suspicious activity reports with regulatory authorities',
    sections: [
      { id: 'filing_institution', name: 'Filing Institution Information', required: true },
      { id: 'subject', name: 'Subject Information', required: true },
      { id: 'suspicious_activity', name: 'Suspicious Activity Information', required: true },
      { id: 'transaction_details', name: 'Transaction Details', required: true },
      { id: 'narrative', name: 'Suspicious Activity Narrative', required: true },
      { id: 'filing_contact', name: 'Filing Contact Information', required: true }
    ],
    required_fields: [
      'institution_name', 'institution_id', 'filing_date', 'subject_name', 
      'subject_id_type', 'subject_id_number', 'activity_start_date', 
      'activity_end_date', 'suspicious_activity_type', 'amount', 
      'transaction_dates', 'narrative_description', 'contact_name', 
      'contact_phone', 'contact_email'
    ],
    target_authorities: ['FinCEN', 'NCA', 'AUSTRAC'],
    filing_frequency: 'as_needed',
    created_at: '2023-01-15T00:00:00Z'
  },
  {
    id: 'template-002',
    name: 'Currency Transaction Report (CTR)',
    type: 'regulatory_filing',
    description: 'Template for reporting currency transactions exceeding regulatory thresholds',
    sections: [
      { id: 'filing_institution', name: 'Filing Institution Information', required: true },
      { id: 'transaction', name: 'Transaction Information', required: true },
      { id: 'person_involved', name: 'Person(s) Involved', required: true },
      { id: 'account_information', name: 'Account Information', required: false }
    ],
    required_fields: [
      'institution_name', 'institution_id', 'filing_date', 'transaction_date',
      'transaction_amount', 'transaction_type', 'person_name', 'person_id_type',
      'person_id_number', 'person_role'
    ],
    target_authorities: ['FinCEN', 'AUSTRAC'],
    filing_frequency: 'as_needed',
    created_at: '2023-01-20T00:00:00Z'
  },
  {
    id: 'template-003',
    name: 'Quarterly AML Compliance Report',
    type: 'internal_compliance',
    description: 'Internal quarterly report on AML compliance activities and metrics',
    sections: [
      { id: 'executive_summary', name: 'Executive Summary', required: true },
      { id: 'risk_assessment', name: 'Risk Assessment Update', required: true },
      { id: 'monitoring_results', name: 'Transaction Monitoring Results', required: true },
      { id: 'case_metrics', name: 'Case Investigation Metrics', required: true },
      { id: 'regulatory_filings', name: 'Regulatory Filings Summary', required: true },
      { id: 'training', name: 'Training and Awareness', required: false },
      { id: 'issues', name: 'Issues and Remediation', required: true },
      { id: 'recommendations', name: 'Recommendations', required: true }
    ],
    required_fields: [
      'reporting_period_start', 'reporting_period_end', 'prepared_by',
      'approval_date', 'risk_rating', 'alert_count', 'case_count',
      'sar_count', 'ctr_count', 'high_risk_customers_count'
    ],
    target_authorities: [],
    filing_frequency: 'quarterly',
    created_at: '2023-02-10T00:00:00Z'
  }
];

// Mock database for compliance analytics
const complianceAnalyticsDB: Record<string, any> = {
  transaction_monitoring: {
    alerts_by_type: {
      'structuring': 45,
      'unusual_volume': 78,
      'high_risk_jurisdiction': 32,
      'rapid_movement': 56,
      'unusual_pattern': 67
    },
    alerts_by_risk: {
      'high': 87,
      'medium': 124,
      'low': 67
    },
    false_positive_rate: 0.68,
    true_positive_rate: 0.32,
    average_resolution_time: 3.2, // days
    pending_alerts: 43
  },
  kyc_verification: {
    verifications_by_risk: {
      'high': 34,
      'medium': 156,
      'low': 423
    },
    rejection_rate: 0.08,
    average_completion_time: 1.4, // days
    incomplete_verifications: 28
  },
  communication_monitoring: {
    flagged_communications: 67,
    by_channel: {
      'email': 34,
      'chat': 22,
      'phone': 11
    },
    by_severity: {
      'high': 12,
      'medium': 35,
      'low': 20
    }
  },
  regulatory_filings: {
    sar_filings: 18,
    ctr_filings: 145,
    other_filings: 23,
    late_filings: 2,
    rejected_filings: 1
  }
};

// Compliance reporting API endpoint
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      if (req.query.report_id) {
        return getReportById(req, res);
      } else if (req.query.analytics) {
        return getComplianceAnalytics(req, res);
      } else if (req.query.templates) {
        return getReportTemplates(req, res);
      } else {
        return getReports(req, res);
      }
    case 'POST':
      return generateReport(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Get all compliance reports with filtering
 */
function getReports(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      report_type,
      date_from,
      date_to,
      status,
      created_by,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Start with all reports
    let filteredReports = [...complianceReportsDB];

    // Apply filters
    if (report_type) {
      filteredReports = filteredReports.filter(report => report.report_type === report_type);
    }

    if (date_from) {
      const fromDate = new Date(date_from as string);
      filteredReports = filteredReports.filter(report => 
        new Date(report.created_at) >= fromDate
      );
    }

    if (date_to) {
      const toDate = new Date(date_to as string);
      filteredReports = filteredReports.filter(report => 
        new Date(report.created_at) <= toDate
      );
    }

    if (status) {
      filteredReports = filteredReports.filter(report => report.status === status);
    }

    if (created_by) {
      filteredReports = filteredReports.filter(report => report.created_by === created_by);
    }

    // Apply sorting
    filteredReports.sort((a, b) => {
      const sortField = sort_by as string;
      
      if (sort_order === 'asc') {
        return a[sortField] < b[sortField] ? -1 : 1;
      } else {
        return a[sortField] > b[sortField] ? -1 : 1;
      }
    });

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedReports = filteredReports.slice(startIndex, endIndex);

    // Calculate metadata
    const totalReports = filteredReports.length;
    const totalPages = Math.ceil(totalReports / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    // Generate unique request ID for tracking
    const requestId = uuidv4();

    // Return response with metadata
    return res.status(200).json({
      request_id: requestId,
      metadata: {
        total_reports: totalReports,
        total_pages: totalPages,
        current_page: pageNum,
        limit: limitNum,
        has_next_page: hasNextPage,
        has_previous_page: hasPreviousPage
      },
      reports: paginatedReports,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching compliance reports:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a specific report by ID
 */
function getReportById(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { report_id } = req.query;

    if (!report_id) {
      return res.status(400).json({ error: 'Missing report_id parameter' });
    }

    const report = complianceReportsDB.find(r => r.id === report_id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.status(200).json({
      report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get available report templates
 */
function getReportTemplates(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { type } = req.query;

    let templates = [...reportTemplatesDB];

    if (type) {
      templates = templates.filter(template => template.type === type);
    }

    return res.status(200).json({
      templates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching report templates:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get compliance analytics data
 */
function getComplianceAnalytics(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { category, date_from, date_to, comparison } = req.query;

    // In a real implementation, we would filter analytics by date range
    // and calculate comparison with previous periods
    
    let analyticsData: any = { ...complianceAnalyticsDB };

    if (category && typeof category === 'string' && complianceAnalyticsDB[category]) {
      analyticsData = { [category]: complianceAnalyticsDB[category] };
    }

    // Add trend data (mock data - in a real implementation this would be calculated)
    const trendData = {
      alerts_trend: [45, 52, 48, 67, 78, 65, 87],
      sar_filing_trend: [4, 3, 5, 2, 8, 7, 6],
      risk_score_trend: [0.42, 0.38, 0.45, 0.51, 0.48, 0.52, 0.47]
    };

    // Generate insights based on the analytics data
    const insights = generateComplianceInsights(analyticsData);

    return res.status(200).json({
      analytics: analyticsData,
      trends: trendData,
      insights,
      period: {
        start: date_from || '2023-01-01',
        end: date_to || new Date().toISOString().split('T')[0]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching compliance analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Generate a new compliance report
 */
function generateReport(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      template_id,
      report_name,
      report_description,
      report_data,
      created_by,
      report_period_start,
      report_period_end,
      include_analytics = true,
      include_recommendations = true,
      target_audience = 'internal'
    } = req.body;

    // Validate required fields
    if (!template_id || !report_name || !report_data) {
      return res.status(400).json({ error: 'Missing required report parameters' });
    }

    // Find the template
    const template = reportTemplatesDB.find(t => t.id === template_id);

    if (!template) {
      return res.status(404).json({ error: 'Report template not found' });
    }

    // Validate that all required fields are present
    const missingFields = template.required_fields.filter(
      (field: string) => !report_data[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing_fields: missingFields
      });
    }

    // Generate report ID
    const reportId = uuidv4();
    
    // Generate report content
    const reportContent = generateReportContent(
      template,
      report_data,
      include_analytics,
      include_recommendations
    );

    // Create report record
    const newReport = {
      id: reportId,
      name: report_name,
      description: report_description || template.description,
      template_id,
      template_name: template.name,
      report_type: template.type,
      created_by: created_by || 'system',
      created_at: new Date().toISOString(),
      status: 'draft',
      report_period: {
        start: report_period_start || null,
        end: report_period_end || null
      },
      target_audience,
      content: reportContent,
      metadata: {
        version: '1.0',
        generated_by: 'Compliance Reporting API',
        template_version: template.id,
        data_sources: ['transaction_monitoring', 'kyc_verification', 'communication_monitoring']
      }
    };

    // Add to database
    complianceReportsDB.push(newReport);

    // Return success response
    return res.status(201).json({
      message: 'Report generated successfully',
      report_id: reportId,
      report_summary: {
        id: reportId,
        name: report_name,
        type: template.type,
        created_at: newReport.created_at,
        status: 'draft'
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Helper function to generate report content
 */
function generateReportContent(
  template: any,
  reportData: any,
  includeAnalytics: boolean,
  includeRecommendations: boolean
): any {
  // Initialize content structure based on template sections
  const content: Record<string, any> = {};
  
  // Fill in content for each section
  template.sections.forEach((section: any) => {
    content[section.id] = {
      title: section.name,
      data: {}
    };
    
    // Add relevant data from reportData to each section
    switch (section.id) {
      case 'filing_institution':
        content[section.id].data = {
          name: reportData.institution_name,
          id: reportData.institution_id,
          filing_date: reportData.filing_date
        };
        break;
        
      case 'subject':
        content[section.id].data = {
          name: reportData.subject_name,
          id_type: reportData.subject_id_type,
          id_number: reportData.subject_id_number
        };
        break;
        
      case 'suspicious_activity':
        content[section.id].data = {
          start_date: reportData.activity_start_date,
          end_date: reportData.activity_end_date,
          type: reportData.suspicious_activity_type,
          amount: reportData.amount
        };
        break;
        
      case 'transaction_details':
        content[section.id].data = {
          dates: reportData.transaction_dates,
          amounts: reportData.transaction_amounts,
          methods: reportData.transaction_methods
        };
        break;
        
      case 'narrative':
        content[section.id].data = {
          description: reportData.narrative_description
        };
        break;
        
      case 'filing_contact':
        content[section.id].data = {
          name: reportData.contact_name,
          phone: reportData.contact_phone,
          email: reportData.contact_email
        };
        break;
        
      case 'executive_summary':
        content[section.id].data = {
          summary: reportData.executive_summary,
          key_findings: reportData.key_findings,
          period: {
            start: reportData.reporting_period_start,
            end: reportData.reporting_period_end
          }
        };
        break;
        
      case 'risk_assessment':
        content[section.id].data = {
          overall_risk_rating: reportData.risk_rating,
          risk_factors: reportData.risk_factors,
          risk_trends: reportData.risk_trends
        };
        break;
        
      case 'monitoring_results':
        content[section.id].data = {
          alert_count: reportData.alert_count,
          alerts_by_type: reportData.alerts_by_type,
          alerts_by_risk: reportData.alerts_by_risk,
          false_positive_rate: reportData.false_positive_rate
        };
        break;
        
      case 'case_metrics':
        content[section.id].data = {
          case_count: reportData.case_count,
          cases_by_type: reportData.cases_by_type,
          average_resolution_time: reportData.average_resolution_time,
          pending_cases: reportData.pending_cases
        };
        break;
        
      case 'regulatory_filings':
        content[section.id].data = {
          sar_count: reportData.sar_count,
          ctr_count: reportData.ctr_count,
          other_filings: reportData.other_filings,
          late_filings: reportData.late_filings
        };
        break;
        
      default:
        // For other sections, just copy over any data with matching keys
        Object.keys(reportData).forEach(key => {
          if (key.startsWith(section.id + '_')) {
            const fieldName = key.replace(section.id + '_', '');
            content[section.id].data[fieldName] = reportData[key];
          }
        });
    }
  });
  
  // Add analytics if requested
  if (includeAnalytics) {
    content.analytics = {
      title: 'Compliance Analytics',
      data: {
        transaction_monitoring: complianceAnalyticsDB.transaction_monitoring,
        kyc_verification: complianceAnalyticsDB.kyc_verification,
        communication_monitoring: complianceAnalyticsDB.communication_monitoring,
        regulatory_filings: complianceAnalyticsDB.regulatory_filings
      }
    };
  }
  
  // Add recommendations if requested
  if (includeRecommendations) {
    content.recommendations = {
      title: 'Recommendations',
      data: generateRecommendations(reportData, template.type)
    };
  }
  
  return content;
}

/**
 * Helper function to generate recommendations based on report data
 */
function generateRecommendations(reportData: any, templateType: string): any {
  const recommendations: any[] = [];
  
  // Generate recommendations based on template type and report data
  if (templateType === 'internal_compliance') {
    // Check false positive rate
    if (reportData.false_positive_rate && reportData.false_positive_rate > 0.6) {
      recommendations.push({
        id: 'rec-001',
        title: 'Optimize Alert Thresholds',
        description: 'The current false positive rate is high. Consider reviewing and adjusting alert thresholds to reduce false positives while maintaining detection effectiveness.',
        priority: 'high',
        implementation_difficulty: 'medium'
      });
    }
    
    // Check case resolution time
    if (reportData.average_resolution_time && reportData.average_resolution_time > 5) {
      recommendations.push({
        id: 'rec-002',
        title: 'Improve Case Resolution Process',
        description: 'Case resolution times are above target. Consider process improvements or additional resources to reduce investigation time.',
        priority: 'medium',
        implementation_difficulty: 'medium'
      });
    }
    
    // Check pending cases
    if (reportData.pending_cases && reportData.pending_cases > 50) {
      recommendations.push({
        id: 'rec-003',
        title: 'Address Case Backlog',
        description: 'There is a significant backlog of pending cases. Consider a focused effort to clear the backlog and prevent future accumulation.',
        priority: 'high',
        implementation_difficulty: 'high'
      });
    }
    
    // Always recommend training
    recommendations.push({
      id: 'rec-004',
      title: 'Ongoing Compliance Training',
      description: 'Continue regular compliance training for all staff, with focus on recent regulatory changes and emerging risks.',
      priority: 'medium',
      implementation_difficulty: 'low'
    });
  } else if (templateType === 'regulatory_filing') {
    // Recommendations for regulatory filings
    recommendations.push({
      id: 'rec-005',
      title: 'Enhanced Documentation',
      description: 'Ensure comprehensive documentation is maintained for all regulatory filings to support potential regulatory inquiries.',
      priority: 'high',
      implementation_difficulty: 'medium'
    });
    
    // Check for suspicious activity type
    if (reportData.suspicious_activity_type === 'structuring' || 
        reportData.suspicious_activity_type === 'layering') {
      recommendations.push({
        id: 'rec-006',
        title: 'Enhanced Monitoring for Similar Patterns',
        description: 'Implement enhanced monitoring for similar structuring/layering patterns across related accounts and customers.',
        priority: 'high',
        implementation_difficulty: 'medium'
      });
    }
  }
  
  return recommendations;
}

/**
 * Helper function to generate insights from analytics data
 */
function generateComplianceInsights(analyticsData: any): any[] {
  const insights: any[] = [];
  
  // Transaction monitoring insights
  if (analyticsData.transaction_monitoring) {
    const tm = analyticsData.transaction_monitoring;
    
    // Alert distribution insight
    const totalAlerts = Object.values(tm.alerts_by_type).reduce((sum: number, count: any) => sum + count, 0);
    const highestAlertType = Object.entries(tm.alerts_by_type).sort((a: any, b: any) => b[1] - a[1])[0];
    
    insights.push({
      category: 'transaction_monitoring',
      title: 'Alert Distribution Analysis',
      description: `${highestAlertType[0]} alerts account for ${Math.round((highestAlertType[1] / totalAlerts) * 100)}% of all alerts, suggesting this area requires focused attention.`,
      impact: 'medium',
      action_required: true
    });
    
    // False positive insight
    if (tm.false_positive_rate > 0.6) {
      insights.push({
        category: 'transaction_monitoring',
        title: 'High False Positive Rate',
        description: `The current false positive rate of ${Math.round(tm.false_positive_rate * 100)}% indicates potential inefficiency in alert rules. Consider rule optimization.`,
        impact: 'high',
        action_required: true
      });
    }
  }
  
  // KYC verification insights
  if (analyticsData.kyc_verification) {
    const kyc = analyticsData.kyc_verification;
    
    // High-risk customer insight
    const totalVerifications = kyc.verifications_by_risk.high + kyc.verifications_by_risk.medium + kyc.verifications_by_risk.low;
    const highRiskPercentage = (kyc.verifications_by_risk.high / totalVerifications) * 100;
    
    if (highRiskPercentage > 15) {
      insights.push({
        category: 'kyc_verification',
        title: 'Elevated High-Risk Customer Percentage',
        description: `High-risk customers represent ${Math.round(highRiskPercentage)}% of verifications, which is above the target threshold of 15%.`,
        impact: 'high',
        action_required: true
      });
    }
    
    // Incomplete verifications insight
    if (kyc.incomplete_verifications > 20) {
      insights.push({
        category: 'kyc_verification',
        title: 'Significant Incomplete Verifications',
        description: `There are ${kyc.incomplete_verifications} incomplete KYC verifications, which may indicate process bottlenecks or customer experience issues.`,
        impact: 'medium',
        action_required: true
      });
    }
  }
  
  // Communication monitoring insights
  if (analyticsData.communication_monitoring) {
    const cm = analyticsData.communication_monitoring;
    
    // Channel distribution insight
    const totalFlagged = cm.flagged_communications;
    const channelDistribution = Object.entries(cm.by_channel).map(([channel, count]: [string, any]) => {
      return {
        channel,
        percentage: Math.round((count / totalFlagged) * 100)
      };
    });
    
    const highestChannel = channelDistribution.sort((a, b) => b.percentage - a.percentage)[0];
    
    insights.push({
      category: 'communication_monitoring',
      title: 'Communication Channel Risk Analysis',
      description: `${highestChannel.channel} communications account for ${highestChannel.percentage}% of all flagged communications, suggesting focused monitoring of this channel.`,
      impact: 'medium',
      action_required: false
    });
  }
  
  // Regulatory filings insights
  if (analyticsData.regulatory_filings) {
    const rf = analyticsData.regulatory_filings;
    
    // Late filings insight
    if (rf.late_filings > 0) {
      insights.push({
        category: 'regulatory_filings',
        title: 'Late Regulatory Filings',
        description: `There were ${rf.late_filings} late regulatory filings, which poses compliance risk. Review filing processes to ensure timely submissions.`,
        impact: 'high',
        action_required: true
      });
    }
    
    // SAR filing trend insight
    if (rf.sar_filings > 10) {
      insights.push({
        category: 'regulatory_filings',
        title: 'Significant SAR Filing Activity',
        description: `With ${rf.sar_filings} SAR filings, ensure adequate resources are allocated to investigation and filing quality.`,
        impact: 'medium',
        action_required: false
      });
    }
  }
  
  return insights;
}
