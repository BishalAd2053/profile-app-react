package com.bishal.profile;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record Profile(
    String name,
    String title,
    String location,
    String bio,
    String email,
    String avatarUrl,
    Social social,
    List<String> skills,
    List<Experience> experience,
    List<Project> projects
) {
    public record Social(String github, String linkedin) {}
    public record Experience(String role, String company, String period, String summary) {}
    public record Project(String name, String description, List<String> tech) {}
}
