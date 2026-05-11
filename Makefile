.PHONY: backend

backend:
	cd chat-backend && go run . -allow-anonymous
