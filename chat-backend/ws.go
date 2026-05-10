package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/0x6flab/namegenerator"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Client struct {
	broker   *Broker
	conn     *websocket.Conn
	username string
	send     chan Message
}

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = pongWait / 2

	// Maximum message size allowed from peer.
	maxMessageSize = 10_000
)

func (c *Client) handleIncoming() {
	defer func() {
		c.broker.Disconnect(c)
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		log.Printf("got pong from client %s", c.username)
		return nil
	})
	for {
		_, messageRaw, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		messageText := string(messageRaw)
		log.Println("got ", messageText, " from", c.username)
		message := Message{Text: messageText, Author: c.username, Timestamp: int(time.Now().UnixMilli()), Id: uuid.NewString()}
		c.broker.broadcast <- message
	}
}

func (c *Client) handleOutgoing() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// closed from broker side
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}

			w.Write(message.SerBytes())
			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type ErrorResponse struct {
	Message string `json:"message"`
}

func getRandomUsername() string {
	generator := namegenerator.NewGenerator().WithGender(namegenerator.Female)
	name := generator.Generate()
	return fmt.Sprintf("anonymous-%s", name)
}

func parseJwtUsername(value string) (string, error) {
	if value == "" {
		if *allowAnonymous {
			return getRandomUsername(), nil
		} else {
			return "", fmt.Errorf("username must be provided via X-Forwarded-Preferred-Username")
		}
	}
	return value, nil
}

func serveWs(broker *Broker, w http.ResponseWriter, r *http.Request) {
	username, err := parseJwtUsername(r.Header.Get("X-Forwarded-Preferred-Username"))
	if err != nil {
		log.Printf("error parsing jwt: %s", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		err := json.NewEncoder(w).Encode(ErrorResponse{Message: err.Error()})
		if err != nil {
			log.Println(err)
		}
		return

	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{broker: broker, conn: conn, username: username, send: make(chan Message, *scrollbackSize)}
	broker.Connect(client)

	go client.handleIncoming()
	go client.handleOutgoing()
	log.Println("connected new client for", username)
}
