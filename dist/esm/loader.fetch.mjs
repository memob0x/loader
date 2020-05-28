function _classPrivateFieldSet(receiver,privateMap,value){var descriptor=privateMap.get(receiver);if(!descriptor){throw new TypeError("attempted to set private field on non-instance");}if(descriptor.set){descriptor.set.call(receiver,value);}else{if(!descriptor.writable){throw new TypeError("attempted to set read only private field");}descriptor.value=value;}return value;}function _classPrivateFieldGet(receiver,privateMap){var descriptor=privateMap.get(receiver);if(!descriptor){throw new TypeError("attempted to get private field on non-instance");}if(descriptor.get){return descriptor.get.call(receiver);}return descriptor.value;}import lworker from"./loader.worker.mjs";export default class Fetch{constructor(){_cache.set(this,{writable:true,value:{}});}get cache(){return _classPrivateFieldGet(this,_cache);}clear(){_classPrivateFieldSet(this,_cache,{});}async fetch(href,options){options={cache:true,fetch:{},...options};if(options.cache===true&&href in _classPrivateFieldGet(this,_cache)){return await _classPrivateFieldGet(this,_cache)[href];}return _classPrivateFieldGet(this,_cache)[href]=new Promise((resolve,reject)=>{const worker=lworker.worker();worker.postMessage({href:href,options:options.fetch});worker.addEventListener("message",event=>{const data=event.data;if(data.href!==href){return;}lworker.terminate();if(data.status===200){resolve(data.blob);return;}reject(new Error(`${data.statusText} for ${data.href} resource.`));});});}}var _cache=new WeakMap();