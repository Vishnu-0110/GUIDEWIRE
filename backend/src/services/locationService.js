const axios = require("axios");
const env = require("../config/env");

async function validateLocation({ lat, lng, city }) {
  if (!lat || !lng || !city) return { valid: true, source: "partial_input" };

  if (!env.mapsApiKey) {
    return { valid: true, source: "mock_maps" };
  }

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          latlng: `${lat},${lng}`,
          key: env.mapsApiKey
        },
        timeout: 7000
      }
    );

    const results = response.data?.results || [];
    const inCity = results.some((result) =>
      result.formatted_address.toLowerCase().includes(city.toLowerCase())
    );

    return { valid: inCity, source: "google_maps" };
  } catch (error) {
    return { valid: true, source: "maps_fallback" };
  }
}

module.exports = { validateLocation };
