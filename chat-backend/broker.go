package main

import "encoding/json"

type Message struct {
	Text      string `json:"text"`
	Author    string `json:"author"`
	Timestamp int    `json:"timestamp"`
	Id        string `json:"id"`
}

func (m *Message) SerBytes() []byte {
	value, _ := json.Marshal(m)
	return value
}

type Unit struct{}

type Broker struct {
	clients map[*Client]Unit

	broadcast  chan Message
	register   chan *Client
	unregister chan *Client

	scrollback []Message
}

func newBroker(scrollback int) *Broker {
	return &Broker{
		clients:    make(map[*Client]Unit),
		broadcast:  make(chan Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		scrollback: make([]Message, 0, scrollback),
	}
}

func (broker *Broker) Send(message Message) {
	broker.broadcast <- message
}

func (broker *Broker) Connect(c *Client) {
	broker.register <- c
}

func (broker *Broker) Disconnect(c *Client) {
	broker.unregister <- c
}

func (broker *Broker) addToScrollback(message Message) {
	if len(broker.scrollback) == cap(broker.scrollback) {
		broker.scrollback = broker.scrollback[1:]
	}
	broker.scrollback = append(broker.scrollback, message)
}

func (broker *Broker) dumpScrollback(c chan Message) {
	for _, message := range broker.scrollback {
		c <- message
	}
}

func (broker *Broker) Run() {
	for {
		select {
		case client := <-broker.register:
			broker.clients[client] = Unit{}
			broker.dumpScrollback(client.send)
		case client := <-broker.unregister:
			if _, ok := broker.clients[client]; ok {
				delete(broker.clients, client)
				close(client.send)
			}
		case newMessage := <-broker.broadcast:
			broker.addToScrollback(newMessage)
			for client := range broker.clients {
				select {
				case client.send <- newMessage:
				default: // when sending fails - closed from the other side
					close(client.send)
					delete(broker.clients, client)
				}
			}
		}
	}
}
