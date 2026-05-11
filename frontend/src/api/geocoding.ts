interface ZipcloudResult {
    address1: string;
    address2: string;
    address3: string;
    prefcode: string;
    zipcode: string;
}

interface ZipcloudResponse {
    status: number;
    message: string | null;
    results: ZipcloudResult[] | null;
}

export interface PostalAddress {
    address: string;
    prefecture: string;
}

export const lookupPostalCode = async (zipcode: string): Promise<PostalAddress | null> => {
    const clean = zipcode.replace(/-/g, '');
    if (clean.length !== 7) return null;
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${clean}`);
    const data: ZipcloudResponse = await res.json();
    if (!data.results || data.results.length === 0) return null;
    const r = data.results[0];
    return {
        address: r.address1 + r.address2 + r.address3,
        prefecture: r.address1,
    };
};

interface NominatimResult {
    lat: string;
    lon: string;
}

export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'ja' } });
    const data: NominatimResult[] = await res.json();
    if (!data || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
};
