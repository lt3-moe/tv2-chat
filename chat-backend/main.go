package main

import (
	"flag"
	"log"
	"net/http"
)

var staticDir = flag.String("static", "./dist", "where to fetch the site static content from")
var allowAnonymous = flag.Bool("allow-anonymous", false, "enable to allow anonymous users")
var scrollbackSize = flag.Int("scrollback-size", 1000, "number of messages to keep in memory for reconnecting clients")
var anonymizeSeed = flag.String("anonymize-seed", "", "Provide seed value to apply simple name anonymization. Disabled when unset.")

func main() {
	flag.Parse()

	log.Printf("allow anonymous: %v", *allowAnonymous)
	log.Printf("use name anonymization: %v", *anonymizeSeed != "")

	fs := http.FileServer(http.Dir(*staticDir))
	log.Println("will serve static content from ", *staticDir)
	http.Handle("/", fs)

	broker := newBroker(*scrollbackSize)
	go broker.Run()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(broker, w, r)
	})
	log.Println("will listen to ws on /ws")

	log.Println("will listen on :8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("error serving: ", err)
	}
}
