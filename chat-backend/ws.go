package main

import (
	"crypto/sha256"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/goombaio/namegenerator"
	"github.com/gorilla/websocket"
)

type Client struct {
	broker   *Broker
	conn     *websocket.Conn
	username string
	send     chan AnyMessage
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
		message := TextMessage{Text: messageText, Author: c.username, Timestamp: int(time.Now().UnixMilli()), Id: uuid.NewString()}
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
	seed := time.Now().UTC().UnixNano()
	generator := namegenerator.NewNameGenerator(seed)
	name := generator.Generate()
	return fmt.Sprintf("anonymous-%s", name)
}

func seedFromStringHash(value string) int64 {
	h := sha256.New()
	h.Write([]byte(value))

	hash := h.Sum(nil)
	return int64(binary.BigEndian.Uint64(hash[:8]))
}

func anonymizeName(seed, value string) string {
	rngSeed := seedFromStringHash(seed + value)
	generator := namegenerator.NewNameGenerator(rngSeed)
	name := generator.Generate()
	return fmt.Sprintf("anonymous-%s", name)
}

func serveWs(broker *Broker, w http.ResponseWriter, r *http.Request) {
	accessHeader := r.Header.Get("X-Forwarded-Access-Token")
	username, err := parseJwtUsername(accessHeader)
	if err != nil {
		log.Printf("error parsing jwt from header: %s", err)
		log.Printf("header value was \"%s\"", accessHeader)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		err := json.NewEncoder(w).Encode(ErrorResponse{Message: err.Error()})
		if err != nil {
			log.Println(err)
		}
		return
	}
	if *anonymizeSeed != "" {
		username = anonymizeName(*anonymizeSeed, username)
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{broker: broker, conn: conn, username: username, send: make(chan AnyMessage, *scrollbackSize)}
	broker.Connect(client)

	go client.handleIncoming()
	go client.handleOutgoing()
	log.Println("connected new client for", username)
}
