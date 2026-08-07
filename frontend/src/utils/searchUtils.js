export function isCityOnlySearch(item) {
  const city = item?.city?.trim();
  const rawQuery = extractPrimaryTerm(item?.query);

  if (!city) return false;
  return !rawQuery || rawQuery.toLowerCase() === city.toLowerCase();
}

export function extractPrimaryTerm(value) {
  if (!value) return "";
  return value.split(",")[0]?.trim() || "";
}

export function getSearchDisplayName(item) {
  if (item?.property) {
    return item.property;
  }

  const city = item?.city?.trim();
  const rawQuery = extractPrimaryTerm(item?.query);

  if (isCityOnlySearch(item)) {
    return `Properties in ${city}`;
  }

  if (
    rawQuery &&
    city &&
    !rawQuery.toLowerCase().includes(city.toLowerCase())
  ) {
    return `${rawQuery}, ${city}`;
  }

  return rawQuery || city || "—";
}

export function formatPropertyType(type) {
  if (!type) return "—";
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatSearchStatus(status) {
  if (!status) return "—";
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function buildSearchResultsUrl(item) {
  const params = new URLSearchParams();
  const city = item?.city?.trim();
  const rawQuery = extractPrimaryTerm(item?.query);

  if (!isCityOnlySearch(item) && rawQuery) {
    params.set("query", rawQuery);
  }

  if (city) {
    params.set("city", city);
  }

  if (item?.propertyType) params.set("type", item.propertyType);
  if (item?.risk && item.risk !== "Unrated") params.set("risk", item.risk);
  if (item?.status) params.set("status", item.status);

  const queryString = params.toString();
  return queryString ? `/property-results?${queryString}` : "/property-results";
}

export function buildSearchHistoryPayload({
  query,
  city,
  propertyType,
  risk,
  status,
  propertyId,
  propertyName,
} = {}) {
  const trimmedQuery = query?.trim() || "";
  const trimmedCity = city?.trim() || "";

  const payload = {};

  if (
    trimmedQuery &&
    (!trimmedCity || trimmedQuery.toLowerCase() !== trimmedCity.toLowerCase())
  ) {
    payload.query = trimmedQuery;
  }

  if (trimmedCity) {
    payload.city = trimmedCity;
  }

  if (propertyId) payload.propertyId = propertyId;
  if (propertyName) payload.propertyName = propertyName;
  if (propertyType) payload.propertyType = propertyType;
  if (risk) payload.risk = risk;
  if (status) payload.status = status;

  return payload;
}

export function formatVisitedTime(timestamp) {
  if (!timestamp) return "—";

  let date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Visited just now";
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `Visited ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `Visited ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `Visited ${days} day${days === 1 ? "" : "s"} ago`;
  }
  return date.toLocaleDateString();
}
