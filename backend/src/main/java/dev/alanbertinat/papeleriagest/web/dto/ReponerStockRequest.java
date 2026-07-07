package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.Positive;

public record ReponerStockRequest(@Positive int cantidad) {
}
