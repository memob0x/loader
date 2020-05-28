import modern from "./loader.css.modern.mjs";
import legacy from "./loader.css.legacy.mjs";

export default async (blob, options) => {
    const url = URL.createObjectURL(blob);

    try {
        return await modern(url, options);
    } catch {
        return await legacy(url);
    }
};
