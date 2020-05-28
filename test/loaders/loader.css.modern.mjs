import { getURL } from "../../src/loader.utils.mjs";
import Fetch from "../../src/loader.fetch.mjs";
import Load from "../../src/loader.load.mjs";
import css from "../../src/loaders/loader.css.modern.mjs";

describe("stylesheet loader (modern)", () => {
    const lfetch = new Fetch();
    const lload = new Load();
    lload.register("css", css);

    it("should return a promise which resolves to a CSSStyleSheet object", async () => {
        const path = "/base/test/resources/css.inherit.css";

        const blob = await lfetch.fetch(getURL(path).href);
        const stylesheet = await lload.load(blob);

        expect(stylesheet).to.be.an.instanceof(CSSStyleSheet);

        return stylesheet;
    });

    it("should attach stylesheet to document if no different option is specified", async () => {
        const sheets = document.adoptedStyleSheets;
        const path = "/base/test/resources/css.blue-background.css";
        const getBodyBackgroundColor = () =>
            getComputedStyle(document.body).backgroundColor;

        expect(getBodyBackgroundColor()).to.equals("rgba(0, 0, 0, 0)");

        const blob = await lfetch.fetch(getURL(path).href);
        const stylesheet = await lload.load(blob);

        expect(getBodyBackgroundColor()).to.equals("rgb(0, 0, 255)");

        document.adoptedStyleSheets = sheets;
        return stylesheet;
    });
});
