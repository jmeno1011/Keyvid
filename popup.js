const STORAGE_KEY = 'allowedSites';

const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const currentHost = document.getElementById('currentHost');
const toggleSite = document.getElementById('toggleSite');
const toggleList = document.getElementById('toggleList');
const siteList = document.getElementById('siteList');
const emptyList = document.getElementById('emptyList');

let activeHost = '';
let allowedSites = [];

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
  chrome.storage.local.set({ [STORAGE_KEY]: allowedSites }, render);
}

function renderSiteList() {
  siteList.innerHTML = '';
  emptyList.classList.toggle('visible', allowedSites.length === 0);

  for (const site of allowedSites) {
    const item = document.createElement('div');
    item.className = 'site-item';

    const name = document.createElement('span');
    name.className = 'site-name';
    name.textContent = site;

    const remove = document.createElement('button');
    remove.className = 'remove-site';
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      saveSites(allowedSites.filter(allowedSite => allowedSite !== site));
    });

    item.append(name, remove);
    siteList.appendChild(item);
  }
}

function render() {
  const enabled = activeHost && isSiteAllowed(activeHost, allowedSites);

  statusDot.classList.toggle('disabled', !enabled);
  statusText.textContent = enabled ? 'Enabled on this site' : 'Disabled on this site';
  currentHost.textContent = activeHost || 'This page cannot be registered';

  toggleSite.disabled = !activeHost;
  toggleSite.textContent = enabled ? 'Remove current site' : 'Add current site';
  toggleSite.classList.toggle('danger', Boolean(enabled));

  renderSiteList();
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
  siteList.classList.toggle('open');
});

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  activeHost = parseHost(tabs[0]?.url);

  chrome.storage.local.get({ [STORAGE_KEY]: [] }, result => {
    allowedSites = sortSites(result[STORAGE_KEY]);
    render();
  });
});
