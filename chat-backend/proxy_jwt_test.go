package main

import "testing"

func TestParsesJWT(t *testing.T) {
	jwt := "eyJhbGciOiJSUzI1NiIsImtpZCI6IjMxNmIzMmFjOGMwNDM1ZDUyZTMyOTQ0MjdhOGI3M2ZlM2RiNDk0NDMifQ.eyJpc3MiOiJodHRwczovL2RleC5sdDMubW9lIiwic3ViIjoiQ2hReE5qRTBNemMxTURJNU5qQTJOekV6TWpJNU1CSUlkR1ZzWldkeVlXMCIsImF1ZCI6InR2IiwiZXhwIjoxNzc4MzYzODc0LCJpYXQiOjE3NzgyNzc0NzQsImF0X2hhc2giOiJBSmtlSXowWVdWWVRYaVY1UTRXQldRIiwiZW1haWwiOiJsdDNfbGl6IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJMaXogKDjigL84KSIsInByZWZlcnJlZF91c2VybmFtZSI6Imx0M19saXoifQ.signature123"
	expected := "Liz (8‿8)"
	actual, err := extractNameUnverified(jwt)

	if err != nil {
		t.Errorf("Should not produce an error")
	}

	if expected != actual {
		t.Errorf("Result was incorrect, got: %s, want: %s.", actual, expected)
	}
}
