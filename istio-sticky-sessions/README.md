# 🚀 Istio Examples — Sticky Sessions

This repository contains useful examples to help you quickly get started with Istio and perform real-world tests involving traffic management, revisions, and sticky sessions.

## 🛠️ Initial Setup
### 🏗️ Build container images
```shell
cd apps/simples-express
npm run setup
```

### ☸️ Set up the cluster (at root directory)
```shell
make setup-cluster
```

### 📦 Bring up the pods
```shell
make setup-knative-route
make up
```

### 🔄 How to Test Sticky Sessions by Revision

To validate how Knative (with Istio) handles sticky sessions across revisions, follow the steps below:

- 🧪 Open multiple private browser windows or use different browsers.
Each browser will acquire a separate sticky session tied to a specific revision.

- 🍪 If a browser does not stick to the revision you want,
delete the cookie and refresh the page until you get different revisions assigned to different browsers.

- 🔧 After that, you can apply the v99 patch using:
```shell
make up-v99
```
- This command replaces v99 with the version you want to promote.
- This simulates a scenario where you have a problematic revision and need to force users to migrate to a new one.
- Knative's fallback should route users to a healthy revision without returning 503 errors.
- If you want to test a scenario where Knative handles old revisions by scaling to zero, execute the following command and check pods:

```shell
make up-v99-zero-traffic
```