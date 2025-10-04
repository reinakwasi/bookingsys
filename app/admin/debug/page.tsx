'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminDebug() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/test');
      const results = await response.json();
      setTestResults(results);
      
      if (results.success) {
        toast.success('All tests passed!');
      } else {
        toast.error('Some tests failed: ' + results.error);
      }
    } catch (error) {
      toast.error('Failed to run tests: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setTestResults({
        success: false,
        error: 'Failed to run tests',
        tests: {
          supabaseConfig: false,
          databaseConnection: false,
          adminFunction: false,
          adminLogin: false
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSessions = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success('All sessions cleared');
  };

  const testLogin = async () => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'Hotel734!SecureAdmin2024'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Login test successful!');
      } else {
        toast.error('Login test failed: ' + result.error);
      }
      
      console.log('Login test result:', result);
    } catch (error) {
      toast.error('Login test error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Admin Authentication Debug</h1>
        
        <div className="grid gap-6">
          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            <div className="flex gap-4">
              <Button onClick={runTests} disabled={loading}>
                {loading ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              <Button onClick={testLogin} variant="outline">
                Test Login API
              </Button>
              <Button onClick={clearSessions} variant="outline">
                Clear All Sessions
              </Button>
            </div>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${testResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl ${testResults.success ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.success ? '✅' : '❌'}
                    </span>
                    <span className={`font-semibold ${testResults.success ? 'text-green-800' : 'text-red-800'}`}>
                      Overall Status: {testResults.success ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  {!testResults.success && (
                    <p className="text-red-700 mt-2">{testResults.error}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded border ${testResults.tests?.supabaseConfig ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      <span>{testResults.tests?.supabaseConfig ? '✅' : '❌'}</span>
                      <span className="font-medium">Supabase Config</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded border ${testResults.tests?.databaseConnection ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      <span>{testResults.tests?.databaseConnection ? '✅' : '❌'}</span>
                      <span className="font-medium">Database Connection</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded border ${testResults.tests?.adminFunction ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      <span>{testResults.tests?.adminFunction ? '✅' : '❌'}</span>
                      <span className="font-medium">Admin Function</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded border ${testResults.tests?.adminLogin ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      <span>{testResults.tests?.adminLogin ? '✅' : '❌'}</span>
                      <span className="font-medium">Admin Login</span>
                    </div>
                  </div>
                </div>

                {testResults.migrationRequired && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">Migration Required</h3>
                    <p className="text-yellow-700">
                      Please run the following SQL file in your Supabase SQL Editor:
                    </p>
                    <code className="block bg-yellow-100 p-2 rounded mt-2 text-sm">
                      {testResults.migrationFile}
                    </code>
                  </div>
                )}

                {testResults.adminData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Admin Data</h3>
                    <pre className="text-sm text-blue-700 bg-blue-100 p-2 rounded overflow-auto">
                      {JSON.stringify(testResults.adminData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <div className="space-y-3 text-gray-700">
              <p><strong>1. Run Tests:</strong> Click "Run All Tests" to check all authentication components</p>
              <p><strong>2. Check Results:</strong> Green checkmarks indicate working components</p>
              <p><strong>3. Fix Issues:</strong> If any tests fail, run the suggested SQL migration</p>
              <p><strong>4. Test Login:</strong> Use "Test Login API" to verify the login endpoint works</p>
              <p><strong>5. Clear Sessions:</strong> Use "Clear All Sessions" if you're stuck in a login loop</p>
            </div>
          </div>

          {/* Default Credentials */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Default Credentials</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Username:</strong> admin</p>
              <p><strong>Password:</strong> Hotel734!SecureAdmin2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
