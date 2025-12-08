## 🚀 Istio + Knative — Traffic Split Testing with Sticky Sessions

This repository provides practical examples for experimenting with Istio traffic management, Knative revisions, and cookie-based sticky sessions.
It is designed to help you quickly validate traffic split testing, version pinning, and session-aware routing setups.

## 🛠️ 1. Build Example Applications

From the root of the repository:

```shell
cd apps/simples-express
npm run setup
```

This step builds and publishes the example container images used in the test environment.

## ☸️ 2. Create and Configure the Kubernetes Cluster

From the repository root:

```shell
make setup-cluster
```

This will:
- Create a KIND cluster
- Install Istio
- Install Knative Serving
- Patch the Istio ingress gateway for local testing


## 📦 3. Deploy the Knative Services and Routing Rules

```shell
make setup-knative-route
make up
```

## 🧭 4. Configure Local DNS (Required)

Edit your /etc/hosts file:

```shell
sudo nano /etc/hosts
```

Add:

```
127.0.0.1 app-a.traffic-split.example.com app-b.traffic-split.example.com app-c.traffic-split.example.com app.traffic-split.example.com 
```

## 🔄 5. Testing Sticky Sessions with Traffic Split

This environment simulates how Knative + Istio handle session-aware routing across multiple service revisions.

How to test:

1. Open multiple private browser windows
Each isolated browser instance will receive a different sticky session cookie.

2. Observe how each browser sticks to one revision
Even if traffic weights change, the browser should remain pinned to the same revision for the duration of the session.

3. To force reassignment
Clear cookies and refresh the page.
A new revision may be assigned based on the configured weights.

Initial traffic distribution example:

- 33% → Revision v1
- 33% → Revision v2
- 34% → Revision v99

You can modify these percentages or introduce new rules to experiment with AB tests, canary rollouts, and sticky-session migrations.


###  URLs

- http://app.traffic-split.example.com:8080
- http://app-a.traffic-split.example.com:8080
- http://app-b.traffic-split.example.com:8080
- http://app-c.traffic-split.example.com:8080
