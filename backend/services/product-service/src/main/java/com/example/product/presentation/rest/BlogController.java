package com.example.product.presentation.rest;

import com.example.product.application.dto.ApiResponse;
import com.example.product.infrastructure.persistence.entity.BlogJpaEntity;
import com.example.product.infrastructure.persistence.repository.BlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.example.product.infrastructure.persistence.entity.BlogPostTagJpaEntity;
import com.example.product.infrastructure.persistence.repository.BlogPostTagRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/blog")
@RequiredArgsConstructor
public class BlogController {

    private final BlogRepository blogRepository;
    private final BlogPostTagRepository blogPostTagRepository;

    // Frontend gửi page 1-indexed, pageSize param
    @GetMapping
    public ApiResponse<Object> listBlog(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int pageSize) {
        // Convert 1-indexed → 0-indexed for Spring
        int springPage = Math.max(0, page - 1);
        PageRequest pageable = PageRequest.of(springPage, pageSize, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<BlogJpaEntity> result = blogRepository.findByStatusOrderByPublishedAtDesc("PUBLISHED", pageable);
        return ApiResponse.success(Map.of(
            "data", result.getContent(),
            "totalRecords", result.getTotalElements(),
            "totalPages", result.getTotalPages(),
            "page", page,
            "pageSize", pageSize
        ));
    }

    @GetMapping("/{slug}")
    public ApiResponse<Object> getBlog(@PathVariable String slug) {
        return blogRepository.findBySlug(slug)
            .map(blog -> ApiResponse.success((Object)blog))
            .orElse(ApiResponse.error("Blog not found"));
    }

    @GetMapping("/{id}/related")
    public ApiResponse<Object> getRelated(@PathVariable Long id) {
        Optional<BlogJpaEntity> blog = blogRepository.findById(id);
        if (blog.isEmpty()) {
            return ApiResponse.error("Blog not found");
        }
        List<BlogPostTagJpaEntity> tags = blogPostTagRepository.findByBlogPostId(id);
        if (tags == null || tags.isEmpty()) {
            return ApiResponse.success(blogRepository.findTop5ByStatusAndIdNotOrderByPublishedAtDesc("PUBLISHED", id));
        }
        String firstTag = tags.get(0).getTag();
        if (firstTag.isEmpty()) {
            return ApiResponse.success(blogRepository.findTop5ByStatusAndIdNotOrderByPublishedAtDesc("PUBLISHED", id));
        }
        List<BlogJpaEntity> related = blogRepository.findTop5ByStatusAndTagsContainingIgnoreCaseOrderByPublishedAtDesc("PUBLISHED", firstTag, PageRequest.of(0, 5));
        related.removeIf(item -> item.getId().equals(id));
        return ApiResponse.success(related);
    }

    @GetMapping("/recent")
    public ApiResponse<Object> getRecent() {
        return ApiResponse.success(blogRepository.findTop10ByStatusOrderByPublishedAtDesc("PUBLISHED"));
    }

    @GetMapping("/tag/{tag}")
    public ApiResponse<Object> getByTag(@PathVariable String tag) {
        if (tag == null || tag.isBlank()) {
            return ApiResponse.success(Collections.emptyList());
        }
        return ApiResponse.success(blogRepository.findTop10ByStatusAndTagsContainingIgnoreCaseOrderByPublishedAtDesc("PUBLISHED", tag, PageRequest.of(0, 10)));
    }
}
