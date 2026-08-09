package main

import (
	"fmt"
	"net/http"
)

type UserInfo struct {
	UserId      string
	DisplayName string
}

func getUserFromRequest(r *http.Request) (UserInfo, error) {
	userId := r.Header.Get("X-Forwarded-User")
	displayName := r.Header.Get("X-Forwarded-User-Name")

	if userId == "" || displayName == "" {
		if *allowAnonymous {
			generatedUsername := getRandomUsername()
			return UserInfo{
				UserId:      generatedUsername,
				DisplayName: generatedUsername,
			}, nil
		} else {
			return UserInfo{}, fmt.Errorf("Either X-Forwarded-User or X-Forwarded-User-Name value is missing")
		}
	}
	return UserInfo{
		UserId:      userId,
		DisplayName: displayName,
	}, nil
}
