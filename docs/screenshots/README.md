# Screenshots Directory

This directory contains screenshots for documentation and presentation purposes.

## Required Screenshots

### Azure Portal

1. **azure-openai.png**
   - Azure OpenAI resource overview
   - Show deployment of gpt-4o-mini model
   - Display API keys and endpoint
   - Show usage metrics

2. **content-moderator.png**
   - Content Moderator resource overview
   - Show API keys and endpoint
   - Display transaction history
   - Show configuration settings

3. **aks-cluster.png**
   - AKS cluster overview
   - Show node pools and scaling configuration
   - Display connected services
   - Show insights and monitoring

4. **acr.png**
   - Azure Container Registry overview
   - Show repository list with images
   - Display image tags
   - Show webhooks configuration

5. **postgresql.png**
   - PostgreSQL Flexible Server overview
   - Show connection details
   - Display backup configuration
   - Show firewall rules

6. **usage-metrics.png**
   - Azure cost analysis
   - GenAI API usage statistics
   - Resource utilization charts

### Application Screenshots

7. **login-page.png**
   - Login form

8. **register-page.png**
   - Registration form

9. **profile-quiz.png**
   - 5-question quiz interface

10. **dashboard.png**
    - Main dashboard with Discord-like layout
    - Sidebar with groups and channels
    - Chat area
    - Right panel with events and resources

11. **chat-moderation.png**
    - Example of moderated message
    - Warning notification

12. **resource-summary.png**
    - Resource with AI-generated summary
    - Sparkle icon indicating AI feature

### CI/CD Screenshots

13. **github-actions.png**
    - GitHub Actions workflow overview
    - Successful pipeline run
    - Deployment stages

14. **pipeline-logs.png**
    - Detailed pipeline execution logs
    - Build and deployment steps

### Kubernetes Screenshots

15. **kubectl-pods.png**
    - Output of `kubectl get pods -n production`

16. **kubectl-services.png**
    - Output of `kubectl get services -n production`

17. **kubectl-hpa.png**
    - Output of `kubectl get hpa -n production`

## How to Take Screenshots

### Azure Portal
1. Login to https://portal.azure.com
2. Navigate to each resource
3. Capture full browser window
4. Save as PNG with descriptive name

### Application
1. Run application locally or on deployed URL
2. Use browser developer tools (F12) for responsive views
3. Capture key features and GenAI integrations

### Terminal/CLI
1. Use terminal screenshot tool
2. Ensure text is readable
3. Include command and output

### GitHub Actions
1. Navigate to repository → Actions
2. Select successful workflow run
3. Capture workflow visualization and logs

## Screenshot Guidelines

- **Format:** PNG (preferred) or JPG
- **Resolution:** At least 1920x1080
- **Quality:** High quality, readable text
- **Annotations:** Use arrows/boxes to highlight key features (optional)
- **Privacy:** Redact sensitive information (API keys, passwords)

## Placeholder Images

If Azure resources are not provisioned yet, you can:
1. Use mock screenshots from similar deployments
2. Use design tools (Figma, Canva) to create mockups
3. Label clearly as "Example" or "Mockup"

## Including in Documentation

Reference screenshots in markdown:
```markdown
![Azure OpenAI Resource](screenshots/azure-openai.png)
```

Include in presentation slides with captions.

---

**Note:** Commit screenshots with descriptive names and update references in documentation files.

