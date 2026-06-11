import { postexConfig } from "../config/postex.config.js";

const request = async (endpoint, method = "GET", body = null) => {
    const res = await fetch(postexConfig.baseURL + endpoint, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Api-Key": postexConfig.apiKey
        },
        body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Postex API error");
    }

    return res.json();
};

export const getProvinces = () => request("/locality/provinces");

export const getCitiesByProvince = (provinceCode) =>
    request(`/locality/cities/to/${provinceCode}`);

export const calculateShipping = (data) =>
    request("/rate/calculate", "POST", data);
