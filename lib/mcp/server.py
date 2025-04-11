from typing import Any, Dict, List, Optional
import httpx
from mcp.server.fastmcp import FastMCP
from starlette.applications import Starlette
from mcp.server.sse import SseServerTransport
from starlette.requests import Request
from starlette.responses import HTMLResponse, JSONResponse
from starlette.routing import Mount, Route
from mcp.server import Server
import uvicorn
import json
import os
from datetime import datetime

# Initialize FastMCP server with a name
mcp = FastMCP("fintech-compliance")

# Constants for API access
API_BASE = os.environ.get("COMPLIANCE_API_BASE", "https://api.compliance-service.com")
API_KEY = os.environ.get("COMPLIANCE_API_KEY", "")

if not API_KEY and not os.environ.get("DEVELOPMENT_MODE"):
    print("WARNING: API key not found. Set COMPLIANCE_API_KEY environment variable for production use.")

async def make_api_request(endpoint: str, method: str = "GET", params: Dict = None, data: Dict = None) -> Dict[str, Any]:
    """Make a request to the compliance API with proper error handling."""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    url = f"{API_BASE}/{endpoint}"
    
    async with httpx.AsyncClient() as client:
        try:
            if method == "GET":
                response = await client.get(url, headers=headers, params=params, timeout=30.0)
            elif method == "POST":
                response = await client.post(url, headers=headers, json=data, timeout=30.0)
            else:
                return {"error": f"Unsupported method: {method}"}
            
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            return {"error": f"HTTP error: {e.response.status_code}", "details": e.response.text}
        except httpx.RequestError as e:
            return {"error": f"Request error: {str(e)}"}
        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}"}

# Define MCP tools for fintech compliance

@mcp.tool()
async def analyze_transaction(transaction_id: str) -> str:
    """Analyze a financial transaction for compliance issues.
    
    Args:
        transaction_id: The ID of the transaction to analyze
    
    Returns:
        A detailed compliance analysis report for the transaction
    """
    # In development mode, return mock data
    if os.environ.get("DEVELOPMENT_MODE"):
        mock_data = {
            "compliance_status": "COMPLIANT",
            "risk_score": 25,
            "issues": [
                {
                    "category": "Documentation",
                    "description": "Missing secondary verification for high-value transaction",
                    "recommendation": "Request additional documentation from the customer"
                }
            ],
            "regulatory_references": [
                {
                    "code": "REG-123",
                    "description": "High-value transaction verification requirements"
                }
            ]
        }
        data = mock_data
    else:
        data = await make_api_request(f"transactions/{transaction_id}/analyze")
    
    if "error" in data:
        return f"Error analyzing transaction: {data['error']}"
    
    # Format the analysis results
    result = f"## Transaction Compliance Analysis\n\n"
    result += f"**Transaction ID**: {transaction_id}\n"
    result += f"**Analysis Time**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    
    if "compliance_status" in data:
        result += f"**Compliance Status**: {data['compliance_status']}\n"
    
    if "risk_score" in data:
        result += f"**Risk Score**: {data['risk_score']}/100\n"
    
    if "issues" in data and data["issues"]:
        result += "\n### Identified Issues\n\n"
        for issue in data["issues"]:
            result += f"- **{issue['category']}**: {issue['description']}\n"
            if "recommendation" in issue:
                result += f"  - Recommendation: {issue['recommendation']}\n"
    else:
        result += "\n### No compliance issues detected\n"
    
    if "regulatory_references" in data and data["regulatory_references"]:
        result += "\n### Regulatory References\n\n"
        for ref in data["regulatory_references"]:
            result += f"- {ref['code']}: {ref['description']}\n"
    
    return result

