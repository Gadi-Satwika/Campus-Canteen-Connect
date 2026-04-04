export const checkFoodStatus = (item) => {
    const hour = new Date().getHours();
    
    // 1. ADMIN KILL-SWITCH: If Admin marked isAvailable = false, it's GONE.
    if (!item.isAvailable) return { canOrder: false, reason: "Sold Out" };

    // 2. ADMIN FORCE: If mode is 'Force Available', ignore the clock.
    if (item.availabilityMode === 'Force Available') return { canOrder: true, reason: "" };

    // 3. AUTO TIME-LOGIC:
    const timings = {
        'Breakfast': { start: 7, end: 11 }, // 7 AM - 11 AM
        'Lunch':     { start: 12, end: 15 }, // 12 PM - 3 PM
        'Snacks':    { start: 16, end: 21 }  // 4 PM - 9 PM
    };

    const window = timings[item.category];
    if (window) {
        if (hour >= window.start && hour < window.end) {
            return { canOrder: true, reason: "" };
        } else {
            return { canOrder: false, reason: `Starts at ${window.start}:00` };
        }
    }

    return { canOrder: true, reason: "" };
};