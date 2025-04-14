package org.example.cognoquest.security;

import org.example.cognoquest.oauth2.CustomUserPrincipal;
import org.example.cognoquest.user.User;
import org.example.cognoquest.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        UUID uuid;
        try {
            uuid = UUID.fromString(userId);
        } catch (IllegalArgumentException e) {
            throw new UsernameNotFoundException("Invalid user ID format: " + userId);
        }

        User user = userRepository.findById(uuid)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

        return new CustomUserPrincipal(user, Collections.emptyMap());
    }
}