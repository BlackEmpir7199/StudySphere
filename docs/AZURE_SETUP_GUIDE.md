# Azure Setup Guide for StudySphere (India Student Account)

## Prerequisites
- ✅ Azure for Students account ($100 credit)
- ✅ College/university email address
- ✅ Browser (Chrome/Edge recommended)

**Estimated Time:** 45-60 minutes  
**Cost:** Free (using student credits)

---

## Part 1: Azure Account Setup (5 minutes)

### Step 1: Verify Your Azure Account

1. Go to https://portal.azure.com
2. Sign in with your college email
3. You should see the Azure Portal dashboard

**Verify Student Credits:**
1. Click on **"Cost Management + Billing"** (search in top bar)
2. Click **"Credits"**
3. You should see **$100 available**

**If you don't have Azure for Students yet:**
1. Go to https://azure.microsoft.com/en-in/free/students/
2. Click **"Activate now"**
3. Sign in with college email
4. Verify with phone number
5. Accept terms
6. Wait for approval (usually instant)

---

## Part 2: Create Azure OpenAI Resource (15 minutes)

### Step 2.1: Request Access to Azure OpenAI

**Important:** Azure OpenAI requires approval (usually 1-2 business days)

1. Go to https://aka.ms/oai/access
2. Click **"Request access to Azure OpenAI Service"**
3. Fill in the form:
   - **Email:** Your college email
   - **First Name:** Your name
   - **Last Name:** Your surname
   - **Company/Organization:** Your college name
   - **Country:** India
   - **Use Case:** "Educational project for cloud computing course"
   - **Will you use Azure OpenAI for research:** Yes
   - **Research details:** "Study group collaboration platform with AI features"

4. Click **"Submit"**
5. Wait for approval email (check spam folder)

**While waiting, you can continue with other steps and come back later**

### Step 2.2: Create Azure OpenAI Resource (After Approval)

**Once you receive approval email:**

1. **Login to Azure Portal:** https://portal.azure.com

2. **Create Resource:**
   - Click **"+ Create a resource"** (top left)
   - Search for **"Azure OpenAI"**
   - Click **"Azure OpenAI"** by Microsoft
   - Click **"Create"**

3. **Configure Basics:**
   - **Subscription:** Azure for Students
   - **Resource group:** Click "Create new"
     - Name: `studysphere-rg`
     - Region: **East US** (recommended) or **West Europe**
     - Click OK
   - **Region:** **East US** (same as resource group)
   - **Name:** `studysphere-openai` (must be globally unique)
     - If taken, try: `studysphere-openai-yourname`
   - **Pricing tier:** Standard S0
   - Click **"Next: Network"**

4. **Network Settings:**
   - Type: **All networks, including the internet, can access this resource**
   - Click **"Next: Tags"**

5. **Tags (Optional):**
   - Skip or add:
     - `Project: StudySphere`
     - `Environment: Development`
   - Click **"Next: Review + create"**

6. **Review and Create:**
   - Review all settings
   - Click **"Create"**
   - Wait 2-3 minutes for deployment

7. **Go to Resource:**
   - Click **"Go to resource"** when deployment completes

### Step 2.3: Deploy GPT-4o-mini Model

1. **In your OpenAI resource:**
   - Click **"Model deployments"** (left menu under "Resource Management")
   - Or click **"Go to Azure OpenAI Studio"**

2. **In Azure OpenAI Studio:**
   - Click **"Deployments"** (left menu)
   - Click **"+ Create new deployment"**

3. **Configure Deployment:**
   - **Select a model:** `gpt-4o-mini` (scroll to find it)
     - If not available, use `gpt-35-turbo` as alternative
   - **Deployment name:** `gpt-4o-mini` (must match your code)
   - **Deployment type:** Standard
   - **Model version:** Select latest (auto-update)
   - **Tokens per Minute Rate Limit:** 10K (or default)
   - Click **"Create"**

4. **Wait for Deployment:**
   - Takes 1-2 minutes
   - Status should show "Succeeded"

### Step 2.4: Get API Keys and Endpoint

1. **Go back to Azure Portal** (portal.azure.com)
2. Navigate to your **studysphere-openai** resource
3. Click **"Keys and Endpoint"** (left menu under "Resource Management")

