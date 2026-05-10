FROM golang:1.26 AS backend-build

WORKDIR /app

COPY chat-backend/go.mod chat-backend/go.sum ./

RUN go mod download

COPY  chat-backend/*.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /chat-backend

FROM scratch

WORKDIR /app

COPY --from=backend-build /chat-backend /app/chat-backend

ENTRYPOINT [ "/app/chat-backend" ]