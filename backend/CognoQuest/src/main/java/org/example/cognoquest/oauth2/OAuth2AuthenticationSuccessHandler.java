package org.example.cognoquest.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.cognoquest.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;


@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private AuthService authService;

    public OAuth2AuthenticationSuccessHandler(
            @Value("${app.frontend-url}") String frontendUrl) {
        super(frontendUrl);
        setRedirectStrategy(new DefaultRedirectStrategy());
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        Object principal = authentication.getPrincipal();
        UUID userId = null;

        System.out.println("onAuthenticationSuccess: Principal type: " + principal.getClass().getName());

        if (principal instanceof CustomUserPrincipal customPrincipal) {
            userId = customPrincipal.getId();
            System.out.println("OAuth2AuthenticationSuccessHandler: User ID from CustomUserPrincipal: " + userId);
        } else {
            System.err.println("CRITICAL ERROR: Principal is not CustomUserPrincipal after OAuth2 login. Type: " + principal.getClass().getName());
            getRedirectStrategy().sendRedirect(request, response, "/login?error=OAuthUserMappingFailed");
            return;
        }

        try {
            authService.setAuthCookies(response, userId);
            clearAuthenticationAttributes(request);
            getRedirectStrategy().sendRedirect(request, response, getDefaultTargetUrl());
            System.out.println("Redirecting to: " + getDefaultTargetUrl());
        } catch (Exception e) {
            System.err.println("Error setting auth cookies or redirecting: " + e.getMessage());
            e.printStackTrace();
            getRedirectStrategy().sendRedirect(request, response, "/login?error=AuthenticationFailed");
        }
    }
}