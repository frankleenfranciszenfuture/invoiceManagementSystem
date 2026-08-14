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
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());

    }

    public String generateUserToken(UserEntity user) {

        Map<String, Object> claims = new HashMap<>();

        claims.put("type", "USER");
        claims.put("userId", user.getId());
        claims.put("role", user.getRole().getRoleName());
        return createToken(claims, user.getEmail());
    }

    private String createToken(Map<String, Object> claims, String email) {
        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                .signWith(getSigningKey())
                .compact();
    }


    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        final Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public boolean validateToken(String token, UserDetails userDetails) {

        final String email = extractEmail(token);

        return (email.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }


    public String extractLoginType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    public Long extractEmployeeId(String token) {
        return extractClaim(token, claims -> claims.get("employeeId", Long.class));
    }

    public Long extractBranchId(String token) {
        return extractClaim(token, claims -> claims.get("branchId", Long.class));
    }

    public Long extractShopId(String token) {
        return extractClaim(token, claims -> claims.get("shopId", Long.class));
    }

    public Long extractFloorId(String token) {
        return extractClaim(token, claims -> claims.get("floorId", Long.class));
    }
}