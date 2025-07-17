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

const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
    />
  </div>
);

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
    avgResponseTime: 142
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch user's APIs on component mount
  useEffect(() => {
    if (user) {
      fetchUserApis();
      fetchAnalytics();
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
      const newApi = await apiClient.post('/apis', {
        name: apiName,
        endpoint,
        description,
        code,
        language,
        parameters,
        is_public: isPublic,
        rate_limit: rateLimit,
        pricing
      });
      
      setDeployedApis([...deployedApis, newApi]);
      
      // Reset form
      setApiName('');
      setEndpoint('');
      setDescription('');
      setCode('');
      setParameters([]);
      
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
      const result = await apiClient.post('/apis/generate', {
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

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />;
  }

  const tabs = [
    { id: 'builder', label: 'API Builder', icon: Code },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'data', label: 'Data Manager', icon: Database },
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
                </div>
              </div>

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
                    <p className="text-2xl font-bold text-white">{analytics.totalRequests.toLocaleString()}</p>
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
                    <p className="text-2xl font-bold text-white">${analytics.revenue.toFixed(2)}</p>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default APIMakerEngine;
