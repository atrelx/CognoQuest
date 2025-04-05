package org.example.cognoquest.oauth2;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class OAuth2ProviderFactory {
    private final Map<String, OAuth2Provider> providers = new HashMap<>();

    public OAuth2ProviderFactory(GithubOAuth2Provider gitHubOAuthProvider) {
        providers.put("github", gitHubOAuthProvider);
        // Other providers go here
    }

    public OAuth2Provider getProvider(String providerName) {
        return providers.get(providerName);
    }
}
