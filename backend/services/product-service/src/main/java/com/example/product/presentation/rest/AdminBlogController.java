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
import java.util.List;
import java.util.StringJoiner;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.example.product.infrastructure.persistence.entity.BlogPostTagJpaEntity;
import com.example.product.infrastructure.persistence.repository.BlogPostTagRepository;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/admin/blog")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminBlogController {

    private final BlogRepository blogRepository;
    private final BlogPostTagRepository blogPostTagRepository;

    @GetMapping
    public ApiResponse<Object> listBlogs(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (status != null && !status.isBlank()) {
            return ApiResponse.success(blogRepository.findAllByStatusOrderByCreatedAtDesc(status, pageable));
        }
        return ApiResponse.success(blogRepository.findAllByOrderByCreatedAtDesc(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<Object> getBlog(@PathVariable Long id) {
        return blogRepository.findById(id)
            .map(blog -> ApiResponse.success((Object)blog))
            .orElse(ApiResponse.error("Blog not found"));
    }

    @PostMapping
    @Transactional
    public ApiResponse<Object> createBlog(@RequestBody BlogRequest request) {
        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = SlugUtil.slugify(request.getTitle());
        }
        
        BlogJpaEntity blog = BlogJpaEntity.builder()
            .title(request.getTitle())
            .slug(slug)
            .summary(request.getSummary())
            .content(request.getContent())
            .featuredImageUrl(request.getFeaturedImageUrl() != null && !request.getFeaturedImageUrl().isBlank() ? request.getFeaturedImageUrl() : "...")
            .authorId(request.getAuthorId() != null ? request.getAuthorId() : 1L)
            .status(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus() : "DRAFT")
            .publishedAt("PUBLISHED".equalsIgnoreCase(request.getStatus()) ? LocalDateTime.now() : null)
            .productIds(request.getProductIds() != null && !request.getProductIds().isBlank() ? request.getProductIds() : "[]")
            .build();
        blog = blogRepository.save(blog);
        
        saveTags(blog.getId(), request.getTags());
        
        return ApiResponse.success((Object)blog);
    }

    @PutMapping("/{id}")
    @Transactional
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
        if (request.getFeaturedImageUrl() != null) {
            blog.setFeaturedImageUrl(request.getFeaturedImageUrl());
        }
        if (request.getAuthorId() != null) {
            blog.setAuthorId(request.getAuthorId());
        }
        if (request.getProductIds() != null) {
            blog.setProductIds(request.getProductIds());
        }
        if (request.getTags() != null) {
            saveTags(blog.getId(), request.getTags());
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

    private void saveTags(Long blogId, java.util.List<String> tags) {
        blogPostTagRepository.deleteByBlogPostId(blogId);
        if (tags != null && !tags.isEmpty()) {
            for (String tag : tags) {
                if (tag != null && !tag.isBlank()) {
                    blogPostTagRepository.save(BlogPostTagJpaEntity.builder()
                        .blogPostId(blogId)
                        .tag(tag.trim())
                        .build());
                }
            }
        }
    }
}
