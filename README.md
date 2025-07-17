# API Maker Engine

🚀 **Build and deploy APIs instantly with AI assistance**

API Maker Engine is a powerful platform that allows you to create, deploy, and manage APIs using natural language descriptions. With built-in user management, rate limiting, authentication, and an interactive playground, it's perfect for rapid API development and prototyping.

## ✨ Features

### 🤖 AI-Powered API Generation
- Describe your API in natural language
- GPT-4 generates production-ready code
- Support for Python, JavaScript, Java, Go, and PHP
- Automatic error handling and validation

### 🔐 User Management & Authentication
- Secure user registration and login
- JWT-based authentication
- User-specific API management
- Role-based access control

### ⚡ Advanced Rate Limiting
- Individual API rate limiting
- Per-hour, per-day, and per-month limits
- IP-based and user-based tracking
- Real-time rate limit monitoring

### 🎮 Interactive API Playground
- Test APIs directly in the browser
- Real-time request/response testing
- Parameter validation and examples
- Response time monitoring

### 📊 Analytics & Monitoring
- Request analytics and metrics
- Performance monitoring
- Usage statistics
- Revenue tracking

### 🐳 Container-Based Deployment
- Automatic Docker containerization
- Isolated API execution
- Easy scaling and management
- Production-ready deployments

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- OpenAI API key
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd API-ENGINE
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Deploy with one command**
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

4. **Access the platform**
   - Open http://localhost:8000
   - Login with `admin/admin123`
   - Start building your APIs!

## 📖 Usage Guide

### Creating Your First API

1. **Login** to the platform
2. **Navigate** to the API Builder
3. **Describe** your API in natural language:
   ```
   Create a user management API that can register users, 
   authenticate them, and manage profiles with validation
   ```
4. **Configure** rate limits and authentication
5. **Deploy** your API instantly
6. **Test** in the playground

### Example API Descriptions

**E-commerce API:**
```
Create an e-commerce API with product catalog, shopping cart, 
order management, and payment processing capabilities
```

**Social Media API:**
```
Build a social media API with user posts, comments, likes, 
following system, and real-time notifications
```

**File Management API:**
```
Create a file upload and management API with image processing, 
metadata extraction, and secure file sharing
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for code generation | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Auto-generated |
| `DATABASE_URL` | SQLite database path | `sqlite:///data/api_maker.db` |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379/0` |
| `DEFAULT_RATE_LIMIT` | Default API rate limit | `1000` |
| `DEFAULT_RATE_PERIOD` | Default rate limit period | `day` |

### Rate Limiting Options

- **Per Hour**: Up to X requests per hour
- **Per Day**: Up to X requests per day  
- **Per Month**: Up to X requests per month
- **IP-based**: Track by client IP address
- **User-based**: Track by authenticated user

### Pricing Models

- **Free**: No charges
- **Pay-as-you-go**: Per-request pricing
- **Subscription**: Monthly/yearly plans

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Engine    │    │   Redis Cache   │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (Rate Limit)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   SQLite DB     │    │   Docker        │
                       │   (User Data)   │    │   (API Deploy)  │
                       └─────────────────┘    └─────────────────┘
```

### Components

- **Frontend**: React-based UI with TailwindCSS
- **Backend**: FastAPI with async support
- **Database**: SQLite for user and API data
- **Cache**: Redis for rate limiting and sessions
- **Container**: Docker for API deployment
- **AI**: OpenAI GPT-4 for code generation

## 🔗 API Reference

### Authentication

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}
```

### API Management

**Create API**
```http
POST /api/apis
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My API",
  "endpoint": "my-api",
  "description": "API description",
  "code": "generated code",
  "language": "python",
  "parameters": [...],
  "settings": {
    "max_requests_per_hour": 1000,
    "requires_auth": false
  }
}
```

**Deploy API**
```http
POST /api/apis/{api_id}/deploy
Authorization: Bearer <token>
```

**Test API**
```http
POST /api/apis/{api_id}/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "method": "POST",
  "headers": {"Content-Type": "application/json"},
  "body": {"param": "value"}
}
```

## 🛠️ Development

### Local Development

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Redis** (optional, for rate limiting)
   ```bash
   docker run -d -p 6379:6379 redis:7-alpine
   ```

3. **Start the development server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Project Structure

```
API-ENGINE/
├── main.py                 # Main FastAPI application
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker container definition
├── docker-compose.yml     # Multi-service setup
├── .env.example          # Environment template
├── templates/            # HTML templates
│   ├── index.html        # Main application
│   └── playground.html   # API testing interface
├── static/              # Static assets
├── data/                # Database and uploads
├── scripts/             # Deployment scripts
│   └── deploy.sh        # Main deployment script
└── README.md           # This file
```

## 🚀 Deployment to AWS

### Preparation for AWS Migration

The current system is designed to easily migrate to AWS:

1. **Database**: Replace SQLite with RDS (PostgreSQL/MySQL)
2. **Cache**: Replace local Redis with ElastiCache
3. **Container**: Deploy to ECS or EKS
4. **Storage**: Use S3 for file storage
5. **Load Balancer**: Add ALB for scaling

### AWS Migration Script (Future)

```bash
# Convert to AWS-ready configuration
./scripts/aws-deploy.sh
```

## 📊 Monitoring & Analytics

### Available Metrics

- **Request Volume**: Requests per API over time
- **Response Times**: Average and percentile response times
- **Error Rates**: 4xx and 5xx error tracking
- **User Activity**: Active users and API usage
- **Revenue**: Pay-per-use and subscription tracking

### Grafana Dashboard (Optional)

For advanced monitoring, you can integrate with Grafana:

```bash
# Add Grafana to docker-compose
docker-compose -f docker-compose.grafana.yml up -d
```

## 🔒 Security

### Best Practices

- **JWT Tokens**: Secure authentication with expiration
- **Rate Limiting**: Prevent abuse and DoS attacks
- **Input Validation**: Automatic parameter validation
- **API Keys**: Unique keys for each API endpoint
- **Container Isolation**: Isolated execution environments

### Production Security Checklist

- [ ] Change default admin password
- [ ] Set strong JWT secret
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor for suspicious activity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**OpenAI API Key Issues**
- Ensure your API key is valid and has sufficient credits
- Check the key format: `sk-...`

**Docker Issues**
- Ensure Docker daemon is running
- Check port 8000 is not in use

**Rate Limiting Issues**
- Redis connection problems
- Check Redis container status

### Getting Help

- 📧 Create an issue on GitHub
- 💬 Join our Discord community
- 📚 Check the documentation

## 🎉 What's Next?

### Planned Features

- [ ] Multi-language support
- [ ] Advanced API templates
- [ ] Webhook support
- [ ] API versioning
- [ ] Automated testing
- [ ] Performance optimization
- [ ] AWS one-click deployment
- [ ] Enterprise features

---

**Built with ❤️ using FastAPI, React, and OpenAI GPT-4**
