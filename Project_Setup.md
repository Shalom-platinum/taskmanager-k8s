# Task Manager - Kubernetes Project Setup Guide

## 📁 Project Structure

Create this folder structure:

```
taskmanager-k8s/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── k8s/
│   ├── mongodb-deployment.yaml
│   ├── backend-deployment.yaml
│   └── frontend-deployment.yaml
└── README.md
```

## 🚀 Step-by-Step Setup

### Step 1: Create the Project Files

1. Create a new directory: `mkdir taskmanager-k8s && cd taskmanager-k8s`
2. Copy all the files from the artifacts into their respective folders
3. Make sure your folder structure matches the one above

### Step 2: Build Docker Images

Since we're using Minikube, we need to build images inside Minikube's Docker environment:

```bash
# Point your terminal to Minikube's Docker daemon
eval $(minikube docker-env)

# Build backend image
cd backend
docker build -t taskmanager-backend:latest .

# Build frontend image
cd ../frontend
docker build -t taskmanager-frontend:latest .

# Go back to project root
cd ..
```

**Important**: The `eval $(minikube docker-env)` command makes your terminal use Minikube's Docker daemon. This way, images built locally are available inside Minikube without pushing to a registry.

### Step 3: Deploy to Kubernetes

```bash
# Deploy MongoDB first (backend depends on it)
kubectl apply -f k8s/mongodb-deployment.yaml

# Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=120s

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l app=backend --timeout=120s

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml
```

### Step 4: Access the Application

```bash
# Get the service URL
minikube service frontend-service --url

# Or use port forwarding
kubectl port-forward service/frontend-service 8080:80
```

Then open your browser to the URL shown (or http://localhost:8080 if using port-forward).

## 🔍 Verification Commands

Check if everything is running:

```bash
# View all resources
kubectl get all

# Check pods status
kubectl get pods

# Check services
kubectl get services

# View logs
kubectl logs -l app=backend
kubectl logs -l app=frontend
kubectl logs -l app=mongodb

# Describe a pod (replace POD_NAME)
kubectl describe pod <POD_NAME>

# Check if backend is healthy
kubectl port-forward service/backend-service 5000:5000
# Then visit http://localhost:5000/health in your browser
```

## 🐛 Troubleshooting

### Pods not starting?
```bash
kubectl describe pod <POD_NAME>
kubectl logs <POD_NAME>
```

### Can't access the app?
```bash
# Check service
kubectl get svc frontend-service

# Try port-forward instead
kubectl port-forward service/frontend-service 8080:80
```

### MongoDB connection issues?
```bash
# Check if MongoDB is running
kubectl get pods -l app=mongodb

# Check MongoDB logs
kubectl logs -l app=mongodb
```

### Image pull errors?
Make sure you ran `eval $(minikube docker-env)` before building images.

## 🧹 Cleanup

When you're done:

```bash
# Delete all resources
kubectl delete -f k8s/

# Or delete the entire namespace if you created one
kubectl delete namespace <namespace-name>

# Stop Minikube
minikube stop
```

## 📚 What You're Learning

- **Deployments**: Managing application replicas
- **Services**: Networking between pods
- **PersistentVolumeClaim**: Persistent storage for MongoDB
- **ConfigMaps & Environment Variables**: Configuration management
- **Resource Limits**: Managing CPU and memory
- **Health Checks**: Liveness and readiness probes
- **Multi-tier Architecture**: Frontend, backend, and database

## 🎯 Next Steps

Once this is working:
1. Add a ConfigMap for backend configuration
2. Add Secrets for sensitive data
3. Implement Horizontal Pod Autoscaler
4. Set up Ingress for better routing
5. Add monitoring with Prometheus
6. Create CI/CD pipeline with GitHub Actions

Let me know when you're ready for the next phase!