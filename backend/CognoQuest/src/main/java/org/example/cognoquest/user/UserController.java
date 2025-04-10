package org.example.cognoquest.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cognoquest.user.dto.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }


    @PutMapping("/me/update")
    public ResponseEntity<UserDto> updateUser(@RequestBody @Valid UserUpdateDto userUpdateDto) {
        return ResponseEntity.ok(userService.updateUser(userUpdateDto));
    }

    @PutMapping("/me/update/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody @Valid PasswordChangeDto passwordChangeDto) {
        userService.changePassword(passwordChangeDto);
        return ResponseEntity.noContent().build();
    }
}
