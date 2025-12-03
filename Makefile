ISTIO_VERSION=1.24.3
CLUSTER_NAME=knative-local

activate-cluster:
	@echo '🖥️ Activating cluster'
	@kubectl config use-context kind-$(CLUSTER_NAME)

setup: setup-cluster install-istio install-knative setup-knative-route setup-net-istio setup-istio-ports wait-all

setup-cluster:
	@echo '🛠️ Setup up cluster'
	@kind get clusters | grep -q $(CLUSTER_NAME) || \
		kind create cluster --name $(CLUSTER_NAME) --config ./iac/kind-config.yaml

uninstall-istio:
	@echo '🗑️ Uninstalling istio'
	@cd istio-$(ISTIO_VERSION) && export PATH=$$PWD/bin:$$PATH && istioctl uninstall -y --purge
	@echo "[OK] Istio $(ISTIO_VERSION) uninstalled"

install-istio:
	@echo '🚀 Installing istio'
	@curl -L https://istio.io/downloadIstio | ISTIO_VERSION=$(ISTIO_VERSION) sh -
	@cd istio-$(ISTIO_VERSION) && export PATH=$$PWD/bin:$$PATH && istioctl install \
		--set profile=default \
		--set hub=docker.io/istio \
		--set tag=$(ISTIO_VERSION) -y
	@echo "[OK] Istio $(ISTIO_VERSION) installed"

install-knative:
	@echo '🚀 Installing knative'
	@kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.13.0/serving-crds.yaml
	@kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.13.0/serving-core.yaml
	@echo "[OK] Knative Serving installed"

setup-net-istio:
	@echo '🚀 Setup istio + knative network'
	@kubectl apply -f https://github.com/knative/net-istio/releases/download/knative-v1.20.1/net-istio.yaml
	@echo "[OK] net-istio installed"

setup-istio-ports:
	@echo '🌐 Patching istio ports'
	@kubectl patch service istio-ingressgateway -n istio-system --type='json' \
		-p='[{"op": "replace", "path": "/spec/type", "value": "NodePort"}, {"op": "add", "path": "/spec/ports/1/nodePort", "value": 30080}, {"op": "add", "path": "/spec/ports/2/nodePort", "value": 30443}]'

wait-all:
	@echo '⏳ Waiting deployments'
	@kubectl wait --for=condition=available deployment --all -n istio-system --timeout=300s
	@kubectl wait --for=condition=available deployment --all -n knative-serving --timeout=300s
	@echo "[OK] All deployments done"

setup-knative-route:
	@kubectl -n knative-serving patch configmap config-features \
  	--type=merge -p '{"data":{"tag-header-based-routing":"enabled"}}'

forward:
	echo '🎯 Forwarding istio ingress port to 8080'
	kubectl port-forward -n istio-system service/istio-ingressgateway 8080:80

delete-cluster:
	@echo '🗑️ Deleting cluster'
	@kind delete cluster --name knative-local

status: 
	@echo "=== 🌐 Istio Status ===" 
	@kubectl get pods -n istio-system 
	
	@echo ""
	@echo "=== ☁️  Knative Status ==="
	@kubectl get pods -n knative-serving
	@echo ""

	@echo "=== 🚪 Gateway ===" 
	@kubectl get svc istio-ingressgateway -n istio-system 

logs-istio: 
	@kubectl logs -n istio-system -l app=istio-ingressgateway --tail=50 

logs-knative: 
	@kubectl logs -n knative-serving -l app=controller --tail=50