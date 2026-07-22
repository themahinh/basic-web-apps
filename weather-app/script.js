/* ============================================
   Weather — Glass
   script.js
   ============================================ */

(() => {
    "use strict";

    const API_KEY = "2334d61af35b4c4da38181550261807";
    const API_BASE = "https://api.weatherapi.com/v1/forecast.json";
    const FALLBACK_CITY = "Delhi";
    const FALLBACK_QUERY = "28.6139,77.2090"; // Delhi, India coords — avoids ambiguous matches like Delhi, Ontario

    // ---- DOM references ----
    const els = {
        cityInput: document.getElementById("cityInput"),
        searchBtn: document.getElementById("searchBtn"),
        locBtn: document.getElementById("locBtn"),
        toast: document.getElementById("toast"),

        loadingCard: document.getElementById("loadingCard"),
        weatherCard: document.getElementById("weatherCard"),
        errorCard: document.getElementById("errorCard"),
        errorMessage: document.getElementById("errorMessage"),
        retryBtn: document.getElementById("retryBtn"),

        cityName: document.getElementById("cityName"),
        regionName: document.getElementById("regionName"),
        localTime: document.getElementById("localTime"),
        condIcon: document.getElementById("condIcon"),
        temp: document.getElementById("temp"),
        condText: document.getElementById("condText"),
        feelsLike: document.getElementById("feelsLike"),

        unitC: document.getElementById("unitC"),
        unitF: document.getElementById("unitF"),

        humidity: document.getElementById("humidity"),
        wind: document.getElementById("wind"),
        uv: document.getElementById("uv"),
        pressure: document.getElementById("pressure"),
        visibility: document.getElementById("visibility"),
        sunrise: document.getElementById("sunrise"),
        sunset: document.getElementById("sunset"),
        precip: document.getElementById("precip"),

        bgGradient: document.querySelector(".bg-gradient"),
        root: document.documentElement,
        particles: document.getElementById("particles"),
    };

    // Current unit + last fetched payload (so unit toggle doesn't need a refetch)
    let currentUnit = "C";
    let lastData = null;
    let particleTimer = null;

    // ============================================
    // Theming — maps WeatherAPI condition codes to
    // an ambient gradient + accent + particle type
    // ============================================

    function getTheme(conditionCode, isDay) {
        const day = isDay === 1 || isDay === true;

        const themes = {
            clearDay: {
                c1: "#4a90d9",
                c2: "#0f2745",
                c3: "#7ec8f2",
                accent: "#8fd3ff",
                particle: null,
            },
            clearNight: {
                c1: "#0b1435",
                c2: "#000000",
                c3: "#1c2b5e",
                accent: "#5a6fd8",
                particle: "stars",
            },
            cloudyDay: {
                c1: "#6c7f95",
                c2: "#1e2733",
                c3: "#93a4b5",
                accent: "#aebccb",
                particle: null,
            },
            cloudyNight: {
                c1: "#232c3d",
                c2: "#05070c",
                c3: "#3a4658",
                accent: "#7688a8",
                particle: null,
            },
            rainDay: {
                c1: "#3c5a75",
                c2: "#111c26",
                c3: "#57798f",
                accent: "#8fb5cf",
                particle: "rain",
            },
            rainNight: {
                c1: "#141d2b",
                c2: "#000000",
                c3: "#233042",
                accent: "#5f7c99",
                particle: "rain",
            },
            thunder: {
                c1: "#2a2d43",
                c2: "#08090f",
                c3: "#41395c",
                accent: "#8b7ee0",
                particle: "rain",
            },
            snow: {
                c1: "#6e7f92",
                c2: "#232b35",
                c3: "#c8d6e0",
                accent: "#e8f1f7",
                particle: "snow",
            },
            fog: {
                c1: "#5b6673",
                c2: "#22262c",
                c3: "#828d98",
                accent: "#c3cbd2",
                particle: null,
            },
        };

        // Thunder
        if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode))
            return themes.thunder;
        // Snow / sleet / ice
        if (
            [
                1066, 1069, 1072, 1114, 1117, 1147, 1150, 1153, 1168, 1171, 1204, 1207,
                1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261,
                1264,
            ].includes(conditionCode)
        )
            return themes.snow;
        // Rain / drizzle
        if (
            [
                1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240,
                1243, 1246,
            ].includes(conditionCode)
        )
            return day ? themes.rainDay : themes.rainNight;
        // Fog / mist / haze
        if ([1030, 1135, 1147].includes(conditionCode)) return themes.fog;
        // Cloudy / overcast
        if ([1003, 1006, 1009, 1030].includes(conditionCode))
            return day ? themes.cloudyDay : themes.cloudyNight;
        // Clear / sunny (default fallback)
        return day ? themes.clearDay : themes.clearNight;
    }

    function applyTheme(theme) {
        els.root.style.setProperty("--bg-1", theme.c1);
        els.root.style.setProperty("--bg-2", theme.c2);
        els.root.style.setProperty("--bg-3", theme.c3);
        els.root.style.setProperty("--accent", theme.accent);
        spawnParticles(theme.particle);
    }

    function spawnParticles(type) {
        els.particles.innerHTML = "";
        clearInterval(particleTimer);
        if (!type || type === "stars") return;

        const create = () => {
            const el = document.createElement("div");
            const left = Math.random() * 100;
            const duration =
                type === "rain" ? 0.6 + Math.random() * 0.5 : 6 + Math.random() * 6;
            const delay = Math.random() * 2;

            if (type === "rain") {
                el.className = "drop";
                el.style.left = left + "vw";
                el.style.animationDuration = duration + "s";
                el.style.animationDelay = delay + "s";
                el.style.opacity = (0.3 + Math.random() * 0.5).toFixed(2);
            } else if (type === "snow") {
                el.className = "flake";
                const size = 2 + Math.random() * 4;
                el.style.width = size + "px";
                el.style.height = size + "px";
                el.style.left = left + "vw";
                el.style.animationDuration = duration + "s";
                el.style.animationDelay = delay + "s";
                el.style.setProperty("--drift", Math.random() * 40 - 20 + "px");
                el.style.opacity = (0.4 + Math.random() * 0.5).toFixed(2);
            }
            els.particles.appendChild(el);
            setTimeout(() => el.remove(), (duration + delay) * 1000 + 200);
        };

        for (let i = 0; i < 24; i++) setTimeout(create, i * 80);
        particleTimer = setInterval(create, type === "rain" ? 90 : 260);
    }

    // ============================================
    // UI state helpers
    // ============================================

    function showLoading() {
        els.loadingCard.hidden = false;
        els.weatherCard.hidden = true;
        els.errorCard.hidden = true;
    }

    function showWeather() {
        els.loadingCard.hidden = true;
        els.weatherCard.hidden = false;
        els.errorCard.hidden = true;
    }

    function showError(message) {
        els.loadingCard.hidden = true;
        els.weatherCard.hidden = true;
        els.errorCard.hidden = false;
        els.errorMessage.textContent =
            message || "Something went wrong. Please try searching for a city.";
    }

    let toastTimer = null;
    function showToast(message) {
        els.toast.textContent = message;
        els.toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => els.toast.classList.remove("show"), 3600);
    }

    function setLocBtnLoading(isLoading) {
        els.locBtn.classList.toggle("spinning", isLoading);
    }

    // ============================================
    // Rendering
    // ============================================

    function render(data) {
        lastData = data;
        const { location, current, forecast } = data;
        const astro = forecast?.forecastday?.[0]?.astro;

        els.cityName.textContent = location.name;
        els.regionName.textContent = [location.region, location.country]
            .filter(Boolean)
            .join(", ");

        const localDate = new Date(location.localtime.replace(" ", "T"));
        els.localTime.textContent = localDate.toLocaleString(undefined, {
            weekday: "short",
            hour: "numeric",
            minute: "2-digit",
        });

        els.condIcon.src = current.condition.icon.startsWith("//")
            ? "https:" + current.condition.icon
            : current.condition.icon;
        els.condIcon.alt = current.condition.text;
        els.condText.textContent = current.condition.text;

        els.humidity.textContent = `${current.humidity}%`;
        els.uv.textContent = current.uv;
        els.sunrise.textContent = astro?.sunrise ?? "—";
        els.sunset.textContent = astro?.sunset ?? "—";
        els.precip.textContent = `${current.precip_mm} mm`;

        applyUnits();

        const theme = getTheme(current.condition.code, current.is_day);
        applyTheme(theme);

        showWeather();
    }

    function applyUnits() {
        if (!lastData) return;
        const { current } = lastData;

        if (currentUnit === "C") {
            els.temp.textContent = `${Math.round(current.temp_c)}°`;
            els.feelsLike.textContent = `Feels like ${Math.round(current.feelslike_c)}°`;
            els.wind.textContent = `${Math.round(current.wind_kph)} km/h`;
            els.pressure.textContent = `${Math.round(current.pressure_mb)} mb`;
            els.visibility.textContent = `${current.vis_km} km`;
        } else {
            els.temp.textContent = `${Math.round(current.temp_f)}°`;
            els.feelsLike.textContent = `Feels like ${Math.round(current.feelslike_f)}°`;
            els.wind.textContent = `${Math.round(current.wind_mph)} mph`;
            els.pressure.textContent = `${Math.round(current.pressure_in)} in`;
            els.visibility.textContent = `${current.vis_miles} mi`;
        }
    }

    // ============================================
    // Networking
    // ============================================

    async function fetchWeather(query) {
        const url = `${API_BASE}?key=${API_KEY}&q=${encodeURIComponent(query)}&days=1&aqi=no&alerts=no`;
        const res = await fetch(url);

        if (!res.ok) {
            let msg = "Couldn't find that location.";
            try {
                const errJson = await res.json();
                if (errJson?.error?.message) msg = errJson.error.message;
            } catch (_) { }
            throw new Error(msg);
        }
        return res.json();
    }

    async function loadWeatherFor(query, { silent } = {}) {
        if (!silent) showLoading();
        try {
            const data = await fetchWeather(query);
            render(data);
        } catch (err) {
            if (query !== FALLBACK_QUERY) {
                showToast(`${err.message} Showing ${FALLBACK_CITY} instead.`);
                return loadWeatherFor(FALLBACK_QUERY);
            }
            showError(err.message || "Couldn't load weather right now.");
        }
    }

    async function loadWeatherForCoords(lat, lon) {
        showLoading();
        try {
            const data = await fetchWeather(`${lat},${lon}`);
            render(data);
        } catch (err) {
            showToast(
                `Couldn't load your local weather. Showing ${FALLBACK_CITY} instead.`,
            );
            await loadWeatherFor(FALLBACK_QUERY);
        }
    }

    // ============================================
    // Geolocation
    // ============================================

    function detectLocation() {
        if (!("geolocation" in navigator)) {
            loadWeatherFor(FALLBACK_QUERY);
            return;
        }

        showLoading();
        setLocBtnLoading(true);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocBtnLoading(false);
                loadWeatherForCoords(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
                setLocBtnLoading(false);
                showToast(`Location unavailable. Showing ${FALLBACK_CITY} instead.`);
                loadWeatherFor(FALLBACK_QUERY);
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 },
        );
    }

    // ============================================
    // Event wiring
    // ============================================

    function handleSearch() {
        const value = els.cityInput.value.trim();
        if (!value) {
            showToast("Type a city name first.");
            return;
        }
        loadWeatherFor(value);
        els.cityInput.blur();
    }

    els.searchBtn.addEventListener("click", handleSearch);
    els.cityInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleSearch();
    });

    els.locBtn.addEventListener("click", detectLocation);

    els.retryBtn.addEventListener("click", () => loadWeatherFor(FALLBACK_QUERY));

    els.unitC.addEventListener("click", () => {
        if (currentUnit === "C") return;
        currentUnit = "C";
        els.unitC.classList.add("active");
        els.unitF.classList.remove("active");
        applyUnits();
    });

    els.unitF.addEventListener("click", () => {
        if (currentUnit === "F") return;
        currentUnit = "F";
        els.unitF.classList.add("active");
        els.unitC.classList.remove("active");
        applyUnits();
    });

    // ============================================
    // Boot
    // ============================================

    detectLocation();
})();
