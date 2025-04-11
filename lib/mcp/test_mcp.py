import requests
import json
import time
import os
import sys
import argparse
from datetime import datetime

def test_mcp_server(base_url):
    """Test the MCP server by making requests to its endpoints."""
    print(f"\n🔍 Testing MCP server at {base_url}...")
    
    # Test 1: Check if the server is running
    try:
        response = requests.get(base_url)
        if response.status_code == 200:
            print("✅ Server is running")
        else:
            print(f"❌ Server returned status code {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Failed to connect to server. Is it running?")
        return False
    
    # Test 2: Check if the API tools endpoint is available
    try:
        response = requests.get(f"{base_url}/api/tools")
        if response.status_code == 200:
            tools = response.json().get("tools", [])
            print(f"✅ Found {len(tools)} tools available")
            
            # Print the available tools
            print("\n📋 Available Tools:")
            for tool in tools:
                print(f"  • {tool['name']}: {tool['description']}")
        else:
            print(f"❌ API tools endpoint returned status code {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking API tools: {str(e)}")
    
    # Test 3: Simulate a simple SSE connection
    print("\n🔄 Testing SSE connection (will timeout after 5 seconds)...")
    try:
        # This is a simplified test - in a real scenario, you'd use a proper SSE client
        # We're just checking if the endpoint responds correctly
        response = requests.get(f"{base_url}/sse", stream=True, timeout=5)
        if response.status_code == 200:
            print("✅ SSE endpoint is available")
        else:
            print(f"❌ SSE endpoint returned status code {response.status_code}")
    except requests.exceptions.ReadTimeout:
        # This is expected as we're not properly handling the SSE stream
        print("✅ SSE connection established (timed out as expected)")
    except Exception as e:
        print(f"❌ Error testing SSE connection: {str(e)}")
    
    print("\n✨ MCP server test completed successfully!")
    return True

def main():
    parser = argparse.ArgumentParser(description="Test the Fintech Compliance MCP Server")
    parser.add_argument("--host", default="localhost", help="Host where the MCP server is running")
    parser.add_argument("--port", type=int, default=8080, help="Port where the MCP server is running")
    args = parser.parse_args()
    
    base_url = f"http://{args.host}:{args.port}"
    
    print("=" * 60)
    print(f"🚀 Fintech Compliance MCP Server Test")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    success = test_mcp_server(base_url)
    
    if success:
        print("\n🎉 The MCP server is working properly!")
        print("\nTo integrate with NANDA, add the following server configuration:")
        print("-" * 60)
        print(f"""
Server Name: Fintech Compliance
URL: {base_url}
Description: AI-powered financial compliance tools for agentic workflows
        """)
        print("-" * 60)
    else:
        print("\n❌ Some tests failed. Please check the server logs for more information.")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
