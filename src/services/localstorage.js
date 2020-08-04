export function getItemOrDefault(key, _default = null) {
  if (!typeof (Storage)) {
    return _default;
  }

  const value = localStorage.getItem(key);

  if (!value) {
    return _default;
  }

  return JSON.parse(value);
}

export function setItem(key, data) {
  if (!typeof (Storage)) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(data));
}

export function removeItem(key) {
  if (!typeof (Storage)) {
    return;
  }

  localStorage.removeItem(key);
}
