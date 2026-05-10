package main

import (
	"encoding/json"
	"reflect"
)

type AnyMessage interface {
	Kind() string
}

func structToMap(item interface{}) map[string]interface{} {

	res := map[string]interface{}{}
	if item == nil {
		return res
	}
	v := reflect.TypeOf(item)
	reflectValue := reflect.ValueOf(item)
	reflectValue = reflect.Indirect(reflectValue)

	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}
	for i := 0; i < v.NumField(); i++ {
		tag := v.Field(i).Tag.Get("json")
		field := reflectValue.Field(i).Interface()
		if tag != "" && tag != "-" {
			if v.Field(i).Type.Kind() == reflect.Struct {
				res[tag] = structToMap(field)
			} else {
				res[tag] = field
			}
		}
	}
	return res
}

func SerWithTag[T AnyMessage](m T) []byte {

	mapped := structToMap(m)
	mapped["kind"] = m.Kind()

	value, _ := json.Marshal(mapped)
	return value
}

type TextMessage struct {
	Text      string `json:"text"`
	Author    string `json:"author"`
	Timestamp int    `json:"timestamp"`
	Id        string `json:"id"`
}

func (t TextMessage) Kind() string {
	return "newMessage"
}
