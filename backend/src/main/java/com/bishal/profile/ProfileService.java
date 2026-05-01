package com.bishal.profile;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;

@Service
public class ProfileService {

    private final ObjectMapper mapper;
    private final Path dataPath;
    private volatile Profile profile;

    public ProfileService(
            ObjectMapper mapper,
            @Value("${app.profile.data-path:./data/profile.json}") String dataPath
    ) {
        this.mapper = mapper;
        this.dataPath = Path.of(dataPath).toAbsolutePath();
    }

    @PostConstruct
    void init() throws IOException {
        Path parent = dataPath.getParent();
        if (parent != null) Files.createDirectories(parent);

        if (!Files.exists(dataPath)) {
            try (InputStream in = getClass().getResourceAsStream("/profile.default.json")) {
                if (in == null) throw new IllegalStateException("missing /profile.default.json");
                Files.copy(in, dataPath);
            }
        }

        profile = mapper.readValue(dataPath.toFile(), Profile.class);
    }

    public Profile get() {
        return profile;
    }

    public synchronized Profile save(Profile p) throws IOException {
        Path tmp = Files.createTempFile(dataPath.getParent(), "profile", ".json.tmp");
        mapper.writerWithDefaultPrettyPrinter().writeValue(tmp.toFile(), p);
        try {
            Files.move(tmp, dataPath, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (AtomicMoveNotSupportedException e) {
            Files.move(tmp, dataPath, StandardCopyOption.REPLACE_EXISTING);
        }
        profile = p;
        return p;
    }
}
