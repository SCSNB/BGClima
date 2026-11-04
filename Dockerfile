# Use Node.js image for building Angular
FROM node:18 AS angular-build
WORKDIR /src/ui

# Copy Angular project files
COPY BGClima.UI/package.json BGClima.UI/package-lock.json ./

# Install Angular dependencies
RUN npm ci

# Copy Angular source code
COPY BGClima.UI/ ./

# Build Angular application
RUN npm run build

# Use the official .NET 8.0 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY BGClima.sln ./

# Copy project files
COPY BGClima.API/BGClima.API.csproj BGClima.API/
COPY BGClima.Application/BGClima.Application.csproj BGClima.Application/
COPY BGClima.Domain/BGClima.Domain.csproj BGClima.Domain/
COPY BGClima.Infrastructure/BGClima.Infrastructure.csproj BGClima.Infrastructure/

# Restore dependencies
RUN dotnet restore

# Copy the rest of the source code
COPY . .

# Copy Angular build output to wwwroot
COPY --from=angular-build /src/ui/dist/bgclima.ui ./BGClima.API/wwwroot/

# Build the application
WORKDIR /src/BGClima.API
RUN dotnet build -c Release -o /app/build

# Publish the application
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Use the official .NET 8.0 runtime image for the final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install curl for health checks (optional)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the published application
COPY --from=build /app/publish .

# Create a non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose the port the app runs on
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start the application
ENTRYPOINT ["dotnet", "BGClima.API.dll"]
