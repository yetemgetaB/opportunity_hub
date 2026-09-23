Tailwind setup notes:

1. Install Tailwind and autoprefixer (if not already present):
   npm install -D tailwindcss@latest postcss autoprefixer
   npx tailwindcss init -p

2. tailwind.config.cjs is present and content paths include ./index.html and ./src/**/*.{js,ts,jsx,tsx}

3. index.css includes Tailwind directives (@tailwind base; @tailwind components; @tailwind utilities;)

4. Run dev server with `npm run dev` (Vite) and verify styles load. If Tailwind isn't installed or build fails, run the install command above.
