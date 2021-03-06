import { promises as fs, existsSync } from "fs";
import { basename } from "path";
import Handlebars from "handlebars";
import layouts from "handlebars-layouts";
import { name, buffer, extension, each } from "./utils.mjs";

Handlebars.registerHelper(layouts(Handlebars));

const getModel = async (path) =>
    JSON.parse(existsSync(path) ? await buffer(path) : "{}");

const buildView = async (view, data) =>
    Handlebars.compile(view)({}, { data: data });

export const registerHbsPartial = async (name, path) =>
    Handlebars.registerPartial(name, await buffer(path));

export const eachHbs = async (path, callback) =>
    await each(path, "hbs", callback);

export default async (path, dest) => {
    console.log(`${path}: start`);

    var model = await getModel(extension(path, "json"));

    await fs.writeFile(
        `${dest}/${name(path, "html")}`,
        await buildView(await buffer(path), {
            ...model,
            path: dest,
            folder: basename(dest)
        })
    );

    console.log(`${path}: end`);
};
