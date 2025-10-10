# ✅ Complete Deployment Checklist

Use this checklist to ensure everything is set up correctly!

---

## 📋 Pre-Deployment Checklist

### Azure Resources
- [ ] Resource Group created: `studysphere-rg`
- [ ] PostgreSQL Flexible Server running: `studysphere-postgres`
- [ ] Database created: `studysphere`
- [ ] Database migrations applied (2 migrations)
- [ ] ACR created: `studysphereacr.azurecr.io`
- [ ] AKS cluster running: `studysphere-aks`
- [ ] AKS has 2 nodes (Standard_B2s)
- [ ] ACR attached to AKS
- [ ] Ingress Controller installed
- [ ] All pods running (11/11)

### Local Setup
- [ ] Code cloned/created locally
- [ ] `.env` file created from `env.txt`
- [ ] Docker Desktop installed and running
- [ ] Node.js 18 installed
- [ ] Azure CLI installed and logged in
- [ ] kubectl configured for AKS

---

## 🐙 GitHub Setup Checklist

### Repository
- [ ] GitHub repository created
- [ ] Code pushed to repository
- [ ] `main` branch is default
- [ ] `.gitignore` properly configured

### GitHub Secrets Set
- [ ] `AZURE_CREDENTIALS` (JSON from service principal)
- [ ] `ARM_CLIENT_ID`
- [ ] `ARM_CLIENT_SECRET`
- [ ] `ARM_SUBSCRIPTION_ID`
- [ ] `ARM_TENANT_ID`
- [ ] `ACR_NAME` = `studysphereacr`
- [ ] `ACR_LOGIN_SERVER` = `studysphereacr.azurecr.io`
- [ ] `AKS_CLUSTER_NAME` = `studysphere-aks`
- [ ] `AKS_RESOURCE_GROUP` = `studysphere-rg`
- [ ] `DATABASE_URL` (PostgreSQL connection string)
- [ ] `DB_ADMIN_PASSWORD`
- [ ] `JWT_SECRET` (strong random string)
- [ ] `GEMINI_API_KEY`
- [ ] `GEMINI_MODEL` = `gemini-2.0-flash-exp`
- [ ] `AZURE_MODERATOR_KEY`
- [ ] `AZURE_MODERATOR_ENDPOINT`

### GitHub Environments Created
- [ ] `development` environment
- [ ] `testing` environment with reviewers
- [ ] `production` environment with reviewers
- [ ] `production-infrastructure` environment with reviewers
- [ ] `production-infrastructure-destroy` environment with strict reviewers

### Branch Protection
- [ ] `main` branch protected
- [ ] Require pull request reviews
- [ ] Require status checks to pass
- [ ] Require branches to be up to date

---

## 🏗️ Terraform Checklist

### Files Updated
- [ ] `infra/main.tf` - Matches actual deployment
- [ ] `infra/variables.tf` - Location = Korea Central
- [ ] `infra/outputs.tf` - All outputs defined
- [ ] `infra/terraform.tfvars` - Your values set
- [ ] `infra/backend.tf` - Backend configured (optional)

### Terraform Commands Tested
```bash
cd infra
terraform init      # Initialize
terraform fmt       # Format
terraform validate  # Validate
terraform plan      # Show plan
# terraform apply   # Apply (when ready)
```

- [ ] `terraform init` successful
- [ ] `terraform fmt` no changes
- [ ] `terraform validate` successful
- [ ] `terraform plan` shows correct resources

---

## 🔄 CI/CD Checklist

### Workflows Created
- [ ] `.github/workflows/ci-cd.yml` - Application deployment
- [ ] `.github/workflows/terraform.yml` - Infrastructure management

### Workflow Jobs Working
- [ ] Build and Test job passes
- [ ] Build Images job passes
- [ ] Deploy Dev job passes
- [ ] Deploy Test job passes (with approval)
- [ ] Deploy Prod job passes (with approval)

### Docker Images in ACR
- [ ] `auth-service:latest`
- [ ] `user-service:latest`
- [ ] `group-service:latest`
- [ ] `chat-service:latest`
- [ ] `frontend:latest`

---

## 🚀 Application Deployment Checklist

### Kubernetes Resources
- [ ] Namespaces created (dev, testing, production)
- [ ] Secrets created in all namespaces
- [ ] Redis deployment running
- [ ] All service deployments running
- [ ] All services created
- [ ] Ingress resource created
- [ ] Ingress has external IP

### Pods Status (Production)
- [ ] auth-service: 2/2 Running
- [ ] user-service: 2/2 Running
- [ ] group-service: 2/2 Running
- [ ] chat-service: 2/2 Running
- [ ] frontend: 2/2 Running
- [ ] redis: 1/1 Running

### Services Exposed
- [ ] Ingress LoadBalancer has external IP
- [ ] Can access frontend at external IP
- [ ] API routes working through Ingress

---

## 🧪 Testing Checklist

### Application Tests
Visit: http://[YOUR_EXTERNAL_IP]

- [ ] Frontend loads successfully
- [ ] Register new user works
- [ ] Login works
- [ ] JWT cookie authentication works
- [ ] Quiz submission works
- [ ] Gemini AI returns interests
- [ ] Create group works (was 404, now fixed!)
- [ ] Join group works
- [ ] Real-time chat works
- [ ] @Mention autocomplete works
- [ ] @Mention highlighting works
- [ ] Send messages works
- [ ] Add events works
- [ ] Add resources works
- [ ] AI resource summary works
- [ ] User profile edit works
- [ ] Group settings modal works

