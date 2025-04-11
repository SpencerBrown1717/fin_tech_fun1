# FinGuard AI: Agentic Workflow Implementation Guide

This guide explains how to implement an agentic workflow using FinGuard AI's financial compliance tools. These tools enable AI agents to perform compliance checks, analyze transactions, verify KYC information, and more.

## Overview of Agentic Workflow

The agentic workflow for financial compliance follows these steps:

1. **Tool Discovery**: The AI agent discovers available compliance tools via the MCP schema
2. **Task Analysis**: The agent analyzes the compliance task and selects the appropriate tool
3. **Parameter Collection**: The agent gathers required parameters for the selected tool
4. **Tool Execution**: The agent calls the tool with the appropriate parameters
5. **Result Analysis**: The agent interprets the results and determines next actions
6. **Action Recommendation**: The agent provides recommendations based on compliance results

## Available Compliance Tools

FinGuard AI provides the following compliance tools:

| Tool Name | Description | Endpoint |
|-----------|-------------|----------|
| analyze_transaction | Analyzes financial transactions for compliance issues | /api/compliance/transaction |
| verify_customer_kyc | Verifies KYC compliance for customers | /api/compliance/kyc |
| analyze_communication | Analyzes communications for compliance issues | /api/compliance/communication |
| get_regulatory_updates | Retrieves latest regulatory updates | /api/compliance/regulations |
| generate_compliance_report | Generates compliance reports for entities | /api/compliance/report |

## Integration with AI Agents

### 1. OpenAI Function Calling

```javascript
// Example: Integrating with OpenAI's function calling
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define the function schema
const functions = [
  {
    name: "analyze_transaction",
    description: "Analyzes financial transactions for compliance issues",
    parameters: {
      type: "object",
      required: ["transaction_id", "amount", "sender", "recipient", "transaction_type"],
      properties: {
        transaction_id: {
          type: "string",
          description: "Unique identifier for the transaction"
        },
        amount: {
          type: "number",
          description: "Transaction amount"
        },
        sender: {
          type: "object",
          description: "Information about the sender",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            country: { type: "string" }
          }
        },
        recipient: {
          type: "object",
          description: "Information about the recipient",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            country: { type: "string" }
          }
        },
        transaction_type: {
          type: "string",
          description: "Type of transaction (e.g., domestic, international, wire)",
          enum: ["domestic", "international", "wire", "ach", "internal"]
        }
      }
    }
  }
];

// Example usage in a conversation
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: "You are a financial compliance assistant." },
    { role: "user", content: "Check if this transaction is compliant: $12,000 wire transfer from John Smith in the US to ABC Corp in CountryB." }
  ],
  functions: functions,
  function_call: "auto"
});

// Handle function call
if (response.choices[0].message.function_call) {
  const functionCall = response.choices[0].message.function_call;
  const functionName = functionCall.name;
  const functionArgs = JSON.parse(functionCall.arguments);
  
  // Call the FinGuard API
  const result = await fetch("http://localhost:3003/api/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tool: functionName,
      parameters: functionArgs
    })
  }).then(res => res.json());
  
  // Continue the conversation with the result
  const finalResponse = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a financial compliance assistant." },
      { role: "user", content: "Check if this transaction is compliant: $12,000 wire transfer from John Smith in the US to ABC Corp in CountryB." },
      { role: "assistant", content: null, function_call: { name: functionName, arguments: functionCall.arguments } },
      { role: "function", name: functionName, content: JSON.stringify(result) }
    ]
  });
  
  console.log(finalResponse.choices[0].message.content);
}
```

### 2. Claude Tool Use

```javascript
// Example: Integrating with Anthropic Claude's tool use
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Define the tools
const tools = [
  {
    name: "analyze_transaction",
    description: "Analyzes financial transactions for compliance issues",
    input_schema: {
      type: "object",
      required: ["transaction_id", "amount", "sender", "recipient", "transaction_type"],
      properties: {
        transaction_id: {
          type: "string",
          description: "Unique identifier for the transaction"
        },
        amount: {
          type: "number",
          description: "Transaction amount"
        },
        sender: {
          type: "object",
          description: "Information about the sender",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            country: { type: "string" }
          }
        },
        recipient: {
          type: "object",
          description: "Information about the recipient",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            country: { type: "string" }
          }
        },
        transaction_type: {
          type: "string",
          description: "Type of transaction (e.g., domestic, international, wire)",
          enum: ["domestic", "international", "wire", "ach", "internal"]
        }
      }
    }
  }
];

// Example usage in a conversation
const message = await anthropic.messages.create({
  model: "claude-3-opus-20240229",
  max_tokens: 1024,
  system: "You are a financial compliance assistant. Use the available tools to help with compliance tasks.",
  messages: [
    { role: "user", content: "Check if this transaction is compliant: $12,000 wire transfer from John Smith in the US to ABC Corp in CountryB." }
  ],
  tools: tools
});

// Handle tool use
if (message.content[0].type === "tool_use") {
  const toolUse = message.content[0];
  const toolName = toolUse.name;
  const toolInput = toolUse.input;
  
  // Call the FinGuard API
  const result = await fetch("http://localhost:3003/api/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tool: toolName,
      parameters: toolInput
    })
  }).then(res => res.json());
  
  // Continue the conversation with the result
  const finalMessage = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    system: "You are a financial compliance assistant. Use the available tools to help with compliance tasks.",
    messages: [
      { role: "user", content: "Check if this transaction is compliant: $12,000 wire transfer from John Smith in the US to ABC Corp in CountryB." },
      { 
        role: "assistant", 
        content: [toolUse]
      },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: JSON.stringify(result)
          }
        ]
      }
    ],
    tools: tools
  });
  
  console.log(finalMessage.content);
}
```

