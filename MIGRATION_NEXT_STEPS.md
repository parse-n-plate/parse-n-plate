# AWS to Vercel Migration - Next Steps

## ✅ Completed (Automated)

I've successfully completed the following migration tasks:

### Code Changes
1. ✅ **Created Node.js scraper** (`src/utils/scrape_recipe.ts`)
   - Converted Python scraper to TypeScript
   - Uses Cheerio for HTML parsing
   - Multi-layer approach: JSON-LD → HTML selectors
   - No Python dependencies needed

2. ✅ **Updated API route** (`src/app/api/recipeScraperPython/route.ts`)
   - Removed Python process spawning
   - Now calls Node.js scraper directly
   - Improved error handling
   - Better timeout management

3. ✅ **Updated GitHub workflow** (`.github/workflows/deploy-prod.yml`)
   - Removed all AWS deployment steps
   - Kept linting job only
   - Renamed to "CI" workflow
   - Vercel handles deployments automatically now

4. ✅ **Deleted Python files**
   - Removed `src/utils/scrape_recipe.py`
   - Removed `requirements.txt`
   - Removed `Dockerfile`

5. ✅ **Updated documentation**
   - Updated `README.md` with new stack info
   - Updated `TECHNICAL_SUMMARY.txt` with Vercel architecture
   - Updated `ENVIRONMENT_SETUP.md` with Vercel setup instructions
   - Added comprehensive migration entry to `CHANGELOG.md`

---

## 📋 What You Need to Do (Manual Steps)

### Phase 1: Test Locally First ⚡ HIGH PRIORITY

Before deploying to Vercel, test that the Node.js scraper works:

```bash
# Make sure you're in the project directory
cd /Users/gageminamoto/Documents/GitHub/parse-n-plate

# Install dependencies (in case any are missing)
npm install

# Start development server
npm run dev
```

**Test these recipe URLs:**
1. AllRecipes: https://www.allrecipes.com/recipe/[any-recipe]
2. Food Network: https://www.foodnetwork.com/recipes/[any-recipe]
3. A food blog recipe

**What to check:**
- Does recipe parsing work?
- Are ingredients showing up?
- Are instructions showing up?
- Does error handling work?

**If you encounter errors:**
- Check the terminal console for error messages
- The Node.js scraper uses Cheerio instead of Python
- All functionality should work the same

---

### Phase 2: Set Up Vercel Account

**Step-by-step instructions:**

