package org.example.cognoquest.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordChangeDto {

    private String oldPassword;

    @Size(min = 6, max = 100, message = "Password should be between 6 and 100 characters")
    @NotBlank(message = "Password is mandatory")
    private String newPassword;
}

