package com.example.product.presentation.rest;

import com.example.product.application.dto.ApiResponse;
import com.example.product.application.dto.BlogRequest;
import com.example.product.application.util.SlugUtil;
import com.example.product.infrastructure.persistence.entity.BlogJpaEntity;
import com.example.product.infrastructure.persistence.repository.BlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.StringJoiner;

@RestController
@RequestMapping("/api/admin/blog")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminBlogController {

    private final BlogRepository blogRepository;

    @GetMapping("/{id}")
    public ApiResponse<Object> getBlog(@PathVariable Long id) {
        return blogRepository.findById(id)
            .map(blog -> ApiResponse.success((Object)blog))
            .orElse(ApiResponse.error("Blog not found"));
    }

    @PostMapping
    public ApiResponse<Object> createBlog(@RequestBody BlogRequest request) {
        BlogJpaEntity blog = BlogJpaEntity.builder()
            .title(request.getTitle())
            .slug(request.getSlug() != null ? request.getSlug() : SlugUtil.slugify(request.getTitle()))
            .summary(request.getSummary())
            .content(request.getContent())
            .tags(joinTags(request.getTags()))
            .status(request.getStatus() != null ? request.getStatus() : "DRAFT")
            .publishedAt("PUBLISHED".equalsIgnoreCase(request.getStatus()) ? LocalDateTime.now() : null)
            .build();
        return ApiResponse.success((Object)blogRepository.save(blog));
    }

    @PutMapping("/{id}")
    public ApiResponse<Object> updateBlog(@PathVariable Long id, @RequestBody BlogRequest request) {
        BlogJpaEntity blog = blogRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Blog not found"));
        if (request.getTitle() != null) {
            blog.setTitle(request.getTitle());
        }
        if (request.getSlug() != null) {
            blog.setSlug(request.getSlug());
        }
        if (request.getSummary() != null) {
            blog.setSummary(request.getSummary());
        }
        if (request.getContent() != null) {
            blog.setContent(request.getContent());
        }
        if (request.getTags() != null) {
            blog.setTags(joinTags(request.getTags()));
        }
        if (request.getStatus() != null) {
            blog.setStatus(request.getStatus());
            if ("PUBLISHED".equalsIgnoreCase(request.getStatus()) && blog.getPublishedAt() == null) {
                blog.setPublishedAt(LocalDateTime.now());
            }
            if ("DRAFT".equalsIgnoreCase(request.getStatus())) {
                blog.setPublishedAt(null);
            }
        }
        return ApiResponse.success((Object)blogRepository.save(blog));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Object> deleteBlog(@PathVariable Long id) {
        blogRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    @PostMapping("/{id}/publish")
    public ApiResponse<Object> publishBlog(@PathVariable Long id) {
        BlogJpaEntity blog = blogRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Blog not found"));
        blog.setStatus("PUBLISHED");
        blog.setPublishedAt(LocalDateTime.now());
        return ApiResponse.success((Object)blogRepository.save(blog));
    }

    @PostMapping("/{id}/unpublish")
    public ApiResponse<Object> unpublishBlog(@PathVariable Long id) {
        BlogJpaEntity blog = blogRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Blog not found"));
        blog.setStatus("DRAFT");
        return ApiResponse.success((Object)blogRepository.save(blog));
    }

    private String joinTags(java.util.List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return null;
        }
        StringJoiner joiner = new StringJoiner(",");
        for (String tag : tags) {
            if (tag != null && !tag.isBlank()) {
                joiner.add(tag.trim());
            }
        }
        return joiner.toString();
    }
}
