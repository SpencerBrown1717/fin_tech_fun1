import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

// Mock database for regulatory updates
const regulatoryUpdatesDB: Record<string, any>[] = [
  {
    id: 'reg-001',
    title: 'Anti-Money Laundering Updates',
    category: 'AML',
    jurisdiction: 'US',
    authority: 'FinCEN',
    publication_date: '2023-11-15',
    effective_date: '2024-01-01',
    summary: 'Updates to KYC requirements for financial institutions',
    impact_level: 'high',
    affected_departments: ['compliance', 'operations', 'customer_service'],
    action_required: true,
    action_deadline: '2023-12-31',
    content: 'Financial institutions must implement enhanced due diligence procedures for high-risk customers...',
    tags: ['KYC', 'due diligence', 'high-risk customers']
  },
  {
    id: 'reg-002',
    title: 'Data Privacy Regulation Changes',
    category: 'Privacy',
    jurisdiction: 'EU',
    authority: 'EDPB',
    publication_date: '2023-10-20',
    effective_date: '2024-02-15',
    summary: 'Updates to data processing requirements under GDPR',
    impact_level: 'medium',
    affected_departments: ['compliance', 'IT', 'data'],
    action_required: true,
    action_deadline: '2024-02-01',
    content: 'Organizations must implement additional safeguards for cross-border data transfers...',
    tags: ['GDPR', 'data transfers', 'privacy shield']
  },
  {
    id: 'reg-003',
    title: 'Payment Services Directive Update',
    category: 'Payments',
    jurisdiction: 'EU',
    authority: 'EBA',
    publication_date: '2023-09-05',
    effective_date: '2024-03-01',
    summary: 'Enhanced security requirements for electronic payments',
    impact_level: 'high',
    affected_departments: ['compliance', 'IT', 'payments'],
    action_required: true,
    action_deadline: '2024-02-15',
    content: 'Payment service providers must implement additional strong customer authentication methods...',
    tags: ['PSD2', 'SCA', 'electronic payments']
  }
];

// Subscription preferences mock database
const subscriptionPreferencesDB: Record<string, any>[] = [];