### API Endpoints Test
- [ ] GET / (frontend) - 200 OK
- [ ] POST /api/auth/register - Works
- [ ] POST /api/auth/login - Works
- [ ] GET /api/profile - Works
- [ ] POST /api/profile/quiz - Works (was 401, now fixed!)
- [ ] POST /api/groups - Works (was 404, now fixed!)
- [ ] GET /api/groups/my-groups - Works
- [ ] GET /api/groups/browse - Works
- [ ] Socket.io connection - Works

---

## 📊 Monitoring Checklist

### Check Logs
```bash
# Check pod logs
kubectl logs -f deployment/auth-service -n production
kubectl logs -f deployment/user-service -n production
kubectl logs -f deployment/group-service -n production
kubectl logs -f deployment/chat-service -n production

# Check ingress logs
kubectl logs -f -n ingress-nginx deployment/ingress-nginx-controller
```

- [ ] No error logs in pods
- [ ] Services responding correctly
- [ ] Ingress routing correctly

### Check Metrics
```bash
# Check pod status
kubectl get pods -n production

# Check resource usage
kubectl top nodes
kubectl top pods -n production
```

- [ ] All pods healthy
- [ ] Resource usage acceptable
- [ ] No pod restarts

---

## 📝 Documentation Checklist

### Project Documentation
- [ ] `README.md` - Project overview
- [ ] `dev.md` - Complete technical reference
- [ ] `GITHUB_SETUP.md` - CI/CD setup guide
- [ ] `DEPLOYMENT_CHECKLIST.md` - This checklist
- [ ] `docs/architecture.md` - System architecture
- [ ] `docs/GenAI-use-cases.md` - AI integration docs
- [ ] `docs/presentation.md` - Presentation outline

### Setup Guides
- [ ] `GEMINI_SETUP.md` - Gemini API setup
- [ ] `GET_GEMINI_KEY.md` - Quick key guide
- [ ] `DEPLOYMENT_COMPLETE.md` - Deployment summary
- [ ] `NEW_IP_INGRESS.md` - Ingress explanation

---

## 🎓 Demo Preparation Checklist

### Screenshots Taken
- [ ] Azure Portal - Resource Group
- [ ] Azure Portal - AKS cluster
- [ ] Azure Portal - ACR images
- [ ] Azure Portal - PostgreSQL
- [ ] Terminal - `kubectl get pods`
- [ ] Terminal - `kubectl get ingress`
- [ ] Application - Login page
- [ ] Application - Quiz with AI
- [ ] Application - Dashboard
- [ ] Application - Chat with @mentions
- [ ] Application - Group settings
- [ ] Application - AI resource summary
- [ ] GitHub Actions - Successful workflow run
- [ ] Terraform - Plan output

### Presentation Ready
- [ ] Slides prepared
- [ ] Demo flow practiced (10 minutes)
- [ ] Backup screenshots ready
- [ ] Architecture diagrams ready
- [ ] Q&A answers prepared
- [ ] Know all features
- [ ] Know all technologies used
- [ ] Can explain CI/CD pipeline
- [ ] Can explain Terraform setup
- [ ] Can explain Ingress routing

---

## 🎯 Final Verification

### Green Ticks Required ✅

**Azure Portal:**
- [ ] All resources showing as "Running/Succeeded"
- [ ] No failed deployments
- [ ] Cost analysis < $105/month

**GitHub Actions:**
- [ ] All workflows have green checkmarks
- [ ] Latest commit deployed successfully
- [ ] No failed workflow runs

**Kubernetes:**
- [ ] All pods in "Running" state
- [ ] All services have endpoints
- [ ] Ingress has external IP
- [ ] No CrashLoopBackOff errors

**Application:**
- [ ] Accessible at http://[EXTERNAL_IP]
- [ ] All features working
- [ ] No 404 errors
- [ ] No 401 errors
- [ ] No 500 errors

**Terraform:**
- [ ] `terraform plan` shows no changes
- [ ] All resources match configuration
- [ ] State file is clean

---

## 📞 Troubleshooting Reference

### If Something is Red ❌

**Pods CrashLoopBackOff:**
```bash
kubectl logs -f pod/[POD_NAME] -n production
kubectl describe pod/[POD_NAME] -n production
```

**Workflow Failing:**
- Check GitHub Actions logs
- Verify all secrets are set
- Check Azure permissions

**Application 404/500 Errors:**
- Check ingress configuration
- Check service endpoints
- Check pod logs

**Terraform Errors:**
- Run `terraform init` again
- Check Azure credentials
- Verify resource names

---

## 🎉 Success Criteria

**You've successfully completed the deployment when:**

1. ✅ All Azure resources created and running
2. ✅ All GitHub workflows passing (green)
3. ✅ All Kubernetes pods running (11/11)
4. ✅ Ingress has external IP
5. ✅ Application accessible and working
6. ✅ All features tested and working
7. ✅ CI/CD pipeline deploying automatically
8. ✅ Terraform managing infrastructure
9. ✅ Documentation complete
10. ✅ Demo ready

**Congratulations! 🎊 Your production-grade cloud application is deployed!**

---

**Current Status:** http://20.249.205.162 ✅ LIVE!

**Next:** Take screenshots, practice demo, ace presentation! 🚀

