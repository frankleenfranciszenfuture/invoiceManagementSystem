package com.ims.utils.jwt;

import com.ims.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret.key}")
    private String SECRET_KEY;

    private SecretKey getSigningKey() {

        byte[] keyBytes =
                Decoders.BASE64.decode(SECRET_KEY);

        return Keys.hmacShaKeyFor(keyBytes);
    }

    /*
     * ================================
     * GENERATE TOKEN
     * ================================
     */

    public String generateToken(
            UserDetails userDetails) {

        Map<String, Object> claims =
                new HashMap<>();

        return createToken(
                claims,
                userDetails.getUsername()
        );
    }

    /*
     * ================================
     * GENERATE USER TOKEN
     * ================================
     */

    public String generateUserToken(
            UserEntity user) {

        Map<String, Object> claims =
                new HashMap<>();

        claims.put(
                "type",
                "USER"
        );

        claims.put(
                "userId",
                user.getId()
        );

        claims.put(
                "role",
                user.getRole().getRoleName()
        );

        return createToken(
                claims,
                user.getEmail()
        );
    }

    /*
     * ================================
     * CREATE TOKEN
     * ================================
     */

    private String createToken(
            Map<String, Object> claims,
            String email) {

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + 1000L * 60 * 60 * 10
                        )
                )
                .signWith(getSigningKey())
                .compact();
    }

    /*
     * ================================
     * EXTRACT ALL CLAIMS
     * ================================
     */

    private Claims extractAllClaims(
            String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /*
     * ================================
     * GENERIC CLAIM
     * ================================
     */

    public <T> T extractClaim(
            String token,
            Function<Claims, T> resolver) {

        final Claims claims =
                extractAllClaims(token);

        return resolver.apply(claims);
    }

    /*
     * ================================
     * EMAIL
     * ================================
     */

    public String extractEmail(
            String token) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }

    /*
     * ================================
     * EXPIRATION
     * ================================
     */

    public Date extractExpiration(
            String token) {

        return extractClaim(
                token,
                Claims::getExpiration
        );
    }

    /*
     * ================================
     * TOKEN EXPIRED
     * ================================
     */

    private boolean isTokenExpired(
            String token) {

        return extractExpiration(token)
                .before(new Date());
    }

    /*
     * ================================
     * VALIDATE TOKEN
     * ================================
     */

    public boolean validateToken(
            String token,
            UserDetails userDetails) {

        final String email =
                extractEmail(token);

        return email.equals(
                userDetails.getUsername()
        )
                && !isTokenExpired(token);
    }

    /*
     * ================================
     * LOGIN TYPE
     * ================================
     */

    public String extractLoginType(
            String token) {

        return extractClaim(
                token,
                claims ->
                        claims.get(
                                "type",
                                String.class
                        )
        );
    }

    /*
     * ================================
     * USER ID
     * ================================
     */

    public Long extractUserId(
            String token) {

        return extractClaim(
                token,
                claims ->
                        claims.get(
                                "userId",
                                Long.class
                        )
        );
    }

    /*
     * ================================
     * EMPLOYEE ID
     * ================================
     */

    public Long extractEmployeeId(
            String token) {

        return extractClaim(
                token,
                claims ->
                        claims.get(
                                "employeeId",
                                Long.class
                        )
        );
    }

    /*
     * ================================
     * ROLE
     * ================================
     */

    public String extractRole(
            String token) {

        return extractClaim(
                token,
                claims ->
                        claims.get(
                                "role",
                                String.class
                        )
        );
    }
}