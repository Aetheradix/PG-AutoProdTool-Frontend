import { useMemo } from 'react';

/**
 * Shared hook for timeline-based visualizations (Gantt, Tank Timeline).
 * Handles time range calculation, label generation, and lane assignment.
 */
export const useTimeline = (tasks = [], filterRange = null, stepMinutes = 60) => {
    const { timelineItems, timelineStart, timelineEnd, timeLabels, totalDurationHrs } = useMemo(() => {
        let minTime = Infinity;
        let maxTime = -Infinity;
        const allItemsMap = new Map();

        // Extract all items and find global time range
        tasks.forEach((resource) => {
            if (!resource.items) return;
            resource.items.forEach((item) => {
                const start = new Date(item.start_time).getTime();
                const end = new Date(item.end_time).getTime();
                if (start < minTime) minTime = start;
                if (end > maxTime) maxTime = end;
                
                // Only add to global units list once per ID
                if (!allItemsMap.has(item.id)) {
                    allItemsMap.set(item.id, { ...item, start, end });
                }
            });
        });

        const allItems = Array.from(allItemsMap.values());

        if (allItems.length === 0 && !filterRange) {
            return {
                timelineItems: [],
                timelineStart: 0,
                timelineEnd: 0,
                timeLabels: [],
                totalDurationHrs: 1,
            };
        }

        // Use filter range if provided, otherwise calculate from data
        let finalMinTime = filterRange?.start ? new Date(filterRange.start).getTime() : minTime;
        let finalMaxTime = filterRange?.end ? new Date(filterRange.end).getTime() : maxTime;

        // Fallback for empty data with filterRange
        if (allItems.length === 0 && filterRange) {
            finalMinTime = new Date(filterRange.start).getTime();
            finalMaxTime = new Date(filterRange.end).getTime();
        }

        // Round start down to nearest hour
        const start = new Date(finalMinTime);
        start.setMinutes(0, 0, 0);
        const timelineStart = start.getTime();

        // Round end up to nearest hour
        const end = new Date(finalMaxTime);
        end.setMinutes(0, 0, 0);
        if (end.getTime() < finalMaxTime) {
            end.setHours(end.getHours() + 1);
        }
        const timelineEnd = end.getTime();

        const durationMs = timelineEnd - timelineStart;
        const totalDurationHrs = durationMs / (1000 * 60 * 60);

        // Generate labels for each step (default 60 mins)
        const stepMs = stepMinutes * 60 * 1000;
        const totalSteps = durationMs / stepMs;
        const labels = [];
        for (let i = 0; i <= totalSteps; i++) {
            const time = new Date(timelineStart + i * stepMs);
            labels.push({
                label: `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`,
                fullDate: time.toLocaleString(),
                isNewDay: time.getHours() === 0 && time.getMinutes() === 0 && i !== 0,
                timestamp: time.getTime(),
            });
        }

        const filteredItems = filterRange 
            ? allItems.filter(item => item.start < timelineEnd && item.end > timelineStart)
            : allItems;

        return {
            timelineItems: filteredItems,
            timelineStart,
            timelineEnd,
            timeLabels: labels,
            totalDurationHrs,
        };
    }, [tasks, filterRange, stepMinutes]);

    /**
     * Assigns lanes to items within a resource to prevent visual overlapping.
     */
    const tasksWithLanes = useMemo(() => {
        return tasks.map((resourceRow) => {
            const isDualResource = resourceRow.resource && /FMT\s*\+\s*MMT/.test(resourceRow.resource);
            
            const rawItems = timelineItems
                .filter((item) => resourceRow.items?.some((ri) => ri.id === item.id))
                .sort((a, b) => a.start - b.start);

            const lanes = [];
            const itemsWithLanes = rawItems.map((item) => {
                let laneIndex = 0;
                while (laneIndex < lanes.length && lanes[laneIndex] > item.start) {
                    laneIndex++;
                }
                if (laneIndex === lanes.length) lanes.push(item.end);
                else lanes[laneIndex] = item.end;

                const isDualBlock = item.tech_type === 'Dual' || (item.tech_type !== 'Single' && isDualResource);

                return { 
                    ...item, 
                    laneIndex, 
                    isDualBlock,
                    isDualRow: isDualResource
                };
            });

            return {
                ...resourceRow,
                isDualRow: isDualResource,
                items: itemsWithLanes,
                totalLanes: Math.max(lanes.length, 1)
            };
        });
    }, [tasks, timelineItems]);

    /**
     * Calculates the left percentage position for a given timestamp.
     */
    const getPosition = (time) => {
        if (timelineEnd === timelineStart) return 0;
        return ((time - timelineStart) / (timelineEnd - timelineStart)) * 100;
    };

    return {
        tasksWithLanes,
        timeLabels,
        timelineStart,
        timelineEnd,
        totalDurationHrs,
        getPosition,
    };
};
