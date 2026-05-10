package main

import (
	"fmt"
	"log"

	"github.com/golang-jwt/jwt/v5"
)

func parseJwtUsername(value string) (string, error) {
	if value == "" {
		if *allowAnonymous {
			return getRandomUsername(), nil
		} else {
			return "", fmt.Errorf("value is missing, token must be provided via X-Forwarded-Access-Token")
		}
	}
	return extractNameUnverified(value)
}

type Claims struct {
	jwt.RegisteredClaims
	Name string `json:"name"`
}

func extractNameUnverified(jwtValue string) (string, error) {
	var claims jwt.Claims = &Claims{}
	token, _, err := jwt.NewParser().ParseUnverified(jwtValue, claims)
	if err != nil {
		log.Printf("error parsing jwt: %s", err.Error())
		return "", fmt.Errorf("failed to parse jwt claims")
	}

	if castedClaims, ok := token.Claims.(*Claims); ok {
		return castedClaims.Name, nil
	} else {
		return "", fmt.Errorf("failed to extract name claim from jwt")
	}
}
