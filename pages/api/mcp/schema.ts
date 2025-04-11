// MCP Schema for Financial Compliance Tools
export const complianceToolsSchema = {
  "openapi": "3.1.0",
  "info": {
    "title": "Financial Compliance Tools API",
    "description": "API for financial compliance tools that can be used by agentic AI systems",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://api.finguard.ai",
      "description": "Production server"
    },
    {
      "url": "http://localhost:3003",
      "description": "Development server"
    }
  ],
  "paths": {
    "/api/compliance/transaction": {
      "post": {
        "operationId": "analyze_transaction",
        "summary": "Analyzes financial transactions for compliance issues",
        "description": "Evaluates a financial transaction against regulatory requirements and flags potential compliance issues",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["transaction_id", "amount", "sender", "recipient", "transaction_type"],
                "properties": {
                  "transaction_id": {
                    "type": "string",
                    "description": "Unique identifier for the transaction"
                  },
                  "amount": {
                    "type": "number",
                    "description": "Transaction amount"
                  },
                  "sender": {
                    "type": "object",
                    "description": "Information about the sender",
                    "properties": {
                      "id": { "type": "string" },
                      "name": { "type": "string" },
                      "country": { "type": "string" }
                    }
                  },
                  "recipient": {
                    "type": "object",
                    "description": "Information about the recipient",
                    "properties": {
                      "id": { "type": "string" },
                      "name": { "type": "string" },
                      "country": { "type": "string" }
                    }
                  },
                  "transaction_type": {
                    "type": "string",
                    "description": "Type of transaction (e.g., domestic, international, wire)",
                    "enum": ["domestic", "international", "wire", "ach", "internal"]
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Transaction analysis result",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "transaction_id": { "type": "string" },
                    "risk_score": { "type": "number" },
                    "compliance_status": { 
                      "type": "string",
                      "enum": ["COMPLIANT", "REVIEW_REQUIRED", "NON_COMPLIANT"]
                    },
                    "risk_factors": {
                      "type": "array",
                      "items": { "type": "string" }
                    },
                    "timestamp": { "type": "string", "format": "date-time" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/compliance/kyc": {
      "post": {
        "operationId": "verify_customer_kyc",
        "summary": "Verifies KYC compliance for customers",
        "description": "Checks if a customer's KYC (Know Your Customer) information meets regulatory requirements",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["customer_id", "name", "date_of_birth", "address", "document_type", "document_id"],
                "properties": {
                  "customer_id": {
                    "type": "string",
                    "description": "Unique identifier for the customer"
                  },
                  "name": {
                    "type": "string",
                    "description": "Customer's full name"
                  },
                  "date_of_birth": {
                    "type": "string",
                    "format": "date",
                    "description": "Customer's date of birth"
                  },
                  "address": {
                    "type": "object",
                    "description": "Customer's address",
                    "properties": {
                      "street": { "type": "string" },
                      "city": { "type": "string" },
                      "state": { "type": "string" },
                      "postal_code": { "type": "string" },
                      "country": { "type": "string" }
                    }
                  },
                  "document_type": {
                    "type": "string",
                    "description": "Type of identification document",
                    "enum": ["passport", "drivers_license", "national_id", "residence_permit"]
                  },
                  "document_id": {
                    "type": "string",
                    "description": "Identification document number"
                  },
                  "additional_documents": {
                    "type": "array",
                    "description": "Additional verification documents",
                    "items": {
                      "type": "object",
                      "properties": {
                        "type": { "type": "string" },
                        "id": { "type": "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "KYC verification result",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "customer_id": { "type": "string" },
                    "kyc_status": { 
                      "type": "string",
                      "enum": ["VERIFIED", "PENDING", "REJECTED"]
                    },
                    "verification_level": { 
                      "type": "string",
                      "enum": ["STANDARD", "ENHANCED"]
                    },
                    "verification_checks": {
                      "type": "object",
                      "properties": {
                        "identity_verified": { "type": "boolean" },
                        "address_verified": { "type": "boolean" },
                        "document_verified": { "type": "boolean" },
                        "sanctions_check": { "type": "string" },
                        "pep_check": { "type": "string" }
                      }
                    },
                    "expiry_date": { "type": "string", "format": "date" },
                    "timestamp": { "type": "string", "format": "date-time" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/compliance/communication": {
      "post": {
        "operationId": "analyze_communication",
        "summary": "Analyzes communications for compliance issues",
        "description": "Scans communications for regulatory compliance issues, flagged terms, and sensitive data",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["communication_id", "content", "sender", "recipient", "channel"],
                "properties": {
                  "communication_id": {
                    "type": "string",
                    "description": "Unique identifier for the communication"
                  },
                  "content": {
                    "type": "string",
                    "description": "Content of the communication"
                  },
                  "sender": {
                    "type": "object",
                    "description": "Information about the sender",
                    "properties": {
                      "id": { "type": "string" },
                      "name": { "type": "string" },
                      "role": { "type": "string" }
                    }
                  },
                  "recipient": {
                    "type": "object",
                    "description": "Information about the recipient",
                    "properties": {
                      "id": { "type": "string" },
                      "name": { "type": "string" },
                      "role": { "type": "string" }
                    }
                  },
                  "channel": {
                    "type": "string",
                    "description": "Communication channel",
                    "enum": ["email", "chat", "phone", "meeting", "social_media"]
                  },
                  "timestamp": {
                    "type": "string",
                    "format": "date-time",
                    "description": "When the communication occurred"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Communication analysis result",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "communication_id": { "type": "string" },
                    "compliance_status": { 
                      "type": "string",
                      "enum": ["COMPLIANT", "REVIEW_REQUIRED"]
                    },
                    "flagged_terms": {
                      "type": "array",
                      "items": { "type": "string" }
                    },
                    "sensitive_data_detected": {
                      "type": "array",
                      "items": { "type": "string" }
                    },
                    "channel": { "type": "string" },
                    "analysis_timestamp": { "type": "string", "format": "date-time" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/compliance/regulations": {
      "get": {
        "operationId": "get_regulatory_updates",
        "summary": "Retrieves latest regulatory updates",
        "description": "Gets recent regulatory updates relevant to financial institutions",
        "parameters": [
          {
            "name": "region",
            "in": "query",
            "description": "Filter updates by region (e.g., US, EU, Global)",
            "schema": { "type": "string" }
          },
          {
            "name": "industry",
            "in": "query",
            "description": "Filter updates by industry sector",
            "schema": { "type": "string" }
          },
          {
            "name": "date_from",
            "in": "query",
            "description": "Get updates effective from this date",
            "schema": { "type": "string", "format": "date" }
          }
        ],
        "responses": {
          "200": {
            "description": "Regulatory updates",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "updates": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": { "type": "string" },
                          "regulation": { "type": "string" },
                          "description": { "type": "string" },
                          "effective_date": { "type": "string", "format": "date" },
                          "regions": { 
                            "type": "array",
                            "items": { "type": "string" }
                          },
                          "industries": { 
                            "type": "array",
                            "items": { "type": "string" }
                          },
                          "url": { "type": "string" }
                        }
                      }
                    },
                    "total_count": { "type": "integer" },
                    "timestamp": { "type": "string", "format": "date-time" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/compliance/report": {
      "post": {
        "operationId": "generate_compliance_report",
        "summary": "Generates compliance reports for entities",
        "description": "Creates a comprehensive compliance report for a specific entity",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["entity_id", "report_type", "time_period"],
                "properties": {
                  "entity_id": {
                    "type": "string",
                    "description": "Unique identifier for the entity"
                  },
                  "report_type": {
                    "type": "string",
                    "description": "Type of report to generate",
                    "enum": ["summary", "detailed", "regulatory"]
                  },
                  "time_period": {
                    "type": "object",
                    "description": "Time period for the report",
                    "properties": {
                      "start_date": { "type": "string", "format": "date" },
                      "end_date": { "type": "string", "format": "date" }
                    }
                  },
                  "include_details": {
                    "type": "boolean",
                    "description": "Whether to include detailed sections"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Generated compliance report",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "entity_id": { "type": "string" },
                    "report_id": { "type": "string" },
                    "report_type": { "type": "string" },
                    "time_period": { "type": "object" },
                    "generated_at": { "type": "string", "format": "date-time" },
                    "compliance_score": { "type": "number" },
                    "risk_level": { "type": "string" },
                    "summary": { "type": "object" },
                    "details": { "type": "object" },
                    "recommendations": {
                      "type": "array",
                      "items": { "type": "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export default complianceToolsSchema;
