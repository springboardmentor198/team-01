package com.realestate.duediligence.controller;

import com.realestate.duediligence.service.external.GovernmentApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/government")
@CrossOrigin(origins = "*")
public class GovernmentController {

    @Autowired
    private GovernmentApiService governmentApiService;

    @GetMapping("/verify/{propertyCode}")
    public Map<String, Object> verify(@PathVariable String propertyCode) {

        return governmentApiService.verifyProperty(propertyCode);

    }
}