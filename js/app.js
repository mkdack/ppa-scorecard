// ═══════════════════════════════════════════════════════════════
// PPA DEAL SCORECARD - MAIN APPLICATION
// ═══════════════════════════════════════════════════════════════

// State management
let currentFilter = 'all';
let expandedRow = null;
let sliderValues = {};
let isDragging = false;
let currentDragRow = null;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initSliders();
  renderScorecard();
  updateSummary();
  
  // Load theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeButton(true);
  }
});

// ═══════════════════════════════════════════════════════════════
// RENDER SCORECARD
// ═══════════════════════════════════════════════════════════════

function renderScorecard(forceRefresh = false) {
  const container = document.getElementById('scorecardContainer');
  
  // Clear container for fresh render
  container.innerHTML = '';
  
  console.log('Rendering scorecard with', Object.keys(sliderValues).length, 'term values');
  
  SCORECARD_GROUPS.forEach(group => {
    // Create group header
    const header = document.createElement('div');
    header.className = 'group-header';
    header.id = `grp-${group.id}`;
    header.innerHTML = `
      <div class="group-title">${group.title}</div>
      <div class="group-line"></div>
      ${group.id === 'pricing' ? '<div class="drag-hint">↔ drag sliders to simulate negotiation</div>' : ''}
    `;
    container.appendChild(header);
    
    // Create scorecard container for this group
    const scorecard = document.createElement('div');
    scorecard.className = 'scorecard';
    scorecard.dataset.group = group.id;
    
    // Render each term in the group
    group.terms.forEach((termId, index) => {
      const meta = TERM_META[termId];
      const pos = sliderValues[termId] !== undefined ? sliderValues[termId] : meta.defaultPos;
      const zone = getZone(pos);
      
      const row = createTermRow(termId, meta, pos, zone, index);
      scorecard.appendChild(row);
    });
    
    container.appendChild(scorecard);
  });
  
  applyFilter(currentFilter);
}

