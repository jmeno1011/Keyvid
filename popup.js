const STORAGE_KEY = 'allowedSites';
const POSITION_KEY = 'indicatorPosition';
const SEEK_SECONDS_KEY = 'seekSeconds';

const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const currentHost = document.getElementById('currentHost');
const toggleSite = document.getElementById('toggleSite');
const toggleList = document.getElementById('toggleList');
const siteList = document.getElementById('siteList');
const emptyList = document.getElementById('emptyList');
const currentBadge = document.getElementById('currentBadge');
const manualSiteForm = document.getElementById('manualSiteForm');
const manualSiteInput = document.getElementById('manualSiteInput');
const manualSiteSubmit = document.getElementById('manualSiteSubmit');
const manualSiteCancel = document.getElementById('manualSiteCancel');
const manualSiteFeedback = document.getElementById('manualSiteFeedback');
const positionButtons = [...document.querySelectorAll('.position-option')];
const positionPanel = document.getElementById('positionPanel');
const togglePositionPanel = document.getElementById('togglePositionPanel');
const seekSecondsInput = document.getElementById('seekSecondsInput');
const seekForwardLabel = document.getElementById('seekForwardLabel');
const seekBackwardLabel = document.getElementById('seekBackwardLabel');

let activePage = {
  host: '',
  path: '',
  exactPattern: '',
  displayPattern: '',
};
let allowedSites = [];
let editingSite = '';
let siteListOpen = false;
let positionPanelOpen = false;
let indicatorPosition = 'center';
let seekSeconds = 5;
const hasChromeApi = typeof chrome !== 'undefined' && chrome.storage?.local && chrome.tabs?.query;

function normalizeHost(host) {
  return String(host || '')
    .trim()
    .toLowerCase()
    .replace(/^www\./, '');
}

function normalizePath(path) {
  const normalized = String(path || '')
    .trim()
    .toLowerCase()
    .replace(/\/+$/, '');

  if (!normalized || normalized === '/') return '';
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function normalizeSitePattern(pattern) {
  const raw = String(pattern || '').trim().toLowerCase();
  if (!raw) return '';

  const cleaned = raw.replace(/\*+$/, '').replace(/\/+$/, '');
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;

  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    const host = normalizeHost(parsed.hostname);
    const path = normalizePath(parsed.pathname);
    return path ? `${host}${path}` : host;
  } catch {
    return '';
  }
}

function splitSitePattern(pattern) {
  const normalized = normalizeSitePattern(pattern);
  if (!normalized) return { host: '', path: '' };

  const slashIndex = normalized.indexOf('/');
  if (slashIndex === -1) return { host: normalized, path: '' };

  return {
    host: normalized.slice(0, slashIndex),
    path: normalizePath(normalized.slice(slashIndex)),
  };
}

function formatSitePatternForDisplay(pattern) {
  const { host, path } = splitSitePattern(pattern);
  if (!host) return '';
  return path ? `${host}${path}/*` : host;
}

function parseCurrentPage(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return {
      host: '',
      path: '',
      exactPattern: '',
      displayPattern: '',
    };

    const host = normalizeHost(parsed.hostname);
    const path = normalizePath(parsed.pathname);
    const isYouTubeHost = host === 'youtube.com' || host.endsWith('.youtube.com');
    const exactPattern = isYouTubeHost && path.startsWith('/shorts')
      ? `${host}/shorts`
      : host;
    const displayPattern = exactPattern || host;

    return {
      host,
      path,
      exactPattern,
      displayPattern,
    };
  } catch {
    return {
      host: '',
      path: '',
      exactPattern: '',
      displayPattern: '',
    };
  }
}

function parseSiteInput(value) {
  const rawValue = String(value || '').trim();
  if (!rawValue) return '';
  return normalizeSitePattern(rawValue);
}

