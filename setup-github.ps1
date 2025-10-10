# StudySphere - GitHub Setup PowerShell Script
# This script helps you set up GitHub secrets using the web interface

Write-Host "🚀 StudySphere - GitHub Setup Helper" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Read env.txt for credentials
$envContent = Get-Content -Path ".\env.txt" -Raw

# Parse credentials
$GEMINI_KEY = ($envContent | Select-String 'GEMINI_API_KEY="([^"]+)"').Matches.Groups[1].Value
$MODERATOR_KEY = ($envContent | Select-String 'AZURE_MODERATOR_KEY="([^"]+)"').Matches.Groups[1].Value
$MODERATOR_ENDPOINT = ($envContent | Select-String 'AZURE_MODERATOR_ENDPOINT="([^"]+)"').Matches.Groups[1].Value
$ARM_CLIENT_ID = ($envContent | Select-String 'ARM_CLIENT_ID="([^"]+)"').Matches.Groups[1].Value
$ARM_CLIENT_SECRET = ($envContent | Select-String 'ARM_CLIENT_SECRET="([^"]+)"').Matches.Groups[1].Value
$ARM_TENANT_ID = ($envContent | Select-String 'ARM_TENANT_ID="([^"]+)"').Matches.Groups[1].Value
$ARM_SUBSCRIPTION_ID = ($envContent | Select-String 'ARM_SUBSCRIPTION_ID="([^"]+)"').Matches.Groups[1].Value

Write-Host "✅ Loaded credentials from env.txt" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Creating AZURE_CREDENTIALS JSON..." -ForegroundColor Yellow

# Create Azure credentials JSON
$azureCredentials = @{
    clientId = $ARM_CLIENT_ID
    clientSecret = $ARM_CLIENT_SECRET
    subscriptionId = $ARM_SUBSCRIPTION_ID
    tenantId = $ARM_TENANT_ID
} | ConvertTo-Json

# Save to file
$azureCredentials | Out-File -FilePath ".\azure-credentials.json" -Encoding UTF8

Write-Host "✅ Created azure-credentials.json" -ForegroundColor Green
Write-Host ""

Write-Host "📋 GitHub Secrets Setup Instructions:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Go to: https://github.com/BlackEmpir7199/StudySphere/settings/secrets/actions" -ForegroundColor White
Write-Host ""
Write-Host "Add these 16 secrets (click 'New repository secret' for each):" -ForegroundColor Yellow
Write-Host ""

$secrets = @(
    @{Name="ACR_NAME"; Value="studysphereacr"},
    @{Name="ACR_LOGIN_SERVER"; Value="studysphereacr.azurecr.io"},
    @{Name="AKS_CLUSTER_NAME"; Value="studysphere-aks"},
    @{Name="AKS_RESOURCE_GROUP"; Value="studysphere-rg"},
    @{Name="ARM_SUBSCRIPTION_ID"; Value=$ARM_SUBSCRIPTION_ID},
    @{Name="ARM_TENANT_ID"; Value=$ARM_TENANT_ID},
    @{Name="ARM_CLIENT_ID"; Value=$ARM_CLIENT_ID},
    @{Name="ARM_CLIENT_SECRET"; Value=$ARM_CLIENT_SECRET},
    @{Name="DATABASE_URL"; Value="postgresql://pgadmin:StudySphere@2024!@studysphere-postgres.postgres.database.azure.com:5432/studysphere?sslmode=require"},
    @{Name="DB_ADMIN_PASSWORD"; Value="StudySphere@2024!"},
    @{Name="JWT_SECRET"; Value="prod-secret-key-2024-studysphere"},
    @{Name="GEMINI_API_KEY"; Value=$GEMINI_KEY},
    @{Name="GEMINI_MODEL"; Value="gemini-2.0-flash-exp"},
    @{Name="AZURE_MODERATOR_KEY"; Value=$MODERATOR_KEY},
    @{Name="AZURE_MODERATOR_ENDPOINT"; Value=$MODERATOR_ENDPOINT},
    @{Name="AZURE_CREDENTIALS"; Value=$azureCredentials}
)

foreach ($secret in $secrets) {
    Write-Host "  $($secret.Name)" -ForegroundColor White -NoNewline
    if ($secret.Value.Length -gt 50) {
        Write-Host " = $($secret.Value.Substring(0,50))..." -ForegroundColor Gray
    } else {
        Write-Host " = $($secret.Value)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "💾 I've saved AZURE_CREDENTIALS to: azure-credentials.json" -ForegroundColor Green
Write-Host "   You can copy the entire content of this file for the AZURE_CREDENTIALS secret" -ForegroundColor Yellow
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open: https://github.com/BlackEmpir7199/StudySphere/settings/secrets/actions" -ForegroundColor White
Write-Host "2. Add each secret above" -ForegroundColor White
Write-Host "3. Create environments: development, testing, production" -ForegroundColor White
Write-Host "   Go to: https://github.com/BlackEmpir7199/StudySphere/settings/environments" -ForegroundColor White
Write-Host "4. Check Actions tab to see workflows" -ForegroundColor White
Write-Host ""

Write-Host "Setup helper complete!" -ForegroundColor Green
Write-Host "See GITHUB_SETUP.md for detailed instructions" -ForegroundColor Cyan

