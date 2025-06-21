# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["PetCareServicios.csproj", "."]
RUN dotnet restore "PetCareServicios.csproj"
COPY . .
RUN dotnet build "PetCareServicios.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "PetCareServicios.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "PetCareServicios.dll"]