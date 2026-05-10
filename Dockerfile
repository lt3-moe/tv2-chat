FROM golang:1.26 AS backend-build

WORKDIR /build

COPY chat-backend/go.mod chat-backend/go.sum ./

RUN go mod download

COPY  chat-backend/*.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /chat-backend

FROM node:23-alpine AS frontend-build

WORKDIR /build

COPY chat-frontend/package.json chat-frontend/package-lock.json ./

RUN npm install

COPY chat-frontend/ ./

RUN npm run build

FROM scratch

WORKDIR /app

COPY --from=backend-build /chat-backend /app/chat-backend
COPY --from=frontend-build /build/dist/ /app/dist/

ENTRYPOINT [ "/app/chat-backend" ]