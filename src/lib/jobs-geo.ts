/** Max continent peer countries passed to search_jobs (server also caps at 8). */
const MAX_CONTINENT_TERMS = 8

export type JobGeoLocation = {
	city: string | null
	region: string | null
	country: string | null
	countryCode: string | null
	continent: string | null
	/** Value shown in the location filter input */
	displayName: string
}

/** Structured location args for ranked search_jobs RPC. */
export type JobLocationSearchContext = {
	locationQuery: string
	city: string | null
	region: string | null
	country: string | null
	/** Same-continent peer country names (excludes primary country). */
	continentTerms: string[]
}

type ContinentName =
	| "North America"
	| "South America"
	| "Europe"
	| "Asia"
	| "Africa"
	| "Oceania"

/** Compact peer lists — enough coverage without huge OR clauses. */
const CONTINENT_COUNTRY_TERMS: Record<ContinentName, readonly string[]> = {
	"North America": [
		"Canada",
		"United States",
		"USA",
		"US",
		"Mexico",
	],
	"South America": ["Brazil", "Argentina", "Chile", "Colombia", "Peru"],
	Europe: [
		"United Kingdom",
		"UK",
		"Germany",
		"France",
		"Netherlands",
		"Ireland",
		"Spain",
		"Portugal",
	],
	Asia: [
		"India",
		"Singapore",
		"Japan",
		"Philippines",
		"Vietnam",
		"China",
		"South Korea",
		"Indonesia",
	],
	Africa: ["South Africa", "Nigeria", "Egypt", "Kenya", "Morocco"],
	Oceania: ["Australia", "New Zealand"],
}

const COUNTRY_TO_CONTINENT: Record<string, ContinentName> = {
	canada: "North America",
	"united states": "North America",
	usa: "North America",
	us: "North America",
	mexico: "North America",
	brazil: "South America",
	argentina: "South America",
	chile: "South America",
	colombia: "South America",
	peru: "South America",
	"united kingdom": "Europe",
	uk: "Europe",
	germany: "Europe",
	france: "Europe",
	netherlands: "Europe",
	ireland: "Europe",
	spain: "Europe",
	portugal: "Europe",
	india: "Asia",
	singapore: "Asia",
	japan: "Asia",
	philippines: "Asia",
	vietnam: "Asia",
	china: "Asia",
	"south korea": "Asia",
	indonesia: "Asia",
	"south africa": "Africa",
	nigeria: "Africa",
	egypt: "Africa",
	kenya: "Africa",
	morocco: "Africa",
	australia: "Oceania",
	"new zealand": "Oceania",
}

const COUNTRY_CODE_TO_COUNTRY: Record<string, string> = {
	ca: "Canada",
	us: "United States",
	usa: "United States",
	mx: "Mexico",
	gb: "United Kingdom",
	uk: "United Kingdom",
	de: "Germany",
	fr: "France",
	nl: "Netherlands",
	ie: "Ireland",
	es: "Spain",
	pt: "Portugal",
	in: "India",
	sg: "Singapore",
	jp: "Japan",
	ph: "Philippines",
	vn: "Vietnam",
	cn: "China",
	kr: "South Korea",
	id: "Indonesia",
	za: "South Africa",
	ng: "Nigeria",
	eg: "Egypt",
	ke: "Kenya",
	ma: "Morocco",
	au: "Australia",
	nz: "New Zealand",
	br: "Brazil",
	ar: "Argentina",
	cl: "Chile",
	co: "Colombia",
	pe: "Peru",
}

/** Common job-market cities → country (for typed location expansion). */
const CITY_TO_COUNTRY: Record<string, string> = {
	toronto: "Canada",
	vancouver: "Canada",
	montreal: "Canada",
	calgary: "Canada",
	ottawa: "Canada",
	edmonton: "Canada",
	winnipeg: "Canada",
	waterloo: "Canada",
	mississauga: "Canada",
	hamilton: "Canada",
	victoria: "Canada",
	quebec: "Canada",
	halifax: "Canada",
	"new york": "United States",
	"san francisco": "United States",
	"los angeles": "United States",
	seattle: "United States",
	austin: "United States",
	boston: "United States",
	chicago: "United States",
	denver: "United States",
	miami: "United States",
	london: "United Kingdom",
	manchester: "United Kingdom",
	dublin: "Ireland",
	berlin: "Germany",
	munich: "Germany",
	amsterdam: "Netherlands",
	paris: "France",
	sydney: "Australia",
	melbourne: "Australia",
	auckland: "New Zealand",
	singapore: "Singapore",
	bangalore: "India",
	bengaluru: "India",
	hyderabad: "India",
	mumbai: "India",
}

