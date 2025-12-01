setup-knative-route:
	@kubectl -n knative-serving patch configmap config-features \
  --type=merge -p '{"data":{"tag-header-based-routing":"enabled"}}'

up:
	@kubectl apply \
		-f ./iac/01-namespace.yml \
		-f ./iac/02-kservice-v1.yml \
		-f ./iac/02-kservice-v2.yml \
		-f ./iac/02-kservice-v99.yml \
		-f ./iac/02-kservice-all.yml \
		-f ./iac/03-virtual-service.yml

up-v99:
	@kubectl apply -f ./iac/02-kservice-v99-only.yml

up-v99-zero-traffic:
	@kubectl apply -f ./iac/02-kservice-v99-zero-traffic.yml

down:
	@kubectl delete \
		-f ./iac/02-kservice-v1.yml \
		-f ./iac/03-virtual-service.yml

revisions:
	@kubectl get revisions -n sticky-sessions

revision:
	@kubectl describe revision express-sticky-v1 -n sticky-sessions

pods:
	@kubectl get pods -n sticky-sessions

logs:
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