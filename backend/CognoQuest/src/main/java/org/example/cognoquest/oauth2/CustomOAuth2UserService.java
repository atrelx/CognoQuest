package org.example.cognoquest.oauth2;

import org.example.cognoquest.exception.OAuth2AuthenticationProcessingException;
import org.example.cognoquest.user.User;
import org.example.cognoquest.user.UserRepository;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OidcUserRequest, OidcUser> {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        try {
            System.out.println("--- Starting processOAuth2User ---");

            Map<String, Object> attributes = userRequest.getIdToken().getClaims();
            String provider = userRequest.getClientRegistration().getRegistrationId(); // "google"
            String googleUserId = attributes.get("sub").toString();
            String email = (String) attributes.get("email");
            String name = (String) attributes.get("name");
            String pictureUrl = (String) attributes.get("picture");

            if (!StringUtils.hasText(googleUserId)) {
                throw new OAuth2AuthenticationProcessingException("Google User ID missing");
            }

            Optional<User> userOptional = userRepository.findByOauthProviderAndOauthId(provider, googleUserId);
            User user;

            if (userOptional.isPresent()) {
                user = userOptional.get();
                System.out.println("Found existing OAuth user: ID=" + user.getId() + ", GoogleID=" + googleUserId);
                boolean updated = false;
                if (name != null && !name.equals(user.getName())) {
                    user.setName(name);
                    updated = true;
                }
                if (pictureUrl != null && !pictureUrl.equals(user.getProfilePicture())) {
                    user.setProfilePicture(pictureUrl);
                    updated = true;
                }
                if (email != null && !StringUtils.hasText(user.getEmail())) {
                    User finalUser = user;
                    if (!userRepository.findByEmail(email)
                            .filter(existing -> !existing.getId().equals(finalUser.getId()))
                            .isPresent()) {
                        user.setEmail(email);
                        updated = true;
                    } else {
                        System.err.println("OAuth Update Warning: Email " + email + " exists for another user.");
                    }
                }
                if (updated) {
                    System.out.println("Updating existing user ID: " + user.getId());
                    user = userRepository.save(user);
                    System.out.println("User updated in DB.");
                }
            } else {
                System.out.println("OAuth user not found by provider ID. Checking by email: " + email);
                Optional<User> userByEmailOptional = Optional.empty();
                if (StringUtils.hasText(email)) {
                    userByEmailOptional = userRepository.findByEmail(email);
                }
                if (userByEmailOptional.isPresent()) {
                    System.err.println("User with email " + email + " already exists but not linked to Google ID " + googleUserId);
                    throw new OAuth2AuthenticationProcessingException("An account with email " + email + " already exists. Please log in using your password.");
                } else {
                    user = registerNewOAuthUser(provider, googleUserId, email, name, pictureUrl);
                    System.out.println("Registered new OAuth user: ID=" + user.getId() + ", GoogleID=" + googleUserId);
                }
            }

            System.out.println("Returning CustomUserPrincipal for User ID: " + user.getId());

            return new CustomUserPrincipal(user, attributes, userRequest.getIdToken(), null);
        } catch (Exception ex) {
            System.err.println("!!! Error in processOAuth2User: " + ex.getMessage());
            ex.printStackTrace();
            throw new OAuth2AuthenticationProcessingException(ex.getMessage(), ex.getCause());
        }
    }

    private User registerNewOAuthUser(String provider, String providerId, String email, String name, String imageUrl) {
        User newUser = new User();
        newUser.setOauthProvider(provider);
        newUser.setOauthId(providerId);
        newUser.setEmail(email);
        newUser.setName(name);
        newUser.setProfilePicture(imageUrl);
        newUser.setCreatedAt(Instant.now());
        return userRepository.save(newUser);
    }
}