package server

import (
	"context"
	"encoding/json"
	"flag"
	"log"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"google.golang.org/genai"
)

// Add more data to this type if needed
type client struct {
	isClosing bool
	mu        sync.Mutex
}

var (
	clients    = make(map[*websocket.Conn]*client) // Note: although large maps with pointer-like types (e.g. strings) as keys are slow, using pointers themselves as keys is acceptable and fast
	register   = make(chan *websocket.Conn)
	broadcast  = make(chan string)
	unregister = make(chan *websocket.Conn)
)

type Token struct {
	Request string `json:"request"`
}

func runHub() {
	for {
		select {
		case connection := <-register:
			clients[connection] = &client{}
			log.Println("connection registered")

		case message := <-broadcast:
			log.Println("message received:", message)
			// Send the message to all clients
			for connection, c := range clients {
				go func(connection *websocket.Conn, c *client) { // send to each client in parallel so we don't block on a slow client
					c.mu.Lock()
					defer c.mu.Unlock()
					if c.isClosing {
						return
					}
					if err := connection.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
						c.isClosing = true
						log.Println("write error:", err)

						connection.WriteMessage(websocket.CloseMessage, []byte{})
						connection.Close()
						unregister <- connection
					}
					log.Println("sent: ", string(message))
				}(connection, c)
			}

		case connection := <-unregister:
			// Remove the client from the hub
			delete(clients, connection)

			log.Println("connection unregistered")
		}
	}
}

const (
	APIKey = "" // your api key
)

var (
	wg = sync.WaitGroup{}
)

func Run() {
	app := fiber.New()

	app.Use(func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return c.SendStatus(fiber.StatusUpgradeRequired)
	})

	go runHub()

	app.Get("/ws", websocket.New(func(c *websocket.Conn) {
		// When the function returns, unregister the client and close the connection
		defer func() {
			unregister <- c
			c.Close()
		}()

		// Register the client
		register <- c

		for {
			messageType, message, err := c.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Println("read error:", err)
				}

				return
			}

			if messageType == websocket.TextMessage {
				log.Println("connected")
				var token Token
				json.Unmarshal(message, &token)

				ctx := context.Background()
				client, err := genai.NewClient(ctx, &genai.ClientConfig{
					APIKey: APIKey, // your api key
				})
				if err != nil {
					log.Fatal(err)
				}

				result, _ := client.Models.GenerateContent(
					ctx,
					"gemini-2.5-flash",
					genai.Text(token.Request),
					nil,
				)
				wg.Add(1)
				go func() {

					broadcast <- string(result.Text())
				}()
				// Broadcast the received message

				// message = []byte("hello react!!!🤗  how you doing!!?")
				// broadcast <- string(message)
			} else {
				log.Println("websocket message received of type", messageType)
			}
		}
	}, websocket.Config{Origins: []string{"*"}}))

	addr := flag.String("addr", ":8080", "http service address")
	flag.Parse()
	log.Fatal(app.Listen(*addr))
}
