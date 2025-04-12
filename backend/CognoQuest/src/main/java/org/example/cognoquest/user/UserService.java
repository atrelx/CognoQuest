package org.example.cognoquest.user;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.cognoquest.Firebase.FirebaseStorageService;
import org.example.cognoquest.exception.NotFoundException;
import org.example.cognoquest.user.dto.*;
import org.example.cognoquest.user.mapper.UserMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final FirebaseStorageService storageService;


    public UserDto getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return userMapper.toDto(user);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    public UserDto updateUser(UserUpdateDto updateDto, MultipartFile pictureFile) {
        UUID userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        userMapper.updateUserFromDto(updateDto, user);
        if (pictureFile != null && !pictureFile.isEmpty()) {
            updateProfilePicture(user, pictureFile);
        }

        user = userRepository.save(user);

        return userMapper.toDto(user);
    }

    private void updateProfilePicture(User user, MultipartFile file) {
        UUID userId = user.getId();

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file provided for profile picture.");
        }

        try {
            // Upload to Firebase Storage
            // avatars/{userId}/profilePicture
            String filePath = String.format("avatars/%s/profilePicture", userId.toString());
            String fileUrl = storageService.uploadFile(file, filePath);

            user.setProfilePicture(fileUrl);
        } catch (Exception e) {
            System.err.println("Failed to upload profile picture for user " + userId + ": " + e.getMessage());
            throw new RuntimeException("Failed to update profile picture.", e);
        }
    }

    public void changePassword(PasswordChangeDto dto) {
        User currentUser = getCurrentUser();

        if (!passwordEncoder.matches(dto.getOldPassword(), currentUser.getPasswordHash())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        currentUser.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(currentUser);
    }

    private UUID getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        return UUID.fromString(authentication.getName());
    }

    private User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        return userRepository.findById(UUID.fromString(authentication.getName()))
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    public UserDto getCurrentUserDto() {
        return userMapper.toDto(getCurrentUser());
    }
}
