# 🚀 Istio Examples — Sticky Sessions

This repository provides practical examples to help you quickly explore Istio + Knative, focusing on real-world scenarios such as traffic management, service revisions, and sticky sessions

## 🛠️ Initial Setup
### 🏗️ Build container images
```shell
cd apps/simples-express
npm run setup
```

### ☸️ Set up the cluster (from the repository root)
```shell
make setup-cluster
```

## 📦 Deploy Knative Route and start the pods
```shell
make setup-knative-route
make up
```

## 🧩 Configure /etc/hosts

Edit your hosts file:

```shell
sudo nano /etc/hosts
```

Add the following entry:

```
127.0.0.1   localhost express-sticky.sticky-sessions.svc.cluster.local
```

### Set your /etc/hosts

```shell
nano /etc/hosts
```

```
127.0.0.1        localhost express-sticky.sticky-sessions.svc.cluster.local
```

## 🔄 Testing Sticky Sessions by Revision

This section explains how to validate sticky session behavior across Knative revisions using Istio.

*✔️ Step 1 — Simulate independent user sessions*

To observe how sticky sessions behave:

- Open multiple private/incognito windows, or use different browsers.
- Each browser instance will receive its own sticky session cookie, binding it to a specific revision.

*✔️ Step 2 — Control session assignment*

If a browser does not stick to the desired revision:

- Clear the cookie for the application.
- Refresh the page until different browsers attach to different revisions.

### 🚦 Promoting Revisions & Testing Fallbacks
*🔧 Apply the v99 patch*

Use the following command:

```shell
make up-v99
```

This action:

- Replaces the v99 revision with the version you want to promote.
- Simulates a real scenario where a problematic or deprecated revision must be replaced.
- Allows you to validate whether Knative’s fallback mechanism correctly routes traffic to a healthy revision without returning 503 errors.

### 💤 Simulating Scale-to-Zero Behavior

To test how Knative handles older revisions by scaling them down to zero replicas:

```shell
make up-v99-zero-traffic
```

After running the command, inspect the pods to confirm scale-to-zero behavior.