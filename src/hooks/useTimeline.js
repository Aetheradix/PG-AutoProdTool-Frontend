import { useMemo } from 'react';

/**
 * Shared hook for timeline-based visualizations (Gantt, Tank Timeline).
 * Handles time range calculation, label generation, and lane assignment.
 */
export const useTimeline = (tasks = []) => {
    const { timelineItems, timelineStart, timelineEnd, timeLabels, totalDurationHrs } = useMemo(() => {
        let minTime = Infinity;
        let maxTime = -Infinity;
        const allItems = [];

        // Extract all items and find global time range
        tasks.forEach((resource) => {
            if (!resource.items) return;
            resource.items.forEach((item) => {
                const start = new Date(item.start_time).getTime();
                const end = new Date(item.end_time).getTime();
                if (start < minTime) minTime = start;
                if (end > maxTime) maxTime = end;
                allItems.push({ ...item, start, end });
            });
        });

        if (allItems.length === 0) {
            return {
                timelineItems: [],
                timelineStart: 0,
                timelineEnd: 0,
                timeLabels: [],
                totalDurationHrs: 1,
            };
        }

        // Round start down to nearest hour
        const start = new Date(minTime);
        start.setMinutes(0, 0, 0);
        const timelineStart = start.getTime();

        // Round end up to nearest hour
        const end = new Date(maxTime);
        end.setMinutes(0, 0, 0);
        if (end.getTime() < maxTime) {
            end.setHours(end.getHours() + 1);
        }
        const timelineEnd = end.getTime();

        const durationMs = timelineEnd - timelineStart;
        const totalDurationHrs = durationMs / (1000 * 60 * 60);

        // Generate labels for each hour
        const labels = [];
        for (let i = 0; i <= totalDurationHrs; i++) {
            const time = new Date(timelineStart + i * 3600000);
            labels.push({
                label: `${time.getHours()}:00`,
                fullDate: time.toLocaleString(),
                isNewDay: time.getHours() === 0 && i !== 0,
                timestamp: time.getTime(),
            });
        }

        return {
            timelineItems: allItems,
            timelineStart,
            timelineEnd,
            timeLabels: labels,
            totalDurationHrs,
        };
    }, [tasks]);

    /**
     * Assigns lanes to items within a resource to prevent visual overlapping.
     */
    const tasksWithLanes = useMemo(() => {
        return tasks.map((resourceRow) => {
            const resourceItems = timelineItems
                .filter((item) => resourceRow.items?.some((ri) => ri.id === item.id))
                .sort((a, b) => a.start - b.start);

            const lanes = []; // Stores the end time of the last item in each lane
            const itemsWithLanes = resourceItems.map((item) => {
                let laneIndex = 0;

                // Find the first lane that ends before this item starts
                while (laneIndex < lanes.length && lanes[laneIndex] > item.start) {
                    laneIndex++;
                }

                if (laneIndex === lanes.length) {
                    lanes.push(item.end);
                } else {
                    lanes[laneIndex] = item.end;
                }

                return { ...item, laneIndex };
            });

            return {
                ...resourceRow,
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
