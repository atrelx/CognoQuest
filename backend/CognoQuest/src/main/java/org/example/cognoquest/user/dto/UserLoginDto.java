package org.example.cognoquest.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserLoginDto {

    @Email
    @NotBlank
    private String email;

    @Size(min = 6, max = 100)
    @NotBlank
    private String password;
}
