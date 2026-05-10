package main

type Unit struct{}

type Broker struct {
	clients map[*Client]Unit

	broadcast  chan AnyMessage
	register   chan *Client
	unregister chan *Client

	scrollback []TextMessage
}

func newBroker(scrollback int) *Broker {
	return &Broker{
		clients:    make(map[*Client]Unit),
		broadcast:  make(chan AnyMessage, 100),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		scrollback: make([]TextMessage, 0, scrollback),
	}
}

func (broker *Broker) Send(message TextMessage) {
	broker.broadcast <- message
}

func (broker *Broker) Connect(c *Client) {
	broker.register <- c
}

func (broker *Broker) Disconnect(c *Client) {
	broker.unregister <- c
}

func (broker *Broker) addToScrollback(message TextMessage) {
	if len(broker.scrollback) == cap(broker.scrollback) {
		broker.scrollback = broker.scrollback[1:]
	}
	broker.scrollback = append(broker.scrollback, message)
}

func (broker *Broker) dumpScrollback(c chan AnyMessage) {
	for _, message := range broker.scrollback {
		c <- message
	}
}

func (broker *Broker) RunBroadcasts() {
	for {
		select {
		case client := <-broker.register:
			broker.clients[client] = Unit{}
			broker.dumpScrollback(client.send)
			broker.broadcast <- ViewCount{Count: len(broker.clients)}
		case client := <-broker.unregister:
			if _, ok := broker.clients[client]; ok {
				delete(broker.clients, client)
				close(client.send)
			}
			broker.broadcast <- ViewCount{Count: len(broker.clients)}
		case newMessage := <-broker.broadcast:
			if msg, ok := newMessage.(TextMessage); ok {
				broker.addToScrollback(msg)
			}
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
