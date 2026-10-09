package com.safecity.dto;

public class SafetyTipDTO {

    private String id;
    private String title;
    private String category;
    private String tip;
    private String iconSymbol;

    public SafetyTipDTO() {}

    public SafetyTipDTO(String id, String title, String category, String tip, String iconSymbol) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.tip = tip;
        this.iconSymbol = iconSymbol;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTip() {
        return tip;
    }

    public void setTip(String tip) {
        this.tip = tip;
    }

    public String getIconSymbol() {
        return iconSymbol;
    }

    public void setIconSymbol(String iconSymbol) {
        this.iconSymbol = iconSymbol;
    }
}
