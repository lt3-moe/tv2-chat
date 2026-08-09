package main

import (
	"fmt"
	"net/http"

	"github.com/google/uuid"
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
			generatedUserId := uuid.NewString()
			generatedUsername := getRandomUsername()
			return UserInfo{
				UserId:      generatedUserId,
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
