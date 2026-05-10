package main

import (
	"encoding/json"
	"reflect"
	"testing"
)

func TestSerializes(t *testing.T) {
	msg := TextMessage{}
	type ExpectedStructure struct {
		TextMessage
		Kind string `json:"kind"`
	}
	expected := ExpectedStructure{Kind: "newMessage"}

	val := SerWithTag(msg)

	var deser ExpectedStructure
	json.Unmarshal(val, &deser)
	if !reflect.DeepEqual(deser, expected) {
		t.Error("serialized repr does not match")
	}
}