@mcp.tool()
async def verify_customer_kyc(customer_id: str) -> str:
    """Verify Know Your Customer (KYC) compliance for a specific customer.
    
    Args:
        customer_id: The ID of the customer to verify
    
    Returns:
        A detailed KYC verification report
    """
    # In development mode, return mock data
    if os.environ.get("DEVELOPMENT_MODE"):
        mock_data = {
            "verification_status": "VERIFIED",
            "verification_date": "2025-03-15",
            "identity_verification": {
                "status": "VERIFIED",
                "method": "Document Verification + Biometric",
                "issues": []
            },
            "aml_screening": {
                "status": "CLEARED",
                "risk_level": "LOW",
                "matches": []
            },
            "required_actions": []
        }
        data = mock_data
    else:
        data = await make_api_request(f"customers/{customer_id}/kyc")
    
    if "error" in data:
        return f"Error verifying customer KYC: {data['error']}"
    
    # Format the KYC verification results
    result = f"## Customer KYC Verification\n\n"
    result += f"**Customer ID**: {customer_id}\n"
    result += f"**Verification Time**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    
    if "verification_status" in data:
        result += f"**Verification Status**: {data['verification_status']}\n"
    
    if "verification_date" in data:
        result += f"**Last Verified**: {data['verification_date']}\n"
    
    if "identity_verification" in data:
        result += "\n### Identity Verification\n\n"
        id_verification = data["identity_verification"]
        result += f"- **Status**: {id_verification.get('status', 'Unknown')}\n"
        result += f"- **Method**: {id_verification.get('method', 'Unknown')}\n"
        if "issues" in id_verification and id_verification["issues"]:
            result += "- **Issues**:\n"
            for issue in id_verification["issues"]:
                result += f"  - {issue}\n"
    
    if "aml_screening" in data:
        result += "\n### AML Screening\n\n"
        aml = data["aml_screening"]
        result += f"- **Status**: {aml.get('status', 'Unknown')}\n"
        result += f"- **Risk Level**: {aml.get('risk_level', 'Unknown')}\n"
        if "matches" in aml and aml["matches"]:
            result += "- **Watchlist Matches**:\n"
            for match in aml["matches"]:
                result += f"  - {match.get('list_name')}: {match.get('match_details')}\n"
    
    if "required_actions" in data and data["required_actions"]:
        result += "\n### Required Actions\n\n"
        for action in data["required_actions"]:
            result += f"- {action}\n"
    
    return result

@mcp.tool()
async def analyze_communication(communication_id: str) -> str:
    """Analyze customer communication for compliance issues.
    
    Args:
        communication_id: The ID of the communication to analyze
    
    Returns:
        A detailed compliance analysis of the communication
    """
    # In development mode, return mock data
    if os.environ.get("DEVELOPMENT_MODE"):
        mock_data = {
            "communication_type": "Email",
            "compliance_status": "REVIEW_REQUIRED",
            "sentiment_analysis": {
                "overall": "Neutral"
            },
            "issues": [
                {
                    "category": "Disclosure",
                    "description": "Missing required risk disclosure",
                    "severity": "Medium",
                    "context": "We recommend investing in our new high-yield fund..."
                }
            ],
            "recommendations": [
                "Add standard risk disclosure statement",
                "Include performance disclaimer"
            ]
        }
        data = mock_data
    else:
        data = await make_api_request(f"communications/{communication_id}/analyze")
    
    if "error" in data:
        return f"Error analyzing communication: {data['error']}"
    
    # Format the communication analysis results
    result = f"## Communication Compliance Analysis\n\n"
    result += f"**Communication ID**: {communication_id}\n"
    result += f"**Analysis Time**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    
    if "communication_type" in data:
        result += f"**Type**: {data['communication_type']}\n"
    
    if "compliance_status" in data:
        result += f"**Compliance Status**: {data['compliance_status']}\n"
    
    if "sentiment_analysis" in data:
        sentiment = data["sentiment_analysis"]
        result += f"**Sentiment**: {sentiment.get('overall', 'Unknown')}\n"
    
    if "issues" in data and data["issues"]:
        result += "\n### Identified Issues\n\n"
        for issue in data["issues"]:
            result += f"- **{issue['category']}**: {issue['description']}\n"
            if "severity" in issue:
                result += f"  - Severity: {issue['severity']}\n"
            if "context" in issue:
                result += f"  - Context: \"{issue['context']}\"\n"
    else:
        result += "\n### No compliance issues detected\n"
    
    if "recommendations" in data and data["recommendations"]:
        result += "\n### Recommendations\n\n"
        for rec in data["recommendations"]:
            result += f"- {rec}\n"
    
    return result

