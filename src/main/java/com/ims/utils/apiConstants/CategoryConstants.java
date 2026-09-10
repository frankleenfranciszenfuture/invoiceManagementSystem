package com.ims.utils.apiConstants;

public final class CategoryConstants {

    // Success Messages
    public static final String CREATED =
            "Category created successfully.";
    public static final String UPDATED =
            "Category updated successfully.";
    public static final String DELETED =
            "Category deleted successfully.";
    public static final String FOUND =
            "Category retrieved successfully.";
    public static final String LIST =
            "Categories retrieved successfully.";
    public static final String SEARCH =
            "Search completed successfully.";
    // Error Messages
    public static final String NOT_FOUND =
            "Category not found.";
    public static final String DUPLICATE_NAME =
            "Category name already exists.";
    public static final String DUPLICATE_CODE =
            "Category code already exists.";
    public static final String NO_RECORDS =
            "No categories found.";

    private CategoryConstants() {
        // Prevent Instantiation
    }

}
