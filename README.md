# StudySphere - Study Group Creator App

A full-stack microservices application for college students to create and manage study groups with real-time chat, event scheduling, and AI-powered features.

## 🏗️ Architecture

- **Frontend**: React with Vite, shadcn/ui, Tailwind CSS
- **Backend**: Express.js microservices (Auth, User, Group, Chat)
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io with Redis adapter
- **AI Features**: Azure OpenAI (quiz classification, resource summarization), Azure Content Moderator
- **Infrastructure**: Azure (AKS, ACR, PostgreSQL Flexible Server)
- **DevOps**: Terraform, GitHub Actions, Docker, Kubernetes

## 📋 Features

### Core Functionality
- 🔐 **JWT Authentication** with httpOnly cookies
- 👤 **User Profiles** with AI-powered interest quiz
- 👥 **Study Groups** with channel-based organization
- 💬 **Real-time Chat** with content moderation
- 📅 **Event Scheduling** with Google Meet integration
- 📚 **Resource Sharing** with AI summarization

### GenAI Use Cases
1. **Quiz Classification**: Azure OpenAI classifies user quiz answers into interests
2. **Content Moderation**: Azure Content Moderator flags harmful chat messages and resources
3. **Resource Summarization**: Azure OpenAI generates bullet-point summaries of uploaded resources

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Azure account (for production deployment)
- Terraform (for infrastructure provisioning)
- kubectl and Azure CLI (for Kubernetes deployment)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-org/study-group-app.git
cd study-group-app
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start PostgreSQL and Redis with Docker**
```bash
docker-compose up postgres redis -d
```

5. **Run Prisma migrations**
```bash
npm run prisma:generate
npm run prisma:migrate
```

6. **Start all services**

Open 5 terminal windows:

```bash
# Terminal 1 - Auth Service
npm run dev:auth

# Terminal 2 - User Service
npm run dev:user

# Terminal 3 - Group Service
npm run dev:group

# Terminal 4 - Chat Service
npm run dev:chat

# Terminal 5 - Frontend
npm run dev:frontend
```

7. **Access the application**
- Frontend: http://localhost:5173
- Auth API: http://localhost:5001
- User API: http://localhost:5002
- Group API: http://localhost:5003
- Chat API: http://localhost:5004

### Docker Deployment (Local)

```bash
# Build and start all services
docker-compose up --build

# Access frontend at http://localhost:80
```

## 🏗️ Infrastructure Setup (Azure)

### 1. Configure Azure Credentials

```bash
# Login to Azure
az login

# Create service principal for Terraform
az ad sp create-for-rbac --name studysphere-terraform --role Contributor --scopes /subscriptions/<SUBSCRIPTION_ID>

# Save the output to .env
```

### 2. Provision Infrastructure with Terraform

```bash
cd infra

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply infrastructure
chmod +x apply.sh
./apply.sh

# Or manually
terraform apply -auto-approve
```

This creates:
- Resource Group
- PostgreSQL Flexible Server
- Azure Container Registry (ACR)
- Azure Kubernetes Service (AKS) with node pool
- Networking and security configurations

### 3. Deploy to Kubernetes

```bash
# Get AKS credentials
az aks get-credentials --resource-group studysphere-rg --name studysphere-aks

# Create namespaces
kubectl apply -f k8s/namespaces.yaml

# Create secrets (update with your values first)
kubectl create secret generic azure-secrets \
  --from-literal=DATABASE_URL=$AZURE_POSTGRES_URL \
  --from-literal=JWT_SECRET=$JWT_SECRET \
  --from-literal=AZURE_OPENAI_KEY=$AZURE_OPENAI_KEY \
  --from-literal=AZURE_MODERATOR_KEY=$AZURE_MODERATOR_KEY \
  -n production

# Deploy services
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Check deployment status
kubectl get pods -n production
kubectl get services -n production
kubectl get ingress -n production
```

## 🔄 CI/CD Pipeline

The GitHub Actions workflow automatically:
1. **Build** - Builds Docker images for all services
2. **Test** - Runs unit and integration tests
3. **Push** - Pushes images to Azure Container Registry
4. **Deploy** - Deploys to AKS (dev → test → prod)

### Setup GitHub Secrets

Add these secrets to your GitHub repository:

```
AZURE_CREDENTIALS - Service principal JSON
ACR_LOGIN_SERVER - studysphereacr.azurecr.io
ACR_USERNAME - Service principal app ID
ACR_PASSWORD - Service principal password
AKS_CLUSTER_NAME - studysphere-aks
AKS_RESOURCE_GROUP - studysphere-rg
DATABASE_URL - Azure PostgreSQL connection string
JWT_SECRET - JWT secret key
AZURE_OPENAI_KEY - Azure OpenAI API key
AZURE_MODERATOR_KEY - Azure Content Moderator key
```

### Trigger Deployment

```bash
# Push to main branch triggers production deployment
git add .
git commit -m "Deploy to production"
git push origin main

# Or manually trigger via GitHub Actions UI
```

## 🧪 Testing

### API Testing with Postman/cURL

**Register a new user:**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student@college.edu","password":"SecurePass123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@college.edu","password":"SecurePass123"}' \
  -c cookies.txt