4. **Copy the following:**
   - **KEY 1:** (example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
   - **Endpoint:** (example: `https://studysphere-openai.openai.azure.com/`)
   - **Region:** (example: `eastus`)

5. **Save to `.env` file:**
   ```env
   AZURE_OPENAI_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
   AZURE_OPENAI_ENDPOINT="https://studysphere-openai.openai.azure.com/"
   AZURE_OPENAI_DEPLOYMENT="gpt-4o-mini"
   AZURE_OPENAI_API_VERSION="2024-02-15-preview"
   ```

---

## Part 3: Create Content Moderator Resource (10 minutes)

### Step 3.1: Create Content Moderator

1. **In Azure Portal:**
   - Click **"+ Create a resource"**
   - Search for **"Content Moderator"**
   - Click **"Content Moderator"** by Microsoft
   - Click **"Create"**

2. **Configure:**
   - **Subscription:** Azure for Students
   - **Resource group:** Use existing → `studysphere-rg`
   - **Region:** **Central India** (closest to you) or **Southeast Asia**
     - Note: Content Moderator is available in limited regions
     - If not available, try: East US, West Europe
   - **Name:** `studysphere-moderator`
   - **Pricing tier:** 
     - **Free F0** (5,000 transactions/month) ← **Choose this!**
     - Or Standard S0 if F0 not available

3. **Review and Create:**
   - Click **"Review + create"**
   - Click **"Create"**
   - Wait 1-2 minutes

4. **Get API Keys:**
   - Click **"Go to resource"**
   - Click **"Keys and Endpoint"** (left menu)
   - Copy:
     - **KEY 1:** (example: `x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6`)
     - **Endpoint:** (example: `https://centralindia.api.cognitive.microsoft.com/`)

5. **Save to `.env`:**
   ```env
   AZURE_MODERATOR_KEY="x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6"
   AZURE_MODERATOR_ENDPOINT="https://centralindia.api.cognitive.microsoft.com/"
   ```

---

## Part 4: Create PostgreSQL Database (15 minutes)

### Step 4.1: Create PostgreSQL Flexible Server

**Option A: Using Azure Portal (Manual)**

1. **Create Resource:**
   - Click **"+ Create a resource"**
   - Search for **"Azure Database for PostgreSQL"**
   - Click **"Azure Database for PostgreSQL Flexible Server"**
   - Click **"Create"**

2. **Basics:**
   - **Subscription:** Azure for Students
   - **Resource group:** `studysphere-rg`
   - **Server name:** `studysphere-postgres-dev` (must be globally unique)
   - **Region:** **Central India** or **Southeast Asia**
   - **PostgreSQL version:** 15
   - **Workload type:** Development (saves money)
   - **Compute + storage:** 
     - Click **"Configure server"**
     - Choose **Burstable, B1ms** (cheapest option)
     - Storage: 32 GiB
     - Click **"Save"**

3. **Authentication:**
   - **Authentication method:** PostgreSQL authentication only
   - **Admin username:** `pgadmin`
   - **Password:** Create strong password (e.g., `StudySphere@2024`)
   - **Confirm password:** Same as above
   - ⚠️ **SAVE THIS PASSWORD!** You'll need it

4. **Networking:**
   - **Connectivity method:** Public access (all networks)
   - Check **"Allow public access from any Azure service"** ✅
   - **Firewall rules:** Click **"Add current client IP address"** ✅
   - Optional: Add rule for 0.0.0.0 to 255.255.255.255 (all IPs - for testing only!)

5. **Review + Create:**
   - Click **"Review + create"**
   - Click **"Create"**
   - **Wait 5-10 minutes** for deployment

6. **Get Connection String:**
   - After deployment, click **"Go to resource"**
   - Click **"Connection strings"** (left menu)
   - Copy the connection string for **psql**
   - It looks like:
     ```
     postgresql://pgadmin@studysphere-postgres-dev:PASSWORD@studysphere-postgres-dev.postgres.database.azure.com:5432/postgres?sslmode=require
     ```

7. **Save to `.env`:**
   ```env
   AZURE_POSTGRES_URL="postgresql://pgadmin@studysphere-postgres-dev:YOUR_PASSWORD@studysphere-postgres-dev.postgres.database.azure.com:5432/studysphere?sslmode=require"
   ```

   **Replace:**
   - `YOUR_PASSWORD` with the password you created
   - Change database name from `postgres` to `studysphere`

**Option B: Using Terraform (Automated) - Skip if you did Option A**

We'll do this in the next section.

---

## Part 5: Install Required Tools (10 minutes)

### Step 5.1: Install Azure CLI

1. **Download:**
   - Go to https://aka.ms/installazurecliwindows
   - Download the MSI installer
   - Run the installer
   - Accept defaults
   - Click "Install"

2. **Verify:**
   ```bash
   az --version
   ```
   Should show version 2.x.x

3. **Login:**
   ```bash
   az login
   ```
   - Browser opens
   - Sign in with college email
   - You should see your subscription info

4. **Set Default Subscription:**
   ```bash
   # List subscriptions
   az account list --output table
   
   # Set default (if you have multiple)
   az account set --subscription "Azure for Students"
   ```

### Step 5.2: Install Terraform (Optional - for infrastructure automation)

**Only needed if you want to automate infrastructure deployment**

1. **Download:**
   - Go to https://www.terraform.io/downloads
   - Download Windows AMD64 version (ZIP file)

2. **Install:**
   - Extract ZIP to `C:\terraform`
   - Add to PATH:
     - Search "Environment Variables" in Windows
     - Click "Environment Variables"
     - Under "System variables", select "Path"
     - Click "Edit"
     - Click "New"
     - Add: `C:\terraform`
     - Click OK

3. **Verify:**
   ```bash
   terraform --version
   ```
   Should show version 1.x.x

---

## Part 6: Update Your .env File

### Complete .env Configuration

Edit your `.env` file in the project root:

```env
# ============================================================
# DATABASE CONFIGURATION
# ============================================================

# Local development (Docker)
DATABASE_URL="postgresql://studysphere:studysphere123@localhost:5432/studysphere?schema=public"

# Azure PostgreSQL (uncomment when deploying)
# AZURE_POSTGRES_URL="postgresql://pgadmin@studysphere-postgres-dev:YOUR_PASSWORD@studysphere-postgres-dev.postgres.database.azure.com:5432/studysphere?sslmode=require"

# ============================================================
# JWT AUTHENTICATION
# ============================================================
JWT_SECRET="your-super-secret-jwt-key-change-in-production-12345"
JWT_EXPIRES_IN="7d"

# ============================================================
# AZURE OPENAI (Replace with your actual values)
# ============================================================
AZURE_OPENAI_KEY="paste-your-key-1-here"
AZURE_OPENAI_ENDPOINT="https://studysphere-openai.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT="gpt-4o-mini"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"

# ============================================================
# AZURE CONTENT MODERATOR (Replace with your actual values)
# ============================================================
AZURE_MODERATOR_KEY="paste-your-moderator-key-here"
AZURE_MODERATOR_ENDPOINT="https://centralindia.api.cognitive.microsoft.com/"

# ============================================================
# REDIS (For Socket.io scaling)
# ============================================================
REDIS_URL="redis://localhost:6379"

# ============================================================
# SERVICE PORTS
# ============================================================
AUTH_SERVICE_PORT=5001
USER_SERVICE_PORT=5002
GROUP_SERVICE_PORT=5003
CHAT_SERVICE_PORT=5004
FRONTEND_PORT=5173

# ============================================================
# CORS ORIGINS
# ============================================================
CORS_ORIGIN="http://localhost:5173"

# ============================================================
# TERRAFORM / AZURE CREDENTIALS (Optional - for automation)
# ============================================================
# Get these from Service Principal creation
ARM_CLIENT_ID=""
ARM_CLIENT_SECRET=""
ARM_TENANT_ID=""
ARM_SUBSCRIPTION_ID=""

# ============================================================
# AZURE RESOURCES (Optional - for Terraform/K8s deployment)
# ============================================================
ACR_NAME="studysphereacr"
ACR_LOGIN_SERVER="studysphereacr.azurecr.io"
AKS_CLUSTER_NAME="studysphere-aks"
AKS_RESOURCE_GROUP="studysphere-rg"
AKS_NAMESPACE="production"

# ============================================================
# FILE UPLOAD
# ============================================================
MAX_FILE_SIZE="10485760"
UPLOAD_DIR="./uploads"
```

---

## Part 7: Test Azure OpenAI (Critical!)

### Step 7.1: Test API Connection

Create a test file to verify your keys work:

**Create file: `test-azure.js`**

```javascript
const { OpenAI } = require('openai');

// Replace with your actual values
const AZURE_OPENAI_KEY = "your-key-here";
const AZURE_OPENAI_ENDPOINT = "https://studysphere-openai.openai.azure.com/";
const AZURE_OPENAI_DEPLOYMENT = "gpt-4o-mini";

const client = new OpenAI({
  apiKey: AZURE_OPENAI_KEY,
  baseURL: `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}`,
  defaultQuery: { 'api-version': '2024-02-15-preview' },
  defaultHeaders: { 'api-key': AZURE_OPENAI_KEY },
});

async function testOpenAI() {
  try {
    console.log('Testing Azure OpenAI connection...');
    
    const response = await client.chat.completions.create({
      model: AZURE_OPENAI_DEPLOYMENT,
      messages: [
        { role: 'user', content: 'Say hello!' }
      ],
      max_tokens: 50
    });
    
    console.log('✅ Success!');
    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Details:', error.response.data);
    }
  }
}

testOpenAI();
```

