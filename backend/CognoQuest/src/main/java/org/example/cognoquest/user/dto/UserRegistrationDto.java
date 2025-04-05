package org.example.cognoquest.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegistrationDto {
    @Email (message = "Email should be valid")
    @NotBlank (message = "Email is mandatory")
    private String email;

    @Size(min = 6, max = 100, message = "Password should be between 6 and 100 characters")
    @NotBlank (message = "Password is mandatory")
    private String password;

    @Size(max = 100)
    @NotBlank
    private String name;
}

