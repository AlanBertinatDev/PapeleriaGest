package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MarcarEnRevisionRequest(@NotBlank @Size(max = 500) String motivo) {
}
