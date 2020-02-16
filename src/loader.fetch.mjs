import { isCORS } from "./loader.utils.mjs";
import _load from "./loader.load.mjs";
import loaderWorker from "./loader.worker.mjs";
import LoaderResource from "./loader.resource.mjs";

// ...
const collection = {};

/**
 *
 * @param {LoaderResource} resource
 * @param {Object} options
 */
export default async (resource, options = {}) => {
    // ...
    if (resource.url.href in collection) {
        const el = resource.el;

        resource = await collection[resource.url.href];

        return new LoaderResource({ ...resource, ...{ el: el } }, true);
    }

    // ...
    if (isCORS(resource) && options.fetch.cors !== "no-cors") {
        return (collection[resource.url.href] = _load(
            resource,
            options,
            false
        ));
    }

    // ...
    return (collection[resource.url.href] = new Promise((resolve, reject) => {
        const worker = loaderWorker();

        // ...
        worker.postMessage({
            href: resource.url.href,
            options: options.fetch
        });

        // ...
        worker.addEventListener("message", event => {
            const data = event.data;

            // ...
            if (data.href !== resource.url.href) {
                return;
            }

            // ...
            if (data.status === 200) {
                resource = new LoaderResource(
                    { ...resource, ...{ blob: data.blob } },
                    true
                );

                resolve(resource);

                return;
            }

            // ...
            reject(new Error(`${data.statusText} ${data.href}`));
        });
    }));
};
