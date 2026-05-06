package com.example.product.application.util;

public final class SlugUtil {
    private SlugUtil() {}

    public static String slugify(String input) {
        if (input == null) {
            return null;
        }
        String slug = input.trim().toLowerCase();
        slug = slug.replaceAll("[^a-z0-9]+", "-");
        slug = slug.replaceAll("^-+|-+$", "");
        return slug;
    }
}
