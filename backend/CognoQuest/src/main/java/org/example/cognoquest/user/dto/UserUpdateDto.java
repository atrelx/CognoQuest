package org.example.cognoquest.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateDto {
    @Size(max = 100)
    @NotBlank
    private String name;
}
