import React, { useState } from 'react';
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
  Sparkles
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

const APIMakerEngine = () => {
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

  const generateApiKey = () => {
    const key = 'ak_' + Math.random().toString(36).substr(2, 32);
    setApiKey(key);
  };

  const runCode = async () => {
    setIsRunning(true);
    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRunning(false);
    alert('Code executed successfully! Ready to deploy.');
  };

  const deployApi = () => {
    const newApi = {
      id: Date.now(),
      name: apiName,
      endpoint: `https://api.yourplatform.com/${endpoint}`,
      language,
      isPublic,
      requests: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    setDeployedApis([...deployedApis, newApi]);
    alert(`API deployed successfully! Available at: ${newApi.endpoint}`);
  };

  const generateFromPrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsRunning(true);
    // Simulate GPT API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock generated code based on prompt
    const generatedCode = `# Generated API code based on your prompt
# "${prompt}"

from flask import Flask, request, jsonify
import json

app = Flask(__name__)

@app.route('/api/${endpoint || 'generated'}', methods=['POST'])
def handle_request():
    data = request.get_json()
    
    # Your custom logic here
    result = {
        "status": "success",
        "message": "API processed successfully",
        "data": data
    }
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)`;
    
    setCode(generatedCode);
    setIsRunning(false);
  };

  const tabs = [
    { id: 'builder', label: 'API Builder', icon: Code },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'data', label: 'Data Manager', icon: Database },
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
              <div className="text-sm text-gray-400">
                <span className="text-green-400">●</span> Online
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors">
                Upgrade Pro
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
                    onClick={deployApi}
                    disabled={!apiName || !endpoint || !code}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Server size={16} />
                    Deploy API
                  </button>
                  <button className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <Save size={16} />
                    Save Draft
                  </button>
                  <button className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <Upload size={16} />
                    Import Code
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-500/20">
                <h3 className="text-lg font-semibold mb-2 text-green-400">Ready to Deploy?</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Your API will be live at:<br />
                  <code className="bg-gray-800 px-2 py-1 rounded text-xs">
                    api.yourplatform.com/{endpoint || 'your-endpoint'}
                  </code>
                </p>
                <div className="text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Activity size={12} className="text-green-400" />
                    Auto-scaling enabled
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe size={12} className="text-blue-400" />
                    Global CDN distribution
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
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      api.status === 'active' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                    }`}>
                      {api.status}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Globe size={14} />
                      <span className="font-mono text-xs">{api.endpoint}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users size={14} />
                      <span>{api.requests} requests</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Code size={14} />
                      <span className="capitalize">{api.language}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm transition-colors">
                      View
                    </button>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm transition-colors">
                      Edit
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
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-400" />
                        <span className="text-sm">users.json</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">2.3 MB</span>
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-green-400" />
                        <span className="text-sm">products.csv</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">1.8 MB</span>
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Requests</p>
                    <p className="text-2xl font-bold text-white">12,847</p>
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
                    <p className="text-2xl font-bold text-white">$89.34</p>
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
                    <p className="text-2xl font-bold text-white">142ms</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Request Volume</h3>
                <div className="h-64 bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400">Chart visualization would go here</p>
                    <p className="text-xs text-gray-500 mt-2">Integration with charting library needed</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Top Endpoints</h3>
                <div className="space-y-3">
                  {deployedApis.slice(0, 5).map((api, index) => (
                    <div key={api.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{api.name}</p>
                          <p className="text-xs text-gray-400">{api.endpoint}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{api.requests}</p>
                        <p className="text-xs text-gray-400">requests</p>
                      </div>
                    </div>
                  ))}
                  
                  {deployedApis.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Activity size={32} className="mx-auto mb-4 opacity-50" />
                      <p>No API data available</p>
                    </div>
                  )}
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