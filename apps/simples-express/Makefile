IMAGES := v1 v2 v99

build-image:
	for i in $(IMAGES); do \
		docker build --build-arg REVISION=$$i -t willsenabr/express-sticky:$$i -f Containerfile .; \
	done

push-image:
	for i in $(IMAGES); do \
		docker push willsenabr/express-sticky:$$i; \
	done