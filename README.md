# Intro

This repository contains useful examples using Istio.

# Kubernetes
## Datadog to collect cluster metrics
```shell
kubectl create secret generic datadog-secret \
  --from-literal=api-key='<SUA_DATADOG_API_KEY>'

helm repo add datadog https://helm.datadoghq.com
helm repo update

helm install datadog-agent datadog/datadog \
  --set datadog.apiKeyExistingSecret=datadog-secret \
  --set datadog.site=us5.datadoghq.com \
  --set daemonset.useHostNetwork=true \
  --set datadog.logs.enabled=true \
  --set datadog.apm.enabled=true \
  --set datadog.processAgent.enabled=true \
  --set datadog.kubelet.enabled=true \
  --set datadog.containerScrubbing.enabled=true \
  --set datadog.kubeStateMetricsEnabled=true \
  --set datadog.prometheusScrape.enabled=true \
  --set clusterAgent.enabled=true
```

## How to deploy?

```shell
# For testing purposes only. Ensure you create a `.env` file containing the necessary secrets before proceeding.
kubectl delete configmap app-config --namespace=istio-example
kubectl create configmap app-config \
  --from-env-file=.env.production \
  --namespace=istio-example

make up
```

# Troubleshooting

If local k3s is not applying istio we can define to all namespace.

```shell
kubectl label namespace istio-example istio-injection=enabled
```
## Check Istio metrics

```shell
kubectl port-forward -n istio-example deployment/greeter 15000:15000
curl http://localhost:15000/stats

kubectl port-forward -n istio-example deployment/greeter 15090:15090
curl http://localhost:15090/stats/prometheus
```

## Remove Virtual Services

```shell
kubectl delete virtualservice --all -n NAMESPACE
```