function normalizeKey(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function continentForCountry(country: string | null | undefined): ContinentName | null {
	if (!country) return null
	return COUNTRY_TO_CONTINENT[normalizeKey(country)] ?? null
}

function continentPeerTerms(
	continent: ContinentName | null,
	country: string | null,
): string[] {
	if (!continent) return []
	const peers = CONTINENT_COUNTRY_TERMS[continent] ?? []
	const countryKey = country ? normalizeKey(country) : null
	const terms: string[] = []

	for (const peer of peers) {
		if (countryKey && normalizeKey(peer) === countryKey) continue
		terms.push(peer)
		if (terms.length >= MAX_CONTINENT_TERMS) break
	}

	return terms
}

/**
 * Infer country/continent from free-text location (city, country, or "City, Country").
 */
export function resolveLocationContext(
	locationQuery: string,
): Pick<
	JobGeoLocation,
	"city" | "region" | "country" | "countryCode" | "continent"
> | null {
	const raw = locationQuery.trim()
	if (!raw) return null

	const parts = raw.split(",").map((part) => part.trim()).filter(Boolean)
	const primary = parts[0] ?? raw
	const secondary = parts[1] ?? null
	const primaryKey = normalizeKey(primary)
	const secondaryKey = secondary ? normalizeKey(secondary) : null

	let country: string | null = null
	let city: string | null = null

	if (secondaryKey && COUNTRY_TO_CONTINENT[secondaryKey]) {
		country = secondary
		city = primary
	} else if (COUNTRY_TO_CONTINENT[primaryKey]) {
		country = primary
	} else if (COUNTRY_CODE_TO_COUNTRY[primaryKey]) {
		country = COUNTRY_CODE_TO_COUNTRY[primaryKey]
	} else if (CITY_TO_COUNTRY[primaryKey]) {
		city = primary
		country = CITY_TO_COUNTRY[primaryKey]
	} else if (secondaryKey && CITY_TO_COUNTRY[secondaryKey]) {
		city = secondary
		country = CITY_TO_COUNTRY[secondaryKey]
	} else {
		city = primary
	}

	const continent = continentForCountry(country)
	if (!city && !country && !continent) return null

	return {
		city,
		region: null,
		country,
		countryCode: null,
		continent,
	}
}

/**
 * Build structured location context for search_jobs ranking.
 * Prefer geoHint when the input still matches the detected city or display name.
 */
export function buildLocationSearchContext(
	locationQuery: string,
	geoHint: JobGeoLocation | null = null,
): JobLocationSearchContext | null {
	const query = locationQuery.trim()
	if (!query) return null

	const context = isGeoSeededLocationQuery(query, geoHint)
		? {
				city: geoHint!.city,
				region: geoHint!.region,
				country: geoHint!.country,
				countryCode: geoHint!.countryCode,
				continent:
					geoHint!.continent ?? continentForCountry(geoHint!.country),
			}
		: resolveLocationContext(query)

	const city = context?.city?.trim() || null
	const region = context?.region?.trim() || null
	const country = context?.country?.trim() || null
	const continent = (context?.continent ??
		continentForCountry(country)) as ContinentName | null

	return {
		locationQuery: query,
		city,
		region,
		country,
		continentTerms: continentPeerTerms(continent, country),
	}
}

/** Value shown/seeded in the location filter — prefer city for job matching. */
export function geoLocationFilterValue(location: JobGeoLocation): string {
	return location.city?.trim() || location.displayName
}

export function isGeoSeededLocationQuery(
	locationQuery: string,
	geoHint: JobGeoLocation | null,
): boolean {
	if (!geoHint) return false
	const key = normalizeKey(locationQuery)
	if (!key) return false
	if (geoHint.city && normalizeKey(geoHint.city) === key) return true
	return normalizeKey(geoHint.displayName) === key
}

export function formatGeoDisplayName(location: {
	city: string | null
	region: string | null
	country: string | null
}): string {
	const city = location.city?.trim()
	const country = location.country?.trim()
	if (city && country) return `${city}, ${country}`
	if (city) return city
	if (country) return country
	return location.region?.trim() || ""
}

type BigDataCloudResponse = {
	city?: string
	locality?: string
	localityInfo?: {
		administrative?: Array<{ name?: string; order?: number }>
	}
	principalSubdivision?: string
	countryName?: string
	countryCode?: string
	continent?: string
}

function parseBigDataCloudLocation(
	data: BigDataCloudResponse,
): JobGeoLocation | null {
	const city =
		data.city?.trim() ||
		data.locality?.trim() ||
		data.localityInfo?.administrative
			?.slice()
			.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
			.find((entry) => entry.name?.trim())?.name?.trim() ||
		null
	const region = data.principalSubdivision?.trim() || null
	const country = data.countryName?.trim() || null
	const countryCode = data.countryCode?.trim()?.toUpperCase() || null
	const continent = data.continent?.trim() || continentForCountry(country)

	const displayName = formatGeoDisplayName({ city, region, country })
	if (!displayName) return null

	return {
		city,
		region,
		country,
		countryCode,
		continent,
		displayName,
	}
}

export async function reverseGeocodeCoords(
	latitude: number,
	longitude: number,
	signal?: AbortSignal,
): Promise<JobGeoLocation | null> {
	const url =
		"https://api.bigdatacloud.net/data/reverse-geocode-client" +
		`?latitude=${encodeURIComponent(String(latitude))}` +
		`&longitude=${encodeURIComponent(String(longitude))}` +
		"&localityLanguage=en"

	const response = await fetch(url, { signal })
	if (!response.ok) {
		throw new Error(`Reverse geocode failed (${response.status})`)
	}

	const data = (await response.json()) as BigDataCloudResponse
	return parseBigDataCloudLocation(data)
}

/**
 * IP-based city lookup (no browser permission). Used when GPS is denied/unavailable.
 */
export async function reverseGeocodeClientIp(
	signal?: AbortSignal,
): Promise<JobGeoLocation | null> {
	const url =
		"https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en"

	const response = await fetch(url, { signal })
	if (!response.ok) {
		throw new Error(`IP reverse geocode failed (${response.status})`)
	}

	const data = (await response.json()) as BigDataCloudResponse
	return parseBigDataCloudLocation(data)
}

/**
 * Resolve the user's area: browser GPS first, then IP city fallback.
 */
export async function resolveUserGeoLocation(
	signal?: AbortSignal,
): Promise<JobGeoLocation | null> {
	// Keep GPS short so IP city fallback still fits the hook timeout.
	const coords = await readBrowserCoordinates(3_500)
	if (coords) {
		try {
			const fromGps = await reverseGeocodeCoords(
				coords.latitude,
				coords.longitude,
				signal,
			)
			if (fromGps?.city || fromGps?.country) return fromGps
		} catch (error) {
			console.error("Something went wrong reverse-geocoding GPS:", error)
		}
	}

	try {
		return await reverseGeocodeClientIp(signal)
	} catch (error) {
		console.error("Something went wrong resolving IP location:", error)
		return null
	}
}

export function readBrowserCoordinates(
	timeoutMs = 3_500,
): Promise<GeolocationCoordinates | null> {
	if (typeof navigator === "undefined" || !navigator.geolocation) {
		return Promise.resolve(null)
	}

	return new Promise((resolve) => {
		const timer = window.setTimeout(() => resolve(null), timeoutMs)

		navigator.geolocation.getCurrentPosition(
			(position) => {
				window.clearTimeout(timer)
				resolve(position.coords)
			},
			() => {
				window.clearTimeout(timer)
				resolve(null)
			},
			{
				enableHighAccuracy: false,
				timeout: timeoutMs,
				maximumAge: 30 * 60 * 1000,
			},
		)
	})
}