## Example Agentic Workflows

### 1. Transaction Compliance Check

```
User: "I need to check if a $15,000 international wire transfer from our US client to a vendor in CountryA is compliant."

Agent: [Analyzes request and determines it needs to check transaction compliance]

Agent: [Calls analyze_transaction tool with parameters:
  {
    "transaction_id": "TX" + Date.now(),
    "amount": 15000,
    "sender": {
      "id": "CLIENT123",
      "name": "US Client",
      "country": "US"
    },
    "recipient": {
      "id": "VENDOR456",
      "name": "Vendor Company",
      "country": "CountryA"
    },
    "transaction_type": "international"
  }
]

[Tool returns result:
  {
    "transaction_id": "TX1681234567",
    "risk_score": 0.3,
    "compliance_status": "COMPLIANT",
    "risk_factors": ["High value transaction", "International transaction"],
    "timestamp": "2025-04-10T22:35:12Z"
  }
]

Agent: "The transaction is compliant with a risk score of 0.3. While it was flagged for being a high-value international transaction, it doesn't exceed our compliance thresholds. You can proceed with the transfer, but make sure to document the business purpose as required for international wires over $10,000."
```

### 2. KYC Verification Workflow

```
User: "We have a new client who needs KYC verification. Their name is Jane Doe, born on 1980-05-15, residing in New York, with passport number P12345678."

Agent: [Analyzes request and determines it needs to verify KYC]

Agent: [Calls verify_customer_kyc tool with parameters:
  {
    "customer_id": "CUST" + Date.now(),
    "name": "Jane Doe",
    "date_of_birth": "1980-05-15",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "country": "US"
    },
    "document_type": "passport",
    "document_id": "P12345678"
  }
]

[Tool returns result:
  {
    "customer_id": "CUST1681234567",
    "kyc_status": "VERIFIED",
    "verification_level": "ENHANCED",
    "verification_checks": {
      "identity_verified": true,
      "address_verified": true,
      "document_verified": true,
      "sanctions_check": "passed",
      "pep_check": "not_found"
    },
    "expiry_date": "2026-04-10",
    "timestamp": "2025-04-10T22:36:45Z"
  }
]

Agent: "Jane Doe has been successfully verified with enhanced verification level. All verification checks passed, including identity, address, and document verification. The client is not on any sanctions lists and is not identified as a politically exposed person. The verification is valid until April 10, 2026."
```

## Best Practices for Agentic Compliance Workflows

1. **Proper Parameter Validation**: Ensure all required parameters are collected before calling compliance tools
2. **Error Handling**: Implement robust error handling for API failures or unexpected responses
3. **Context Preservation**: Maintain context between multiple compliance checks for complex workflows
4. **Regulatory Awareness**: Use the get_regulatory_updates tool to stay informed about changing regulations
5. **Audit Trail**: Log all compliance checks and their results for audit purposes
6. **User Confirmation**: For high-risk actions, request user confirmation before proceeding
7. **Explanation**: Always explain compliance results in clear, non-technical language

## Security Considerations

1. **API Authentication**: Use proper authentication for all API calls
2. **Data Encryption**: Ensure sensitive data is encrypted in transit and at rest
3. **Access Control**: Implement role-based access control for compliance tools
4. **Audit Logging**: Maintain detailed logs of all compliance activities
5. **Rate Limiting**: Implement rate limiting to prevent abuse
6. **Data Minimization**: Only collect and process the minimum data needed for compliance checks

## Troubleshooting

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Tool returns 400 error | Missing required parameters | Check that all required parameters are provided |
| Tool returns 500 error | Server-side error | Check server logs and retry the request |
| High risk scores | Transaction has multiple risk factors | Review the risk factors and consider additional verification |
| Slow response times | Complex compliance checks | Implement asynchronous processing for complex checks |

For additional support, contact support@finguard.ai
