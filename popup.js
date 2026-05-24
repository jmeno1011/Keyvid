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

let activeHost = '';
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

function parseHost(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    return normalizeHost(parsed.hostname);
  } catch {
    return '';
  }
}

function parseSiteInput(value) {
  const rawValue = String(value || '').trim();
  if (!rawValue) return '';

  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;
  return parseHost(candidate);
}

function sortSites(sites) {
  return [...new Set(sites.map(normalizeHost).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function isSiteAllowed(host, sites) {
  return Boolean(getMatchingSite(host, sites));
}

function getMatchingSite(host, sites) {
  const normalizedHost = normalizeHost(host);
  return sites.find(site => normalizedHost === site || normalizedHost.endsWith(`.${site}`)) || '';
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
  if (/(^|\.)youtube\.com$|^youtu\.be$/.test(site)) return 'youtube';
  if (/(^|\.)vimeo\.com$/.test(site)) return 'vimeo';
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
    name.textContent = site;

    const edit = document.createElement('button');
    edit.className = 'edit-site';
    edit.type = 'button';
    edit.title = `Edit ${site}`;
    edit.setAttribute('aria-label', `Edit ${site}`);
    edit.textContent = '✎';
    edit.addEventListener('click', () => {
      editingSite = site;
      manualSiteInput.value = site;
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
  const enabled = activeHost && isSiteAllowed(activeHost, allowedSites);

  statusDot.classList.toggle('disabled', !enabled);
  statusText.textContent = enabled ? 'Enabled on this site' : 'Disabled on this site';
  currentHost.textContent = activeHost || 'This page cannot be registered';
  currentBadge.textContent = enabled ? 'Enabled' : 'Disabled';
  currentBadge.classList.toggle('disabled', !enabled);

  toggleSite.disabled = !activeHost;
  toggleSite.textContent = enabled ? 'Remove current site' : 'Add current site';
  toggleSite.classList.toggle('danger', Boolean(enabled));

  renderSiteList();
  renderManualState();
  renderIndicatorPosition();
  renderSeekSettings();
}

toggleSite.addEventListener('click', () => {
  if (!activeHost) return;

  const matchingSite = getMatchingSite(activeHost, allowedSites);
  if (matchingSite) {
    saveSites(allowedSites.filter(site => site !== matchingSite));
    return;
  }

  saveSites([...allowedSites, activeHost]);
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
    activeHost = parseHost(tabs[0]?.url);

    chrome.storage.local.get({ [STORAGE_KEY]: [], [POSITION_KEY]: 'center', [SEEK_SECONDS_KEY]: 5 }, result => {
      allowedSites = sortSites(result[STORAGE_KEY]);
      indicatorPosition = normalizeIndicatorPosition(result[POSITION_KEY]);
      seekSeconds = normalizeSeekSeconds(result[SEEK_SECONDS_KEY]);
      render();
    });
  });
} else {
  activeHost = 'www.example.com';
  allowedSites = sortSites(['youtube.com', 'vimeo.com', 'example.com']);
  indicatorPosition = 'center';
  seekSeconds = 5;
  render();
}
