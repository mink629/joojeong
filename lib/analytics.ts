import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let initialized = false;

function ensureInit() {
  if (initialized || !MIXPANEL_TOKEN) return;
  mixpanel.init(MIXPANEL_TOKEN, {
    track_pageview: false,
    persistence: "localStorage",
  });
  initialized = true;
}

export function trackPageView(pathname: string) {
  ensureInit();
  if (!initialized) return;
  mixpanel.track("Page View", { page: pathname });
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
  ensureInit();
  if (!initialized) return;
  mixpanel.track(name, props);
}
