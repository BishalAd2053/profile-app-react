package com.bishal.profile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final ProfileService service;

    public ProfileController(ProfileService service) {
        this.service = service;
    }

    @GetMapping("/profile")
    public Profile profile() {
        return service.get();
    }

    @PostMapping("/contact")
    public Map<String, Object> contact(@Valid @RequestBody ContactRequest req) {
        System.out.printf("[contact] from=%s <%s> message=%s%n",
            req.name(), req.email(), req.message());
        return Map.of(
            "ok", true,
            "receivedAt", Instant.now().toString()
        );
    }

    public record ContactRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 200) String email,
        @NotBlank @Size(max = 2000) String message
    ) {}
}
