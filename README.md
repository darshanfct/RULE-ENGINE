# Documentation Website

This is a static documentation website built with **React**, **Vite**, and **TypeScript**. It automatically generates a navigation tree from your markdown files and is deployed to **GitHub Pages**.

## 🚀 Quick Start: How to Update

To update the website with new documentation:

1.  **Add/Edit Files**: Navigate to the `public/docs` folder.
2.  **Organize**: Create folders and `.md` files.
    *   The folder structure directly maps to the sidebar navigation.
    *   You can number folders/files to control the order (e.g., `01.introduction`, `02.getting-started`).
3.  **Deploy**:
    *   **Windows**: Double-click the `deploy.bat` file in the root directory.
    *   **Terminal**: Run `npm run deploy`.

The script will automatically scanning your files, rebuild the site, and publish the changes to GitHub Pages.

---

## 📂 Documentation Structure

The site reads documentation from the `public/docs` directory.

### Example Structure:
```text
public/
  docs/
    01.getting-started/        <- Section
      01.introduction.md       <- Page
      02.installation.md       <- Page
    02.features/               <- Section
      01.rule-engine.md        <- Page
```

### Naming Conventions:
-   **Numbering**: Use prefixes like `01.`, `02.` to sort items in the sidebar. These numbers are removed from the display label.
-   **Labels**: Filenames are converted to Readable Labels (e.g., `01.my-file-name.md` -> "My File Name").

---

## 💻 Local Development

If you want to run the site locally to preview changes:

1.  **Install Dependencies** (first time only):
    ```bash
    npm install
    ```

2.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
    This will start the site at `http://localhost:5173/RULE-ENGINE/`.

---

## 🔧 Technical Details

-   **Frontend**: React + Vite + TailwindCSS.
-   **Routing**: HashRouter (for compatibility with GitHub Pages).
-   **Data Loading**:
    -   A build script `generate-navtree.js` scans `public/docs` and creates `public/navTree.json`.
    -   The React app fetches this JSON at runtime to build the sidebar.
    -   Markdown content is fetched on-demand.

## 📦 Deployment command

The `deploy` command performs the following steps:
1.  Runs `node generate-navtree.js` to update the navigation JSON.
2.  Runs `vite build` to compile the React app to static files in `dist/`.
3.  Runs `gh-pages -d dist` to push the `dist` folder to the `gh-pages` branch on GitHub.
