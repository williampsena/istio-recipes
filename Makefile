up:
	kubectl apply \
		-f ./iac/kubernetes/01-namespace.yml \
		-f ./iac/kubernetes/02-otel.yml \
		-f ./iac/kubernetes/03-apps.yml \
		-f ./iac/kubernetes/04-istio-virtual-svc.yml \
		-f ./iac/kubernetes/05-destination-rule.yml

down:
	kubectl delete \
		-f ./iac/kubernetes/02-otel.yml \
		-f ./iac/kubernetes/03-apps.yml \
		-f ./iac/kubernetes/04-istio-virtual-svc.yml \
		-f ./iac/kubernetes/05-destination-rule.yml

rollout:
	kubectl rollout restart deployment/greeter -n istio-example
	kubectl rollout restart deployment/joker -n istio-example
	kubectl rollout restart deployment/greeter-joker -n istio-example

install-istio:
	$(MAKE) install-istio-bin
	$(MAKE) setup-istio
	$(MAKE) setup-istio-crd

install-istio-bin:
	(cd /tmp && curl -L https://istio.io/downloadIstio | sh -)
	cp /tmp/istio-*/bin/istioctl $(HOME)/.local/bin

setup-istio:
	istioctl install -f iac/kubernetes/00-istio-operator.yml -y

setup-istio-crd:
	kubectl get crd gateways.gateway.networking.k8s.io &> /dev/null || \
	{ kubectl kustomize "github.com/kubernetes-sigs/gateway-api/config/crd?ref=v1.3.0" | kubectl apply -f -; }
