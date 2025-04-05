package org.example.cognoquest.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateDto {
    @Size(max = 100)
    private String name;

    private String profilePicture;
}
