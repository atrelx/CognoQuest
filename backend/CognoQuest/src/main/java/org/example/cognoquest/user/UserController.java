package org.example.cognoquest.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cognoquest.user.dto.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUserProfile() {
        return ResponseEntity.ok(userService.getCurrentUserDto());
    }

    @PutMapping(value = "/me/update", consumes = { "multipart/form-data" })
    public ResponseEntity<UserDto> updateUser(
            @RequestParam("name") String name,
            @RequestParam(value = "pictureFile", required = false) MultipartFile pictureFile
    ) {
        UserUpdateDto updateDto = new UserUpdateDto();
        updateDto.setName(name);
        return ResponseEntity.ok(userService.updateUser(updateDto, pictureFile));
    }


    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@RequestBody @Valid PasswordChangeDto passwordChangeDto) {
        userService.changePassword(passwordChangeDto);
        return ResponseEntity.noContent().build();
    }
}