**Run the test:**
```bash
node test-azure.js
```

**Expected output:**
```
Testing Azure OpenAI connection...
✅ Success!
Response: Hello! How can I help you today?
```

**If you get errors:**
- ❌ 401 Unauthorized → Check API key
- ❌ 404 Not Found → Check endpoint URL or deployment name
- ❌ 429 Rate Limit → Wait a minute and retry
- ❌ Network error → Check firewall/VPN

### Step 7.2: Test Content Moderator

**Create file: `test-moderator.js`**

```javascript
const ContentModeratorClient = require('@azure/cognitiveservices-contentmoderator').ContentModeratorClient;
const msRest = require('@azure/ms-rest-azure-js');

// Replace with your actual values
const AZURE_MODERATOR_KEY = "your-moderator-key";
const AZURE_MODERATOR_ENDPOINT = "https://centralindia.api.cognitive.microsoft.com/";

const credentials = new msRest.ApiKeyCredentials({
  inHeader: { 'Ocp-Apim-Subscription-Key': AZURE_MODERATOR_KEY }
});

const client = new ContentModeratorClient(credentials, AZURE_MODERATOR_ENDPOINT);

async function testModerator() {
  try {
    console.log('Testing Azure Content Moderator...');
    
    const result = await client.textModeration.screenText(
      'text/plain',
      Buffer.from('This is a clean test message'),
      { language: 'eng' }
    );
    
    console.log('✅ Success!');
    console.log('Terms found:', result.terms?.length || 0);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testModerator();
```

