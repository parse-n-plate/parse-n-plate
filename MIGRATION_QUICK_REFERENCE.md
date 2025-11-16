# AWS to Vercel Migration - Quick Reference

## 📊 Current AWS Infrastructure Summary

### AWS Resources You Have

| Resource Type | Name/ID | Purpose | Cost Impact |
|--------------|---------|---------|-------------|
| **ECR Repository** | `parse-n-plate` | Stores Docker images | ~$0.10/month |
| **ECS Cluster** | `parse-n-plate-ecs-cluster` | Container orchestration | Included with EC2 |
| **ECS Service** | `parse-n-plate-service-prod` | Runs containers | Included with EC2 |
| **ECS Task Definition** | `parse-n-plate-task-prod` | Container configuration | Free |
| **EC2 Instance** | (check AWS console) | Runs ECS containers + Nginx | ~$15-30/month |
| **IAM User/Role** | (check AWS console) | AWS API access | Free |

### GitHub Secrets (AWS-Related)

These need to be removed after migration:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCOUNT_ID`
- `EC2_HOST`
- `EC2_SSH_KEY`

**Keep this one** (also needed for Vercel):
- `GROQ_API_KEY` ✅

### Files in Your Codebase

**AWS-Specific Files:**
- `.github/workflows/deploy-prod.yml` - AWS deployment workflow
- `.aws/task-definition.json` - ECS task definition

**Files to Keep (for now):**
- `Dockerfile` - May be useful for local development
- `requirements.txt` - Needed for Python dependencies on Vercel

---

## 🎯 Migration Priority Actions

### Phase 1: Setup Vercel (Do This First) ⚡

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Repository**
   - Click "New Project"
   - Import `parse-n-plate` repository
   - Vercel auto-detects Next.js

3. **Add Environment Variable**
   - Go to Project Settings → Environment Variables
   - Add: `GROQ_API_KEY` = (copy from GitHub Secrets)
   - Set for: Production, Preview, Development

4. **Deploy & Test**
   - Vercel will auto-deploy on import
   - Test all functionality:
     - ✅ Recipe URL parsing
     - ⚠️ **Python scraper** (needs special attention - see below)
     - ✅ AI-powered parsing
     - ✅ Error handling

### Phase 2: Fix Python Integration ⚠️ CRITICAL

**The Problem:**
Your code spawns Python from Node.js:
```typescript
spawn('python3', ['src/utils/scrape_recipe.py', url])
```
Vercel Node.js functions don't have Python installed.

**The Solution:**
Convert to a Python serverless function:

1. **Create new file**: `src/app/api/recipeScraperPython/index.py`
2. **Move Python logic** from `scrape_recipe.py` to the new file
3. **Update frontend** to call the endpoint (same URL, different implementation)
4. **Vercel will automatically**:
   - Detect Python
   - Install dependencies from `requirements.txt`
   - Deploy as serverless function

**Alternative (if Python function doesn't work):**
- Rewrite scraper in Node.js using Cheerio (already in dependencies)

### Phase 3: Update GitHub Actions

**Option A: Remove AWS Deployment** (Recommended)
- Keep linting job
- Remove AWS deployment steps
- Vercel handles deployments automatically

**Option B: Remove Entirely**
- Delete `.github/workflows/deploy-prod.yml`
- Vercel handles everything

### Phase 4: Clean Up (After 1-2 Weeks of Successful Vercel Operation)

#### Code Cleanup
- [ ] Delete `.aws/task-definition.json`
- [ ] Update `.github/workflows/deploy-prod.yml` (remove AWS steps or delete)
- [ ] Update `README.md` (remove AWS references, add Vercel)
- [ ] Update `TECHNICAL_SUMMARY.txt` (update infrastructure section)

#### GitHub Secrets Cleanup
- [ ] Remove `AWS_ACCESS_KEY_ID`
- [ ] Remove `AWS_SECRET_ACCESS_KEY`
- [ ] Remove `AWS_ACCOUNT_ID`
- [ ] Remove `EC2_HOST`
- [ ] Remove `EC2_SSH_KEY`
- [ ] Keep `GROQ_API_KEY` (also in Vercel now)

#### AWS Infrastructure Cleanup ⚠️ DO LAST
**Only after confirming Vercel works perfectly for 1-2 weeks!**

1. **Stop ECS Service** (saves costs, reversible)
   - AWS Console → ECS → Services
   - Stop: `parse-n-plate-service-prod`

2. **Delete ECS Resources** (after testing period)
   - Delete Service: `parse-n-plate-service-prod`
   - Delete Cluster: `parse-n-plate-ecs-cluster`
   - Delete Task Definition: `parse-n-plate-task-prod`

3. **Clean Up ECR** (after testing period)
   - Delete images from repository
   - Delete repository: `parse-n-plate`

4. **Terminate EC2** (after testing period)
   - Stop instance first (reversible)
   - After 1-2 weeks, terminate (irreversible!)

5. **Clean Up IAM**
   - Review IAM users/roles
   - Remove unused access keys
   - Delete unused roles

---

## 🔍 Key Differences: AWS vs Vercel

| Aspect | AWS (Current) | Vercel (Target) |
|--------|---------------|-----------------|
| **Deployment** | Docker containers → ECS | Serverless functions (automatic) |
| **Container Registry** | ECR | Not needed |
| **Orchestration** | ECS | Automatic |
| **Server** | EC2 instance | Serverless (no server to manage) |
| **Reverse Proxy** | Nginx on EC2 | Built-in (automatic) |
| **HTTPS** | Manual setup | Automatic |
| **CDN** | Optional (CloudFront) | Built-in (automatic) |
| **Scaling** | Manual/ECS auto-scaling | Automatic |
| **Cost** | ~$15-30/month | Free (Hobby) or $20/month (Pro) |
| **Python Support** | Docker includes Python | Python serverless functions |

---

## ⚠️ Critical Migration Notes

### Python Integration
- **Current**: Node.js spawns Python process
- **Vercel**: Must use Python serverless function OR rewrite in Node.js
- **Action Required**: Convert `/api/recipeScraperPython` to Python function

### Timeout Limits
- **Vercel Hobby**: 10 seconds per function
- **Vercel Pro**: 60 seconds per function
- **Your Current Timeout**: 30 seconds (should be fine on Pro plan)

### File Paths
- Python script path: `src/utils/scrape_recipe.py`
- In serverless function, use relative paths or `__dirname`

### Environment Variables
- Move `GROQ_API_KEY` from GitHub Secrets to Vercel
- Vercel dashboard → Project Settings → Environment Variables

---

## 📋 Pre-Migration Checklist

Before starting migration:
- [ ] Review current AWS costs (check AWS billing)
- [ ] Document current domain/DNS setup (if any)
- [ ] Test local build: `npm run build`
- [ ] Test all API endpoints locally
- [ ] Note any custom Nginx configurations
- [ ] Backup any important AWS configurations

---

## 📋 Post-Migration Checklist

After Vercel is working:
- [ ] Test all functionality on Vercel
- [ ] Verify Python scraper works
- [ ] Check performance/response times
- [ ] Verify HTTPS works
- [ ] Test error handling
- [ ] Monitor for 1-2 weeks
- [ ] Then proceed with AWS cleanup

---

## 💰 Cost Comparison

**Current AWS Costs:**
- EC2 t3.small: ~$15-30/month
- ECR storage: ~$0.10/month
- **Total: ~$15-30/month**

**Vercel Costs:**
- **Hobby Plan**: FREE (for personal projects)
  - 100GB bandwidth/month
  - Unlimited serverless executions
- **Pro Plan**: $20/month
  - 1TB bandwidth/month
  - 1000 serverless function hours/month
  - Better performance

**Potential Savings**: $0-10/month depending on plan

---

## 🆘 Troubleshooting

### Python Function Not Working
- Check that `requirements.txt` is in root directory
- Verify Python function is in correct path: `/api/recipeScraperPython/index.py`
- Check Vercel function logs for errors

### Timeout Issues
- Upgrade to Pro plan (60s timeout)
- Optimize Python script performance
- Consider caching strategies

### Environment Variables Not Working
- Verify variables are set in Vercel dashboard
- Check environment scope (Production/Preview/Development)
- Redeploy after adding variables

---

## 📚 Resources

- [Vercel Next.js Docs](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Python Functions](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [Full Migration Plan](./AWS_TO_VERCEL_MIGRATION.md)

---

**Last Updated**: [Current Date]
**Status**: Ready to Start Migration


