CLUSTER_NAME=knative-local

activate-cluster:
	@echo '🖥️ Activating cluster'
	@kubectl config use-context kind-$(CLUSTER_NAME)

up: activate-cluster
	@kubectl apply \
		-f ./iac/01-namespace.yml \
		-f ./iac/02-kservice-v1.yml \
		-f ./iac/02-kservice-v2.yml \
		-f ./iac/02-kservice-v99.yml \
		-f ./iac/03-virtual-service.yml

up-v99: activate-cluster
	@kubectl apply -f ./iac/02-kservice-v99-only.yml

up-v99-zero-traffic: activate-cluster
	@kubectl apply -f ./iac/02-kservice-v99-zero-traffic.yml

down: activate-cluster
	@kubectl delete \
		-f ./iac/03-virtual-service.yml \
		-f ./iac/01-namespace.yml \

revisions: activate-cluster
	@kubectl get revisions -n sticky-sessions

revision: activate-cluster
	@kubectl describe revision express-sticky-v1 -n sticky-sessions

pods: activate-cluster
	@kubectl get pods -n sticky-sessions

logs: activate-cluster
	@kubectl logs -n sticky-sessions -l serving.knative.dev/service=express-sticky -c user-container --tail=100

test:
	@printf "Running tests\n\n"
	@printf "No cookies\n\n"
	@curl -i http://localhost:8080 \
	-H "Host: express-sticky.sticky-sessions.svc.cluster.local"
	@printf "\n\n"

	@printf "With cookie v1\n\n"
	@curl -i http://localhost:8080 \
	-H "Host: express-sticky.sticky-sessions.svc.cluster.local" \
	-H "Cookie: session-version=express-sticky-v1"
	@printf "\n\n"

	@printf "With cookie v2\n\n"
	@curl -i http://localhost:8080 \
	-H "Host: express-sticky.sticky-sessions.svc.cluster.local" \
	-H "Cookie: session-version=express-sticky-v2"
	@printf "\n\n"

	@printf "Fallback\n\n"
	@curl -i http://localhost:8080 \
	-H "Host: express-sticky.sticky-sessions.svc.cluster.local" \
	-H "Cookie: session-version=express-sticky-v99"
	@printf "\n\n"