package com.bishal.profile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ContactController {

    private static final String EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send";

    @Value("${app.emailjs.service-id:}")
    private String serviceId;

    @Value("${app.emailjs.template-id:}")
    private String templateId;

    @Value("${app.emailjs.public-key:}")
    private String publicKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/contact")
    public ResponseEntity<?> sendContact(@Valid @RequestBody ContactRequest req) {
        if (serviceId.isBlank() || templateId.isBlank() || publicKey.isBlank()) {
            return ResponseEntity.status(503)
                .body(Map.of("error", "Contact service not configured"));
        }

        Map<String, Object> payload = Map.of(
            "service_id", serviceId,
            "template_id", templateId,
            "user_id", publicKey,
            "template_params", Map.of(
                "from_name", req.name(),
                "from_email", req.email(),
                "message", req.message()
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            restTemplate.exchange(EMAILJS_URL, HttpMethod.POST, request, String.class);
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (Exception e) {
            return ResponseEntity.status(502)
                .body(Map.of("error", "Failed to send email: " + e.getMessage()));
        }
    }

    public record ContactRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 200) String email,
        @NotBlank @Size(max = 2000) String message
    ) {}
}