@mcp.tool()
async def get_regulatory_updates() -> str:
    """Get the latest regulatory updates and changes relevant to financial compliance.
    
    Returns:
        A summary of recent regulatory updates
    """
    # In development mode, return mock data
    if os.environ.get("DEVELOPMENT_MODE"):
        mock_data = {
            "updates": [
                {
                    "title": "New AML Reporting Requirements",
                    "date": "2025-03-01",
                    "jurisdiction": "United States",
                    "category": "Anti-Money Laundering",
                    "summary": "The Financial Crimes Enforcement Network (FinCEN) has issued new guidelines for reporting suspicious transactions related to cryptocurrency exchanges.",
                    "action_items": [
                        "Update AML monitoring systems",
                        "Train compliance staff on new requirements",
                        "Implement enhanced due diligence for crypto transactions"
                    ]
                },
                {
                    "title": "ESG Disclosure Framework",
                    "date": "2025-02-15",
                    "jurisdiction": "European Union",
                    "category": "ESG Compliance",
                    "summary": "The European Securities and Markets Authority (ESMA) has finalized the new ESG disclosure framework for financial products.",
                    "action_items": [
                        "Assess current ESG reporting capabilities",
                        "Implement new disclosure templates",
                        "Review investment products for compliance"
                    ]
                }
            ]
        }
        data = mock_data
    else:
        data = await make_api_request("regulatory/updates")
    
    if "error" in data:
        return f"Error fetching regulatory updates: {data['error']}"
    
    # Format the regulatory updates
    result = f"## Recent Regulatory Updates\n\n"
    
    if "updates" in data and data["updates"]:
        for update in data["updates"]:
            result += f"### {update.get('title', 'Untitled Update')}\n\n"
            result += f"**Date**: {update.get('date', 'Unknown')}\n"
            result += f"**Jurisdiction**: {update.get('jurisdiction', 'Global')}\n"
            result += f"**Category**: {update.get('category', 'General')}\n\n"
            result += f"{update.get('summary', 'No summary available')}\n\n"
            
            if "action_items" in update and update["action_items"]:
                result += "**Required Actions**:\n"
                for item in update["action_items"]:
                    result += f"- {item}\n"
            
            result += "\n---\n\n"
    else:
        result += "No recent regulatory updates available.\n"
    
    return result

@mcp.tool()
async def generate_compliance_report(entity_id: str, report_type: str) -> str:
    """Generate a compliance report for a specific entity.
    
    Args:
        entity_id: The ID of the entity (customer, account, etc.)
        report_type: Type of report (summary, detailed, risk, audit)
    
    Returns:
        A formatted compliance report
    """
    # In development mode, return mock data
    if os.environ.get("DEVELOPMENT_MODE"):
        mock_data = {
            "summary": "This entity is generally compliant with current regulations, with minor issues requiring attention.",
            "risk_assessment": {
                "overall": "Medium-Low",
                "factors": [
                    {
                        "name": "Transaction Volume",
                        "level": "Medium",
                        "details": "Higher than average transaction volume for this customer segment"
                    },
                    {
                        "name": "Geographic Risk",
                        "level": "Low",
                        "details": "Operations primarily in low-risk jurisdictions"
                    },
                    {
                        "name": "Customer Due Diligence",
                        "level": "Low",
                        "details": "All required documentation is complete and verified"
                    }
                ]
            },
            "compliance_status": {
                "overall": "Compliant with Exceptions",
                "categories": [
                    {
                        "name": "KYC/AML",
                        "status": "Compliant",
                        "details": "All KYC requirements met"
                    },
                    {
                        "name": "Regulatory Reporting",
                        "status": "Compliant with Exceptions",
                        "details": "One late filing in the past quarter"
                    },
                    {
                        "name": "Transaction Monitoring",
                        "status": "Compliant",
                        "details": "No suspicious activity detected"
                    }
                ]
            },
            "recommendations": [
                "Review and update customer risk profile",
                "Implement additional monitoring for high-volume transactions",
                "Schedule quarterly compliance review"
            ]
        }
        data = mock_data
    else:
        data = await make_api_request(
            "reports/generate", 
            method="POST", 
            data={"entity_id": entity_id, "report_type": report_type}
        )
    
    if "error" in data:
        return f"Error generating compliance report: {data['error']}"
    
    # Format the compliance report
    result = f"## {report_type.capitalize()} Compliance Report\n\n"
    result += f"**Entity ID**: {entity_id}\n"
    result += f"**Report Time**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    result += f"**Report Type**: {report_type.capitalize()}\n\n"
    
    if "summary" in data:
        result += f"### Summary\n\n{data['summary']}\n\n"
    
    if "risk_assessment" in data:
        risk = data["risk_assessment"]
        result += f"### Risk Assessment\n\n"
        result += f"**Overall Risk**: {risk.get('overall', 'Unknown')}\n"
        
        if "factors" in risk and risk["factors"]:
            result += "\n**Risk Factors**:\n"
            for factor in risk["factors"]:
                result += f"- **{factor['name']}**: {factor['level']}\n"
                if "details" in factor:
                    result += f"  - {factor['details']}\n"
    
    if "compliance_status" in data:
        status = data["compliance_status"]
        result += f"\n### Compliance Status\n\n"
        result += f"**Status**: {status.get('overall', 'Unknown')}\n\n"
        
        if "categories" in status and status["categories"]:
            for category in status["categories"]:
                result += f"- **{category['name']}**: {category['status']}\n"
                if "details" in category:
                    result += f"  - {category['details']}\n"
    
    if "recommendations" in data and data["recommendations"]:
        result += "\n### Recommendations\n\n"
        for rec in data["recommendations"]:
            result += f"- {rec}\n"
    
    return result

