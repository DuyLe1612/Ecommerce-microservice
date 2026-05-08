package com.example.product.domain.model.blog;

public class BlogPost {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private String status; // DRAFT, PUBLISHED

    public void publish() {
        this.status = "PUBLISHED";
    }

    public void unpublish() {
        this.status = "DRAFT";
    }
}
