# Intro

This repository contains useful examples using Istio.

# Installing
## 🧱 1. Creating locally Knative (kind + Istio)
### 1.1 Creating cluster kind
kind create cluster --name knative-local

### 1.2 Instalar Istio (perfil minimal)

```shell
curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH=$PWD/bin:$PATH

# for default (with ingress)
istioctl install --set profile=default -y

# or minimal
istioctl install --set profile=minimal -y
```

### 1.3 Installing Knative Serving

```shell
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.13.0/serving-crds.yaml
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.13.0/serving-core.yaml
```

### 1.4 Installing networking-istio

```shell
kubectl apply -f https://github.com/knative/net-istio/releases/download/knative-v1.13.0/net-istio.yaml
```

### 1.5 Exposing ingress locally 
> ⚠️ If kind cluster node port not working

```shell
kubectl port-forward -n istio-system service/istio-ingressgateway 8080:80
```

Knative responding at *http://localhost:8080*

# Examples
- [Getting started](./istio-getting-started/README.md)
- [Sticky Sessions](./istio-sticky-sessions/README.md)