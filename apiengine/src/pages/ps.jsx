import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import { 
  Play, 
  Save, 
  Settings, 
  Database, 
  Code, 
  Globe, 
  Lock, 
  DollarSign, 
  Activity, 
  Upload, 
  Download,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Zap,
  Server,
  Users,
  BarChart3,
  FileText,
  Sparkles,
  LogOut,
  User,
  Shield,
  Clock,
  CheckCircle,
  TrendingUp,
  TestTube
} from 'lucide-react';

const APICodeEditor = ({ code, onChange, language }) => (
  <div className="relative">
    <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
      {language}
    </div>
    <textarea
      value={code}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-64 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
      placeholder={`Enter your ${language} code here...`}
      spellCheck={false}
    />
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = "text", step }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      step={step}
      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
    />
  </div>
);

const APIParameterBuilder = ({ parameters, setParameters }) => {
  const addParameter = () => {
    setParameters([...parameters, { name: '', type: 'string', required: true, description: '' }]);
  };

  const removeParameter = (index) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index, field, value) => {
    const updated = [...parameters];
    updated[index][field] = value;
    setParameters(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">API Parameters</h3>
        <button
          onClick={addParameter}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Parameter
        </button>
      </div>

      {parameters.map((param, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Parameter {index + 1}</span>
            <button
              onClick={() => removeParameter(index)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Name"
              value={param.name}
              onChange={(e) => updateParameter(index, 'name', e.target.value)}
              placeholder="parameter_name"
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Type</label>
              <select
                value={param.type}
                onChange={(e) => updateParameter(index, 'type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
              >
                <option value="string">String</option>
                <option value="integer">Integer</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
                <option value="object">Object</option>
              </select>
            </div>
          </div>
          
          <InputField
            label="Description"
            value={param.description}
            onChange={(e) => updateParameter(index, 'description', e.target.value)}
            placeholder="Parameter description"
          />
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={param.required}
              onChange={(e) => updateParameter(index, 'required', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-300">Required</label>
          </div>
        </div>
      ))}
    </div>
  );
};

const APIMakerEngine = () => {
  const { user, logout, apiClient } = useAuth();
  const [activeTab, setActiveTab] = useState('builder');
  const [apiName, setApiName] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [parameters, setParameters] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [rateLimit, setRateLimit] = useState({ requests: 1000, period: 'day' });
  const [pricing, setPricing] = useState({ model: 'payg', pricePerRequest: 0.001 });
  const [isRunning, setIsRunning] = useState(false);
  const [deployedApis, setDeployedApis] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalRequests: 0,
    revenue: 0,
    avgResponseTime: 142,
    openai_costs: {
      daily_cost: 0,
      total_cost: 0,
      remaining_budget: 5.00,
      usage_percentage: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Enhanced features state
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [newDatabaseName, setNewDatabaseName] = useState('');
  const [databaseType, setDatabaseType] = useState('sqlite');
  const [enableDatabase, setEnableDatabase] = useState(false);
  const [tableNameForApi, setTableNameForApi] = useState('');
  const [testCases, setTestCases] = useState([]);
  const [newTestCase, setNewTestCase] = useState({
    name: '',
    method: 'POST',
    endpoint: '',
    headers: {},
    body: null,
    query_params: {},
    expected_status: 200
  });
  const [testResults, setTestResults] = useState(null);
  const [selectedApiForTesting, setSelectedApiForTesting] = useState('');
  const [apiSettings, setApiSettings] = useState({
    max_requests_per_hour: 1000,
    max_requests_per_day: 10000,
    max_requests_per_month: 100000,
    requires_auth: false,
    allowed_origins: '*',
    webhook_url: ''
  });
  
  // Testing related states
  const [selectedApiForTest, setSelectedApiForTest] = useState('');
  const [testMethod, setTestMethod] = useState('GET');
  const [testHeaders, setTestHeaders] = useState('{"Content-Type": "application/json"}');
  const [testBody, setTestBody] = useState('{}');
  const [testResponse, setTestResponse] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  // Fetch user's APIs and analytics on component mount
  useEffect(() => {
    if (user) {
      fetchUserApis();
      fetchAnalytics();
      fetchDatabases();
    }
  }, [user]);

  const fetchUserApis = async () => {
    try {
      setLoading(true);
      const apis = await apiClient.get('/apis');
      setDeployedApis(apis);
    } catch (error) {
      setError('Failed to fetch APIs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await apiClient.get('/analytics');
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchDatabases = async () => {
    try {
      const data = await apiClient.get('/databases');
      setDatabases(data.databases || []);
    } catch (error) {
      console.error('Failed to fetch databases:', error);
    }
  };

  const createDatabase = async () => {
    if (!newDatabaseName.trim()) {
      setError('Database name is required');
      return;
    }

    try {
      await apiClient.post('/databases', {
        database_name: newDatabaseName,
        database_type: databaseType
      });
      setNewDatabaseName('');
      fetchDatabases();
      setError('');
    } catch (error) {
      setError('Failed to create database: ' + error.message);
    }
  };

  const generateApiKey = () => {
    const key = 'ak_' + Math.random().toString(36).substr(2, 32);
    setApiKey(key);
  };

  const runCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to test');
      return;
    }

    setIsRunning(true);
    setError('');
    
    try {
      const result = await apiClient.post('/apis/test', {
        code,
        language,
        parameters
      });
      
      alert(`Code executed successfully!\nOutput: ${result.output || 'No output'}`);
    } catch (error) {
      setError('Code execution failed: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const deployApi = async () => {
    if (!apiName || !endpoint || !code) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Use enhanced API creation if database is enabled
      const apiData = {
        name: apiName,
        endpoint,
        description,
        code,
        language,
        parameters,
        is_public: isPublic,
        api_key: apiKey,
        rate_limit_requests: rateLimit.requests,
        rate_limit_period: rateLimit.period,
        pricing_model: pricing.model,
        price_per_request: pricing.pricePerRequest,
        settings: apiSettings
      };

      // Add database connection if enabled
      if (enableDatabase && selectedDatabase) {
        apiData.database_connection = {
          database_id: selectedDatabase,
          table_name: tableNameForApi || endpoint.replace('-', '_')
        };
      }

      const newApi = await apiClient.post(enableDatabase ? '/apis/enhanced' : '/apis', apiData);
      
      setDeployedApis([...deployedApis, newApi]);
      
      // Reset form
      setApiName('');
      setEndpoint('');
      setDescription('');
      setCode('');
      setParameters([]);
      setEnableDatabase(false);
      setSelectedDatabase('');
      setTableNameForApi('');
      
      alert(`API deployed successfully! Available at: ${newApi.endpoint}`);
      setActiveTab('apis');
    } catch (error) {
      setError('Deployment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateFromPrompt = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your API');
      return;
    }
    
    setIsRunning(true);
    setError('');
    
    try {
      const result = await apiClient.post('/generate-code', {
        prompt,
        language
      });
      
      setCode(result.code);
      if (result.suggested_name) setApiName(result.suggested_name);
      if (result.suggested_endpoint) setEndpoint(result.suggested_endpoint);
      if (result.description) setDescription(result.description);
      if (result.parameters) setParameters(result.parameters);
      
    } catch (error) {
      setError('Code generation failed: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const deleteApi = async (apiId) => {
    if (!window.confirm('Are you sure you want to delete this API?')) return;
    
    try {
      await apiClient.delete(`/apis/${apiId}`);
      setDeployedApis(deployedApis.filter(api => api.id !== apiId));
      alert('API deleted successfully');
    } catch (error) {
      setError('Failed to delete API: ' + error.message);
    }
  };

  const addTestCase = () => {
    if (!newTestCase.name.trim()) {
      setError('Test case name is required');
      return;
    }

    setTestCases([...testCases, { ...newTestCase, id: Date.now() }]);
    setNewTestCase({
      name: '',
      method: 'POST',
      endpoint: '',
      headers: {},
      body: null,
      query_params: {},
      expected_status: 200
    });
    setError('');
  };

  const removeTestCase = (id) => {
    setTestCases(testCases.filter(tc => tc.id !== id));
  };

  const runTestSuite = async () => {
    if (!selectedApiForTesting) {
      setError('Please select an API to test');
      return;
    }

    if (testCases.length === 0) {
      setError('Please add at least one test case');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const results = await apiClient.post(`/apis/${selectedApiForTesting}/test-suite`, testCases);
      setTestResults(results);
      setActiveTab('test');
    } catch (error) {
      setError('Test suite failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSingleApi = async (apiId, testData) => {
    try {
      setLoading(true);
      const result = await apiClient.post(`/apis/${apiId}/test`, testData);
      return result;
    } catch (error) {
      throw new Error('API test failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testApi = async () => {
    if (!selectedApiForTest) {
      setError('Please select an API to test');
      return;
    }

    setTestLoading(true);
    setError('');
    
    try {
      const selectedApi = deployedApis.find(api => api.id === selectedApiForTest);
      if (!selectedApi) {
        throw new Error('Selected API not found');
      }

      const startTime = Date.now();
      
      // Parse headers
      let headers = {};
      try {
        headers = JSON.parse(testHeaders);
      } catch (e) {
        headers = { 'Content-Type': 'application/json' };
      }

      // Parse body for POST/PUT requests
      let body = null;
      if (testMethod === 'POST' || testMethod === 'PUT') {
        try {
          body = JSON.parse(testBody);
        } catch (e) {
          body = {};
        }
      }

      const response = await apiClient.post(`/apis/${selectedApiForTest}/test`, {
        method: testMethod,
        headers,
        body
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      setTestResponse({
        status: response.status || 200,
        statusText: response.status_text || 'OK',
        responseTime,
        headers: response.headers || {},
        body: response.data || response,
        contentLength: JSON.stringify(response.data || response).length
      });

    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - Date.now();
      
      setTestResponse({
        status: error.response?.status || 500,
        statusText: error.response?.statusText || 'Error',
        responseTime,
        headers: error.response?.headers || {},
        body: { error: error.message },
        contentLength: JSON.stringify({ error: error.message }).length
      });
      
      setError('API test failed: ' + error.message);
    } finally {
      setTestLoading(false);
    }
  };

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />;
  }

  const tabs = [
    { id: 'builder', label: 'API Builder', icon: Code },
    { id: 'databases', label: 'Databases', icon: Database },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'test', label: 'API Testing', icon: TestTube },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'apis', label: 'My APIs', icon: Server }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  API Maker Engine
                </h1>
                <p className="text-sm text-gray-400">Create powerful APIs in seconds</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <User size={16} />
                <span>Welcome, {user?.username || 'User'}</span>
              </div>
              <div className="text-sm text-gray-400">
                <span className="text-green-400">●</span> Online
              </div>
              <button 
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400">
            {error}
            <button 
              onClick={() => setError('')}
              className="float-right text-red-300 hover:text-red-100"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* API Builder Tab */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-yellow-400" size={20} />
                  <h2 className="text-xl font-semibold">AI-Powered API Generation</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Describe what you want your API to do
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., Create a user management API that can register users, authenticate them, and manage profiles with MongoDB storage"
                      className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    onClick={generateFromPrompt}
                    disabled={isRunning || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isRunning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Generate API Code
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Code Editor</h2>
                  <div className="flex items-center gap-2">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
                      <option value="go">Go</option>
                      <option value="php">PHP</option>
                    </select>
                    <button
                      onClick={runCode}
                      disabled={isRunning}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      {isRunning ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Play size={16} />
                      )}
                      Run Code
                    </button>
                  </div>
                </div>
                <APICodeEditor
                  code={code}
                  onChange={setCode}
                  language={language}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">API Details</h3>
                <div className="space-y-4">
                  <InputField
                    label="API Name"
                    value={apiName}
                    onChange={(e) => setApiName(e.target.value)}
                    placeholder="My Awesome API"
                  />
                  <InputField
                    label="Endpoint"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="my-api"
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What does your API do?"
                      className="w-full h-20 bg-gray-900 border border-gray-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>
                  
                  {/* Database Connection */}
                  <div className="space-y-3 border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="enableDatabase"
                        checked={enableDatabase}
                        onChange={(e) => setEnableDatabase(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="enableDatabase" className="text-sm font-medium text-gray-300">
                        Connect to Database
                      </label>
                    </div>
                    
                    {enableDatabase && (
                      <div className="space-y-3 ml-6">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Select Database</label>
                          <select
                            value={selectedDatabase}
                            onChange={(e) => setSelectedDatabase(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Choose a database...</option>
                            {databases.map((db) => (
                              <option key={db.id} value={db.id}>
                                {db.database_name} ({db.database_type})
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {selectedDatabase && (
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Table Name (optional)</label>
                            <input
                              type="text"
                              value={tableNameForApi}
                              onChange={(e) => setTableNameForApi(e.target.value)}
                              placeholder={endpoint.replace('-', '_') || 'table_name'}
                              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave empty to use endpoint name as table name</p>
                          </div>
                        )}
                        
                        {databases.length === 0 && (
                          <div className="text-center py-3 text-gray-500 text-sm">
                            <p>No databases available.</p>
                            <button
                              onClick={() => setActiveTab('databases')}
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              Create a database first
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* API Configuration */}
                  <div className="space-y-3 border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-4 h-4 text-green-600 bg-gray-900 border-gray-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="isPublic" className="text-sm font-medium text-gray-300">
                        Public API (no authentication required)
                      </label>
                    </div>
                    
                    {!isPublic && (
                      <div className="ml-6 space-y-2">
                        <label className="block text-xs font-medium text-gray-400">API Key</label>
                        <div className="flex gap-2">
                          <input
                            type={showApiKey ? "text" : "password"}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Auto-generated if empty"
                            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300"
                          >
                            {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={generateApiKey}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm"
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Rate Limit</label>
                        <input
                          type="number"
                          value={rateLimit.requests}
                          onChange={(e) => setRateLimit({...rateLimit, requests: parseInt(e.target.value) || 1000})}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Period</label>
                        <select
                          value={rateLimit.period}
                          onChange={(e) => setRateLimit({...rateLimit, period: e.target.value})}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                          <option value="hour">Per Hour</option>
                          <option value="day">Per Day</option>
                          <option value="month">Per Month</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <APIParameterBuilder parameters={parameters} setParameters={setParameters} />

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={deployApi}
                    disabled={!apiName || !endpoint || !code || loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Server size={16} />
                    )}
                    {loading ? 'Deploying...' : 'Deploy API'}
                  </button>
                  <button className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <Save size={16} />
                    Save Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Databases Tab */}
        {activeTab === 'databases' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Database Management</h2>
            
            {/* Create New Database */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
              <h3 className="text-lg font-semibold mb-4">Create New Database</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Database name"
                  value={newDatabaseName}
                  onChange={(e) => setNewDatabaseName(e.target.value)}
                  className="bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
                <select
                  value={databaseType}
                  onChange={(e) => setDatabaseType(e.target.value)}
                  className="bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="sqlite">SQLite</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                </select>
                <button
                  onClick={createDatabase}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Create Database
                </button>
              </div>
            </div>

            {/* Existing Databases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {databases.map((db) => (
                <div key={db.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{db.database_name}</h3>
                    <div className="px-2 py-1 rounded text-xs font-medium bg-green-900/50 text-green-400">
                      {db.database_type}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Database size={14} />
                      <span className="font-mono text-xs">{db.database_path || db.connection_string}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock size={14} />
                      <span>Created: {new Date(db.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
                    <button
                      onClick={() => {/* Add table management logic */}}
                      className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Manage Tables
                    </button>
                    <button
                      onClick={() => {/* Add backup logic */}}
                      className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Backup
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {databases.length === 0 && (
              <div className="text-center py-12">
                <Database size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No databases yet</h3>
                <p className="text-gray-500">Create your first database to start storing data for your APIs</p>
              </div>
            )}
          </div>
        )}

        {/* My APIs Tab */}
        {activeTab === 'apis' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My APIs</h2>
              <button
                onClick={() => setActiveTab('builder')}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Create New API
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {deployedApis.map((api) => (
                <div key={api.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{api.name}</h3>
                    <div className="px-2 py-1 rounded text-xs font-medium bg-green-900/50 text-green-400">
                      {api.status || 'active'}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Globe size={14} />
                      <span className="font-mono text-xs">{api.endpoint}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users size={14} />
                      <span>{api.requests || 0} requests</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Code size={14} />
                      <span className="capitalize">{api.language}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm transition-colors">
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteApi(api.id)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {deployedApis.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Server size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No APIs deployed yet</h3>
                  <p className="text-gray-400 mb-4">Create your first API to get started</p>
                  <button
                    onClick={() => setActiveTab('builder')}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Create Your First API
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Requests</p>
                    <p className="text-2xl font-bold text-white">{analytics.totalRequests?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-blue-600/20 p-3 rounded-lg">
                    <BarChart3 className="text-blue-400" size={24} />
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-400">
                  +23% from last month
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active APIs</p>
                    <p className="text-2xl font-bold text-white">{deployedApis.length}</p>
                  </div>
                  <div className="bg-green-600/20 p-3 rounded-lg">
                    <Server className="text-green-400" size={24} />
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-400">
                  All systems operational
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Revenue</p>
                    <p className="text-2xl font-bold text-white">${analytics.revenue?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="bg-purple-600/20 p-3 rounded-lg">
                    <DollarSign className="text-purple-400" size={24} />
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-400">
                  +12% from last week
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Response Time</p>
                    <p className="text-2xl font-bold text-white">{analytics.avgResponseTime}ms</p>
                  </div>
                  <div className="bg-yellow-600/20 p-3 rounded-lg">
                    <Activity className="text-yellow-400" size={24} />
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-400">
                  -5ms from yesterday
                </div>
              </div>
            </div>

            {/* OpenAI Cost Tracking */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">AI Cost Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Daily AI Cost</p>
                      <p className="text-2xl font-bold text-white">${analytics.openai_costs?.daily_cost?.toFixed(4) || '0.0000'}</p>
                    </div>
                    <div className="bg-orange-600/20 p-3 rounded-lg">
                      <DollarSign className="text-orange-400" size={24} />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-blue-400">
                    Today's OpenAI usage
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total AI Cost</p>
                      <p className="text-2xl font-bold text-white">${analytics.openai_costs?.total_cost?.toFixed(4) || '0.0000'}</p>
                    </div>
                    <div className="bg-red-600/20 p-3 rounded-lg">
                      <Activity className="text-red-400" size={24} />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-blue-400">
                    All-time OpenAI usage
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Remaining Budget</p>
                      <p className="text-2xl font-bold text-white">${analytics.openai_costs?.remaining_budget?.toFixed(2) || '5.00'}</p>
                    </div>
                    <div className="bg-green-600/20 p-3 rounded-lg">
                      <CheckCircle className="text-green-400" size={24} />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-green-400">
                    Available today
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Budget Usage</p>
                      <p className="text-2xl font-bold text-white">{(analytics.openai_costs?.usage_percentage || 0).toFixed(1)}%</p>
                    </div>
                    <div className={`p-3 rounded-lg ${(analytics.openai_costs?.usage_percentage || 0) > 80 ? 'bg-red-600/20' : 'bg-blue-600/20'}`}>
                      <BarChart3 className={`${(analytics.openai_costs?.usage_percentage || 0) > 80 ? 'text-red-400' : 'text-blue-400'}`} size={24} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${(analytics.openai_costs?.usage_percentage || 0) > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(analytics.openai_costs?.usage_percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lock size={20} />
                  Security Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Public API</label>
                      <p className="text-xs text-gray-400">Anyone can access without authentication</p>
                    </div>
                    <button
                      onClick={() => setIsPublic(!isPublic)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isPublic ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isPublic ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {!isPublic && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">API Key</label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type={showApiKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter or generate API key"
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white pr-10"
                          />
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2 top-2 text-gray-400 hover:text-white"
                          >
                            {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <button
                          onClick={generateApiKey}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity size={20} />
                  Rate Limiting
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Requests"
                      value={rateLimit.requests}
                      onChange={(e) => setRateLimit({...rateLimit, requests: e.target.value})}
                      placeholder="1000"
                      type="number"
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Period</label>
                      <select
                        value={rateLimit.period}
                        onChange={(e) => setRateLimit({...rateLimit, period: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                      >
                        <option value="hour">Per Hour</option>
                        <option value="day">Per Day</option>
                        <option value="month">Per Month</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 bg-gray-900 p-3 rounded">
                    <strong>Current limit:</strong> {rateLimit.requests} requests per {rateLimit.period}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign size={20} />
                  Pricing Model
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Billing Model</label>
                    <select
                      value={pricing.model}
                      onChange={(e) => setPricing({...pricing, model: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                    >
                      <option value="payg">Pay as You Go</option>
                      <option value="subscription">Monthly Subscription</option>
                      <option value="free">Free Tier</option>
                    </select>
                  </div>
                  
                  {pricing.model === 'payg' && (
                    <InputField
                      label="Price per Request ($)"
                      value={pricing.pricePerRequest}
                      onChange={(e) => setPricing({...pricing, pricePerRequest: e.target.value})}
                      placeholder="0.001"
                      type="number"
                      step="0.001"
                    />
                  )}
                  
                  <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-4 rounded-lg border border-green-500/20">
                    <div className="text-sm text-green-400 font-medium mb-2">Estimated Revenue</div>
                    <div className="text-lg font-bold text-white">
                      ${(rateLimit.requests * pricing.pricePerRequest * 30).toFixed(2)}/month
                    </div>
                    <div className="text-xs text-gray-400">
                      Based on {rateLimit.requests} requests daily
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Container Resources</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Memory</span>
                    <span className="text-sm font-medium">512 MB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">CPU</span>
                    <span className="text-sm font-medium">0.5 vCPU</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Storage</span>
                    <span className="text-sm font-medium">1 GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Auto-scaling</span>
                    <span className="text-sm font-medium text-green-400">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Testing Tab */}
        {activeTab === 'test' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TestTube size={20} />
                  API Testing Playground
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select API to Test
                    </label>
                    <select 
                      value={selectedApiForTest}
                      onChange={(e) => setSelectedApiForTest(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                    >
                      <option value="">Choose an API...</option>
                      {deployedApis.map(api => (
                        <option key={api.id} value={api.id}>{api.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">HTTP Method</label>
                    <select 
                      value={testMethod}
                      onChange={(e) => setTestMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Request Headers</label>
                    <textarea
                      value={testHeaders}
                      onChange={(e) => setTestHeaders(e.target.value)}
                      className="w-full h-20 bg-gray-900 text-green-400 font-mono text-sm p-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                      placeholder='{"Content-Type": "application/json"}'
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Request Body</label>
                    <textarea
                      value={testBody}
                      onChange={(e) => setTestBody(e.target.value)}
                      className="w-full h-32 bg-gray-900 text-green-400 font-mono text-sm p-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                      placeholder='{"key": "value"}'
                    />
                  </div>
                  
                  <button 
                    onClick={testApi}
                    disabled={!selectedApiForTest || testLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {testLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Play size={16} />
                    )}
                    {testLoading ? 'Testing...' : 'Send Request'}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Response</h3>
                {testResponse ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Status Code:</span>
                      <span className={`font-mono ${testResponse.status >= 200 && testResponse.status < 300 ? 'text-green-400' : 'text-red-400'}`}>
                        {testResponse.status} {testResponse.statusText}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Response Time:</span>
                      <span className="text-blue-400 font-mono">{testResponse.responseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Content Length:</span>
                      <span className="text-purple-400 font-mono">{(testResponse.contentLength / 1024).toFixed(2)} KB</span>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Response Body</label>
                      <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 max-h-64 overflow-auto">
                        <pre className="text-green-400 text-xs font-mono">
                          {JSON.stringify(testResponse.body, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <TestTube size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No test results yet</p>
                    <p className="text-sm">Send a request to see the response</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Data Manager Tab */}
        {activeTab === 'data' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Data Manager</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload size={20} />
                  Upload Data
                </h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <Upload size={32} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400 mb-2">Drop files here or click to browse</p>
                    <p className="text-xs text-gray-500">Supports JSON, CSV, XML, and more</p>
                    <button className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                      Choose Files
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Data Source URL</label>
                    <input
                      type="text"
                      placeholder="https://api.example.com/data"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Database size={20} />
                  Data Storage
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Storage Used</span>
                      <span className="text-sm text-gray-400">125 MB / 1 GB</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '12.5%'}}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-gray-700">
                      <span className="text-sm text-gray-300">users.json</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">2.3 MB</span>
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-700">
                      <span className="text-sm text-gray-300">products.csv</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">1.1 MB</span>
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIMakerEngine;
