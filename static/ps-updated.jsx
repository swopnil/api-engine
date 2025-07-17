import React, { useState, useEffect, useContext, createContext } from 'react';
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
  Home,
  TestTube,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';

// API Client for backend communication
class APIClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('api_token');
  }
  
  setToken(token) {
    this.token = token;
    localStorage.setItem('api_token', token);
  }
  
  clearToken() {
    this.token = null;
    localStorage.removeItem('api_token');
  }
  
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Network error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }
  
  async get(endpoint) {
    return this.request(endpoint);
  }
  
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

const apiClient = new APIClient();

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (apiClient.token) {
          const userData = await apiClient.get('/auth/me');
          setUser(userData);
        }
      } catch (error) {
        apiClient.clearToken();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    apiClient.setToken(response.token);
    setUser(response.user);
    return response;
  };
  
  const register = async (username, email, password) => {
    const response = await apiClient.post('/auth/register', { username, email, password });
    apiClient.setToken(response.token);
    setUser(response.user);
    return response;
  };
  
  const logout = () => {
    apiClient.clearToken();
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Login Component
const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
            <Zap className="text-white" size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          API Maker Engine
        </h1>
        <p className="text-gray-400 text-center mb-6">
          {isLogin ? 'Welcome back!' : 'Create your account'}
        </p>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none text-white"
              required
            />
          </div>
          
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none text-white"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none text-white"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all"
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-400 bg-gray-900/50 p-3 rounded">
          <p className="font-medium mb-1">Demo Credentials:</p>
          <p>Username: <span className="font-mono">admin</span></p>
          <p>Password: <span className="font-mono">admin123</span></p>
        </div>
      </div>
    </div>
  );
};

// Enhanced Components with API integration
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

const InputField = ({ label, value, onChange, placeholder, type = "text", ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
      {...props}
    />
  </div>
);

const APIParameterBuilder = ({ parameters, setParameters }) => {
  const addParameter = () => {
    setParameters([...parameters, { name: '', type: 'string', required: false, description: '' }]);
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
          
          <div className="grid grid-cols-2 gap-4">
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
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
              >
                <option value="string">String</option>
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
            placeholder="What does this parameter do?"
          />
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={param.required}
              onChange={(e) => updateParameter(index, 'required', e.target.checked)}
              className="rounded"
            />
            <label className="text-sm text-gray-300">Required</label>
          </div>
        </div>
      ))}

      {parameters.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Database size={48} className="mx-auto mb-4 opacity-50" />
          <p>No parameters defined yet. Add your first parameter to get started.</p>
        </div>
      )}
    </div>
  );
};

