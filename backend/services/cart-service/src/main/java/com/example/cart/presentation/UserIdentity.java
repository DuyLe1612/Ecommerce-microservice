package com.example.cart.presentation;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class UserIdentity {
    private final SecretKey jwtSecretKey;

    public UserIdentity(@Value("${security.jwt.secret:}") String jwtSecret) {
        this.jwtSecretKey = jwtSecret == null || jwtSecret.isBlank()
            ? null
            : new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    public String resolve(String authHeader, String xUserId) {
        if (authHeader != null && authHeader.startsWith("Bearer mock-user-")) {
            String[] parts = authHeader.substring(7).split("-");
            if (parts.length >= 4) {
                return parts[2];
            }
        }
        String jwtUserId = resolveJwtSubject(authHeader);
        if (jwtUserId != null) {
            return jwtUserId;
        }
        return xUserId;
    }

    private String resolveJwtSubject(String authHeader) {
        if (jwtSecretKey == null || authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7).trim();
        if (token.isEmpty() || token.startsWith("mock-user-")) {
            return null;
        }
        try {
            Claims claims = Jwts.parser()
                .verifyWith(jwtSecretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            String subject = claims.getSubject();
            return subject == null || subject.isBlank() ? null : subject;
        } catch (JwtException | IllegalArgumentException ignored) {
            return null;
        }
    }
}
