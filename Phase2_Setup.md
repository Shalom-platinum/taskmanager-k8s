# Phase 2: Advanced Kubernetes Features Setup

## Prerequisites
- Phase 1 completed and working
- Minikube running
- kubectl configured

---

## Step 1: Deploy ConfigMaps and Secrets

```powershell
# Apply ConfigMap and Secrets
kubectl apply -f k8s/backend-config.yaml

# Verify they were created
kubectl get configmap backend-config
kubectl get secret backend-secrets

# View ConfigMap contents
kubectl describe configmap backend-config

# Secrets are base64 encoded, decode to view (careful in production!)
kubectl get secret backend-secrets -o jsonpath='{.data.JWT_SECRET}' | base64 -d
```

**Update backend deployment** to use ConfigMap/Secrets (already updated in the artifact)

```powershell
# Apply updated backend deployment
kubectl apply -f k8s/backend-deployment.yaml

# Restart backend pods to pick up new config
kubectl rollout restart deployment/backend

# Verify pods are running
kubectl get pods -l app=backend

# Check if environment variables are loaded correctly
kubectl exec -it deployment/backend -- env | findstr MONGO
```

---

## Step 2: Enable Metrics Server (Required for HPA)

Minikube needs the metrics-server addon:

```powershell
# Enable metrics server
minikube addons enable metrics-server

# Verify it's running (may take 1-2 minutes)
kubectl get deployment metrics-server -n kube-system

# Test metrics (wait 30 seconds after enabling)
kubectl top nodes
kubectl top pods
```

---

## Step 3: Deploy Horizontal Pod Autoscaler

```powershell
# Apply HPA
kubectl apply -f k8s/backend-hpa.yaml

# Check HPA status
kubectl get hpa

# Watch HPA in action
kubectl get hpa -w

# Describe for details
kubectl describe hpa backend-hpa
```

**Test Autoscaling** (optional):

```powershell
# Generate load on backend
kubectl run load-generator --rm -it --image=busybox -- /bin/sh

# Inside the pod:
while true; do wget -q -O- http://backend-service:5000/health; done

# In another terminal, watch HPA scale up
kubectl get hpa backend-hpa -w

# You should see CPU utilization increase and replicas scale up
```

---

## Step 4: Set Up Ingress

```powershell
# Enable ingress addon in Minikube
minikube addons enable ingress

# Verify ingress controller is running
kubectl get pods -n ingress-nginx

# Apply ingress configuration
kubectl apply -f k8s/ingress.yaml

# Get ingress details
kubectl get ingress taskmanager-ingress

# Get Minikube IP
minikube ip
```

**Update your hosts file** to access via domain name:

```powershell
# On Windows, edit: C:\Windows\System32\drivers\etc\hosts
# Add this line (replace with your minikube ip):
# 192.168.49.2  taskmanager.local

# On Linux/Mac: /etc/hosts
# sudo echo "$(minikube ip) taskmanager.local" >> /etc/hosts
```

**Test Ingress**:

```powershell
# Access via domain
curl http://taskmanager.local

# Or in browser
# Open: http://taskmanager.local
```

---

## Step 5: Monitoring with Prometheus (Optional)

For full Prometheus setup:

```powershell
# Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus + Grafana
helm install prometheus prometheus-community/kube-prometheus-stack

# Wait for pods to start
kubectl get pods -l "release=prometheus"

# Port forward to access Grafana
kubectl port-forward svc/prometheus-grafana 3000:80

# Access Grafana at http://localhost:3000
# Default credentials: admin / prom-operator
```

**For simpler monitoring**, just use kubectl:

```powershell
# Watch resource usage
kubectl top pods

# View logs
kubectl logs -f deployment/backend

# Monitor events
kubectl get events --sort-by=.metadata.creationTimestamp
```

---

## 🔍 Verification Checklist

- [ ] ConfigMap created and backend using it
- [ ] Secrets created (check with `kubectl get secrets`)
- [ ] Metrics server running (`kubectl top nodes` works)
- [ ] HPA deployed (`kubectl get hpa` shows TARGETS)
- [ ] Ingress controller running
- [ ] Can access app via `taskmanager.local`

---

## 🧹 Managing Resources

### View all resources
```powershell
kubectl get all
kubectl get configmap
kubectl get secrets
kubectl get hpa
kubectl get ingress
```

### Update ConfigMap
```powershell
# Edit directly
kubectl edit configmap backend-config

# Or update YAML and reapply
kubectl apply -f k8s/backend-config.yaml

# Restart pods to pick up changes
kubectl rollout restart deployment/backend
```

### Scale manually (overrides HPA temporarily)
```powershell
kubectl scale deployment backend --replicas=5
```

---

## 🐛 Troubleshooting

**HPA shows `<unknown>` for CPU/Memory:**
- Metrics server not ready yet (wait 1-2 minutes)
- Check: `kubectl get apiservice v1beta1.metrics.k8s.io -o yaml`

**Ingress not working:**
- Check ingress controller: `kubectl get pods -n ingress-nginx`
- Verify ingress: `kubectl describe ingress taskmanager-ingress`
- Check Minikube tunnel: `minikube tunnel` (run in separate terminal)

**ConfigMap changes not reflected:**
- Pods need restart: `kubectl rollout restart deployment/backend`

**HPA not scaling:**
- Generate more load
- Check resource requests/limits are set in deployment
- Verify metrics: `kubectl top pods`

---

## 📊 Monitoring Commands

```powershell
# Watch pods scale
kubectl get pods -w

# Monitor HPA
kubectl get hpa -w

# Check resource usage
kubectl top pods
kubectl top nodes

# View logs from all backend pods
kubectl logs -l app=backend --tail=50 -f

# Check ingress logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -f
```

---

## Next: CI/CD Pipeline

Once these are all working, we'll set up:
- GitHub Actions workflow
- Automated Docker builds
- Automated Kubernetes deployments
- Testing pipeline

Let me know when you're ready!