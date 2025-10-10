# 🚀 GitHub CI/CD Setup Guide

Complete guide to set up GitHub Actions CI/CD for StudySphere

---

## 📋 Prerequisites

1. ✅ Azure resources deployed (PostgreSQL, ACR, AKS)
2. ✅ GitHub repository created
3. ✅ Code pushed to repository
4. ✅ Azure CLI installed locally

---

## Step 1: Create Azure Service Principal

This allows GitHub Actions to access your Azure resources.

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "Azure for Students"

# Create service principal with contributor role
az ad sp create-for-rbac \
  --name "studysphere-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/studysphere-rg \
  --sdk-auth
```

**Save the JSON output!** You'll need it for the next step.

The output will look like:
```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "...",
  ...
}
```

---

## Step 2: Set Up GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Required Secrets:

| Secret Name | Value | Where to Get It |
|-------------|-------|-----------------|
| `AZURE_CREDENTIALS` | Entire JSON from Step 1 | Azure CLI output |
| `ARM_CLIENT_ID` | `clientId` from JSON | Azure CLI output |
| `ARM_CLIENT_SECRET` | `clientSecret` from JSON | Azure CLI output |
| `ARM_SUBSCRIPTION_ID` | `subscriptionId` from JSON | Azure CLI output |
| `ARM_TENANT_ID` | `tenantId` from JSON | Azure CLI output |
| `ACR_NAME` | `studysphereacr` | Your ACR name |
| `ACR_LOGIN_SERVER` | `studysphereacr.azurecr.io` | Your ACR login server |
| `AKS_CLUSTER_NAME` | `studysphere-aks` | Your AKS cluster name |
| `AKS_RESOURCE_GROUP` | `studysphere-rg` | Your resource group |
| `DATABASE_URL` | `postgresql://pgadmin:YOUR_PASSWORD@studysphere-postgres.postgres.database.azure.com:5432/studysphere?sslmode=require` | Your PostgreSQL connection string |
| `DB_ADMIN_PASSWORD` | `YOUR_DB_PASSWORD` | Your database password |
| `JWT_SECRET` | `YOUR_JWT_SECRET` | Strong random string |
| `GEMINI_API_KEY` | `YOUR_GEMINI_KEY` | From Google AI Studio |
| `GEMINI_MODEL` | `gemini-2.0-flash-exp` | Gemini model name |
| `AZURE_MODERATOR_KEY` | `YOUR_MODERATOR_KEY` | From Azure Portal |
| `AZURE_MODERATOR_ENDPOINT` | `https://YOUR_ENDPOINT.cognitiveservices.azure.com/` | From Azure Portal |

### Quick Command to Get Values:

```bash
# Get your subscription ID
az account show --query id -o tsv

# Get ACR login server
az acr show --name studysphereacr --query loginServer -o tsv

# Get PostgreSQL FQDN
az postgres flexible-server show --name studysphere-postgres --resource-group studysphere-rg --query fullyQualifiedDomainName -o tsv

# Get all at once
echo "Subscription ID: $(az account show --query id -o tsv)"
echo "ACR Server: $(az acr show --name studysphereacr --query loginServer -o tsv)"
echo "PostgreSQL: $(az postgres flexible-server show --name studysphere-postgres --resource-group studysphere-rg --query fullyQualifiedDomainName -o tsv)"
```

---

## Step 3: Set Up GitHub Environments

Go to **Settings** → **Environments**

Create three environments:

### 1. development
- No protection rules needed
- Add environment-specific secrets if needed

### 2. testing
- Add protection rule: **Required reviewers** (optional)
- Add deployment branches rule (optional)

### 3. production
- ✅ Add protection rule: **Required reviewers** (add yourself)
- ✅ Add deployment branches rule: Only `main` branch
- This ensures manual approval before production deployment

### 4. production-infrastructure
- For Terraform apply operations
- Add protection rule: **Required reviewers**

### 5. production-infrastructure-destroy
- For Terraform destroy operations
- Add strong protection rules
- Multiple required reviewers recommended

---

## Step 4: Update Terraform Variables

Edit `infra/terraform.tfvars`:

```hcl
project_name        = "studysphere"
environment         = "production"
location            = "Korea Central"
resource_group_name = "studysphere-rg"
db_admin_username   = "pgadmin"
acr_name            = "studysphereacr"
aks_cluster_name    = "studysphere-aks"
aks_node_count      = 2
```

**Don't commit passwords!** Use environment variables instead.

---

## Step 5: Initialize Git Repository

```bash
# Navigate to project
cd C:\Users\Rakhul\Projects\StudySphere

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - StudySphere with CI/CD and Terraform"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/StudySphere.git

# Push to main branch
git branch -M main
git push -u origin main
```

---

## Step 6: Verify Workflows

After pushing, check GitHub Actions:

1. Go to your repo → **Actions** tab
2. You should see two workflows:
   - `CI/CD Pipeline` - For application deployment
   - `Terraform Infrastructure` - For infrastructure management

---

## 🎯 How It Works

### CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests
- Manual trigger

**Jobs:**
1. **Build and Test** - Install deps, generate Prisma client, build frontend
2. **Build Images** - Build Docker images and push to ACR
3. **Deploy Dev** - Deploy to development namespace
4. **Deploy Test** - Deploy to testing namespace (requires review)
5. **Deploy Prod** - Deploy to production namespace (requires review)

