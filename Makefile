ISTIO_VERSION=1.24.3

setup: setup-cluster install-istio install-knative setup-net-istio setup-istio-ports wait-all

setup-cluster:
	@kind get clusters | grep -q knative-local || \
		kind create cluster --name knative-local --config ./iac/kind-config.yaml

uninstall-istio:
	@cd istio-$(ISTIO_VERSION) && export PATH=$$PWD/bin:$$PATH && istioctl uninstall -y --purge
	@echo "[OK] Istio $(ISTIO_VERSION) uninstalled"

install-istio:
	@curl -L https://istio.io/downloadIstio | ISTIO_VERSION=$(ISTIO_VERSION) sh -
	@cd istio-$(ISTIO_VERSION) && export PATH=$$PWD/bin:$$PATH && istioctl install \
		--set profile=default \
		--set hub=docker.io/istio \
		--set tag=$(ISTIO_VERSION) -y
	@echo "[OK] Istio $(ISTIO_VERSION) installed"

install-knative:
	@kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.13.0/serving-crds.yaml
	@kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.13.0/serving-core.yaml
	@echo "[OK] Knative Serving installed"

setup-net-istio:
	@kubectl apply -f https://github.com/knative/net-istio/releases/download/knative-v1.20.1/net-istio.yaml
	@echo "[OK] net-istio installed"

setup-istio-ports:
	kubectl patch service istio-ingressgateway -n istio-system --type='json' \
		-p='[{"op": "replace", "path": "/spec/type", "value": "NodePort"}, {"op": "add", "path": "/spec/ports/1/nodePort", "value": 30080}, {"op": "add", "path": "/spec/ports/2/nodePort", "value": 30443}]'

wait-all:
	@kubectl wait --for=condition=available deployment --all -n istio-system --timeout=300s
	@kubectl wait --for=condition=available deployment --all -n knative-serving --timeout=300s
	@echo "[OK] All deployments done"

forward:
	kubectl port-forward -n istio-system service/istio-ingressgateway 8080:80

delete-cluster:
	@kind delete cluster --name knative-local
