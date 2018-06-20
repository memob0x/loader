/*! Nite Loader | Daniele Fioroni | dfioroni91@gmail.com */
(() => {
	'use strict';

	/**
	 * @returns {string}
	 */
	const generateInstanceID = () => {
		return Math.floor(Math.random() * (9999 - 1000)) + 1000;
	};

	const pluginPrefix = 'nite';
	const pluginMethod = pluginPrefix + 'Load';
	const pluginName = pluginMethod + 'er';
	const pluginInstance = generateInstanceID();
	const eventNamespaceParserSeparator = '__namespace__';

	const CustomEvent =
		window.CustomEvent ||
		(() => {
			const _polyfill = (event, params) => {
				params = params || { bubbles: false, cancelable: false, detail: undefined };
				const evt = document.createEvent('CustomEvent');
				evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
				return evt;
			};
			_polyfill.prototype = window.Event.prototype;
			return _polyfill;
		})();

	const supportedExtensions = {
		image: 'jp[e]?g|jpe|jif|jfif|jfi|gif|png|tif[f]?|bmp|dib|webp|ico|cur|svg',
		audio: 'mp3|ogg|oga|spx|ogg|wav',
		video: 'mp4|ogv|webm'
	};
	const supportedTags = {
		image: 'img|picture|source',
		audio: 'audio|source',
		video: 'video|source'
	};

	const IntersectionObserverSupported = 'IntersectionObserver' in window;
	const pictureElementSupported = 'HTMLPictureElement' in window;

	/**
	 * @param {string} heystack
	 * @param {string} needle
	 * @returns {boolean}
	 */
	const stringContains = (heystack, needle) => {
		return String.prototype.includes ? heystack.includes(needle) : heystack.indexOf(needle, 0) !== -1;
	};

	/**
	 * @param {string} heystack
	 * @param {string} needle
	 * @returns {boolean}
	 */
	const stringStartsWith = (heystack, needle) => {
		return String.prototype.startsWith
			? heystack.startsWith(needle)
			: heystack.substr(0, needle.length) === needle;
	};

	/**
	 * @param {Array} heystack
	 * @param {Function} filter
	 * @returns {number}
	 */
	const arrayFindIndex = (heystack, filter) => {
		return Array.prototype.findIndex
			? heystack.findIndex(filter)
			: (() => {
					let length = heystack.length,
						index = -1;
					while (++index < length) {
						if (filter(heystack[index], index, heystack)) {
							return index;
						}
					}
					return -1;
			  })();
	};

	/**
	 * @param {HTMLElement} element
	 * @param {string} events
	 * @returns {undefined}
	 */
	const detachEventListener = (element, events) => {
		if (!element || typeof events !== 'string') {
			return;
		}

		if (stringStartsWith(events, '.')) {
			for (let key in privateEventsStorage) {
				const eventNameWithNamespace = key.replace(eventNamespaceParserSeparator, '.');
				if (
					stringContains(eventNameWithNamespace, events) &&
					privateEventsStorage[key].element === element
				) {
					detachEventListener(element, eventNameWithNamespace);
				}
			}
		} else {
			events = events.split('.');

			const type = events[0],
				namespace = events[1];

			if (namespace) {
				events = events.join(eventNamespaceParserSeparator);
			}

			if (events in privateEventsStorage) {
				element.removeEventListener(type, privateEventsStorage[events].handler);
				delete privateEventsStorage[events];
			}
		}
	};

	/**
	 * @param {HTMLElement} element
	 * @param {string} events
	 * @param {Function} handler
	 * @param {boolean} once
	 * @returns {undefined}
	 */
	const attachEventListener = (element, events, handler, once) => {
		if (!element || typeof events !== 'string' || typeof handler !== 'function') {
			return;
		}

		events = events.split('.');

		const type = events[0];
		const namespace = events[1];

		if (namespace) {
			events = events.join(eventNamespaceParserSeparator);
		}

		privateEventsStorage[events] = { element: element, count: 0, once: false };

		if (true === once) {
			let _handler = handler;
			handler = function(event) {
				if (events in privateEventsStorage) {
					privateEventsStorage[events].count++;
					if (privateEventsStorage[events].once && privateEventsStorage[events].count > 1) {
						return;
					}
					_handler.call(this, event);
				}
				detachEventListener(element, events);
			};
		} else {
			once = false;
		}

		privateEventsStorage[events] = {
			...privateEventsStorage[events],
			...{ handler: handler, once: once }
		};

		element.addEventListener(type, privateEventsStorage[events].handler, { once: once });
	};

	/**
	 * @param {string} string
	 * @returns {string}
	 */
	const hyphensToCamelCase = string => {
		return string.replace(/-([a-z])/g, g => g[1].toUpperCase());
	};

	/**
	 * @param {string} string
	 * @returns {string}
	 */
	const capitalize = string => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	/**
	 * @param {NodeList} nodelist
	 * @returns {Array}
	 */
	const nodelistToArray = nodelist => {
		return [...nodelist];
	};

	/**
	 * @param {String|number} needle
	 * @param {Array} heystack
	 * @returns {boolean}
	 */
	const isInArray = (needle, heystack) => {
		return heystack.indexOf(needle) > -1;
	};

	/**
	 * @param {HTMLElement} element
	 * @returns {boolean}
	 */
	const isVisible = element => {
		if (IntersectionObserverSupported && 'intersectionRatio' in element) {
			return element.intersectionRatio > 0;
		}

		if (window.getComputedStyle(element, 'display') === 'none') {
			return false;
		}

		const bodyEl = document.getElementsByTagName('body')[0];
		const winWidth = window.innerWidth || documnt.documentElement.clientWidth || bodyEl.clientWidth;
		const winHeight = window.innerHeight || documnt.documentElement.clientHeight || bodyEl.clientHeight;
		const rect = element.getBoundingClientRect();

		return !(rect.right < 0 || rect.bottom < 0 || rect.left > winWidth || rect.top > winHeight);
	};

	/**
	 * @param {HTMLElement} element
	 * @returns {boolean}
	 */
	const isHTMLElement = element => {
		if (typeof element !== 'object') {
			return false;
		}
		try {
			return element instanceof HTMLElement;
		} catch (e) {
			return (
				element.nodeType === 1 &&
				typeof element.style === 'object' &&
				typeof element.ownerDocument === 'object'
			);
		}
	};

	/**
	 * @param {(string|HTMLVideoElement|HTMLAudioElement|HTMLImageElement)} source
	 * @returns {boolean}
	 */
	const isLoaded = source => {
		return (
			(typeof source === 'string' && isInArray(source, privateCache)) ||
			(isHTMLElement(source) &&
				('currentSrc' in source && source.currentSrc.length > 0) &&
				(('complete' in source && source.complete) ||
					('readyState' in source && source.readyState >= 2)))
		);
	};

	/**
	 * @param {(HTMLVideoElement|HTMLAudioElement)} source
	 * @returns {boolean}
	 */
	const isFullyBuffered = media => {
		return (
			media.buffered.length &&
			Math.round(media.buffered.end(0)) / Math.round(media.seekable.end(0)) === 1
		);
	};

	/**
	 * @param {(string|HTMLElement)} source
	 * @returns {boolean}
	 */
	const isBroken = source => {
		return (
			isLoaded(source) &&
			((isHTMLElement(source) &&
				(('naturalWidth' in source && Math.floor(source.naturalWidth) === 0) ||
					('videoWidth' in source && source.videoWidth === 0))) ||
				typeof source === 'string')
		);
	};

	/**
	 * @param {Object} resource
	 * @returns {Object}
	 */
	const decodeResource = resource => {
		let output = { format: null, extension: null, tag: null, consistent: false };

		resource.resource = resource.resource.split('?')[0];
		resource.resource = resource.resource.split('#')[0];
		for (let formatCandidate in supportedExtensions) {
			const base64Heading = ';base64,';

			if (
				new RegExp('(.(' + supportedExtensions[formatCandidate] + ')$)|' + base64Heading, 'g').test(
					resource.resource
				)
			) {
				if (new RegExp(base64Heading, 'g').test(resource.resource)) {
					let matches64 = resource.resource.match(
						new RegExp(
							'^data:' + formatCandidate + '/(' + supportedExtensions[formatCandidate] + ')',
							'g'
						)
					);

					if (null === matches64) {
						return;
					}

					matches64 = matches64[0];

					output.format = formatCandidate;
					output.extension = matches64.replace('data:' + formatCandidate + '/', '');
					output.tag = supportedTags[formatCandidate];

					break;
				} else {
					let matches = resource.resource.match(
						new RegExp(supportedExtensions[formatCandidate], 'g')
					);

					if (matches) {
						output.format = formatCandidate;
						output.extension = matches[0];
						output.tag = supportedTags[formatCandidate];

						break;
					}
				}
			}
		}

		if (isHTMLElement(resource.element)) {
			let tagName = resource.element.tagName.toLowerCase();
			let allTags = '';

			Object.values(supportedTags).forEach(tags => {
				allTags += '|' + tags;
			});

			allTags = allTags.split('|');

			if (isInArray(tagName, allTags)) {
				output.tag = tagName;
				output.consistent = true;
				if (output.format === null) {
					for (let format in supportedTags) {
						if (stringContains(supportedTags[format], output.tag)) {
							output.format = format;
							break;
						}
					}
				}
			}
		}

		if (stringContains(output.tag, '|')) {
			output.tag = output.tag.split('|')[0];
		}

		return output;
	};

	let privateEventsStorage = {};

	let privateCache = [];

	// TODO: Promise support
	// TODO: think about useful vars in callback args (this class is not public but its vars are returned in .progress() callback)
	/** TODO: description of the MyClass constructor function.
	 * @class
	 * @classdesc TODO: description of the SingleLoader class.
	 */
	class SingleLoader {
		/**
		 * @param {Object} [options={ srcAttr: 'data-src', srcsetAttr: 'data-srcset', playthrough: false, visible: false }]
		 */
		constructor(options) {
			this._settings = {
				...{
					srcAttr: 'data-src',
					srcsetAttr: 'data-srcset',
					playthrough: false,
					visible: false
				},
				...options
			};

			if (
				!stringStartsWith(this._settings.srcAttr, 'data-') ||
				!stringStartsWith(this._settings.srcsetAttr, 'data-')
			) {
				throw new Error(
					'Wrong arguments format: srcAttr and srcsetAttr parameters must be dataset values.'
				);
			}

			this.srcAttr = hyphensToCamelCase(this._settings.srcAttr.replace('data-', ''));
			this.srcsetAttr = hyphensToCamelCase(this._settings.srcsetAttr.replace('data-', ''));

			this._id = null;
			this._idEvent = null;
			this._busy = false;

			this._element = null;
			this._resource = null;
			this._format = null;
			this._observer = null;

			this._done = () => {};
			this._success = () => {};
			this._error = () => {};

			this._callback = e => {
				this._busy = false;
				if (null !== this._observer) {
					this._observer.unobserve(this._element);
				}

				const src = this._element.currentSrc || this._element.src;

				if (!isInArray(src, privateCache)) {
					privateCache.push(src);
				}

				let thisArguments = [this._element, e.type, src, this._id];

				this[e.type !== 'error' ? '_success' : '_error'].apply(this, thisArguments);
				this._done.apply(this, thisArguments);
			};
		}

		/**
		 * @param {Object} data
		 */
		set resource(data) {
			if (typeof data === 'object' && 'id' in data && 'element' in data && 'resource' in data) {
				this._id = data.id;
				this._element = data.element;
				this._resource = data.resource;

				let info = decodeResource({
					resource: this._resource,
					element: this._element
				});
				this._tag = info.tag;
				this._consistent = info.consistent;
				this._format = info.format;
				this._exists = this._element !== null;
				this._originalElement = this._element;

				if (!this._exists || !this._consistent) {
					this._element = document.createElement(this._tag);
					this._element.dataset[this.srcAttr] = this._resource;
				}

				if (this._exists && this._settings.visible && IntersectionObserverSupported) {
					this._observer = new IntersectionObserver(
						(entries, observer) => {
							entries.forEach(
								entry => (entry.target.intersectionRatio = entry.intersectionRatio)
							);
						},
						{
							root: null,
							rootMargin: '0px',
							threshold: 0.1
						}
					);
					this._observer.observe(this._originalElement);
				}

				this._idEvent = this._element[pluginInstance + '_IDEvent'];
				this._busy = this._idEvent !== undefined;
				this._idEvent = this._busy
					? this._idEvent
					: pluginName + '_unique_' + this._element.tagName + '_' + generateInstanceID();
			}
		}

		/**
		 * @returns {string}
		 */
		get resource() {
			return this._resource;
		}

		/**
		 * @returns {boolean} se ha preso in carico il caricamento oppure no per vari motivi (è già caricato, non è nella viewport etc)
		 */
		load() {
			if (isLoaded(this._exists && this._consistent ? this._element : this._resource)) {
				if (!this._busy) {
					// TODO: mayabe this should be called in this._callback
					detachEventListener(this._element, '.' + this._idEvent);
				}

				this._callback(
					new CustomEvent(
						!isBroken(this._exists && this._consistent ? this._element : this._resource)
							? 'load'
							: 'error'
					)
				);

				return false;
			} else if (this._exists && this._settings.visible && !isVisible(this._originalElement)) {
				return false;
			} else {
				if (this._format === 'image') {
					attachEventListener(this._element, 'load.' + this._idEvent, this._callback, !this._busy);
					attachEventListener(this._element, 'error.' + this._idEvent, this._callback, !this._busy);

					const picture = this._element.closest('picture');

					if (picture && pictureElementSupported) {
						delete this._element.dataset[this.srcsetAttr];
						delete this._element.dataset[this.srcAttr];

						picture.querySelectorAll('source[' + this._settings.srcsetAttr + ']').forEach(el => {
							el.setAttribute('srcset', el.dataset[this.srcAttr]);
							delete el.dataset[this.srcAttr];
						});
					} else {
						if (this._element.matches('[' + this._settings.srcsetAttr + ']')) {
							this._element.setAttribute('srcset', this._element.dataset[this.srcsetAttr]);
							delete this._element.dataset[this.srcsetAttr];
						}

						if (this._element.matches('[' + this._settings.srcAttr + ']')) {
							this._element.setAttribute('src', this._element.dataset[this.srcAttr]);
							delete this._element.dataset[this.srcAttr];
						}
					}
				} else if (this._format === 'video' || this._format === 'audio') {
					const isStandardPlaythrough = true === this._settings.playthrough;
					const isFullPlaythrough = 'full' === this._settings.playthrough;
					const sources = this._element.querySelectorAll('source');

					let callMediaLoad = false;

					if (sources) {
						sources.forEach(source => {
							if (source.matches('[' + this._settings.srcAttr + ']')) {
								source.setAttribute('src', source.dataset[this.srcAttr]);
								delete source.dataset[this.srcsetAttr];

								callMediaLoad = true;
							}

							attachEventListener(
								source,
								'error.' + this._idEvent,
								e => {
									const sourcesErrorId = pluginName + '_error';

									source[pluginInstance + '_' + sourcesErrorId] = true;

									if (
										sources.length ===
										nodelistToArray(sources).filter(
											thisSource =>
												true === thisSource[pluginInstance + '_' + sourcesErrorId]
										).length
									) {
										this._callback(e);
									}
								},
								!this._busy
							);
						});
					} else if (this._element.matches('[' + this._settings.srcAttr + ']')) {
						this._element.setAttribute('src', this._element.dataset[this.srcAttr]);
						delete this._element.dataset[this.srcAttr];

						attachEventListener(
							this._element,
							'error.' + this._idEvent,
							this._callback,
							!this._busy
						);

						callMediaLoad = true;
					}

					if (callMediaLoad) {
						this._element.load();
					}

					attachEventListener(
						this._element,
						'loadedmetadata.' + this._idEvent,
						() => {
							if (!isStandardPlaythrough && !isFullPlaythrough) {
								this._callback(new CustomEvent('load'));
							}

							if (isFullPlaythrough) {
								let onProgressReplacementInterval = setInterval(() => {
									let isError = this._element.readyState > 0 && !this._element.duration;

									if (isError || isFullyBuffered(this._element)) {
										this._element.currentTime = 0;

										if (
											!isError &&
											!this._busy &&
											this._element.paused &&
											this._element.matches('[autoplay]')
										) {
											this._element.play();
										}

										clearInterval(onProgressReplacementInterval);

										this._callback(new CustomEvent(!isError ? 'load' : 'error'));
									} else {
										if (!this._element.paused) {
											this._element.pause();
										}

										if (!this._busy) {
											this._element.currentTime += 2;
										}
									}
								}, 500);

								this._element[
									pluginName + '_' + this._idEvent
								] = onProgressReplacementInterval;
							}
						},
						!this._busy
					);

					attachEventListener(
						this._element,
						'canplay.' + this._idEvent,
						() => {
							if (
								isFullPlaythrough &&
								this._element.currentTime === 0 &&
								!isFullyBuffered(this._element)
							) {
								this._element.currentTime++;
							}
						},
						!this._busy
					);

					attachEventListener(
						this._element,
						'canplaythrough.' + this._idEvent,
						() => {
							if (isStandardPlaythrough) {
								this._callback(new CustomEvent('load'));
							}
						},
						!this._busy
					);
				} else {
					return false;
				}

				if (!this._busy) {
					this._element[pluginInstance + '_IDEvent'] = this._idEvent;
				}
			}

			this._resource = this._element.currentSrc || this._element.src;

			return !this._busy;
		}

		/**
		 * @param {Function} callback
		 * @returns {undefined}
		 */
		done(callback) {
			if (typeof callback !== 'function') {
				return;
			}

			this._done = function(element, status, resource, id) {
				callback.apply(this, [element, status, resource, id]);
			};
		}

		/**
		 * @returns {undefined}
		 */
		abort() {
			detachEventListener(this._element, '.' + this._idEvent);

			if (isLoaded(this._exists ? this._element : this._resource)) {
				return;
			}

			const src = this._element.getAttribute('srcset'),
				srcset = this._element.getAttribute('src');

			if (undefined !== src) {
				this._element.dataset[this.srcAttr] = src;
				this._element.setAttribute(this._settings.srcAttr, src);
				this._element.removeAttribute('src');
				this._element.removeAttribute('srcset');
			}

			if (undefined !== srcset) {
				this._element.dataset[this.srcsetAttr] = srcset;
				this._element.setAttribute(this._settings.srcsetAttr, srcset);
				this._element.removeAttribute('src');
				this._element.removeAttribute('srcset');
			}
		}
	}

	// TODO: Promise support
	// TODO: private vars
	// TODO: refactory succes/done/progress code...
	/** TODO: description of the MyClass constructor function.
	 * @class
	 * @classdesc TODO: description of the Loader class.
	 */
	class Loader {
		/**
		 * @param {Object} [options={srcAttr: 'data-src', srcsetAttr: 'data-srcset', playthrough: false, visible: false, backgrounds: false }]
		 */
		constructor(options) {
			this._collection = [];
			this._collectionLoaded = [];
			this._collectionInstances = [];
			this._collectionPending = [];
			this._resourcesLoaded = [];

			this._settings = {
				...{
					srcAttr: 'data-src',
					srcsetAttr: 'data-srcset',
					playthrough: false,
					visible: false,
					backgrounds: false
				},
				...options
			};

			if (
				!stringStartsWith(this._settings.srcAttr, 'data-') ||
				!stringStartsWith(this._settings.srcsetAttr, 'data-')
			) {
				throw new Error(
					'Wrong arguments format: srcAttr and srcsetAttr parameters must be dataset values.'
				);
			}

			this.srcAttr = hyphensToCamelCase(this._settings.srcAttr.replace('data-', ''));
			this.srcsetAttr = hyphensToCamelCase(this._settings.srcsetAttr.replace('data-', ''));

			this.percentage = 0;

			this._done = () => {};
			this._progress = () => {};
			this._success = () => {};
			this._error = () => {};
			this._loop = this.load;

			this._abort = false;
			this._loaded = 0;
			this._complete = false;
			this._busy = false;
		}

		/**
		 *
		 * @param {HTMLElement} [element=document.body]
		 * @param {Object} [options={ srcAttr: 'src', srcsetAttr: 'srcset', backgrounds: false }]
		 */
		static findResources(element, options) {
			let settings = {
				srcAttr: 'src',
				srcsetAttr: 'srcset',
				backgrounds: false
			};

			if (typeof element === 'object' && undefined === options) {
				for (let key in settings) {
					if (key in element) {
						options = element;
						element = undefined;
						break;
					}
				}
			}

			if (undefined === element || element === document) {
				element = document.body;
			}

			if (!isHTMLElement(element)) {
				throw new Error('TypeError: ' + element + ' is not of type HTMLElement.');
			}

			let collectedResources = [];

			settings = {
				...settings,
				...options
			};

			const targets = 'img, video, audio';
			const targetsExtended = targets + ', picture, source';
			const targetsFilter = '[' + settings.srcAttr + '], [' + settings.srcsetAttr + ']';

			let targetsTags = nodelistToArray(element.querySelectorAll(targets));

			if (element.matches(targetsExtended)) {
				targetsTags.push(element);
			}

			targetsTags = targetsTags.filter(target => {
				let children = nodelistToArray(target.children);
				children = children.filter(x => x.matches(targetsExtended));
				children = children.filter(x => x.matches(targetsFilter));
				return target.matches(targetsFilter) || children.length;
			});
			targetsTags.forEach(target => {
				let targetSource = target;

				if (!targetSource.matches(targetsFilter)) {
					targetSource = targetSource.querySelectorAll(targetsFilter);
					targetSource = [...targetSource][0];
				}

				collectedResources.push({
					element: target,
					resource:
						targetSource.getAttribute(settings.srcAttr) ||
						targetSource.getAttribute(settings.srcsetAttr)
				});
			});

			if (true === settings.backgrounds) {
				let targetsBg = nodelistToArray(element.querySelectorAll('*'));
				targetsBg.push(element);
				targetsBg = targetsBg.filter(target => !target.matches(targetsExtended));
				targetsBg = targetsBg.filter(target => getComputedStyle(target).backgroundImage !== 'none');
				targetsBg.forEach(target => {
					const url = getComputedStyle(target).backgroundImage.match(/\((.*?)\)/);

					if (null !== url && url.length >= 2) {
						collectedResources.push({
							element: target,
							resource: url[1].replace(/('|")/g, '')
						});
					}
				});
			}

			return collectedResources;
		}

		/**
		 * @param {(Array.<String>|HTMLElement)} collection
		 */
		set collection(collection) {
			let collectedResources = collection;

			try {
				collectedResources = Loader.findResources(collection, this._settings);
			} catch (err) {}

			collectedResources.forEach(item => {
				let element = {
					resource: '',
					element: null,
					id: generateInstanceID()
				};

				if (typeof item === 'string') {
					element.resource = item;
				} else if (typeof item === 'object' && 'resource' in item) {
					element = { ...element, ...item };
				} else {
					return;
				}

				this._collection.push(element);
			});
		}

		/**
		 * @returns {Array} collection
		 */
		get collection() {
			return this._collection;
		}

		/**
		 * @returns {undefined}
		 */
		load() {
			if (!this._collection.length) {
				this._done.call(this, this._resourcesLoaded);
			}

			// resets pending elements (sequential opt helper array) every time we loop
			this._collectionPending = [];

			const sequentialMode = true === this._settings.sequential;

			for (let i = 0; i < this._collection.length; i++) {
				if (this._abort) {
					break;
				}

				let thisLoadId = this._collection[i].id;
				let thisLoadIndex = arrayFindIndex(this._collectionInstances, x => x.id === thisLoadId);
				let thisLoadInstance = new SingleLoader(this._settings);

				if (thisLoadIndex === -1) {
					this._collectionInstances.push({
						id: thisLoadId,
						instance: thisLoadInstance
					});
					thisLoadIndex = arrayFindIndex(this._collectionInstances, x => x.id === thisLoadId);
				} else {
					this._collectionInstances[thisLoadIndex].instance = thisLoadInstance;
				}

				thisLoadInstance.resource = this._collection[i];

				thisLoadInstance.done((element, status, resource, id) => {
					if (this._complete || this._abort) {
						return;
					}

					const aProgress = !isInArray(id, this._collectionLoaded);

					if (aProgress) {
						this._collectionLoaded.push(id);
						this._busy = false;

						this._loaded++;
						this.percentage = this._loaded / this._collection.length * 100;
						this.percentage = parseFloat(this.percentage.toFixed(4));

						const thisResource = {
							resource: resource,
							status: status,
							element: element
						};
						this._resourcesLoaded.push(thisResource);
						this._progress.call(this, thisResource);
						this[status !== 'error' ? '_success' : '_error'].call(this, thisResource);
						// TODO: dispatch event on element maybe?
						// element.dispatchEvent(new CustomEvent(pluginPrefix + capitalize(status) + '.' + pluginPrefix));
					}

					if (this._loaded === this._collection.length) {
						this._done.call(this, this._resourcesLoaded);

						this._complete = true;
					} else if (aProgress && sequentialMode && this._collectionPending.length) {
						this._collectionPending = this._collectionPending.filter(x => x.id !== id);

						if (this._collectionPending.length) {
							this._busy = this._collectionPending[0].instance.load();
						}
					}
				});

				if (!sequentialMode || (sequentialMode && !this._busy)) {
					this._busy = thisLoadInstance.load();
				} else if (
					sequentialMode &&
					this._busy &&
					(!this._settings.visible ||
						!thisLoadInstance._exists ||
						(this._settings.visible &&
							thisLoadInstance._exists &&
							isVisible(thisLoadInstance._originalElement)))
				) {
					this._collectionPending.push({
						id: thisLoadId,
						instance: thisLoadInstance
					});
				}
			}
		}

		/**
		 * @param {Function} callback
		 * @returns {undefined}
		 */
		done(callback) {
			if (typeof callback !== 'function') {
				return;
			}

			this._done = function(resources) {
				callback.call(this, resources);
			};
		}

		/**
		 * @param {Function} callback
		 * @returns {undefined}
		 */
		progress(callback) {
			if (typeof callback !== 'function') {
				return;
			}

			this._progress = function(resource) {
				callback.call(this, resource);
			};
		}

		/**
		 * @param {Function} callback
		 * @returns {undefined}
		 */
		success(callback) {
			if (typeof callback !== 'function') {
				return;
			}

			this._success = function(resource) {
				callback.call(this, resource);
			};
		}

		/**
		 * @param {Function} callback
		 * @returns {undefined}
		 */
		error(callback) {
			if (typeof callback !== 'function') {
				return;
			}

			this._error = function(resource) {
				callback.call(this, resource);
			};
		}

		/**
		 * @returns {undefined}
		 */
		abort() {
			this._collectionInstances.forEach(thisInstance => {
				thisInstance.instance.abort();
			});

			this._abort = true;
		}
	}

	// public interface
	// - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// requirejs
	if (typeof define === 'function' && define.amd) {
		define(capitalize(pluginName), Loader);
		// nodejs
	} else if ('object' === typeof exports) {
		module.exports[capitalize(pluginName)] = Loader;
		// vanilla
	} else {
		window[capitalize(pluginName)] = Loader;
	}
	// - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// jQuery interface
	// - - - - - - - - - - - - - - - - - - - -
	if (!('jQuery' in window)) {
		return;
	}

	const $ = jQuery;

	$[capitalize(pluginName)] = Loader;

	const $document = $(document);
	const $window = $(window);
	// thanks https://gist.github.com/beaucharman/e46b8e4d03ef30480d7f4db5a78498ca
	const throttle = (callback, wait, context = this) => {
		let timeout = null;
		let callbackArgs = null;
		const later = () => {
			callback.apply(context, callbackArgs);
			timeout = null;
		};
		return function() {
			if (!timeout) {
				callbackArgs = arguments;
				timeout = setTimeout(later, wait);
			}
		};
	};

	let methodCollection = [];

	$.fn[pluginMethod] = function(options) {
		let originalUserOptions = options;

		if (typeof options !== 'object') {
			options = {};
		}

		let settings = {
			...{
				srcAttr: 'data-src',
				srcsetAttr: 'data-srcset',

				visible: false,
				sequential: false,

				backgrounds: false,
				playthrough: false,

				early: false,
				earlyTimeout: 0,

				onProgress: () => {},
				onLoad: () => {},
				onError: () => {},

				onComplete: () => {}
			},
			...options
		};

		let callback = settings.onComplete;
		if ($.isFunction(originalUserOptions)) {
			callback = originalUserOptions;
		}

		return this.each(function(i) {
			// TODO: mutation observer when new children are appended

			const $element = $(this);
			const uniqueMethodPluginName = generateInstanceID() + i;
			const thisLoadInstance = new Loader(settings);

			thisLoadInstance.collection = this;

			methodCollection.push({
				id: uniqueMethodPluginName,
				instance: thisLoadInstance,
				element: this,
				timeout: null
			});

			thisLoadInstance.progress(resource => {
				$(resource.element).trigger(pluginPrefix + capitalize(resource.status) + '.' + pluginPrefix, [
					resource.element,
					resource.resource
				]);
				$element.trigger(pluginPrefix + 'Progress.' + pluginPrefix, [this, resource]);

				const thisArguments = [thisLoadInstance, resource];

				if (typeof settings.onProgress === 'function') {
					settings.onProgress.apply(this, thisArguments);
				}

				let eventName = capitalize(resource.status);
				if (typeof settings['on' + eventName] === 'function') {
					settings['on' + eventName].apply(this, thisArguments);
				}
			});

			thisLoadInstance.done(resources => {
				$element.trigger(pluginPrefix + 'Complete.' + pluginPrefix, [this, resources]);
				callback.apply(this, [thisLoadInstance, resources]);

				if (settings.visible) {
					/*if (IntersectionObserverSupported) {
                        thisLoadInstance.collection.forEach(item => item.element.intersectionObserver.unobserve(item.element));

                    } else {*/
					$window.off('scroll.' + uniqueMethodPluginName);

					//}
				}

				// refresh other method calls for same el (omitting this one)
				methodCollection = methodCollection.filter(x => x.id !== uniqueMethodPluginName);
				methodCollection.forEach(thisMethodCollection => {
					if ($element.is(thisMethodCollection.element)) {
						thisMethodCollection.instance.load();
					}
				});
			});

			thisLoadInstance.load();

			if (settings.visible) {
				/* if (IntersectionObserverSupported) {

                    thisLoadInstance.collection.forEach(item => {

                        item.element.intersectionObserver = new IntersectionObserver((entries, observer) => {
                            entries.forEach(entry => {
                                if( entry.intersectionRatio > 0 ){
                                    thisLoadInstance.load();
                                }
                            });
                        }, {
                            root: null,
                            rootMargin: '0px',
                            threshold: 0.0
                        });

                        item.element.intersectionObserver.observe(item.element);

                    });

                } else {*/

				$window.on('scroll.' + uniqueMethodPluginName, throttle(() => thisLoadInstance.load(), 250));

				//}
			}

			if (true === settings.early) {
				let breakLoop = false;

				methodCollection.forEach(thisMethodCollection => {
					if (breakLoop) {
						return;
					}

					if (methodCollection[key].id === uniqueMethodPluginName) {
						clearTimeout(thisMethodCollection.timeout);

						let timeout = parseInt(settings.earlyTimeout);

						thisMethodCollection.timeout = setTimeout(() => {
							// TODO: appropriate method to set/update settings?
							thisMethodCollection.instance._settings.visible = false;
							thisMethodCollection.instance._settings.sequential = true;

							thisMethodCollection.instance.load();
						}, !isNaN(timeout) && isFinite(timeout) ? timeout : 0);

						breakLoop = true;
					}
				});
			}
		});
	};
})();











//# sourceMappingURL=nite.loader.js.map
