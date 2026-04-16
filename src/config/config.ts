export const TARGET_FRAME_MS = 1000 / 60;

export const ANNOUNCEMENT_DELAY_MS = 2000;

// dev-only — shows a marker at the gun muzzle position to verify bullet alignment
export const debug = { showGunMuzzle: false };

// frameSkip: render every Nth update frame. 1 = render every frame (no throttle).
// Values above 1 reduce render frequency, decoupling it from the update rate.
// showFps: display current, min and max FPS on screen.
export const renderConfig = { frameSkip: 2, showFps: true };
