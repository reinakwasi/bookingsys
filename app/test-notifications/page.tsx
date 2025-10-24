'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function TestNotifications() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isTestingSMS, setIsTestingSMS] = useState(false);

  const testEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsTestingEmail(true);
    console.log('🔍 Testing email notification...');
    
    try {
      const response = await fetch('/api/send-ticket-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: 'TEST-TOKEN-123',
          customer_email: email,
          customer_name: 'Test Customer',
          purchase_id: 'test-purchase-123'
        })
      });

      console.log('🔍 Email test response status:', response.status);
      const result = await response.json();
      console.log('🔍 Email test result:', result);
      
      if (response.ok && result.success) {
        toast.success('✅ Email sent successfully!');
        console.log('✅ Email test passed');
      } else {
        toast.error('❌ Email failed: ' + (result.error || 'Unknown error'));
        console.error('❌ Email test failed:', result);
      }
    } catch (error: any) {
      toast.error('❌ Email test failed: ' + error.message);
      console.error('❌ Email test error:', error);
    } finally {
      setIsTestingEmail(false);
    }
  };

  const testSMS = async () => {
    if (!phone) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsTestingSMS(true);
    console.log('🔍 Testing SMS notification...');
    
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phone,
          message: `🏨 HOTEL 734 - TEST SMS

Hello Test Customer!

This is a test SMS to verify your SMS configuration is working.

Time: ${new Date().toLocaleString()}

- Hotel 734 Team`
        })
      });

      console.log('🔍 SMS test response status:', response.status);
      const result = await response.json();
      console.log('🔍 SMS test result:', result);
      
      if (result.success) {
        toast.success('✅ SMS sent successfully!');
        console.log('✅ SMS test passed');
      } else {
        toast.error('❌ SMS failed: ' + (result.error || 'Unknown error'));
        console.error('❌ SMS test failed:', result);
      }
    } catch (error: any) {
      toast.error('❌ SMS test failed: ' + error.message);
      console.error('❌ SMS test error:', error);
    } finally {
      setIsTestingSMS(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-amber-400/20 shadow-2xl">
          <h1 className="text-3xl font-bold text-amber-100 mb-8 text-center">
            🧪 Notification API Testing
          </h1>

          <div className="space-y-6">
            {/* Email Testing */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-amber-200">📧 Email Test</h2>
              
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-amber-400/30 rounded-xl text-white placeholder-amber-200/50 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                onClick={testEmail}
                disabled={isTestingEmail}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-semibold py-3 px-6 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all duration-200 disabled:opacity-50"
              >
                {isTestingEmail ? 'Sending Email...' : 'Test Email'}
              </button>
            </div>

            {/* SMS Testing */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-amber-200">📱 SMS Test</h2>
              
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number (e.g., 0244093821)"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-amber-400/30 rounded-xl text-white placeholder-amber-200/50 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                onClick={testSMS}
                disabled={isTestingSMS}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-semibold py-3 px-6 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all duration-200 disabled:opacity-50"
              >
                {isTestingSMS ? 'Sending SMS...' : 'Test SMS'}
              </button>
            </div>

            <div className="mt-8 p-4 bg-slate-700/30 rounded-xl">
              <h3 className="font-semibold text-amber-200 mb-2">📋 Instructions:</h3>
              <ul className="text-amber-200/80 text-sm space-y-1">
                <li>1. Enter your email and phone number above</li>
                <li>2. Click the test buttons</li>
                <li>3. Check browser console for detailed logs</li>
                <li>4. Verify you receive the test notifications</li>
                <li>5. If tests fail, check your .env.local configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
