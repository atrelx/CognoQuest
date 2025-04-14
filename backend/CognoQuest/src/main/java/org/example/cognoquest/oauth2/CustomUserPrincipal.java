package org.example.cognoquest.oauth2;

import lombok.Getter;
import org.example.cognoquest.user.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

public class CustomUserPrincipal implements OAuth2User, OidcUser, UserDetails {

    @Getter
    private final User user;
    private final Map<String, Object> attributes;
    private final OidcIdToken idToken;
    private final OidcUserInfo userInfo;

    public CustomUserPrincipal(User user, Map<String, Object> attributes) {
        this(user, attributes, null, null);
    }

    public CustomUserPrincipal(User user, Map<String, Object> attributes, OidcIdToken idToken, OidcUserInfo userInfo) {
        this.user = user;
        this.attributes = attributes != null ? attributes : Collections.emptyMap();
        this.idToken = idToken;
        this.userInfo = userInfo;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getName() {
        return user.getId().toString();
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash(); // can be null if not using password authentication
    }

    @Override
    public String getUsername() {
        return user.getId().toString();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public OidcIdToken getIdToken() {
        return idToken;
    }

    @Override
    public OidcUserInfo getUserInfo() {
        return userInfo;
    }

    @Override
    public Map<String, Object> getClaims() {
        return attributes;
    }

    public UUID getId() {
        return user.getId();
    }

    public String getEmail() {
        return user.getEmail();
    }
}