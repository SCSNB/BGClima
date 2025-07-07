# BGClima Solution

## Development Workflow

### 1. Start the ASP.NET Core Backend
```sh
dotnet run --project BGClima.API/BGClima.API.csproj
```
- The API will be available at http://localhost:5252

### 2. Start the Angular UI with Hot Reload
```sh
cd BGClima.UI
ng serve
```
- The Angular app will be available at http://localhost:4200

### 3. API + Angular Integration (Development)
- The Angular app communicates with the API at http://localhost:5252
- CORS must be enabled in the API for http://localhost:4200

---

## Production/Deployment Workflow

**Important:**
- You must build the Angular app before running or deploying the ASP.NET Core API in production.
- The `BGClima.API/wwwroot/` folder is not tracked by git (see `.gitignore`).

### 1. Build Angular for Production and Copy to wwwroot
```sh
cd BGClima.UI
npm run build
npm run postbuild
```
- The output will be copied to `BGClima.API/wwwroot/` automatically.

### 2. Run/Deploy the API Project
```sh
dotnet run --project BGClima.API/BGClima.API.csproj
```
- The API will serve the Angular app from wwwroot in production.
- All SPA routes will fallback to `index.html`.

---

## Notes
- For hot reload, always run Angular and API separately in development.
- For production, only the API needs to be deployed after copying the Angular build output.
- Update `<your-app-name>` with your actual Angular project name from `angular.json` if you customize the output path.