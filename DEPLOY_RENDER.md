# Deploy to GitHub + Render

## 1. Create a GitHub repo

From the project root:

```bash
git init
git add .
git commit -m "Initial deploy-ready version"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## 2. Create the Render service

1. Go to Render.
2. Choose **New +** -> **Blueprint** or **Web Service**.
3. Connect your GitHub repo.
4. Render will detect [`render.yaml`](./render.yaml).

## 3. Add environment variables in Render

Set these in the Render dashboard:

- `FRONTEND_URL`
  - Use your Render public URL, e.g. `https://your-app.onrender.com`
- `GEMINI_API_KEY`
- `OPENAI_API_KEY` (optional)
- `ANTHROPIC_API_KEY` (optional)

Recommended defaults already exist in `render.yaml`:

- `GEMINI_SPECIALIZED_TEACHER_MODEL=gemini-2.5-flash`
- `GEMINI_EXAM_GRADING_MODEL=gemini-2.5-flash`
- `OPENAI_EXAM_GRADING_MODEL=gpt-4.1-mini`
- `SPECIALIZED_TEACHER_PROVIDER_ORDER=gemini,openai,anthropic`

## 4. Notes

- The backend serves the built frontend, so you only need one Render service.
- Local runtime files such as student progress and generated exam files are ignored from git.
- On free/ephemeral hosting, runtime JSON data may reset on restart/redeploy.
- If you want persistent user data, the next step is moving those runtime JSON files to a real database or persistent disk.
