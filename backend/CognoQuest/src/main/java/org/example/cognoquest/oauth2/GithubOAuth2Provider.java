package org.example.cognoquest.oauth2;

import org.example.cognoquest.user.dto.OAuthLoginRequestDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GithubOAuth2Provider implements OAuth2Provider {
    private static final String GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String GITHUB_USER_DATA_URL = "https://api.github.com/user";

    @Value("${github.client_id}")
    private String clientId;

    @Value("${github.client_secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public OAuthLoginRequestDto exchangeCodeForToken(String code) {
        String accessToken = getAccessToken(code);
        return getUserDataFromGitHub(accessToken);
    }

    private String getAccessToken(String code) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("code", code);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/json");
        headers.set("Content-Type", "application/x-www-form-urlencoded");

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(GITHUB_ACCESS_TOKEN_URL, HttpMethod.POST, entity, Map.class);
        Map<String, String> responseBody = response.getBody();

        if (responseBody == null || !responseBody.containsKey("access_token")) {
            throw new RuntimeException("Failed to retrieve access token: " + responseBody);
        }

        return responseBody.get("access_token");
    }

    private OAuthLoginRequestDto getUserDataFromGitHub(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(GITHUB_USER_DATA_URL, HttpMethod.GET, entity, Map.class);
        Map<String, Object> userData = response.getBody();
        System.out.println("GitHub user data: " + userData);

        OAuthLoginRequestDto dto = new OAuthLoginRequestDto();
        dto.setOauthProvider("github");
        dto.setOauthId(String.valueOf(userData.get("id")));
        dto.setEmail((String) userData.get("email"));
        dto.setName((String) userData.get("login"));
        dto.setProfilePicture((String) userData.get("avatar_url"));

        if (dto.getEmail() == null) {
            System.out.println("Warning: Email is null for GitHub user");
        }
        return dto;
    }
}
