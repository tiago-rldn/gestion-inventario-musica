package com.example.backend.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // 1. Permitir peticiones previas de navegadores (CORS Preflight)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // 2. Permitir el tráfico hacia los controladores de la API
                .requestMatchers("/api/**").permitAll()
                
                // 3. CLAVE: Permitir la ruta de redirección de errores de Spring Boot
                .requestMatchers("/error").permitAll()
                
                .anyRequest().authenticated()
            );

        return http.build();
    }
}