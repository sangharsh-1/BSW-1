# A Birthday Surprise Web App

This is a multi-page, interactive, and emotional birthday website created as a surprise for a friend. It features a soothing, cinematic theme with anime-style backgrounds, lo-fi ambience, and a dynamic "Memory Wall" where friends can leave messages and photos.

## Features

- **Interactive Pages**: Multiple themed pages including a landing page, a memory wall, and a final video surprise.
- **AI-Powered Memories**: Users can upload a photo, and the app uses the Gemini API to transform it into a 3D Pixar-style portrait which is then added to the Memory Wall.
- **Persistent Storage**: The Memory Wall's data is securely stored using a [Turso](https://turso.tech/) database, accessed via a secure backend API.
- **Editable "About Me" Page**: A fun, doodle-themed page with content that can be edited and saved directly in the browser.
- **Recovery "Game"**: A terminal-based minigame to "recover" a lost wish and unlock the final page.
- **Dynamic & Themed UI**: Features animated backgrounds, custom fonts, and a responsive design that adapts to different pages.

---

## Deployment Guide (Vercel)

This project is optimized for a zero-install, drag-and-drop deployment on [Vercel](https://vercel.com/).

### Step 1: Push to GitHub

Push the entire project folder to a new repository on your GitHub account.

### Step 2: Create a Vercel Project

1.  Log in to your Vercel account.
2.  Click "Add New..." -> "Project".
3.  Import the GitHub repository you just created.
4.  Vercel will automatically detect the project structure. You do not need to change any build settings.

### Step 3: Configure Environment Variables

This is the most important step. Your application requires three secret keys to function correctly.

1.  In your Vercel project dashboard, go to the **Settings** tab.
2.  Click on **Environment Variables**.
3.  Add the following three variables:

| Variable Name         | Value                                                              | Description                                                                                             |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `API_KEY`             | `Your_Google_AI_Studio_API_Key`                                    | **Required for Gemini API.** This allows the Memory Wall to generate AI images. Get it from [AI Studio](https://aistudio.google.com/app/apikey). |
| `TURSO_DATABASE_URL`  | `libsql://your-database-name-username.turso.io`                    | **Required for the Database.** The connection URL for your Turso database.                               |
| `TURSO_AUTH_TOKEN`    | `Your_Turso_Database_Auth_Token`                                   | **Required for the Database.** The secret authentication token for your Turso database.                  |

### Step 4: Deploy

After adding the environment variables, navigate to the **Deployments** tab in Vercel and trigger a new deployment. Your site will be live!

---

## Local Development

This project is designed to run directly in the browser without a build step or local server. Simply open the `index.html` file in your web browser to view the application.

**Note**: For the database and AI features to work, the application must be deployed, as it relies on the Vercel backend function and the configured environment variables.
