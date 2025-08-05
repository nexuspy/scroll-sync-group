export interface ScrollSyncOptions {
  /** Sync horizontal scrolling (default: true) */
  horizontal?: boolean;
  /** Sync vertical scrolling (default: true) */
  vertical?: boolean;
  /** Debounce delay in milliseconds (default: 0) */
  debounceMs?: number;
  /** Throttle delay in milliseconds (default: 0) */
  throttleMs?: number;
  /** Custom scroll ratio multiplier (default: 1) */
  scrollRatio?: number;
  /** Enable smooth scrolling (default: false) */
  smooth?: boolean;
}

interface ScrollGroupData {
  elements: Set<HTMLElement>;
  options: Required<ScrollSyncOptions>;
  isPaused: boolean;
  listeners: Map<HTMLElement, (event: Event) => void>;
  activeElement?: HTMLElement;
}

type ScrollGroupMap = Map<string, ScrollGroupData>;

const scrollGroups: ScrollGroupMap = new Map();
const DEFAULT_OPTIONS: Required<ScrollSyncOptions> = {
  horizontal: true,
  vertical: true,
  debounceMs: 0,
  throttleMs: 0,
  scrollRatio: 1,
  smooth: false
};

// Utility functions for performance optimization
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: number;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  }) as T;
}

function throttle<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let lastCall = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  }) as T;
}

/**
 * Add an element to a scroll sync group with advanced options
 */
export function addToScrollGroup(
  el: HTMLElement, 
  groupId: string, 
  options: ScrollSyncOptions = {}
): void {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  if (!scrollGroups.has(groupId)) {
    scrollGroups.set(groupId, {
      elements: new Set(),
      options: mergedOptions,
      isPaused: false,
      listeners: new Map()
    });
  }

  const group = scrollGroups.get(groupId)!;
  group.elements.add(el);
  
  // Create optimized scroll handler
  let scrollHandler = (event: Event) => {
    if (group.isPaused) return;
    syncScroll(el, groupId, event);
  };

  // Apply performance optimizations
  if (mergedOptions.debounceMs > 0) {
    scrollHandler = debounce(scrollHandler, mergedOptions.debounceMs);
  } else if (mergedOptions.throttleMs > 0) {
    scrollHandler = throttle(scrollHandler, mergedOptions.throttleMs);
  }

  group.listeners.set(el, scrollHandler);
  el.addEventListener('scroll', scrollHandler, { passive: true });
  
  // Store scroll sync options as data attributes for inspection
  el.dataset.scrollSyncGroup = groupId;
  el.dataset.scrollSyncOptions = JSON.stringify(mergedOptions);
}

/**
 * Remove an element from a scroll sync group
 */
export function removeFromScrollGroup(el: HTMLElement, groupId: string): void {
  const group = scrollGroups.get(groupId);
  if (!group) return;

  group.elements.delete(el);
  
  const listener = group.listeners.get(el);
  if (listener) {
    el.removeEventListener('scroll', listener);
    group.listeners.delete(el);
  }
  
  // Clean up data attributes
  delete el.dataset.scrollSyncGroup;
  delete el.dataset.scrollSyncOptions;
  
  // Clean up empty groups
  if (group.elements.size === 0) {
    scrollGroups.delete(groupId);
  }
}

/**
 * Pause scroll synchronization for a group
 */
export function pauseScrollGroup(groupId: string): void {
  const group = scrollGroups.get(groupId);
  if (group) {
    group.isPaused = true;
  }
}

/**
 * Resume scroll synchronization for a group
 */
export function resumeScrollGroup(groupId: string): void {
  const group = scrollGroups.get(groupId);
  if (group) {
    group.isPaused = false;
  }
}

/**
 * Check if a scroll group is paused
 */
export function isScrollGroupPaused(groupId: string): boolean {
  const group = scrollGroups.get(groupId);
  return group ? group.isPaused : false;
}

/**
 * Get all elements in a scroll group
 */
export function getScrollGroupElements(groupId: string): HTMLElement[] {
  const group = scrollGroups.get(groupId);
  return group ? Array.from(group.elements) : [];
}

/**
 * Get all scroll group IDs
 */
export function getAllScrollGroups(): string[] {
  return Array.from(scrollGroups.keys());
}

/**
 * Destroy a scroll group and clean up all listeners
 */
export function destroyScrollGroup(groupId: string): void {
  const group = scrollGroups.get(groupId);
  if (!group) return;

  group.elements.forEach(el => {
    const listener = group.listeners.get(el);
    if (listener) {
      el.removeEventListener('scroll', listener);
    }
    delete el.dataset.scrollSyncGroup;
    delete el.dataset.scrollSyncOptions;
  });
  
  scrollGroups.delete(groupId);
}

/**
 * Destroy all scroll groups
 */
export function destroyAllScrollGroups(): void {
  const groupIds = Array.from(scrollGroups.keys());
  groupIds.forEach(groupId => destroyScrollGroup(groupId));
}

/**
 * Manually trigger scroll sync for a group
 */
export function triggerScrollSync(groupId: string, sourceElement?: HTMLElement): void {
  const group = scrollGroups.get(groupId);
  if (!group || group.isPaused) return;
  
  const source = sourceElement || group.activeElement || group.elements.values().next().value;
  if (source) {
    syncScroll(source, groupId);
  }
}

/**
 * Update options for an existing scroll group
 */
export function updateScrollGroupOptions(groupId: string, options: ScrollSyncOptions): void {
  const group = scrollGroups.get(groupId);
  if (!group) return;
  
  group.options = { ...group.options, ...options };
  
  // Update data attributes for all elements
  group.elements.forEach(el => {
    el.dataset.scrollSyncOptions = JSON.stringify(group.options);
  });
}

/**
 * Core scroll synchronization logic
 */
function syncScroll(sourceEl: HTMLElement, groupId: string, event?: Event): void {
  const group = scrollGroups.get(groupId);
  if (!group || group.isPaused) return;

  const { scrollTop, scrollLeft } = sourceEl;
  const { horizontal, vertical, scrollRatio, smooth } = group.options;
  
  // Track the active element
  group.activeElement = sourceEl;
  
  // Calculate adjusted scroll positions
  const adjustedScrollTop = scrollTop * scrollRatio;
  const adjustedScrollLeft = scrollLeft * scrollRatio;

  group.elements.forEach(el => {
    if (el === sourceEl) return;
    
    // Apply smooth scrolling if enabled
    if (smooth) {
      const scrollOptions: ScrollToOptions = { behavior: 'smooth' };
      
      if (vertical && horizontal) {
        el.scrollTo({
          top: adjustedScrollTop,
          left: adjustedScrollLeft,
          ...scrollOptions
        });
      } else if (vertical) {
        el.scrollTo({ top: adjustedScrollTop, ...scrollOptions });
      } else if (horizontal) {
        el.scrollTo({ left: adjustedScrollLeft, ...scrollOptions });
      }
    } else {
      // Direct assignment for better performance
      if (vertical) el.scrollTop = adjustedScrollTop;
      if (horizontal) el.scrollLeft = adjustedScrollLeft;
    }
  });
  
  // Emit custom event for external listeners
  const syncEvent = new CustomEvent('scrollsync', {
    detail: { groupId, sourceElement: sourceEl, scrollTop, scrollLeft }
  });
  sourceEl.dispatchEvent(syncEvent);
}

// ScrollSyncOptions is already exported via the interface declaration above

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', destroyAllScrollGroups);
}