// Main Application Component
const APIMakerEngine = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('builder');
  
  // API Builder State
  const [apiName, setApiName] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [parameters, setParameters] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Enhanced Rate Limiting
  const [rateLimit, setRateLimit] = useState({
    requests: 1000,
    period: 'day',
    maxPerHour: 1000,
    maxPerDay: 10000,
    maxPerMonth: 100000
  });
  
  // Settings
  const [settings, setSettings] = useState({
    requiresAuth: false,
    allowedOrigins: '*',
    webhookUrl: ''
  });
  
  // State management
  const [isRunning, setIsRunning] = useState(false);
  const [deployedApis, setDeployedApis] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Load user's APIs on component mount
  useEffect(() => {
    loadUserApis();
    loadAnalytics();
  }, []);

  const loadUserApis = async () => {
    try {
      const apis = await apiClient.get('/apis');
      setDeployedApis(apis);
    } catch (error) {
      console.error('Failed to load APIs:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const analyticsData = await apiClient.get('/analytics');
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const generateApiKey = () => {
    const key = 'ak_' + Math.random().toString(36).substr(2, 32);
    setApiKey(key);
  };

  const generateFromPrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsRunning(true);
    try {
      const response = await apiClient.post('/generate-code', {
        prompt,
        language,
        endpoint: endpoint || 'generated-api'
      });
      setCode(response.code);
      
      // Auto-fill endpoint if not set
      if (!endpoint) {
        setEndpoint('generated-api');
      }
    } catch (error) {
      alert(`Code generation failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const createApi = async () => {
    if (!apiName || !endpoint || !code) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsRunning(true);
      const apiData = {
        name: apiName,
        endpoint,
        description,
        code,
        language,
        parameters,
        is_public: isPublic,
        api_key: apiKey || undefined,
        rate_limit_requests: rateLimit.requests,
        rate_limit_period: rateLimit.period,
        settings: {
          max_requests_per_hour: rateLimit.maxPerHour,
          max_requests_per_day: rateLimit.maxPerDay,
          max_requests_per_month: rateLimit.maxPerMonth,
          requires_auth: settings.requiresAuth,
          allowed_origins: settings.allowedOrigins,
          webhook_url: settings.webhookUrl
        }
      };

      const response = await apiClient.post('/apis', apiData);
      alert(`API created successfully! ID: ${response.id}`);
      
      // Reset form
      setApiName('');
      setEndpoint('');
      setDescription('');
      setCode('');
      setParameters([]);
      setPrompt('');
      
      // Reload APIs
      loadUserApis();
    } catch (error) {
      alert(`Failed to create API: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const deployApi = async (apiId) => {
    try {
      await apiClient.post(`/apis/${apiId}/deploy`);
      alert('API deployed successfully!');
      loadUserApis();
    } catch (error) {
      alert(`Deployment failed: ${error.message}`);
    }
  };

  const deleteApi = async (apiId) => {
    if (!confirm('Are you sure you want to delete this API?')) return;
    
    try {
      await apiClient.delete(`/apis/${apiId}`);
      alert('API deleted successfully');
      loadUserApis();
    } catch (error) {
      alert(`Failed to delete API: ${error.message}`);
    }
  };

  const openPlayground = (apiId) => {
    window.open(`/api/apis/${apiId}/playground`, '_blank');
  };

  const tabs = [
    { id: 'builder', label: 'API Builder', icon: Code },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'apis', label: 'My APIs', icon: Server },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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
                <span>Welcome, {user?.username}</span>
              </div>
              <div className="text-sm text-gray-400">
                <span className="text-green-400">●</span> Online
              </div>
              <button 
                onClick={logout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg font-medium transition-colors"
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
                      placeholder="e.g., Create a user management API that can register users, authenticate them, and manage profiles with validation"
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
                  </div>
                </div>
                <APICodeEditor
                  code={code}
                  onChange={setCode}
                  language={language}
                />
              </div>

              <APIParameterBuilder parameters={parameters} setParameters={setParameters} />
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
                    onClick={createApi}
                    disabled={!apiName || !endpoint || !code || isRunning}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Server size={16} />
                    Create API
                  </button>
                  <button className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <Save size={16} />
                    Save Draft
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-500/20">
                <h3 className="text-lg font-semibold mb-2 text-green-400">Ready to Deploy?</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Your API will be live at:<br />
                  <code className="bg-gray-800 px-2 py-1 rounded text-xs">
                    /api/execute/{endpoint || 'your-endpoint'}
                  </code>
                </p>
                <div className="text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Activity size={12} className="text-green-400" />
                    Auto-scaling enabled
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe size={12} className="text-blue-400" />
                    User-specific management
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Configuration Tab */}
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
                  <Clock size={20} />
                  Enhanced Rate Limiting
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <InputField
                      label="Requests per Hour"
                      value={rateLimit.maxPerHour}
                      onChange={(e) => setRateLimit({...rateLimit, maxPerHour: parseInt(e.target.value) || 0})}
                      placeholder="1000"
                      type="number"
                    />
                    <InputField
                      label="Requests per Day"
                      value={rateLimit.maxPerDay}
                      onChange={(e) => setRateLimit({...rateLimit, maxPerDay: parseInt(e.target.value) || 0})}
                      placeholder="10000"
                      type="number"
                    />
                    <InputField
                      label="Requests per Month"
                      value={rateLimit.maxPerMonth}
                      onChange={(e) => setRateLimit({...rateLimit, maxPerMonth: parseInt(e.target.value) || 0})}
                      placeholder="100000"
                      type="number"
                    />
                  </div>
                  <div className="text-xs text-gray-400 bg-gray-900 p-3 rounded">
                    <strong>Rate Limits:</strong><br />
                    • {rateLimit.maxPerHour} requests per hour<br />
                    • {rateLimit.maxPerDay} requests per day<br />
                    • {rateLimit.maxPerMonth} requests per month
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield size={20} />
                  Advanced Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Require Authentication</label>
                      <p className="text-xs text-gray-400">Force API key validation</p>
                    </div>
                    <button
                      onClick={() => setSettings({...settings, requiresAuth: !settings.requiresAuth})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.requiresAuth ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.requiresAuth ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <InputField
                    label="Allowed Origins (CORS)"
                    value={settings.allowedOrigins}
                    onChange={(e) => setSettings({...settings, allowedOrigins: e.target.value})}
                    placeholder="*"
                  />
                  
                  <InputField
                    label="Webhook URL"
                    value={settings.webhookUrl}
                    onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
                    placeholder="https://your-webhook.com/api/notify"
                  />
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

        {/* Enhanced My APIs Tab */}
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
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      api.status === 'deployed' ? 'bg-green-900/50 text-green-400' : 
                      api.status === 'draft' ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {api.status}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Globe size={14} />
                      <span className="font-mono text-xs">/api/execute/{api.endpoint}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Activity size={14} />
                      <span>{api.total_requests || 0} requests</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Code size={14} />
                      <span className="capitalize">{api.language}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock size={14} />
                      <span>{api.max_requests_per_hour || api.rate_limit_requests}/{api.rate_limit_period}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {api.status === 'deployed' ? (
                      <button 
                        onClick={() => openPlayground(api.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <TestTube size={14} />
                        Test
                      </button>
                    ) : (
                      <button 
                        onClick={() => deployApi(api.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <Server size={14} />
                        Deploy
                      </button>
                    )}
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
                  <h3 className="text-lg font-semibold mb-2">No APIs created yet</h3>
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

        {/* Enhanced Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <button
                onClick={loadAnalytics}
                disabled={loadingAnalytics}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <TrendingUp size={16} />
                {loadingAnalytics ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {analytics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Requests</p>
                        <p className="text-2xl font-bold text-white">{analytics.total_requests.toLocaleString()}</p>
                      </div>
                      <div className="bg-blue-600/20 p-3 rounded-lg">
                        <BarChart3 className="text-blue-400" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Active APIs</p>
                        <p className="text-2xl font-bold text-white">{analytics.active_apis}</p>
                      </div>
                      <div className="bg-green-600/20 p-3 rounded-lg">
                        <Server className="text-green-400" size={24} />
                      </div>
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
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Avg Response Time</p>
                        <p className="text-2xl font-bold text-white">{analytics.avg_response_time}ms</p>
                      </div>
                      <div className="bg-yellow-600/20 p-3 rounded-lg">
                        <Activity className="text-yellow-400" size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">Top Endpoints</h3>
                    <div className="space-y-3">
                      {analytics.top_endpoints.map((endpoint, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{endpoint.name}</p>
                              <p className="text-xs text-gray-400">{endpoint.endpoint}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{endpoint.request_count}</p>
                            <p className="text-xs text-gray-400">requests</p>
                          </div>
                        </div>
                      ))}
                      
                      {analytics.top_endpoints.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <Activity size={32} className="mx-auto mb-4 opacity-50" />
                          <p>No API data available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">Request Volume (Last 7 Days)</h3>
                    <div className="h-64 bg-gray-900 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-400">Chart visualization</p>
                        <div className="mt-4 space-y-2">
                          {analytics.daily_requests.map((day, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-400">{day.date}</span>
                              <span className="text-white">{day.count} requests</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main App with Auth
const App = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading API Maker Engine...</div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <LoginForm />;
  }
  
  return <APIMakerEngine />;
};

// Export with Auth Provider
const APIMakerEngineApp = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default APIMakerEngineApp;
