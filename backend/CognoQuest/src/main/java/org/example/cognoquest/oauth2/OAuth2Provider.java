package org.example.cognoquest.oauth2;

import org.example.cognoquest.user.dto.OAuthLoginRequestDto;

public interface OAuth2Provider {
    OAuthLoginRequestDto exchangeCodeForToken(String code);
}
