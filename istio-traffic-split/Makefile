CLUSTER_NAME=knative-local
NAMESPACE=traffic-split
URL=app.traffic-split.example.com

activate-cluster:
	@echo '🖥️ Activating cluster'
	@kubectl config use-context kind-$(CLUSTER_NAME)

up: activate-cluster
	@kubectl apply \
		-f ./iac/01-domain.yml \
		-f ./iac/01-namespace.yml \
		-f ./iac/02-kservice-a.yml \
		-f ./iac/02-kservice-b.yml \
		-f ./iac/02-kservice-c.yml \
		-f ./iac/03-virtual-service.yml

up-vs: activate-cluster
	@kubectl apply \
		-f ./iac/03-virtual-service.yml

down: activate-cluster
	@kubectl delete \
		-f ./iac/03-virtual-service.yml \
		-f ./iac/02-kservice-a.yml \
		-f ./iac/02-kservice-b.yml \
		-f ./iac/02-kservice-c.yml \
		-f ./iac/01-namespace.yml

services:
	@kubectl get service -n $(NAMESPACE)

routes:
	@kubectl get route -n $(NAMESPACE)

revisions: activate-cluster
	@kubectl get revisions -n $(NAMESPACE)

revision: activate-cluster
	@kubectl describe revision express-sticky-v1 -n $(NAMESPACE)

pods: activate-cluster
	@kubectl get pods -n $(NAMESPACE)

logs: activate-cluster
	@kubectl logs -n $(NAMESPACE) -l serving.knative.dev/service=express-sticky -c user-container --tail=100

test:
	@printf "Running tests\n\n"
	@printf "No cookies\n\n"
	@curl -i http://localhost:8080 \
	-H "Host: $(URL)"
	@printf "\n\n"

	@printf "With cookie v1\n\n"
	@curl -i http://localhost:8080 \
	-H "Host: $(URL)" \
	-H "Cookie: session-version=express-sticky-v1"
	@printf "\n\n"

	@printf "With cookie v2\n\n"
	@curl -i http://localhost:8080 \
	-H "Host: $(URL)" \
	-H "Cookie: session-version=express-sticky-v2"
	@printf "\n\n"