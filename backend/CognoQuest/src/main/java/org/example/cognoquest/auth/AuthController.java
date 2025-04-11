package org.example.cognoquest.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cognoquest.security.JwtUtil;
import org.example.cognoquest.user.UserService;
import org.example.cognoquest.user.dto.OAuthLoginRequestDto;
import org.example.cognoquest.user.dto.UserDto;
import org.example.cognoquest.user.dto.UserLoginDto;
import org.example.cognoquest.user.dto.UserRegistrationDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@Valid @RequestBody UserLoginDto dto, HttpServletResponse response) {
        try {
            System.out.println("Attempting login");
            UserDto userDto = authService.login(dto, response);
            System.out.println("Login successful");
            return ResponseEntity.ok(userDto);
        } catch (RuntimeException e) {
            System.out.println("Error in login: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @PostMapping("/oauth-login")
    public ResponseEntity<Void> oauthLogin(@Valid @RequestBody OAuthLoginRequestDto dto, HttpServletResponse response) {
        try {
            authService.oauthLogin(dto, response);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody UserRegistrationDto dto, HttpServletResponse response) {
        try {
            UserDto userDto = authService.register(dto, response);
            return ResponseEntity.ok(userDto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(HttpServletRequest request, HttpServletResponse response) {
        try {
            authService.refreshToken(request, response);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @GetMapping("/oauth-callback")
    public void oauthCallbackGet(@RequestParam("code") String code,
                                 @RequestParam(value = "state", required = false) String state,
                                 HttpServletResponse response) throws IOException {
        try {
            String provider = "unknown";
            if (state != null) {
                String decodedState = URLDecoder.decode(state, "UTF-8");
                ObjectMapper objectMapper = new ObjectMapper();
                var stateMap = objectMapper.readValue(decodedState, java.util.Map.class);
                provider = (String) stateMap.getOrDefault("provider", "unknown");
            }

            System.out.println("Processing OAuth callback: provider=" + provider + ", code=" + code);
            OAuthLoginRequestDto oauthDto = authService.exchangeCodeForToken(provider, code);
            authService.oauthLogin(oauthDto, response);
            response.sendRedirect("http://localhost:5173/home");
        } catch (Exception e) {
            System.out.println("Error in OAuth callback: " + e.getMessage());
            String errorUrl = "http://localhost:5173/login?error=" + URLEncoder.encode(e.getMessage(), "UTF-8");
            response.sendRedirect(errorUrl);
        }
    }

    @GetMapping("/check")
    public ResponseEntity<UserDto> checkAuth(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        String token = Arrays.stream(cookies)
                .filter(c -> "access_token".equals(c.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);

        if (token != null && jwtUtil.validateAccessToken(token)) {
            UserDto currentUser = userService.getCurrentUserDto();
            return ResponseEntity.ok(currentUser);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.ok().build();
    }
}