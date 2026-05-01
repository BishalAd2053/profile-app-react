package com.bishal.profile;

import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ProfileService service;

    public AdminController(ProfileService service) {
        this.service = service;
    }

    @GetMapping("/profile")
    public Profile get() {
        return service.get();
    }

    @PutMapping("/profile")
    public Profile update(@RequestBody Profile profile) throws IOException {
        return service.save(profile);
    }
}
