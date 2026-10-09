package com.safecity.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    /**
     * Forwards non-API, non-h2-console, non-static asset routes to index.html
     * for React Router client-side routing.
     */
    @GetMapping(value = {
        "/",
        "/{path:^(?!api|h2-console|assets|uploads|.*\\..*$).*}",
        "/{path:^(?!api|h2-console|assets|uploads|.*\\..*$).*}/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