**Run:**
```bash
# Install dependencies first
npm install @azure/cognitiveservices-contentmoderator @azure/ms-rest-azure-js

node test-moderator.js
```

**Expected:**
```
Testing Azure Content Moderator...
✅ Success!
Terms found: 0
```

---

## Part 8: (Optional) Terraform Automation

**Only do this if you want to automate infrastructure deployment**

### Step 8.1: Create Service Principal

A Service Principal is like a bot account for Terraform to manage Azure.

1. **Get Your Subscription ID:**
   ```bash
   az account show --query id -o tsv
   ```
   Copy this ID (looks like: `12345678-1234-1234-1234-123456789abc`)

2. **Create Service Principal:**
   ```bash
   az ad sp create-for-rbac --name studysphere-terraform --role Contributor --scopes /subscriptions/YOUR_SUBSCRIPTION_ID
   ```
   
   Replace `YOUR_SUBSCRIPTION_ID` with the ID from step 1.

3. **Save the Output:**
   ```json
   {
     "appId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
     "displayName": "studysphere-terraform",
     "password": "super-secret-password-here",
     "tenant": "ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj"
   }
   ```

4. **Update `.env`:**
   ```env
   ARM_CLIENT_ID="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
   ARM_CLIENT_SECRET="super-secret-password-here"
   ARM_TENANT_ID="ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj"
   ARM_SUBSCRIPTION_ID="12345678-1234-1234-1234-123456789abc"
   ```

### Step 8.2: Configure Terraform

1. **Edit `infra/terraform.tfvars`:**
   ```bash
   cd infra
   copy terraform.tfvars.example terraform.tfvars
   notepad terraform.tfvars
   ```

