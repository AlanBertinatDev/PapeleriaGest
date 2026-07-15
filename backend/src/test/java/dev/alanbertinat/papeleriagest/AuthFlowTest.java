package dev.alanbertinat.papeleriagest;

import static org.assertj.core.api.Assertions.assertThat;

import dev.alanbertinat.papeleriagest.web.dto.AuthResponse;
import dev.alanbertinat.papeleriagest.web.dto.ChangePasswordRequest;
import dev.alanbertinat.papeleriagest.web.dto.LoginRequest;
import dev.alanbertinat.papeleriagest.web.dto.RegisterRequest;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

class AuthFlowTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void registerLoginAndChangePassword() {
        RegisterRequest registerRequest = new RegisterRequest(
                "Ana Perez", "ana@example.com", "1234567", "099111222", "password123");

        ResponseEntity<AuthResponse> registerResponse =
                restTemplate.postForEntity("/api/auth/register", registerRequest, AuthResponse.class);

        assertThat(registerResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(registerResponse.getBody()).isNotNull();
        assertThat(registerResponse.getBody().token()).isNotBlank();
        assertThat(registerResponse.getBody().usuario().email()).isEqualTo("ana@example.com");

        ResponseEntity<AuthResponse> duplicateResponse =
                restTemplate.postForEntity("/api/auth/register", registerRequest, AuthResponse.class);
        assertThat(duplicateResponse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        LoginRequest loginRequest = new LoginRequest("ana@example.com", "password123");
        ResponseEntity<AuthResponse> loginResponse =
                restTemplate.postForEntity("/api/auth/login", loginRequest, AuthResponse.class);
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        String token = loginResponse.getBody().token();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        ResponseEntity<UsuarioResponse> meResponse = restTemplate.exchange(
                "/api/auth/me", org.springframework.http.HttpMethod.GET,
                new HttpEntity<>(headers), UsuarioResponse.class);
        assertThat(meResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(meResponse.getBody().nombre()).isEqualTo("Ana Perez");

        ChangePasswordRequest changeRequest = new ChangePasswordRequest("password123", "newpassword456");
        ResponseEntity<Void> changeResponse = restTemplate.exchange(
                "/api/auth/password", org.springframework.http.HttpMethod.PUT,
                new HttpEntity<>(changeRequest, headers), Void.class);
        assertThat(changeResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        ResponseEntity<AuthResponse> oldPasswordLogin =
                restTemplate.postForEntity("/api/auth/login", loginRequest, AuthResponse.class);
        assertThat(oldPasswordLogin.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        ResponseEntity<AuthResponse> newPasswordLogin = restTemplate.postForEntity(
                "/api/auth/login", new LoginRequest("ana@example.com", "newpassword456"), AuthResponse.class);
        assertThat(newPasswordLogin.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void bloqueaLoginTrasVariosIntentosFallidos() {
        RegisterRequest registerRequest = new RegisterRequest(
                "Beto Perez", "beto@example.com", "7654321", "099333444", "password123");
        restTemplate.postForEntity("/api/auth/register", registerRequest, AuthResponse.class);

        LoginRequest loginIncorrecto = new LoginRequest("beto@example.com", "incorrecta");
        for (int i = 0; i < 5; i++) {
            ResponseEntity<String> respuesta =
                    restTemplate.postForEntity("/api/auth/login", loginIncorrecto, String.class);
            assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        ResponseEntity<String> bloqueado = restTemplate.postForEntity(
                "/api/auth/login", new LoginRequest("beto@example.com", "password123"), String.class);
        assertThat(bloqueado.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
    }
}
