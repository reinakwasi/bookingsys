import { NextRequest, NextResponse } from 'next/server'
import { PaystackService } from '@/lib/paystack'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Debug: Checking Paystack configuration...');
    
    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      PAYSTACK_SECRET_KEY: !!process.env.PAYSTACK_SECRET_KEY,
      NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
      publicKeyValue: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.substring(0, 10) + '...',
      secretKeyValue: process.env.PAYSTACK_SECRET_KEY?.substring(0, 10) + '...',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    };
    
    console.log('📋 Environment variables check:', envCheck);
    
    // Check Paystack service validation
    const configValidation = PaystackService.validateConfiguration();
    console.log('🔍 Paystack service validation:', configValidation);
    
    // Test payment data structure
    const testPaymentData = {
      amount: 10,
      email: 'test@hotel734.temp',
      reference: 'TEST_' + Date.now(),
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success`,
      metadata: {
        customer_name: 'Test User',
        customer_phone: '0244093821',
        test: true
      }
    };
    
    console.log('🧪 Test payment data:', testPaymentData);
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      validation: configValidation,
      testData: testPaymentData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Debug: Testing payment initialization...');
    
    // Get test data from request or use defaults
    let testData;
    try {
      testData = await request.json();
    } catch {
      testData = {
        amount: 10,
        email: 'customer12345678@hotel734.com',
        customerName: 'Test User',
        customerPhone: '0244093821',
        metadata: {
          reference: 'TEST_' + Date.now(),
          ticket_id: 'test-ticket',
          customer_name: 'Test User',
          customer_phone: '0244093821',
          customer_email: '',
          has_email: false
        }
      };
    }
    
    console.log('📤 Testing with data:', testData);
    
    // Test email validation
    if (testData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testData.email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format',
        email: testData.email,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Test the same logic as the real endpoint
    const configValidation = PaystackService.validateConfiguration();
    if (!configValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Paystack not configured',
        issues: configValidation.issues,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    const paymentData = {
      amount: testData.amount,
      email: testData.email,
      reference: testData.metadata?.reference || 'TEST_' + Date.now(),
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success?reference=${testData.metadata?.reference || 'TEST'}`,
      metadata: testData.metadata
    };
    
    console.log('🚀 Calling PaystackService.initializePayment...');
    const result = await PaystackService.initializePayment(paymentData);
    console.log('📥 PaystackService result:', result);
    
    return NextResponse.json({
      success: true,
      testData,
      paymentData,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Debug test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