function sortSites(sites) {
  return [...new Set(sites.map(normalizeSitePattern).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function isPathMatch(currentPath, allowedPath) {
  if (!allowedPath) return true;
  return currentPath === allowedPath || currentPath.startsWith(`${allowedPath}/`);
}

function isPatternMatchCurrentPage(pattern) {
  const { host: allowedHost, path: allowedPath } = splitSitePattern(pattern);
  if (!allowedHost || !activePage.host) return false;

  const hostMatches = activePage.host === allowedHost || activePage.host.endsWith(`.${allowedHost}`);
  return hostMatches && isPathMatch(activePage.path, allowedPath);
}

function isSiteAllowed(page, sites) {
  return Boolean(getMatchingSite(page, sites));
}

function getMatchingSite(page, sites) {
  if (!page.host) return '';
  return sites.find(site => {
    const { host: allowedHost, path: allowedPath } = splitSitePattern(site);
    const hostMatches = page.host === allowedHost || page.host.endsWith(`.${allowedHost}`);
    return hostMatches && isPathMatch(page.path, allowedPath);
  }) || '';
}

function saveSites(nextSites) {
  allowedSites = sortSites(nextSites);
  editingSite = allowedSites.includes(editingSite) ? editingSite : '';
  if (!hasChromeApi) {
    render();
    return;
  }
  chrome.storage.local.set({ [STORAGE_KEY]: allowedSites }, render);
}

function normalizeIndicatorPosition(position) {
  return ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'].includes(position)
    ? position
    : 'center';
}

function saveIndicatorPosition(position) {
  indicatorPosition = normalizeIndicatorPosition(position);
  if (!hasChromeApi) {
    render();
    return;
  }
  chrome.storage.local.set({ [POSITION_KEY]: indicatorPosition }, render);
}

function normalizeSeekSeconds(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 5;
  return Math.min(60, Math.max(1, parsed));
}

function saveSeekSeconds(value) {
  seekSeconds = normalizeSeekSeconds(value);
  if (!hasChromeApi) {
    render();
    return;
  }
  chrome.storage.local.set({ [SEEK_SECONDS_KEY]: seekSeconds }, render);
}

function getSiteType(site) {
  const { host } = splitSitePattern(site);
  if (/(^|\.)youtube\.com$|^youtu\.be$/.test(host)) return 'youtube';
  if (/(^|\.)vimeo\.com$/.test(host)) return 'vimeo';
  return 'default';
}

function getSiteIcon(site) {
  const type = getSiteType(site);
  if (type === 'youtube') return '▶';
  if (type === 'vimeo') return 'v';
  return '◎';
}

function renderSiteList() {
  siteList.innerHTML = '';
  emptyList.classList.toggle('visible', allowedSites.length === 0);
  siteListOpen = allowedSites.length > 0 && siteListOpen;
  siteList.classList.toggle('open', siteListOpen);
  siteList.setAttribute('aria-hidden', String(!siteListOpen));
  toggleList.textContent = siteListOpen ? 'Hide' : 'Show';
  toggleList.setAttribute('aria-expanded', String(siteListOpen));
  toggleList.disabled = allowedSites.length === 0;

  for (const site of allowedSites) {
    const item = document.createElement('div');
    item.className = 'site-item';

    const icon = document.createElement('span');
    icon.className = `site-icon ${getSiteType(site)}`;
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = getSiteIcon(site);

    const name = document.createElement('span');
    name.className = 'site-name';
    name.textContent = formatSitePatternForDisplay(site);

    const edit = document.createElement('button');
    edit.className = 'edit-site';
    edit.type = 'button';
    edit.title = `Edit ${site}`;
    edit.setAttribute('aria-label', `Edit ${site}`);
    edit.textContent = '✎';
    edit.addEventListener('click', () => {
      editingSite = site;
      manualSiteInput.value = formatSitePatternForDisplay(site);
      manualSiteInput.focus();
      manualSiteSubmit.textContent = 'Save';
      manualSiteCancel.classList.add('visible');
      manualSiteFeedback.textContent = '';
    });

    const remove = document.createElement('button');
    remove.className = 'remove-site';
    remove.type = 'button';
    remove.title = `Remove ${site}`;
    remove.setAttribute('aria-label', `Remove ${site}`);
    remove.textContent = '🗑';
    remove.addEventListener('click', () => {
      if (editingSite === site) {
        clearManualEdit();
      }
      saveSites(allowedSites.filter(allowedSite => allowedSite !== site));
    });

    item.append(icon, name, edit, remove);
    siteList.appendChild(item);
  }
}

function clearManualEdit() {
  editingSite = '';
  manualSiteInput.value = '';
  manualSiteSubmit.textContent = 'Add';
  manualSiteCancel.classList.remove('visible');
  manualSiteFeedback.textContent = '';
}

function renderManualState() {
  manualSiteSubmit.textContent = editingSite ? 'Save' : 'Add';
  manualSiteCancel.classList.toggle('visible', Boolean(editingSite));
}

function renderIndicatorPosition() {
  for (const button of positionButtons) {
    const active = button.dataset.position === indicatorPosition;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }

  positionPanel.classList.toggle('open', positionPanelOpen);
  positionPanel.setAttribute('aria-hidden', String(!positionPanelOpen));
  togglePositionPanel.textContent = positionPanelOpen ? 'Hide' : 'Show';
  togglePositionPanel.setAttribute('aria-expanded', String(positionPanelOpen));
}

function renderSeekSettings() {
  seekSecondsInput.value = String(seekSeconds);
  seekForwardLabel.textContent = `Seek forward ${seekSeconds} second${seekSeconds === 1 ? '' : 's'}`;
  seekBackwardLabel.textContent = `Seek backward ${seekSeconds} second${seekSeconds === 1 ? '' : 's'}`;
}

function render() {
  const enabled = isSiteAllowed(activePage, allowedSites);
  const exactRegistered = Boolean(activePage.exactPattern && allowedSites.includes(activePage.exactPattern));

  statusDot.classList.toggle('disabled', !enabled);
  statusText.textContent = enabled ? 'Enabled on this site' : 'Disabled on this site';
  currentHost.textContent = activePage.displayPattern
    ? formatSitePatternForDisplay(activePage.displayPattern)
    : 'This page cannot be registered';
  currentBadge.textContent = enabled ? 'Enabled' : 'Disabled';
  currentBadge.classList.toggle('disabled', !enabled);

  toggleSite.disabled = !activePage.exactPattern;
  toggleSite.textContent = exactRegistered ? 'Remove current site' : 'Add current site';
  toggleSite.classList.toggle('danger', exactRegistered);

  renderSiteList();
  renderManualState();
  renderIndicatorPosition();
  renderSeekSettings();
}

toggleSite.addEventListener('click', () => {
  if (!activePage.exactPattern) return;

  if (allowedSites.includes(activePage.exactPattern)) {
    saveSites(allowedSites.filter(site => site !== activePage.exactPattern));
    return;
  }

  saveSites([...allowedSites, activePage.exactPattern]);
});

toggleList.addEventListener('click', () => {
  siteListOpen = !siteListOpen;
  renderSiteList();
});

manualSiteForm.addEventListener('submit', event => {
  event.preventDefault();

  const site = parseSiteInput(manualSiteInput.value);
  if (!site) {
    manualSiteFeedback.textContent = 'Enter a valid site URL.';
    return;
  }

  const duplicate = allowedSites.includes(site) && site !== editingSite;
  if (duplicate) {
    manualSiteFeedback.textContent = `${site} is already registered.`;
    return;
  }

  const nextSites = editingSite
    ? allowedSites.map(allowedSite => (allowedSite === editingSite ? site : allowedSite))
    : [...allowedSites, site];

  clearManualEdit();
  saveSites(nextSites);
});

manualSiteCancel.addEventListener('click', clearManualEdit);

togglePositionPanel.addEventListener('click', () => {
  positionPanelOpen = !positionPanelOpen;
  renderIndicatorPosition();
});

for (const button of positionButtons) {
  button.addEventListener('click', () => {
    saveIndicatorPosition(button.dataset.position);
  });
}

seekSecondsInput.addEventListener('change', () => {
  saveSeekSeconds(seekSecondsInput.value);
});

seekSecondsInput.addEventListener('blur', () => {
  saveSeekSeconds(seekSecondsInput.value);
});

if (hasChromeApi) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    activePage = parseCurrentPage(tabs[0]?.url);

    chrome.storage.local.get({ [STORAGE_KEY]: [], [POSITION_KEY]: 'center', [SEEK_SECONDS_KEY]: 5 }, result => {
      allowedSites = sortSites(result[STORAGE_KEY]);
      indicatorPosition = normalizeIndicatorPosition(result[POSITION_KEY]);
      seekSeconds = normalizeSeekSeconds(result[SEEK_SECONDS_KEY]);
      render();
    });
  });
} else {
  activePage = parseCurrentPage('https://www.youtube.com/shorts/example');
  allowedSites = sortSites(['youtube.com', 'vimeo.com', 'example.com']);
  indicatorPosition = 'center';
  seekSeconds = 5;
  render();
}
