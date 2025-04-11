import React from 'react'
import ComplianceAutomation from '@/components/ComplianceAutomation'
import { Shield, Check, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">FinGuard AI</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-blue-600">Documentation</a>
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-blue-600">API</a>
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-blue-600">Support</a>
          </nav>
        </div>
      </header>

      {/* Dashboard */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Compliance Dashboard</h2>
          <p className="text-gray-600">
            Access powerful compliance tools, system architecture, and performance metrics
          </p>
        </div>

        {/* Main Dashboard */}
        <div className="mb-8">
          <ComplianceAutomation />
        </div>

        {/* Integration Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold mb-4">LLM Integration</h3>
          <p className="mb-4">
            FinGuard AI provides a Model Context Protocol (MCP) server that enables LLMs like Claude 3.7 and OpenAI models to access specialized financial compliance tools.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="border rounded p-4">
              <div className="flex items-center mb-2">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <h4 className="font-medium">Simple Integration</h4>
              </div>
              <p className="text-sm text-gray-600">
                Standardized API endpoints for easy integration with any LLM that supports tool use
              </p>
            </div>
            <div className="border rounded p-4">
              <div className="flex items-center mb-2">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <h4 className="font-medium">Powerful Tools</h4>
              </div>
              <p className="text-sm text-gray-600">
                Access transaction analysis, KYC verification, and regulatory compliance tools
              </p>
            </div>
            <div className="border rounded p-4">
              <div className="flex items-center mb-2">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <h4 className="font-medium">Secure & Compliant</h4>
              </div>
              <p className="text-sm text-gray-600">
                Built with security and regulatory compliance as core design principles
              </p>
            </div>
          </div>
          <a 
            href="#" 
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View integration documentation <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                &copy; 2025 FinGuard AI. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Terms</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Privacy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