2. **Update values:**
   ```hcl
   project_name        = "studysphere"
   environment         = "dev"
   location            = "Central India"  # or "Southeast Asia"
   resource_group_name = "studysphere-rg"
   
   # PostgreSQL
   db_admin_username = "pgadmin"
   db_admin_password = "StudySphere@2024"  # Use a strong password!
   
   # Container Registry (must be alphanumeric, globally unique)
   acr_name = "studysphereacr"  # Try adding your name if taken
   
   # Kubernetes
   aks_cluster_name = "studysphere-aks"
   aks_node_count   = 2
   ```

3. **Initialize Terraform:**
   ```bash
   cd infra
   terraform init
   ```

4. **Plan (Preview Changes):**
   ```bash
   terraform plan
   ```
   This shows what will be created. Review carefully.

5. **Apply (Create Resources):**
   ```bash
   terraform apply
   ```
   - Type `yes` when prompted
   - Wait 15-20 minutes
   - **Cost:** ~$50-80/month (uses your student credits)

6. **Get Outputs:**
   ```bash
   terraform output
   ```
   Save these values!

---

## Part 9: Restart Services with Azure Keys

### Step 9.1: Stop and Restart Docker

```bash
cd C:\Users\Rakhul\Projects\StudySphere

# Stop containers
docker-compose down

# Start with new .env values
docker-compose up -d
```

### Step 9.2: Verify GenAI Features Work

1. **Test Quiz Classification:**
   - Register new user
   - Complete profile quiz
   - Should see **AI-classified interests** (not mock data)
   - Check console logs for "Classified interests"

2. **Test Content Moderation:**
   - Send message with word "spam"
   - Should be blocked with moderation warning
   - Check if message says "[Message removed by content moderation]"

3. **Test Resource Summarization:**
   - Upload a resource with content
   - Should see AI-generated bullet-point summary
   - Look for sparkle icon (✨)

---

## Part 10: Take Screenshots for Documentation

### Azure Portal Screenshots

**OpenAI Resource:**
1. Go to your `studysphere-openai` resource
2. Screenshot the **Overview** page
3. Screenshot the **Model deployments** page
4. Screenshot the **Keys and Endpoint** page (blur the keys!)
5. Save as: `docs/screenshots/azure-openai.png`

**Content Moderator:**
1. Go to your `studysphere-moderator` resource
2. Screenshot the **Overview** page
3. Screenshot **Usage** (if available)
4. Save as: `docs/screenshots/content-moderator.png`

**PostgreSQL (if created):**
1. Screenshot overview
2. Save as: `docs/screenshots/postgresql.png`

---

## Troubleshooting

### Issue 1: Azure OpenAI Access Not Approved

**Solution:**
- Use mock responses for now (already implemented in code)
- For demo, mention "Pending Azure OpenAI approval"
- Show the request form as proof
- Alternative: Use OpenAI API (non-Azure) temporarily

**Quick test with mock:**
- Comment out `AZURE_OPENAI_KEY` in `.env`
- Code will automatically use mock responses
- Still demonstrates the concept!

### Issue 2: Content Moderator Quota Exceeded

**Error:** "429 Too Many Requests"

**Solution:**
- Free tier: 1 call/second, 5,000/month
- Wait 1 second between messages
- Or upgrade to Standard tier

### Issue 3: PostgreSQL Connection Failed

**Error:** "Connection timeout"

**Solution:**
1. Check firewall rules in Azure Portal
2. Add your IP address:
   ```bash
   # Get your IP
   curl ifconfig.me
   
   # Add firewall rule in Azure Portal
   # PostgreSQL → Networking → Firewall rules
   ```

3. Or use local PostgreSQL (Docker) for development

### Issue 4: Terraform Errors

**Error:** "Error creating resource group"

**Solution:**
- Make sure you're logged in: `az login`
- Check subscription: `az account show`
- Verify service principal has Contributor role

---

## Cost Optimization Tips

### Stay Within $100 Student Credits

**Monthly Cost Breakdown:**

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| Azure OpenAI | gpt-4o-mini, <1M tokens | ~$5 |
| Content Moderator | Free F0 tier | $0 |
| PostgreSQL | B1ms, 32GB | ~$15 |
| AKS | 2x B2s nodes | ~$40 |
| ACR | Standard | ~$5 |
| **Total** | | **~$65/month** |

