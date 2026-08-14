package com.realestate.duediligence.service;

import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.ThreadMXBean;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.stereotype.Service;

import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.Meter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;

@Service
public class AdminSystemService {

    private final DataSource dataSource;
    private final MeterRegistry meterRegistry;

    public AdminSystemService(
            DataSource dataSource,
            MeterRegistry meterRegistry
    ) {
        this.dataSource = dataSource;
        this.meterRegistry = meterRegistry;
    }

    // =========================
    // HEALTH
    // =========================

    public Map<String, Object> getHealth() {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("application", "UP");
        response.put("database", checkDatabase());

        String overallStatus =
                "UP".equals(response.get("database"))
                        ? "UP"
                        : "DOWN";

        response.put("status", overallStatus);

        return response;
    }

    private String checkDatabase() {

        try (Connection connection =
                     dataSource.getConnection()) {

            if (connection.isValid(2)) {
                return "UP";
            }

            return "DOWN";

        } catch (Exception e) {
            return "DOWN";
        }
    }

    // =========================
    // METRICS
    // =========================

    public Map<String, Object> getMetrics() {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("cpu", getCpuMetrics());
        response.put("memory", getMemoryMetrics());
        response.put("jvm", getJvmMetrics());

        return response;
    }

    // =========================
    // API PERFORMANCE
    // =========================

    public Map<String, Object> getApiPerformance() {

        Collection<Timer> timers =
                meterRegistry
                        .find("http.server.requests")
                        .timers();

        List<Map<String, Object>> apis =
                new ArrayList<>();

        List<Map<String, Object>> slowApis =
                new ArrayList<>();

        long totalRequests = 0;
        long errorRequests = 0;

        /*
         * API is considered slow when
         * average response time is greater than 1 second.
         */
        final double SLOW_API_THRESHOLD_MS = 1000.0;

        for (Timer timer : timers) {

            if (timer.count() == 0) {
                continue;
            }

            String uri =
                    getTag(timer, "uri");

            String method =
                    getTag(timer, "method");

            String status =
                    getTag(timer, "status");

            long requestCount =
                    timer.count();

            double averageResponseTime =
                    timer.mean(
                            java.util.concurrent.TimeUnit.MILLISECONDS
                    );

            double totalResponseTime =
                    timer.totalTime(
                            java.util.concurrent.TimeUnit.MILLISECONDS
                    );

            Map<String, Object> api =
                    new LinkedHashMap<>();

            api.put(
                    "uri",
                    uri
            );

            api.put(
                    "method",
                    method
            );

            api.put(
                    "status",
                    status
            );

            api.put(
                    "requestCount",
                    requestCount
            );

            api.put(
                    "averageResponseTimeMs",
                    Math.round(
                            averageResponseTime * 100.0
                    ) / 100.0
            );

            api.put(
                    "totalResponseTimeMs",
                    Math.round(
                            totalResponseTime * 100.0
                    ) / 100.0
            );

            apis.add(api);

            // Total requests
            totalRequests += requestCount;

            // Error requests
            if (isErrorStatus(status)) {
                errorRequests += requestCount;
            }

            // Slow APIs
            if (averageResponseTime >
                    SLOW_API_THRESHOLD_MS) {

                slowApis.add(api);
            }
        }

        // =========================
        // ERROR RATE
        // =========================

        double errorRate =
                totalRequests > 0
                        ? (errorRequests * 100.0)
                        / totalRequests
                        : 0.0;

        // =========================
        // SUMMARY
        // =========================

        Map<String, Object> summary =
                new LinkedHashMap<>();

        summary.put(
                "totalRequests",
                totalRequests
        );

        summary.put(
                "errorRequests",
                errorRequests
        );

        summary.put(
                "errorRatePercentage",
                Math.round(
                        errorRate * 100.0
                ) / 100.0
        );

        summary.put(
                "slowApiThresholdMs",
                SLOW_API_THRESHOLD_MS
        );

        // =========================
        // FINAL RESPONSE
        // =========================

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "summary",
                summary
        );

        response.put(
                "apis",
                apis
        );

        response.put(
                "slowApis",
                slowApis
        );