function createTermRow(termId, meta, pos, zone, index) {
  const row = document.createElement('div');
  row.className = `scorecard-row p-${zone.priority}`;
  row.dataset.priority = zone.priority;
  row.dataset.group = meta.group;
  row.dataset.term = termId;
  row.id = `row-${termId}`;
  row.style.animationDelay = `${index * 0.05}s`;
  
  const content = getTermContent(termId, pos);
  
  const flexibilityBadge = meta.flexibility === 'inflexible' 
    ? `<span class="flex-badge inflex" title="Buyer Inflexible">🔒 BUYER INFLEXIBLE</span>` 
    : `<span class="flex-badge flex" title="Buyer Flexible">🔄 BUYER FLEXIBLE</span>`;
  
  row.innerHTML = `
    <div class="row-main" onclick="toggleRow('${termId}')">
      <div class="pi pi-${zone.priority}">${meta.icon}</div>
      <div class="row-label">
        <div class="row-name">${meta.name} ${flexibilityBadge}</div>
        <div class="row-cat">${meta.category}</div>
        ${meta.exposure ? `<div class="row-exposure">${meta.exposure}</div>` : ''}
      </div>
      <div class="slider-wrap" onclick="event.stopPropagation()">
        <div class="slider-track" id="track-${termId}" data-term="${termId}">
          <div class="slider-zones">
            <div class="z1"></div>
            <div class="z2"></div>
            <div class="z3"></div>
            <div class="z4"></div>
          </div>
          <div class="slider-indicator ${zone.indClass}" id="ind-${termId}" style="left: ${pos}%"></div>
          <div class="zone-tooltip" id="tip-${termId}"></div>
        </div>
        <div class="slider-labels">
          <span class="sl">BUYER-FAVORABLE</span>
          <span class="sl">AT MARKET</span>
          <span class="sl">SELLER-FAVORABLE</span>
          <span class="sl">RED FLAG</span>
        </div>
      </div>
      <div class="row-badge">
        <div class="badge ${zone.badgeClass}" id="badge-${termId}">${zone.badgeText}</div>
      </div>
      <div class="chevron">▼</div>
    </div>
    <div class="expand-panel" id="panel-${termId}">
      <div class="expand-grid">
        <div class="ex-block">
          <div class="ex-label">Deal Term</div>
          <div class="ex-value" id="term-${termId}">${content.term}</div>
          <div class="ex-label" style="margin-top:10px">Market Benchmark</div>
          <div class="ex-value" id="bench-${termId}">${content.bench || 'Standard market terms apply for this provision.'}</div>
        </div>
        <div class="ex-block">
          <div class="impact-box ${zone.impClass}" id="impactbox-${termId}">
            <div>
              <div class="ib-main" id="impact-${termId}">${content.impact}</div>
              <div class="ib-sub" id="impactsub-${termId}">${content.impactsub}</div>
            </div>
          </div>
          <div class="rec-bar">
            <span class="rec-label" id="reclabel-${termId}">${content.reclabel}</span>
            <div class="rec-text" id="rec-${termId}">${content.rec}</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Attach slider events
  setTimeout(() => {
    attachSliderEvents(termId);
  }, 0);
  
  return row;
}

function getTermContent(termId, pos) {
  if (CONTENT[termId] && CONTENT[termId].getContent) {
    return CONTENT[termId].getContent(pos);
  }
  return generateSimpleContent(termId, pos);
}

// ═══════════════════════════════════════════════════════════════
// SLIDER INTERACTION
// ═══════════════════════════════════════════════════════════════

function attachSliderEvents(termId) {
  console.log(`Attaching slider events for ${termId}`);
  const track = document.getElementById(`track-${termId}`);
  const indicator = document.getElementById(`ind-${termId}`);
  const tooltip = document.getElementById(`tip-${termId}`);
  
  if (!track || !indicator) {
    console.error(`Missing elements for ${termId}: track=${!!track}, indicator=${!!indicator}`);
    return;
  }
  
  // Use requestAnimationFrame for smooth visual updates
  let rafId = null;
  let pendingClientX = null;
  
  const updateVisualPosition = (clientX) => {
    const rect = track.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    
    indicator.style.left = `${pct}%`;
    
    // Update badge color immediately for feedback
    const zone = getZone(pct);
    const badge = document.getElementById(`badge-${termId}`);
    if (badge) {
      badge.className = `badge ${zone.badgeClass}`;
      badge.textContent = zone.badgeText;
    }
    
    // Update row border color
    const row = document.getElementById(`row-${termId}`);
    if (row) {
      row.className = `scorecard-row p-${zone.priority}`;
      row.dataset.priority = zone.priority;
    }
    
    return pct;
  };
  
  const updatePosition = (clientX, updateStored = true) => {
    const pct = updateVisualPosition(clientX);
    if (updateStored) {
      sliderValues[termId] = pct;
      // Update summary counts only (not full content)
      updateSummary();
    }
    return pct;
  };
  
  const onMouseDown = (e) => {
    isDragging = true;
    currentDragRow = termId;
    updatePosition(e.clientX);
    e.preventDefault();
  };
  
  const onMouseMove = (e) => {
    if (!isDragging || currentDragRow !== termId) return;
    
    // Cancel any pending RAF
    if (rafId) cancelAnimationFrame(rafId);
    
    pendingClientX = e.clientX;
    rafId = requestAnimationFrame(() => {
      if (pendingClientX !== null) {
        // Update visual + stored value for live summary counts
        updatePosition(pendingClientX, true);
        pendingClientX = null;
      }
      rafId = null;
    });
  };
  
  const onMouseUp = () => {
    console.log(`onMouseUp called for ${termId}, isDragging=${isDragging}, currentDragRow=${currentDragRow}`);
    if (!isDragging || currentDragRow !== termId) {
      console.log(`Skipping onMouseUp for ${termId} - not dragging or wrong row`);
      return;
    }
    
    // Get final position and update full content only on release
    const pct = sliderValues[termId] || 0;
    console.log(`Calling updateTermDisplay for ${termId} at ${pct}`);
    updateTermDisplay(termId, pct);
    
    isDragging = false;
    currentDragRow = null;
  };
  
  track.addEventListener('mousedown', onMouseDown);
  indicator.addEventListener('mousedown', onMouseDown);
  track.addEventListener('mouseup', onMouseUp);
  indicator.addEventListener('mouseup', onMouseUp);
  
  // Touch events
  track.addEventListener('touchstart', (e) => {
    isDragging = true;
    currentDragRow = termId;
    updatePosition(e.touches[0].clientX);
  }, {passive: false});
  
  track.addEventListener('touchmove', (e) => {
    if (!isDragging || currentDragRow !== termId) return;
    
    if (rafId) cancelAnimationFrame(rafId);
    
    pendingClientX = e.touches[0].clientX;
    rafId = requestAnimationFrame(() => {
      if (pendingClientX !== null) {
        // Update visual + stored value for live summary counts
        updatePosition(pendingClientX, true);
        pendingClientX = null;
      }
      rafId = null;
    });
    
    e.preventDefault();
  }, {passive: false});
  
  track.addEventListener('touchend', onMouseUp, {passive: false});
  
  // Global mouse/touch up - handler uses currentDragRow, not closure
  if (!window._sliderEventsAttached) {
    window.addEventListener('mousemove', (e) => {
      if (!isDragging || !currentDragRow) return;
      // Find the slider that's being dragged and update it
      const track = document.getElementById(`track-${currentDragRow}`);
      if (track) {
        const rect = track.getBoundingClientRect();
        let pct = ((e.clientX - rect.left) / rect.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        const indicator = document.getElementById(`ind-${currentDragRow}`);
        if (indicator) indicator.style.left = `${pct}%`;
        sliderValues[currentDragRow] = pct;
      }
    });
    window.addEventListener('mouseup', () => {
      if (!isDragging || !currentDragRow) return;
      const pct = sliderValues[currentDragRow] || 0;
      updateTermDisplay(currentDragRow, pct);
      isDragging = false;
      currentDragRow = null;
    });
    window._sliderEventsAttached = true;
  }
  
  // Hover tooltip
  track.addEventListener('mousemove', (e) => {
    if (isDragging) return;
    const rect = track.getBoundingClientRect();
    let pct = ((e.clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    const zone = getZone(pct);
    tooltip.textContent = zone.label;
    tooltip.style.left = `${pct}%`;
    tooltip.classList.add('visible');
  });
  
  track.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
  });
}

function updateTermDisplay(termId, pos) {
  console.log(`updateTermDisplay called for ${termId} at position ${pos}`);
  const zone = getZone(pos);
  const row = document.getElementById(`row-${termId}`);
  const impactBox = document.getElementById(`impactbox-${termId}`);
  
  // Update content only (styling already updated during drag)
  const content = getTermContent(termId, pos);
  console.log(`Content for ${termId}:`, content);
  
  const termEl = document.getElementById(`term-${termId}`);
  const impactEl = document.getElementById(`impact-${termId}`);
  const impactSubEl = document.getElementById(`impactsub-${termId}`);
  const recLabelEl = document.getElementById(`reclabel-${termId}`);
  const recEl = document.getElementById(`rec-${termId}`);
  
  if (termEl) termEl.innerHTML = content.term;
  if (impactEl) {
    impactEl.textContent = content.impact;
    impactBox.className = `impact-box ${zone.impClass}`;
  }
  if (impactSubEl) impactSubEl.innerHTML = content.impactsub;
  if (recLabelEl) recLabelEl.textContent = content.reclabel;
  if (recEl) recEl.innerHTML = content.rec;
  
  // Update benchmark text if present
  const benchEl = document.getElementById(`bench-${termId}`);
  if (benchEl && content.bench) benchEl.innerHTML = content.bench;
  
  // Add animation
  row.classList.add('update-flash');
  setTimeout(() => row.classList.remove('update-flash'), 600);
}

// ═══════════════════════════════════════════════════════════════
// ROW EXPANSION
// ═══════════════════════════════════════════════════════════════

function toggleRow(termId) {
  const panel = document.getElementById(`panel-${termId}`);
  const row = document.getElementById(`row-${termId}`);
  
  // Close previous
  if (expandedRow && expandedRow !== termId) {
    const prevPanel = document.getElementById(`panel-${expandedRow}`);
    const prevRow = document.getElementById(`row-${expandedRow}`);
    if (prevPanel) prevPanel.classList.remove('open');
    if (prevRow) prevRow.classList.remove('expanded');
  }
  
  // Toggle current
  if (panel.classList.contains('open')) {
    panel.classList.remove('open');
    row.classList.remove('expanded');
    expandedRow = null;
  } else {
    panel.classList.add('open');
    row.classList.add('expanded');
    expandedRow = termId;
  }
}

// ═══════════════════════════════════════════════════════════════
// FILTERING
// ═══════════════════════════════════════════════════════════════

function setFilter(filter, btn) {
  currentFilter = filter;
  
  // Update button states
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  applyFilter(filter);
}

function applyFilter(filter) {
  const rows = document.querySelectorAll('.scorecard-row');
  const groups = document.querySelectorAll('.group-header');
  
  let visibleCount = 0;
  
  rows.forEach(row => {
    const priority = row.dataset.priority;
    const termId = row.dataset.term;
    const flexibility = TERM_META[termId]?.flexibility || 'flexible';
    
    let shouldShow = filter === 'all' || priority === filter;
    if (filter === 'flexible') shouldShow = flexibility === 'flexible';
    if (filter === 'inflexible') shouldShow = flexibility === 'inflexible';
    
    row.classList.toggle('hidden', !shouldShow);
    if (shouldShow) visibleCount++;
  });
  
  // Show/hide group headers based on visible rows
  groups.forEach(header => {
    const groupId = header.id.replace('grp-', '');
    const groupRows = document.querySelectorAll(`.scorecard-row[data-group="${groupId}"]`);
    const hasVisible = Array.from(groupRows).some(r => !r.classList.contains('hidden'));
    header.classList.toggle('group-hidden', !hasVisible);
  });
  
  // Show empty state if needed
  const emptyState = document.getElementById('emptyState');
  emptyState.classList.toggle('visible', visibleCount === 0);
}

// ═══════════════════════════════════════════════════════════════
// SUMMARY UPDATES
// ═══════════════════════════════════════════════════════════════

function updateSummary() {
  const rows = document.querySelectorAll('.scorecard-row');
  let critical = 0, high = 0, moderate = 0, info = 0, flexible = 0, inflexible = 0;
  
  rows.forEach(row => {
    const termId = row.dataset.term;
    const pos = sliderValues[termId] !== undefined ? sliderValues[termId] : TERM_META[termId].defaultPos;
    const zone = getZone(pos);
    const flexibility = TERM_META[termId]?.flexibility || 'flexible';
    
    if (zone.priority === 'critical') critical++;
    else if (zone.priority === 'high') high++;
    else if (zone.priority === 'moderate') moderate++;
    else info++;
    
    if (flexibility === 'flexible') flexible++;
    else inflexible++;
  });
  
  // Update counts
  document.getElementById('fc-critical').textContent = critical;
  document.getElementById('fc-high').textContent = high;
  document.getElementById('fc-moderate').textContent = moderate;
  document.getElementById('fc-info').textContent = info;
  document.getElementById('fc-flexible').textContent = flexible;
  document.getElementById('fc-inflexible').textContent = inflexible;
  
  // Update summary cards
  document.getElementById('sumCritical').textContent = critical;
  
  // Always use the total count from TERM_META (31 terms)
  const totalTerms = Object.keys(TERM_META).length;
  const analyzedCount = Object.keys(sliderValues).filter(k => sliderValues[k] > 0).length;
  document.getElementById('sumTerms').textContent = `${analyzedCount} / ${totalTerms}`;
  
  // Update terms reviewed subtext
  const termsSub = document.querySelector('#sumTerms').nextElementSibling;
  if (termsSub) {
    if (analyzedCount > 0) {
      termsSub.textContent = analyzedCount === totalTerms ? 'complete analysis' : `${analyzedCount} of ${totalTerms} analyzed`;
    } else {
      termsSub.textContent = 'upload term sheet to begin';
    }
  }
  
  const badge = document.getElementById('overallBadge');
  const ratingText = document.getElementById('sumRating');
  const ratingSub = document.getElementById('sumRatingSub');
  
  if (critical > 0) {
    badge.className = 'overall-badge rating-critical';
    badge.textContent = 'DO NOT SIGN';
    ratingText.textContent = 'NEEDS NEGOTIATION';
    ratingSub.textContent = `resolve ${critical} critical issue${critical > 1 ? 's' : ''} first`;
  } else if (high > 0) {
    badge.className = 'overall-badge rating-minor';
    badge.textContent = 'PROCEED WITH CAUTION';
    ratingText.textContent = 'ACCEPTABLE WITH CHANGES';
    ratingSub.textContent = `${high} high priority item${high > 1 ? 's' : ''} to address`;
  } else if (moderate > 0) {
    badge.className = 'overall-badge rating-needs';
    badge.textContent = 'MINOR REVISIONS';
    ratingText.textContent = 'MINOR CONCERNS';
    ratingSub.textContent = `${moderate} moderate improvement${moderate > 1 ? 's' : ''} possible`;
  } else {
    badge.className = 'overall-badge rating-good';
    badge.textContent = 'READY TO SIGN';
    ratingText.textContent = 'EXCELLENT TERMS';
    ratingSub.textContent = 'All terms buyer-favorable';
  }
  
  // Update critical callout
  const callout = document.getElementById('criticalCallout');
  if (critical > 0) {
    callout.classList.add('visible');
    document.getElementById('ccStrong').textContent = `${critical} critical issue${critical > 1 ? 's' : ''} require${critical === 1 ? 's' : ''} resolution before signing.`;
  } else {
    callout.classList.remove('visible');
  }
}

// ═══════════════════════════════════════════════════════════════
// THEME TOGGLE
// ═══════════════════════════════════════════════════════════════

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
  
  updateThemeButton(!isDark);
}

function updateThemeButton(isDark) {
  const btn = document.getElementById('themeToggle');
  const icon = isDark ? '☀️' : '🌙';
  const label = isDark ? 'Light' : 'Dark';
  btn.innerHTML = `<span class="ctrl-icon">${icon}</span><span class="theme-label">${label}</span>`;
}

// ═══════════════════════════════════════════════════════════════
// RESET & UTILITIES
// ═══════════════════════════════════════════════════════════════

// Store original analyzed values for reset functionality
let originalAnalyzedValues = {};
let hasAnalyzedData = false;

function resetAll() {
  if (hasAnalyzedData && Object.keys(originalAnalyzedValues).length > 0) {
    // Reset to the originally analyzed values
    sliderValues = { ...originalAnalyzedValues };
  } else {
    // No analysis done yet, reset to zeros
    sliderValues = {};
    Object.keys(TERM_META).forEach(termId => {
      sliderValues[termId] = 0;
    });
  }
  renderScorecard();
  updateSummary();
}

function initSliders() {
  // Initialize with zeros (blank state)
  Object.keys(TERM_META).forEach(termId => {
    sliderValues[termId] = 0;
  });
}

// Call this when analysis is complete to store the original values
function storeOriginalAnalyzedValues(analysis) {
  if (analysis && analysis.terms) {
    originalAnalyzedValues = { ...analysis.terms };
    hasAnalyzedData = true;
  }
}

function exportPDF() {
  alert('PDF export coming soon! For now, use Print to PDF (Cmd+P / Ctrl+P)');
}
