'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, MessageSquare, TestTube } from 'lucide-react';

export default function TestNotifications() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testNotifications = async (testType: 'email' | 'sms' | 'both') => {
    if (testType === 'email' && !email) {
      toast.error('Please enter an email address');
      return;
    }
    if (testType === 'sms' && !phone) {
      toast.error('Please enter a phone number');
      return;
    }
    if (testType === 'both' && (!email || !phone)) {
      toast.error('Please enter both email and phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/test-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || undefined,
          phone: phone || undefined,
          testType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const { results } = data;
        
        if (results.email.sent) {
          toast.success('✅ Test email sent successfully!');
        } else if (results.email.error) {
          toast.error(`❌ Email failed: ${results.email.error}`);
        }
        
        if (results.sms.sent) {
          toast.success('✅ Test SMS sent successfully!');
        } else if (results.sms.error) {
          toast.error(`❌ SMS failed: ${results.sms.error}`);
        }
      } else {
        toast.error(`Test failed: ${data.error}`);
      }
    } catch (error) {
      toast.error('Failed to run test');
      console.error('Test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Test Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Email Address</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test-phone">Phone Number</Label>
          <Input
            id="test-phone"
            type="tel"
            placeholder="+1234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={() => testNotifications('email')}
            disabled={isLoading || !email}
            variant="outline"
            className="w-full"
          >
            <Mail className="mr-2 h-4 w-4" />
            Test Email Only
          </Button>
          
          <Button
            onClick={() => testNotifications('sms')}
            disabled={isLoading || !phone}
            variant="outline"
            className="w-full"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Test SMS Only
          </Button>
          
          <Button
            onClick={() => testNotifications('both')}
            disabled={isLoading || !email || !phone}
            className="w-full"
          >
            <TestTube className="mr-2 h-4 w-4" />
            Test Both
          </Button>
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Email Setup:</strong> Configure RESEND_API_KEY or SMTP credentials in .env.local</p>
          <p><strong>SMS Setup:</strong> Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env.local</p>
        </div>
      </CardContent>
    </Card>
  );
}
