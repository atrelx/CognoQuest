package org.example.cognoquest.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OAuthLoginRequestDto {
    @NotNull
    private String oauthProvider;

    @NotNull
    private String oauthId;

    @Email
    private String email;

    private String name;
    private String profilePicture;
}
