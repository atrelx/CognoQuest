package org.example.cognoquest.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.example.cognoquest.oauth2.OAuth2Provider;
import org.example.cognoquest.oauth2.OAuth2ProviderFactory;
import org.example.cognoquest.security.JwtUtil;
import org.example.cognoquest.security.refreshToken.RefreshTokenRepository;
import org.example.cognoquest.user.User;
import org.example.cognoquest.user.dto.UserDto;
import org.example.cognoquest.user.mapper.UserMapper;
import org.example.cognoquest.user.UserRepository;
import org.example.cognoquest.user.dto.OAuthLoginRequestDto;
import org.example.cognoquest.user.dto.UserLoginDto;
import org.example.cognoquest.user.dto.UserRegistrationDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OAuth2ProviderFactory oauth2ProviderFactory;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthService(UserRepository userRepository, UserMapper userMapper,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       OAuth2ProviderFactory oauth2ProviderFactory, RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.oauth2ProviderFactory = oauth2ProviderFactory;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional
    public UserDto register(UserRegistrationDto dto, HttpServletResponse response) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already taken");
        }
        User user = userMapper.toEntity(dto);
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setCreatedAt(Instant.now());
        user = userRepository.save(user);
        setAuthCookies(response, user.getId());

        return userMapper.toDto(user);
    }

    public UserDto login(UserLoginDto dto, HttpServletResponse response) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        setAuthCookies(response, user.getId());
        return userMapper.toDto(user);
    }

    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            Arrays.stream(cookies)
                    .filter(c -> "refresh_token".equals(c.getName()))
                    .findFirst()
                    .ifPresent(cookie -> refreshTokenRepository.deleteByToken(cookie.getValue()));
        }

        clearAuthCookies(response);
    }

    @Transactional
    public void oauthLogin(OAuthLoginRequestDto dto, HttpServletResponse response) {
        User user = userRepository.findByOauthProviderAndOauthId(dto.getOauthProvider(), dto.getOauthId())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(dto.getEmail());
                    newUser.setName(dto.getName());
                    newUser.setOauthProvider(dto.getOauthProvider());
                    newUser.setOauthId(dto.getOauthId());
                    newUser.setCreatedAt(Instant.now());
                    newUser.setProfilePicture(dto.getProfilePicture());
                    try {
                        return userRepository.save(newUser);
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to save new user: " + e.getMessage(), e);
                    }
                });
        setAuthCookies(response, user.getId());
    }

    public OAuthLoginRequestDto exchangeCodeForToken(String provider, String code) {
        OAuth2Provider oauthProvider = oauth2ProviderFactory.getProvider(provider);
        if (oauthProvider == null) {
            throw new RuntimeException("Unsupported OAuth provider");
        }
        return oauthProvider.exchangeCodeForToken(code);
    }

    public void refreshToken(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        String refreshToken = Arrays.stream(cookies)
                .filter(c -> "refresh_token".equals(c.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        if (!jwtUtil.validateRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid or revoked refresh token");
        }

        UUID userId = jwtUtil.extractUserId(refreshToken);
        setAuthCookies(response, userId);
    }

    private void setAuthCookies(HttpServletResponse response, UUID userId) {
        String accessToken = jwtUtil.generateAccessToken(userId);
        String refreshToken = jwtUtil.generateRefreshToken(userId);

        Cookie accessCookie = new Cookie("access_token", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false); // TODO: set to true in production
        accessCookie.setPath("/");
        accessCookie.setMaxAge((int) (jwtUtil.accessExpiration / 1000));
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false); // TODO: set to true in production
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge((int) (jwtUtil.refreshExpiration / 1000));
        response.addCookie(refreshCookie);
    }

    private void clearAuthCookies(HttpServletResponse response) {
        Cookie accessCookie = new Cookie("access_token", "");
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false); // TODO: set to true in production
        accessCookie.setPath("/");
        accessCookie.setMaxAge(0);
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refresh_token", "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false); // TODO: set to true in production
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);
    }
}