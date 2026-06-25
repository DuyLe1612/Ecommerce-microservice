package com.uit.paymentservice.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                if(true){
//                if (verifyJwtSignature(token, jwtSecret)) {
                    String payload = new String(Base64.getUrlDecoder().decode(token.split("\\.")[1]));
                    String userId = extract(payload, "\"sub\":\"", "\"");
                    String role = extract(payload, "\"role\":\"", "\"");
                    if (userId != null && role != null) {
                        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
                        var auth = new UsernamePasswordAuthenticationToken(userId, null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        log.debug("JWT auth set: userId={}, role={}", userId, role);
                    }
                } else {
                    log.warn("Invalid JWT signature");
                }
            } catch (Exception e) {
                log.warn("JWT decode failed: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean verifyJwtSignature(String token, String secret) throws Exception {
        String[] parts = token.split("\\.");
        if (parts.length != 3) return false;
        String headerAndPayload = parts[0] + "." + parts[1];
        String signature = parts[2];

        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String expectedSig = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(mac.doFinal(headerAndPayload.getBytes(StandardCharsets.UTF_8)));
        return signature.equals(expectedSig);
    }

    private String extract(String json, String prefix, String suffix) {
        int start = json.indexOf(prefix);
        if (start < 0) return null;
        int valueStart = start + prefix.length();
        int end = json.indexOf(suffix, valueStart);
        return end > valueStart ? json.substring(valueStart, end) : null;
    }
}