**Environment Promotion:**
```
Code Push → Build → Development → Testing → Production
              ↓         ↓           ↓          ↓
           Tests    Auto-Deploy  Manual   Manual+Ingress
```

### Terraform Workflow (`.github/workflows/terraform.yml`)

**Triggers:**
- Push to `main` (changes in `infra/` folder)
- Pull requests (plan only)
- Manual trigger (plan/apply/destroy)

**Jobs:**
1. **Terraform Plan** - Shows what will be created/changed
2. **Terraform Apply** - Creates infrastructure (requires approval)
3. **Terraform Destroy** - Destroys infrastructure (requires approval)

---

## 📊 Testing the Setup

### Test 1: Trigger Terraform Plan

```bash
# Make a small change to Terraform
cd infra
echo "# Test comment" >> main.tf

# Commit and push
git add .
git commit -m "test: Trigger Terraform plan"
git push
```

Check **Actions** tab - Terraform workflow should run and show a plan.

### Test 2: Trigger CI/CD Pipeline

```bash
# Make a small change to application
echo "// Test comment" >> services/auth-service/server.js

# Commit and push
git add .
git commit -m "test: Trigger CI/CD pipeline"
git push
```

Check **Actions** tab - CI/CD workflow should run through all jobs.

### Test 3: Manual Deployment

1. Go to **Actions** tab
2. Select `CI/CD Pipeline`
3. Click `Run workflow`
4. Select branch: `main`
5. Click `Run workflow`

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ All workflow runs show green checkmarks
2. ✅ Docker images appear in ACR with commit SHA tags
3. ✅ Pods deploy successfully to each namespace
4. ✅ Ingress gets external IP
5. ✅ Application accessible at external IP

---

## 🔐 Security Best Practices

1. **Never commit secrets to git**
   - `.env` is in `.gitignore`
   - Use GitHub Secrets for sensitive data

2. **Use environment-specific secrets**
   - Different JWT secrets for dev/test/prod
   - Different database passwords

3. **Enable branch protection**
   - Settings → Branches → Add rule for `main`
   - Require pull request reviews
   - Require status checks to pass

4. **Rotate secrets regularly**
   - Database passwords
   - API keys
   - Service principal credentials

5. **Review Terraform changes**
   - Always review plan before apply
   - Use `production-infrastructure` environment with approvers

---

## 🐛 Troubleshooting

### Workflow fails on "Log in to ACR"

**Cause:** Azure credentials not set correctly

**Fix:**
```bash
# Recreate service principal
az ad sp create-for-rbac --name "studysphere-github-actions" --role contributor --scopes /subscriptions/YOUR_SUBSCRIPTION_ID --sdk-auth

# Update AZURE_CREDENTIALS secret in GitHub
```

### Workflow fails on "Set AKS context"

**Cause:** AKS cluster not found or credentials incorrect

**Fix:**
- Verify `AKS_CLUSTER_NAME` and `AKS_RESOURCE_GROUP` secrets
- Ensure service principal has access to AKS

### Docker build fails

**Cause:** Dockerfile or dependencies issue

**Fix:**
- Test build locally first: `docker build -f services/auth-service/Dockerfile .`
- Check Dockerfile paths are correct

### Deployment fails with ImagePullBackOff

**Cause:** AKS can't pull from ACR

**Fix:**
- Verify ACR is attached to AKS: `az aks update --name studysphere-aks --resource-group studysphere-rg --attach-acr studysphereacr`

### Terraform fails with "resource already exists"

**Cause:** Resources created manually

**Fix:**
- Import existing resources: `terraform import azurerm_resource_group.main /subscriptions/SUB_ID/resourceGroups/studysphere-rg`
- Or destroy manual resources and let Terraform create them

---

## 📈 Monitoring Workflows

### View Workflow Runs:
- Go to **Actions** tab
- Click on a workflow run
- Expand jobs to see logs

### View Deployment Status:
```bash
# Check pods in production
kubectl get pods -n production

# Check ingress
kubectl get ingress -n production

# Check services
kubectl get services -n production
```

---

## 🎓 Best Practices

1. **Always test in dev first**
   - Push to `develop` branch first
   - Verify in development namespace
   - Then merge to `main` for production

2. **Use semantic commit messages**
   ```
   feat: Add new feature
   fix: Fix bug
   docs: Update documentation
   ci: Update CI/CD
   infra: Update infrastructure
   ```

3. **Tag releases**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

4. **Keep Terraform state safe**
   - Consider using Azure Storage backend for Terraform state
   - Enable state locking

---

## 🚀 Next Steps

After setup:

1. ✅ Push code to trigger workflows
2. ✅ Monitor Actions tab for green checkmarks
3. ✅ Approve production deployments when ready
4. ✅ Access application at ingress external IP
5. ✅ Set up monitoring and alerts
6. ✅ Configure custom domain (optional)
7. ✅ Add SSL/TLS with cert-manager (optional)

---

## 📞 Quick Reference

### Deploy to Production Manually:
1. Go to Actions → CI/CD Pipeline → Run workflow
2. Select branch: `main`
3. Run workflow
4. Approve production deployment when prompted

### Check Deployment Status:
```bash
kubectl get pods -n production
kubectl get ingress -n production
kubectl logs -f deployment/auth-service -n production
```

### Rollback Deployment:
```bash
kubectl rollout undo deployment/auth-service -n production
```

### View Terraform State:
```bash
cd infra
terraform show
terraform state list
```

---

**🎉 You're all set!** Your CI/CD pipeline is ready to deploy StudySphere automatically! 🚀

