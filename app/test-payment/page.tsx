'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TestPaymentPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [testResult, setTestResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const testPaymentInitialization = async () => {
    setIsLoading(true)
    setTestResult('Testing...')
    
    try {
      console.log('🧪 Starting payment test...')
      console.log('📝 Form data:', formData)
      
      // Generate temporary email if none provided
      const tempEmail = formData.email.trim() || `customer${formData.phone.replace(/\D/g, '').slice(-8) || Date.now().toString().slice(-8)}@hotel734.com`
      
      console.log('📧 Email to use:', tempEmail)
      
      const requestData = {
        amount: 10, // Test amount
        email: tempEmail,
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        metadata: {
          reference: 'TEST_' + Date.now(),
          ticket_id: 'test-ticket',
          customer_name: formData.name.trim(),
          customer_phone: formData.phone.trim(),
          customer_email: formData.email.trim(),
          has_email: !!formData.email.trim(),
          test: true
        }
      }
      
      console.log('📤 Request data:', requestData)
      
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })
      
      console.log('📡 Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        let errorDetails
        try {
          const errorJson = await response.json()
          errorDetails = errorJson.error || errorJson.message || 'Unknown error'
          console.error('❌ API Error (JSON):', errorJson)
        } catch {
          errorDetails = await response.text()
          console.error('❌ API Error (Text):', errorDetails)
        }
        
        setTestResult(`❌ FAILED: ${response.status} - ${errorDetails}`)
        return
      }
      
      const result = await response.json()
      console.log('✅ Success response:', result)
      
      setTestResult(`✅ SUCCESS: Payment initialized successfully!\nReference: ${result.reference}\nAuthorization URL: ${result.authorization_url ? 'Present' : 'Missing'}`)
      
    } catch (error) {
      console.error('❌ Test error:', error)
      setTestResult(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Payment Initialization Test</h1>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your name"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Enter your phone"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter your email (leave empty to test)"
          />
        </div>
        
        <Button 
          onClick={testPaymentInitialization}
          disabled={isLoading || !formData.name.trim() || !formData.phone.trim()}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Payment Initialization'}
        </Button>
        
        {testResult && (
          <div className="mt-4 p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Test Result:</h3>
            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Fill in Name and Phone (required)</li>
            <li>Leave Email empty to test no-email scenario</li>
            <li>Click "Test Payment Initialization"</li>
            <li>Check browser console for detailed logs</li>
            <li>Check server console for API logs</li>
          </ol>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p className="text-sm">
            <strong>Temporary Email:</strong> {formData.email.trim() || `customer${formData.phone.replace(/\D/g, '').slice(-8) || 'XXXXXXXX'}@hotel734.com`}
          </p>
          <p className="text-sm">
            <strong>Has Real Email:</strong> {!!formData.email.trim() ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    </div>
  )
}