1. **Go to Vercel**: Visit [vercel.com](https://vercel.com)

2. **Sign up with GitHub**:
   - Click "Sign Up"
   - Choose "Continue with GitHub"
   - Authorize Vercel to access your GitHub

3. **Import your repository**:
   - Click "Add New..." → "Project"
   - Find and select `parse-n-plate` repository
   - Vercel will auto-detect it's a Next.js project
   - Click "Import"

4. **Configure project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./ (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: .next (auto-detected)

5. **Add environment variable**:
   - Before deploying, expand "Environment Variables" section
   - Add variable:
     - **Name**: `GROQ_API_KEY`
     - **Value**: (Get this from your GitHub Secrets or .env.local)
     - **Environment**: Check all three (Production, Preview, Development)
   - Click "Add"

6. **Deploy**:
   - Click "Deploy"
   - Wait 1-2 minutes for build to complete
   - You'll get a URL like `parse-n-plate.vercel.app`

---

### Phase 3: Test on Vercel

Once deployed, test your Vercel URL:

1. **Visit your Vercel URL** (e.g., `https://parse-n-plate.vercel.app`)

2. **Test recipe parsing**:
   - Try the same recipe URLs you tested locally
   - Verify all functionality works
   - Check error handling
   - Test the AI fallback

3. **Check Vercel logs** (if issues occur):
   - Go to Vercel dashboard
   - Click on your project
   - Go to "Deployments" → Click latest deployment
   - Check "Functions" tab for any errors

**Common issues and fixes:**
- **Function timeout**: Upgrade to Vercel Pro ($20/month) for 60s timeout
- **Environment variable not working**: Make sure GROQ_API_KEY is set
- **Build errors**: Check the build logs in Vercel dashboard

---

### Phase 4: Commit and Push Changes

Once you've tested locally and Vercel is working:

```bash
# Check what files changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Migrate from AWS to Vercel

- Convert Python scraper to Node.js for Vercel compatibility
- Remove Docker and AWS deployment infrastructure
- Update documentation and workflows
- Eliminate Python dependencies
- Enable serverless deployment via Vercel"

# Push to GitHub
git push origin main
```

**What happens next:**
- GitHub Actions will run linting (should pass)
- Vercel will automatically deploy (within 1 minute)
- You'll get a new deployment URL

---

### Phase 5: Clean Up GitHub Secrets

After confirming Vercel works (give it 1-2 days):

1. Go to GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. **Delete these secrets** (no longer needed):
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_ACCOUNT_ID`
   - `EC2_HOST`
   - `EC2_SSH_KEY`

4. **Keep this secret**:
   - `GROQ_API_KEY` (still needed, though now also in Vercel)

---

### Phase 6: AWS Access Recovery & Cleanup

⚠️ **CRITICAL**: You mentioned you don't have AWS access. This is important!

**Why you need AWS access:**
- You may still be paying $15-30/month for AWS resources
- You can't turn off AWS infrastructure without access
- You need to verify what's actually running

**Steps to recover AWS access:**

1. **Check email for AWS setup**:
   - Search inbox for "AWS" or "Amazon Web Services"
   - Look for account creation emails
   - Find password reset emails

2. **Try password reset**:
   - Go to [console.aws.amazon.com](https://console.aws.amazon.com)
   - Click "Forgot password?"
   - Enter the email associated with AWS account

3. **Check bank statements**:
   - Look for AWS charges (~$15-30/month)
   - This confirms you have an active AWS account
   - Note the charge amount and date

4. **Contact AWS Support** (if above fails):
   - Call AWS support: 1-888-321-4880 (US)
   - Provide: Email, project name (parse-n-plate), credit card details
   - They can help you recover access

**Once you have AWS access:**

1. **Stop ECS Service** (reversible, stops costs immediately):
   - AWS Console → ECS → Clusters
   - Select `parse-n-plate-ecs-cluster`
   - Go to Services → `parse-n-plate-service-prod`
   - Update service → Set "Desired tasks" to 0
   - Click "Update"

2. **Wait 1 week**, then delete (if Vercel is working perfectly):
   - Delete ECS Service: `parse-n-plate-service-prod`
   - Delete ECS Cluster: `parse-n-plate-ecs-cluster`
   - Delete all Task Definitions
   - Delete ECR repository and images
   - Stop EC2 instance
   - After a few days, terminate EC2 instance (irreversible!)

3. **Verify $0 charges**:
   - Check AWS billing dashboard
   - Should see $0 or near-$0 charges after cleanup

---

## 📊 Migration Status Summary

### Completed ✅
- [x] Convert Python scraper to Node.js
- [x] Update API routes
- [x] Remove AWS deployment from GitHub Actions
- [x] Update all documentation
- [x] Delete Python files and dependencies
- [x] Update CHANGELOG

### Pending (Requires Your Action) ⏳
- [ ] Test Node.js scraper locally
- [ ] Create Vercel account and import repository
- [ ] Add GROQ_API_KEY to Vercel
- [ ] Test on Vercel production
- [ ] Commit and push changes
- [ ] Remove AWS GitHub Secrets
- [ ] Recover AWS console access
- [ ] Clean up AWS infrastructure

---

## 🎯 Priority Order

Do these in order:

1. **TODAY**: Test locally (Phase 1)
2. **TODAY**: Set up Vercel (Phase 2)
3. **TODAY**: Test on Vercel (Phase 3)
4. **TODAY**: Commit and push (Phase 4)
5. **THIS WEEK**: Recover AWS access (Phase 6, step 1-4)
6. **AFTER 1 WEEK**: Clean GitHub Secrets (Phase 5)
7. **AFTER 2 WEEKS**: Clean up AWS (Phase 6, final cleanup)

---

## 💰 Expected Cost Savings

**Before (AWS):**
- EC2 instance: $15-30/month
- ECR storage: $0.10/month
- **Total: ~$15-30/month**

**After (Vercel):**
- Vercel Hobby plan: $0/month (FREE)
- Groq AI: ~$0-5/month (pay per use)
- **Total: $0-5/month**

**Annual savings: $120-300/year** 💸

---

## 🆘 Need Help?

**If something doesn't work:**

1. **Local testing fails**:
   - Check console for error messages
   - Verify Node.js version: `node --version` (should be 24.1.0)
   - Try `npm install` again

2. **Vercel deployment fails**:
   - Check Vercel build logs
   - Verify GROQ_API_KEY is set
   - Make sure all files are committed

3. **Recipe parsing doesn't work**:
   - Check Vercel function logs
   - Verify the scraper can access recipe URLs
   - Test with different recipe sites

4. **Can't recover AWS access**:
   - Contact AWS support immediately
   - Provide credit card and email details
   - They can help recover account access

---

## 📚 Reference Documents

- **Migration Plan**: `/aws-to-vercel-migration.plan.md`
- **Quick Reference**: `MIGRATION_QUICK_REFERENCE.md`
- **Environment Setup**: `ENVIRONMENT_SETUP.md`
- **Technical Summary**: `TECHNICAL_SUMMARY.txt`

---

**Last Updated**: 2025-11-16
**Status**: Code migration complete, awaiting manual deployment steps