# HTML for the homepage
async def homepage(request: Request) -> HTMLResponse:
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fintech Compliance MCP Server</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                line-height: 1.6;
                color: #333;
            }
            h1, h2 {
                color: #2563eb;
            }
            .card {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .tool {
                background-color: #f9fafb;
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 10px;
            }
            .tool h3 {
                margin-top: 0;
                color: #1f2937;
            }
            button {
                background-color: #2563eb;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
            }
            button:hover {
                background-color: #1d4ed8;
            }
            .status {
                border: 1px solid #e5e7eb;
                padding: 15px;
                min-height: 20px;
                margin-top: 15px;
                border-radius: 6px;
                background-color: #f9fafb;
            }
            code {
                background-color: #f1f5f9;
                padding: 2px 4px;
                border-radius: 4px;
                font-family: monospace;
            }
        </style>
    </head>
    <body>
        <h1>Fintech Compliance MCP Server</h1>
        
        <div class="card">
            <h2>About</h2>
            <p>This Model Context Protocol (MCP) server provides AI-powered financial compliance tools for integration with agentic workflows.</p>
            <p>The server exposes a set of specialized tools for transaction analysis, KYC verification, communication monitoring, and regulatory compliance reporting.</p>
        </div>
        
        <div class="card">
            <h2>Available Tools</h2>
            
            <div class="tool">
                <h3>analyze_transaction</h3>
                <p>Analyze a financial transaction for compliance issues.</p>
            </div>
            
            <div class="tool">
                <h3>verify_customer_kyc</h3>
                <p>Verify Know Your Customer (KYC) compliance for a specific customer.</p>
            </div>
            
            <div class="tool">
                <h3>analyze_communication</h3>
                <p>Analyze customer communication for compliance issues.</p>
            </div>
            
            <div class="tool">
                <h3>get_regulatory_updates</h3>
                <p>Get the latest regulatory updates and changes relevant to financial compliance.</p>
            </div>
            
            <div class="tool">
                <h3>generate_compliance_report</h3>
                <p>Generate a compliance report for a specific entity.</p>
            </div>
        </div>
        
        <button id="connect-button">Connect to SSE</button>
        
        <div class="status" id="status">Connection status will appear here...</div>
        
        <script>
            document.getElementById('connect-button').addEventListener('click', function() {
                const statusDiv = document.getElementById('status');
                
                try {
                    const eventSource = new EventSource('/sse');
                    
                    statusDiv.textContent = 'Connecting to MCP server...';
                    
                    eventSource.onopen = function() {
                        statusDiv.textContent = 'Connected to MCP server';
                    };
                    
                    eventSource.onerror = function() {
                        statusDiv.textContent = 'Error connecting to MCP server';
                        eventSource.close();
                    };
                    
                    eventSource.onmessage = function(event) {
                        statusDiv.textContent = 'Received: ' + event.data;
                    };
                    
                    // Add a disconnect option
                    const disconnectButton = document.createElement('button');
                    disconnectButton.textContent = 'Disconnect';
                    disconnectButton.style.marginLeft = '10px';
                    disconnectButton.style.backgroundColor = '#ef4444';
                    
                    disconnectButton.addEventListener('click', function() {
                        eventSource.close();
                        statusDiv.textContent = 'Disconnected from MCP server';
                        this.remove();
                    });
                    
                    document.body.insertBefore(disconnectButton, statusDiv);
                    
                } catch (e) {
                    statusDiv.textContent = 'Error: ' + e.message;
                }
            });
        </script>
    </body>
    </html>
    """
    return HTMLResponse(html_content)

# Create a Starlette application with SSE transport
def create_starlette_app(mcp_server: Server, *, debug: bool = False) -> Starlette:
    """Create a Starlette application that can serve the provided MCP server with SSE."""
    # Create an SSE transport with a path for messages
    sse = SseServerTransport("/messages/")

    # Handler for SSE connections
    async def handle_sse(request: Request) -> None:
        async with sse.connect_sse(
                request.scope,
                request.receive,
                request._send,  # access private method
        ) as (read_stream, write_stream):
            # Run the MCP server with the SSE streams
            await mcp_server.run(
                read_stream,
                write_stream,
                mcp_server.create_initialization_options(),
            )

    # API endpoint to get available tools
    async def get_tools(request: Request) -> JSONResponse:
        # Hardcoded list of tools with their descriptions and parameters
        tools = [
            {
                "name": "analyze_transaction",
                "description": "Analyze a financial transaction for compliance issues.",
                "parameters": [
                    {
                        "name": "transaction_id",
                        "type": "string",
                        "description": "The ID of the transaction to analyze"
                    }
                ]
            },
            {
                "name": "verify_customer_kyc",
                "description": "Verify Know Your Customer (KYC) compliance for a specific customer.",
                "parameters": [
                    {
                        "name": "customer_id",
                        "type": "string",
                        "description": "The ID of the customer to verify"
                    }
                ]
            },
            {
                "name": "analyze_communication",
                "description": "Analyze customer communication for compliance issues.",
                "parameters": [
                    {
                        "name": "communication_id",
                        "type": "string",
                        "description": "The ID of the communication to analyze"
                    }
                ]
            },
            {
                "name": "get_regulatory_updates",
                "description": "Get the latest regulatory updates and changes relevant to financial compliance.",
                "parameters": []
            },
            {
                "name": "generate_compliance_report",
                "description": "Generate a compliance report for a specific entity.",
                "parameters": [
                    {
                        "name": "entity_id",
                        "type": "string",
                        "description": "The ID of the entity (customer, account, etc.)"
                    },
                    {
                        "name": "report_type",
                        "type": "string",
                        "description": "Type of report (summary, detailed, risk, audit)"
                    }
                ]
            }
        ]
        return JSONResponse({"tools": tools})

    # Create and return the Starlette application
    return Starlette(
        debug=debug,
        routes=[
            Route("/", endpoint=homepage),  # Add the homepage route
            Route("/sse", endpoint=handle_sse),  # Endpoint for SSE connections
            Route("/api/tools", endpoint=get_tools),  # API endpoint to get available tools
            Mount("/messages/", app=sse.handle_post_message),  # Endpoint for messages
        ],
    )

if __name__ == "__main__":
    # Get the underlying MCP server from FastMCP wrapper
    mcp_server = mcp._mcp_server

    import argparse
    
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Run Fintech Compliance MCP Server')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
    parser.add_argument('--port', type=int, default=8080, help='Port to listen on')
    parser.add_argument('--dev', action='store_true', help='Run in development mode')
    args = parser.parse_args()
    
    if args.dev:
        os.environ["DEVELOPMENT_MODE"] = "1"
        print("Running in development mode with mock data")

    # Create and run the Starlette application
    starlette_app = create_starlette_app(mcp_server, debug=args.dev)
    uvicorn.run(starlette_app, host=args.host, port=args.port)
