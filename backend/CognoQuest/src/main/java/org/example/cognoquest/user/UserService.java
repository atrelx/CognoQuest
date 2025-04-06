package org.example.cognoquest.user;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.cognoquest.exception.NotFoundException;
import org.example.cognoquest.user.dto.*;
import org.example.cognoquest.user.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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


    /**
     * Get user by ID
     */
    public UserDto getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return userMapper.toDto(user);
    }

    /**
     * Get all users
     */
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Update user details
     */
    public UserDto updateUser(UUID id, UserUpdateDto updateDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        userMapper.updateUserFromDto(updateDto, user);
        user = userRepository.save(user);

        return userMapper.toDto(user);
    }

    /**
     * Delete user by ID
     */
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

}