        return response;
    }

    // =========================
    // ERROR STATUS CHECK
    // =========================

    private boolean isErrorStatus(String status) {

        if (status == null) {
            return false;
        }

        try {

            int statusCode =
                    Integer.parseInt(status);

            return statusCode >= 400;

        } catch (NumberFormatException e) {

            return false;
        }
    }

    // =========================
    // GET TIMER TAG
    // =========================

    private String getTag(
            Timer timer,
            String tagName
    ) {

        return timer.getId()
                .getTags()
                .stream()
                .filter(
                        tag -> tag.getKey()
                                .equals(tagName)
                )
                .map(
                        tag -> tag.getValue()
                )
                .findFirst()
                .orElse(null);
    }

    // =========================
    // CPU
    // =========================

    private Map<String, Object> getCpuMetrics() {

        Map<String, Object> cpu =
                new LinkedHashMap<>();

        Gauge systemCpu =
                meterRegistry
                        .find("system.cpu.usage")
                        .gauge();

        Gauge processCpu =
                meterRegistry
                        .find("process.cpu.usage")
                        .gauge();

        Double systemCpuUsage =
                systemCpu != null
                        ? systemCpu.value() * 100
                        : null;

        Double processCpuUsage =
                processCpu != null
                        ? processCpu.value() * 100
                        : null;

        cpu.put(
                "systemCpuUsagePercentage",
                systemCpuUsage
        );

        cpu.put(
                "processCpuUsagePercentage",
                processCpuUsage
        );

        return cpu;
    }

    // =========================
    // MEMORY
    // =========================

    private Map<String, Object> getMemoryMetrics() {

        Runtime runtime =
                Runtime.getRuntime();

        long totalMemory =
                runtime.totalMemory();

        long freeMemory =
                runtime.freeMemory();

        long usedMemory =
                totalMemory - freeMemory;

        long maxMemory =
                runtime.maxMemory();

        double usedPercentage =
                maxMemory > 0
                        ? (usedMemory * 100.0)
                        / maxMemory
                        : 0;

        Map<String, Object> memory =
                new LinkedHashMap<>();

        memory.put(
                "usedBytes",
                usedMemory
        );

        memory.put(
                "totalBytes",
                totalMemory
        );

        memory.put(
                "maxBytes",
                maxMemory
        );

        memory.put(
                "usedPercentage",
                Math.round(
                        usedPercentage * 100.0
                ) / 100.0
        );

        return memory;
    }

    // =========================
    // JVM
    // =========================

    private Map<String, Object> getJvmMetrics() {

        MemoryMXBean memoryMXBean =
                ManagementFactory
                        .getMemoryMXBean();

        ThreadMXBean threadMXBean =
                ManagementFactory
                        .getThreadMXBean();

        long heapUsed =
                memoryMXBean
                        .getHeapMemoryUsage()
                        .getUsed();

        long heapMax =
                memoryMXBean
                        .getHeapMemoryUsage()
                        .getMax();

        long nonHeapUsed =
                memoryMXBean
                        .getNonHeapMemoryUsage()
                        .getUsed();

        Map<String, Object> jvm =
                new LinkedHashMap<>();

        jvm.put(
                "heapUsedBytes",
                heapUsed
        );

        jvm.put(
                "heapMaxBytes",
                heapMax
        );

        jvm.put(
                "nonHeapUsedBytes",
                nonHeapUsed
        );

        jvm.put(
                "activeThreads",
                threadMXBean.getThreadCount()
        );

        jvm.put(
                "peakThreads",
                threadMXBean.getPeakThreadCount()
        );

        return jvm;
    }

    // =========================
    // LOGS
    // =========================

    public List<String> getLogs() {

        Path logFile =
                Paths.get(
                        "logs/due-diligence-agent.log"
                );

        try {

            if (!Files.exists(logFile)) {

                return List.of(
                        "Log file does not exist yet."
                );
            }

            List<String> allLogs =
                    Files.readAllLines(logFile);

            int totalLogs =
                    allLogs.size();

            /*
             * Return only the latest 100 log entries.
             */
            int startIndex =
                    Math.max(
                            0,
                            totalLogs - 100
                    );

            return allLogs.subList(
                    startIndex,
                    totalLogs
            );

        } catch (IOException e) {

            return List.of(
                    "Unable to read application logs: "
                            + e.getMessage()
            );
        }
    }

    // =========================
    // CACHE
    // =========================

    public Map<String, Object> getCacheMetrics() {

        Map<String, Object> response =
                new LinkedHashMap<>();

        List<Map<String, Object>> caches =
                new ArrayList<>();

        double totalHits = 0;
        double totalMisses = 0;

        /*
         * Find all meters whose name starts
         * with "cache".
         */
        for (Meter meter : meterRegistry.getMeters()) {

            String meterName =
                    meter.getId().getName();

            if (!meterName.startsWith("cache")) {
                continue;
            }

            Map<String, Object> cache =
                    new LinkedHashMap<>();

            String cacheName =
                    getMeterTag(
                            meter.getId(),
                            "name"
                    );

            String cacheManager =
                    getMeterTag(
                            meter.getId(),
                            "cacheManager"
                    );

            String result =
                    getMeterTag(
                            meter.getId(),
                            "result"
                    );

            cache.put(
                    "cacheName",
                    cacheName
            );

            cache.put(
                    "cacheManager",
                    cacheManager
            );

            cache.put(
                    "metric",
                    meterName
            );

            /*
             * Handle cache gauges.
             */
            if (meter instanceof Gauge gauge) {

                cache.put(
                        "value",
                        gauge.value()
                );
            }

            /*
             * Handle cache timers.
             */
            if (meter instanceof Timer timer) {

                cache.put(
                        "count",
                        timer.count()
                );

                cache.put(
                        "averageTimeMs",
                        Math.round(
                                timer.mean(
                                        java.util.concurrent.TimeUnit.MILLISECONDS
                                ) * 100.0
                        ) / 100.0
                );
            }

            /*
             * Read hit/miss values when the
             * cache meter exposes them.
             */
            if ("hit".equalsIgnoreCase(result)) {

                Double value =
                        getMeterValue(meter);

                if (value != null) {
                    totalHits += value;
                }
            }

            if ("miss".equalsIgnoreCase(result)) {

                Double value =
                        getMeterValue(meter);

                if (value != null) {
                    totalMisses += value;
                }
            }

            caches.add(cache);
        }

        // =========================
        // HIT RATE
        // =========================

        double totalRequests =
                totalHits + totalMisses;

        double hitRate =
                totalRequests > 0
                        ? (totalHits * 100.0)
                        / totalRequests
                        : 0.0;

        // =========================
        // NO CACHE
        // =========================

        if (caches.isEmpty()) {

            response.put(
                    "status",
                    "NOT_CONFIGURED"
            );

            response.put(
                    "message",
                    "No cache metrics are currently available."
            );

            response.put(
                    "totalHits",
                    0
            );

            response.put(
                    "totalMisses",
                    0
            );

            response.put(
                    "hitRatePercentage",
                    0.0
            );

            response.put(
                    "caches",
                    caches
            );

            return response;
        }

        // =========================
        // CACHE AVAILABLE
        // =========================

        response.put(
                "status",
                "UP"
        );

        response.put(
                "totalHits",
                totalHits
        );

        response.put(
                "totalMisses",
                totalMisses
        );

        response.put(
                "hitRatePercentage",
                Math.round(
                        hitRate * 100.0
                ) / 100.0
        );

        response.put(
                "caches",
                caches
        );

        return response;
    }

    // =========================
    // GET METER TAG
    // =========================

    private String getMeterTag(
            Meter.Id meterId,
            String tagName
    ) {

        return meterId
                .getTags()
                .stream()
                .filter(
                        tag -> tag.getKey()
                                .equals(tagName)
                )
                .map(
                        tag -> tag.getValue()
                )
                .findFirst()
                .orElse(null);
    }

    // =========================
    // GET METER VALUE
    // =========================

    private Double getMeterValue(Meter meter) {

        if (meter instanceof Gauge gauge) {
            return gauge.value();
        }

        /*
         * Counter and FunctionCounter both
         * expose their count through Meter.Id
         * and can be safely read using the
         * specialized interfaces below.
         */

        if (meter instanceof io.micrometer.core.instrument.Counter counter) {
            return counter.count();
        }

        if (meter instanceof io.micrometer.core.instrument.FunctionCounter functionCounter) {
            return functionCounter.count();
        }

        return null;
    }
}