// Regulatory updates API endpoint
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getRegulationUpdates(req, res);
    case 'POST':
      return addSubscription(req, res);
    case 'PUT':
      return updateSubscription(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Get regulatory updates with filtering and personalization
 */
function getRegulationUpdates(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      user_id,
      jurisdiction,
      category,
      authority,
      impact_level,
      date_from,
      date_to,
      affected_department,
      action_required,
      search_query,
      tags,
      page = 1,
      limit = 10,
      sort_by = 'publication_date',
      sort_order = 'desc'
    } = req.query;

    // Start with all updates
    let filteredUpdates = [...regulatoryUpdatesDB];

    // Apply filters
    if (jurisdiction) {
      const jurisdictions = Array.isArray(jurisdiction) ? jurisdiction : [jurisdiction];
      filteredUpdates = filteredUpdates.filter(update => 
        jurisdictions.includes(update.jurisdiction)
      );
    }

    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      filteredUpdates = filteredUpdates.filter(update => 
        categories.includes(update.category)
      );
    }

    if (authority) {
      const authorities = Array.isArray(authority) ? authority : [authority];
      filteredUpdates = filteredUpdates.filter(update => 
        authorities.includes(update.authority)
      );
    }

    if (impact_level) {
      const impactLevels = Array.isArray(impact_level) ? impact_level : [impact_level];
      filteredUpdates = filteredUpdates.filter(update => 
        impactLevels.includes(update.impact_level)
      );
    }

    if (date_from) {
      const fromDate = new Date(date_from as string);
      filteredUpdates = filteredUpdates.filter(update => 
        new Date(update.publication_date) >= fromDate
      );
    }

    if (date_to) {
      const toDate = new Date(date_to as string);
      filteredUpdates = filteredUpdates.filter(update => 
        new Date(update.publication_date) <= toDate
      );
    }

    if (affected_department) {
      const departments = Array.isArray(affected_department) ? affected_department : [affected_department];
      filteredUpdates = filteredUpdates.filter(update => 
        update.affected_departments.some((dept: string) => departments.includes(dept))
      );
    }

    if (action_required !== undefined) {
      const actionRequired = action_required === 'true';
      filteredUpdates = filteredUpdates.filter(update => 
        update.action_required === actionRequired
      );
    }

    if (search_query) {
      const query = (search_query as string).toLowerCase();
      filteredUpdates = filteredUpdates.filter(update => 
        update.title.toLowerCase().includes(query) ||
        update.summary.toLowerCase().includes(query) ||
        update.content.toLowerCase().includes(query)
      );
    }

    if (tags) {
      const tagList = Array.isArray(tags) ? tags : [tags];
      filteredUpdates = filteredUpdates.filter(update => 
        update.tags.some((tag: string) => tagList.includes(tag))
      );
    }

    // Apply personalization if user_id is provided
    if (user_id) {
      const userPreferences = subscriptionPreferencesDB.find(pref => pref.user_id === user_id);
      
      if (userPreferences) {
        // Calculate relevance score for each update based on user preferences
        filteredUpdates = filteredUpdates.map(update => {
          let relevanceScore = 0;
          
          // Check jurisdiction match
          if (userPreferences.jurisdictions.includes(update.jurisdiction)) {
            relevanceScore += 0.3;
          }
          
          // Check category match
          if (userPreferences.categories.includes(update.category)) {
            relevanceScore += 0.3;
          }
          
          // Check department match
          const departmentOverlap = update.affected_departments.filter((dept: string) => 
            userPreferences.departments.includes(dept)
          ).length;
          
          if (departmentOverlap > 0) {
            relevanceScore += 0.2 * (departmentOverlap / update.affected_departments.length);
          }
          
          // Check impact level
          if (update.impact_level === 'high' && userPreferences.priority_impact_levels.includes('high')) {
            relevanceScore += 0.2;
          }
          
          return {
            ...update,
            relevance_score: parseFloat(relevanceScore.toFixed(2))
          };
        });
        
        // Sort by relevance if requested
        if (sort_by === 'relevance') {
          filteredUpdates.sort((a, b) => b.relevance_score - a.relevance_score);
        }
      }
    }

    // Apply sorting
    if (sort_by !== 'relevance') {
      filteredUpdates.sort((a, b) => {
        const sortField = sort_by as string;
        
        if (sort_order === 'asc') {
          return a[sortField] < b[sortField] ? -1 : 1;
        } else {
          return a[sortField] > b[sortField] ? -1 : 1;
        }
      });
    }

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedUpdates = filteredUpdates.slice(startIndex, endIndex);

    // Calculate metadata
    const totalUpdates = filteredUpdates.length;
    const totalPages = Math.ceil(totalUpdates / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    // Generate unique request ID for tracking
    const requestId = uuidv4();

    // Return response with metadata
    return res.status(200).json({
      request_id: requestId,
      metadata: {
        total_updates: totalUpdates,
        total_pages: totalPages,
        current_page: pageNum,
        limit: limitNum,
        has_next_page: hasNextPage,
        has_previous_page: hasPreviousPage
      },
      updates: paginatedUpdates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching regulatory updates:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Add a new subscription for regulatory updates
 */
function addSubscription(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      user_id,
      name,
      email,
      jurisdictions,
      categories,
      authorities,
      departments,
      priority_impact_levels,
      notification_preferences,
      tags_of_interest
    } = req.body;

    // Validate required fields
    if (!user_id || !email) {
      return res.status(400).json({ error: 'Missing required subscription parameters' });
    }

    // Check if subscription already exists
    const existingSubscription = subscriptionPreferencesDB.find(sub => sub.user_id === user_id);
    
    if (existingSubscription) {
      return res.status(409).json({ error: 'Subscription already exists for this user' });
    }

    // Create new subscription
    const subscriptionId = uuidv4();
    const newSubscription = {
      subscription_id: subscriptionId,
      user_id,
      name: name || '',
      email,
      jurisdictions: jurisdictions || [],
      categories: categories || [],
      authorities: authorities || [],
      departments: departments || [],
      priority_impact_levels: priority_impact_levels || ['high'],
      notification_preferences: notification_preferences || {
        email: true,
        in_app: true,
        frequency: 'daily'
      },
      tags_of_interest: tags_of_interest || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to database
    subscriptionPreferencesDB.push(newSubscription);

    // Return success response
    return res.status(201).json({
      message: 'Subscription created successfully',
      subscription_id: subscriptionId,
      subscription: newSubscription
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update an existing subscription
 */
function updateSubscription(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      subscription_id,
      user_id,
      name,
      email,
      jurisdictions,
      categories,
      authorities,
      departments,
      priority_impact_levels,
      notification_preferences,
      tags_of_interest
    } = req.body;

    // Validate required fields
    if (!subscription_id && !user_id) {
      return res.status(400).json({ error: 'Missing subscription_id or user_id' });
    }

    // Find subscription index
    const subscriptionIndex = subscriptionPreferencesDB.findIndex(sub => 
      (subscription_id && sub.subscription_id === subscription_id) || 
      (user_id && sub.user_id === user_id)
    );
    
    if (subscriptionIndex === -1) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Get existing subscription
    const existingSubscription = subscriptionPreferencesDB[subscriptionIndex];

    // Update subscription
    const updatedSubscription = {
      ...existingSubscription,
      name: name !== undefined ? name : existingSubscription.name,
      email: email !== undefined ? email : existingSubscription.email,
      jurisdictions: jurisdictions !== undefined ? jurisdictions : existingSubscription.jurisdictions,
      categories: categories !== undefined ? categories : existingSubscription.categories,
      authorities: authorities !== undefined ? authorities : existingSubscription.authorities,
      departments: departments !== undefined ? departments : existingSubscription.departments,
      priority_impact_levels: priority_impact_levels !== undefined ? priority_impact_levels : existingSubscription.priority_impact_levels,
      notification_preferences: notification_preferences !== undefined ? 
        { ...existingSubscription.notification_preferences, ...notification_preferences } : 
        existingSubscription.notification_preferences,
      tags_of_interest: tags_of_interest !== undefined ? tags_of_interest : existingSubscription.tags_of_interest,
      updated_at: new Date().toISOString()
    };

    // Update in database
    subscriptionPreferencesDB[subscriptionIndex] = updatedSubscription;

    // Return success response
    return res.status(200).json({
      message: 'Subscription updated successfully',
      subscription: updatedSubscription
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper functions for regulatory analysis

/**
 * Get available metadata for filtering options
 */
export function getRegulationMetadata() {
  const jurisdictions = [...new Set(regulatoryUpdatesDB.map(update => update.jurisdiction))];
  const categories = [...new Set(regulatoryUpdatesDB.map(update => update.category))];
  const authorities = [...new Set(regulatoryUpdatesDB.map(update => update.authority))];
  const impactLevels = [...new Set(regulatoryUpdatesDB.map(update => update.impact_level))];
  
  // Get all departments across all updates
  const departmentsSet = new Set<string>();
  regulatoryUpdatesDB.forEach(update => {
    update.affected_departments.forEach((dept: string) => departmentsSet.add(dept));
  });
  const departments = [...departmentsSet];
  
  // Get all tags across all updates
  const tagsSet = new Set<string>();
  regulatoryUpdatesDB.forEach(update => {
    update.tags.forEach((tag: string) => tagsSet.add(tag));
  });
  const tags = [...tagsSet];
  
  return {
    jurisdictions,
    categories,
    authorities,
    impact_levels: impactLevels,
    departments,
    tags
  };
}

/**
 * Analyze regulatory impact for a specific business area
 */
export function analyzeRegulatoryImpact(department: string, jurisdiction: string) {
  const relevantUpdates = regulatoryUpdatesDB.filter(update => 
    update.affected_departments.includes(department) && 
    update.jurisdiction === jurisdiction
  );
  
  const highImpactCount = relevantUpdates.filter(update => update.impact_level === 'high').length;
  const mediumImpactCount = relevantUpdates.filter(update => update.impact_level === 'medium').length;
  const lowImpactCount = relevantUpdates.filter(update => update.impact_level === 'low').length;
  
  const pendingActionCount = relevantUpdates.filter(update => 
    update.action_required && new Date(update.action_deadline) > new Date()
  ).length;
  
  const upcomingRegulations = relevantUpdates.filter(update => 
    new Date(update.effective_date) > new Date()
  ).sort((a, b) => new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime());
  
  return {
    department,
    jurisdiction,
    total_relevant_regulations: relevantUpdates.length,
    impact_breakdown: {
      high: highImpactCount,
      medium: mediumImpactCount,
      low: lowImpactCount
    },
    pending_actions: pendingActionCount,
    upcoming_regulations: upcomingRegulations.slice(0, 5), // Return top 5 upcoming
    analysis_timestamp: new Date().toISOString()
  };
}