**Your $100 lasts ~1.5 months!**

**To Save Money:**
1. **Use Free Tiers:**
   - Content Moderator: F0 (free)
   - Keep resources in same region

2. **Only for Demo:**
   - Don't create AKS yet (use local Docker)
   - Skip ACR (not needed for local testing)
   - Only create OpenAI + Moderator + PostgreSQL

3. **Delete After Demo:**
   ```bash
   # Delete everything
   cd infra
   terraform destroy
   
   # Or manually in Azure Portal
   # Delete resource group: studysphere-rg
   ```

---

## Minimal Setup for Demo (Recommended)

**You only need these for a working demo:**

✅ **Must Have:**
1. Azure OpenAI resource (for quiz classification)
2. Content Moderator resource (for chat moderation)

❌ **Not Required for Local Demo:**
1. PostgreSQL on Azure (use local Docker instead)
2. AKS cluster (deploy later if needed)
3. Container Registry (only for production)

**Total Cost:** ~$5/month (just OpenAI usage, Moderator is free!)

---

## Quick Start Checklist

### For Immediate Demo (Use Local + Azure AI)

- [x] Create Azure account (Azure for Students)
- [x] Request Azure OpenAI access
- [ ] Create Azure OpenAI resource
- [ ] Deploy gpt-4o-mini model
- [ ] Get OpenAI API keys
- [ ] Create Content Moderator resource (Free F0)
- [ ] Get Moderator API keys
- [ ] Update `.env` file
- [ ] Run `docker-compose down && docker-compose up -d`
- [ ] Test quiz classification
- [ ] Test chat moderation
- [ ] Test resource summarization
- [ ] Take screenshots
- [ ] Delete test file: `test-azure.js`, `test-moderator.js`

### For Full Production Deployment (Later)

- [ ] Install Azure CLI
- [ ] Install Terraform
- [ ] Create Service Principal
- [ ] Create PostgreSQL on Azure
- [ ] Create ACR
- [ ] Create AKS cluster
- [ ] Setup GitHub Actions
- [ ] Deploy to Kubernetes

---

## Support Resources

### Azure Documentation
- Azure OpenAI: https://learn.microsoft.com/en-us/azure/cognitive-services/openai/
- Content Moderator: https://learn.microsoft.com/en-us/azure/cognitive-services/content-moderator/
- PostgreSQL: https://learn.microsoft.com/en-us/azure/postgresql/

### Azure Support for Students
- Portal: https://aka.ms/studentcredits
- Support: https://aka.ms/azureforeducators
- Learning: https://learn.microsoft.com/en-us/training/

### Community
- Azure Reddit: r/AZURE
- Stack Overflow: [azure] tag
- Discord: Azure Community

---

## Important Notes

### 🔐 Security Best Practices

1. **Never commit `.env` to git** (already in .gitignore)
2. **Use different keys for dev/prod**
3. **Rotate keys regularly**
4. **Don't share keys in screenshots**
5. **Delete resources after demo** (saves credits)

### 💰 Monitor Your Spending

1. **Check costs daily:**
   - Portal → Cost Management + Billing
   - View spending trends

2. **Set budget alerts:**
   - Cost Management → Budgets
   - Create alert at $50, $75, $90

3. **Delete unused resources:**
   - Don't leave resources running overnight
   - Stop/deallocate when not testing

### 📊 For Your Presentation

**What to Show:**
1. Azure Portal with OpenAI resource
2. Model deployment page (gpt-4o-mini)
3. Content Moderator overview
4. Usage/metrics page
5. Working demo with real AI responses

**What to Mention:**
- "Using Azure for Students credits"
- "Free tier for Content Moderator"
- "Cost-effective choice: gpt-4o-mini"
- "Enterprise compliance for education"

---

## Next Steps After Setup

1. ✅ Verify all keys work (test files)
2. ✅ Restart Docker containers
3. ✅ Test all three GenAI features
4. ✅ Take Azure Portal screenshots
5. ✅ Update presentation with real examples
6. ✅ Practice 10-minute demo
7. ✅ (Optional) Deploy to Kubernetes for extra points

---

**Need help? Common issues and solutions are above!**

Good luck with your Azure setup! 🚀

