package org.example.cognoquest.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.example.cognoquest.security.refreshToken.RefreshToken;
import org.example.cognoquest.security.refreshToken.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.accessExpiration}")
    public long accessExpiration;

    @Value("${jwt.refreshExpiration}")
    public long refreshExpiration;

    private final RefreshTokenRepository refreshTokenRepository;

    public JwtUtil(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public String generateAccessToken(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null for JWT generation");
        }
        return Jwts.builder()
                .setSubject(userId.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessExpiration))
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    public String generateRefreshToken(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null for JWT generation");
        }
        String token = Jwts.builder()
                .setSubject(userId.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(token);
        refreshToken.setUserId(userId);
        refreshToken.setIssuedAt(Instant.now());
        refreshToken.setExpiresAt(Instant.ofEpochMilli(System.currentTimeMillis() + refreshExpiration));
        refreshToken.setRevoked(false);
        refreshTokenRepository.save(refreshToken);
        return token;
    }

    public UUID extractUserId(String token) {
        String userIdStr = Jwts.parser()
                .setSigningKey(secret)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
        return UUID.fromString(userIdStr);
    }

    public boolean validateAccessToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(secret)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean validateRefreshToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(secret)
                    .build()
                    .parseSignedClaims(token);

            Optional<RefreshToken> refreshTokenOpt = Optional.ofNullable(refreshTokenRepository.findByToken(token));
            if (refreshTokenOpt.isEmpty() || refreshTokenOpt.get().isRevoked()) {
                return false;
            }

            return refreshTokenOpt.get().getExpiresAt().isAfter(Instant.now());
        } catch (Exception e) {
            return false;
        }
    }
}