```

**Submit quiz (requires auth):**
```bash
curl -X POST http://localhost:5002/api/profile/quiz \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"answers":["Computer Science","Algorithms","Evening","Group","Active"]}'
```

**Create a group:**
```bash
curl -X POST http://localhost:5003/api/groups \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"CS Study Group","description":"Algorithms and Data Structures"}'
```

### Frontend Testing

1. Navigate to http://localhost:5173
2. Register a new account
3. Complete the profile quiz
4. Create or join a study group
5. Send real-time chat messages
6. Schedule an event
7. Upload a resource and view AI summary

## 📁 Project Structure

```
study-group-app/
├── shared/                      # Shared code and Prisma schema
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── utils/
│       ├── auth.js             # JWT utilities
│       └── azure.js            # Azure AI helpers
├── services/
│   ├── auth-service/           # Authentication service
│   ├── user-service/           # User profile and quiz
│   ├── group-service/          # Group management
│   └── chat-service/           # Real-time chat, events, resources
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   └── lib/                # Utilities
│   └── public/
├── infra/                       # Terraform infrastructure
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── k8s/                         # Kubernetes manifests
│   ├── deployments/
│   ├── services/
│   ├── ingress.yaml
│   └── hpa.yaml
├── ci-cd/                       # CI/CD documentation
│   └── .github/workflows/
│       └── ci-cd.yml
├── docs/                        # Documentation
│   ├── GenAI-use-cases.md
│   ├── architecture.md
│   ├── environment-promotion.md
│   └── presentation.md
├── docker-compose.yml
├── package.json
└── README.md
```

## 🎯 Demo Script (10 minutes)

### 1. CI/CD Pipeline Demo (3 min)
```bash
# Show GitHub Actions workflow
gh workflow run ci-cd.yml --ref main

# Show logs
gh run list
gh run view <run-id>

# Show Azure Container Registry
az acr repository list --name studysphereacr

# Show AKS deployment
kubectl get pods -n production
kubectl get services -n production
```

### 2. Container Orchestration Demo (3 min)
```bash
# Show Docker images
docker images | grep studysphere

# Show running containers
docker ps

# Show Kubernetes resources
kubectl get all -n production

# Show horizontal pod autoscaling
kubectl get hpa -n production

# Show ingress
kubectl get ingress -n production
```

### 3. GenAI Features Demo (2 min)
```bash
# Run demo script
node docs/demo.js

# Show Azure Portal
# - OpenAI resource
# - Content Moderator resource
# - API usage metrics

# Live demo in frontend:
# 1. Complete quiz → Show interests
# 2. Send flagged message → Show moderation
# 3. Upload resource → Show summary
```

### 4. Q&A (2 min)

## 📊 GenAI Use Cases

### 1. Quiz Classification
- **Service**: Azure OpenAI (gpt-4o-mini)
- **Purpose**: Classifies user quiz answers into interest categories
- **Endpoint**: POST `/api/profile/quiz`
- **Sample**: User answers → \["CS", "Math", "Algorithms"\]

### 2. Content Moderation
- **Service**: Azure Content Moderator
- **Purpose**: Flags harmful or inappropriate chat messages and resources
- **Implementation**: Real-time filtering in Socket.io chat
- **Action**: Blocks message if flagged as harmful

### 3. Resource Summarization
- **Service**: Azure OpenAI (gpt-4o-mini)
- **Purpose**: Generates concise bullet-point summaries of uploaded resources
- **Endpoint**: POST `/api/resources/:id/summarize`
- **Sample**: PDF content → "• Key concepts: ...\n• Main topics: ..."

## 🛠️ Technology Stack

### Frontend
- React 18 with Vite
- shadcn/ui component library
- Tailwind CSS for styling
- Socket.io-client for real-time communication
- Axios for HTTP requests
- React Router for navigation

### Backend
- Node.js 18+
- Express.js framework
- Socket.io for WebSocket connections
- Prisma ORM for database access
- JWT for authentication
- bcryptjs for password hashing

### Database
- PostgreSQL 15
- Prisma migrations
- Azure PostgreSQL Flexible Server (production)

### AI/ML
- Azure OpenAI Service (GPT-4o-mini)
- Azure Content Moderator API

### Infrastructure
- Docker & Docker Compose
- Kubernetes (AKS)
- Azure Container Registry
- Terraform for IaC
- GitHub Actions for CI/CD

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [GenAI Use Cases](docs/GenAI-use-cases.md)
- [Environment Promotion](docs/environment-promotion.md)
- [CI/CD Pipeline](ci-cd/pipeline.md)
- [Presentation Slides](docs/presentation.md)
- [Project Report](docs/TeamXX_ReviewII.pdf)

## 🤝 Contributing

This project is part of a Cloud Computing course deliverable. Team members:
- Team Member 1 - DevOps & Infrastructure
- Team Member 2 - Backend Microservices
- Team Member 3 - Frontend & UI/UX
- Team Member 4 - GenAI Integration

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
psql -h localhost -U studysphere -d studysphere
```

### Service Not Starting
```bash
# Check logs
docker logs auth-service
kubectl logs -n production deployment/auth-service
```

### Prisma Migration Errors
```bash
# Reset database (WARNING: deletes all data)
cd shared
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name init
```

### Azure Deployment Issues
```bash
# Check AKS cluster status
az aks show --name studysphere-aks --resource-group studysphere-rg

# Get cluster credentials
az aks get-credentials --name studysphere-aks --resource-group studysphere-rg --overwrite-existing
```

## 📞 Support

For issues and questions:
- Create a GitHub issue
- Contact team lead
- Refer to course Slack channel

---

**Built with ❤️ by the StudySphere Team for Cloud Computing Project Review II**

