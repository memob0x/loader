import { getComputed } from './toolbox/src/toolbox.utils.js';
import { Media } from './loader.media.js';
import { allSupportedTags } from './loader.settings.js';

/**
 *
 * @param {HTMLElement} [element=document.body]
 * @param {Object} [options={ srcAttr: 'src', srcsetAttr: 'srcset', backgrounds: false }]
 * @returns {Array}
 */
export const find = (element = document.body, options = {}) => {
    let settings = {
        ...{
            srcAttributes: {
                src: !!!options.lazy ? 'src' : 'data-src',
                srcset: !!!options.lazy ? 'srcset' : 'data-srcset'
            },
            sizesAttributes: {
                sizes: !!!options.lazy ? 'sizes' : 'data-sizes',
                media: !!!options.lazy ? 'media' : 'data-media'
            },
            backgrounds: false
        },
        ...options
    };

    let collection = [];

    const tagsSelector = allSupportedTags.join(',');
    const srcAttributesValues = Object.values(settings.srcAttributes);
    const srcAttributesSelector = srcAttributesValues.map(x => '[' + x + ']').join(',');

    let targets = [...element.querySelectorAll(tagsSelector)].filter(el => !el.parentElement || el.parentElement.tagName.toLowerCase() !== 'picture');
    if (element.matches(tagsSelector) && (!element.parentElement || element.parentElement.tagName.toLowerCase() !== 'picture')) {
        targets.push(element);
    }

    targets.forEach(target => {
        let source = target;

        if (target.querySelectorAll('source').length) {
            source = target.querySelectorAll('source');
            source = [...source][0];
        }

        if (source.matches(srcAttributesSelector)) {
            let attribute = '';

            for (let i = 0, j = srcAttributesValues.length; i < j; i++) {
                attribute = source.getAttribute(srcAttributesValues[i]);
                if (attribute) {
                    break;
                }
            }

            collection.push(
                new Media({
                    element: target,
                    url: attribute
                })
            );
        }
    });

    if (true === settings.backgrounds) {
        targets = [...element.querySelectorAll('*')];
        targets.push(element);
        targets = targets.filter(target => !target.matches(tagsSelector));
        targets = targets.filter(target => getComputed(target, 'background-image') !== 'none');
        targets.forEach(target => {
            const url = getComputed(target, 'background-image').match(/\((.*?)\)/);

            if (null !== url && url.length >= 2) {
                collection.push(
                    new Media({
                        element: target,
                        url: url[1].replace(/('|")/g, '')
                    })
                );
            }
        });
    }

    return collection;
};