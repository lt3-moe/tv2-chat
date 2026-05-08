# Protocol spec

1. Отправка сообщения

    ```http
    POST /messages
    Cookie: ... # handled by oauth2-proxy
    Content-Type: application/json

    {
        "message": "abc123"
    }
    ```

2. Чтение сообщений - подключение по ws.

    В момент подключения отправляется scrollback буфер сервера, чтобы получить историю. Дальше отсылаются все новые сообщения.
