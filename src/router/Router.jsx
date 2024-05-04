import {createContext, useContext} from "react";
import {useIsoContext, useIsoMemo, IsoSuspense} from "isoq";
import {useEventUpdate} from "../utils/react-util.jsx";
import {urlMatchPath, makeUrlCanonical, makeUrlUnique} from "../utils/js-util.js";
import urlJoin from "url-join";

export const LocationContext=createContext();

class Router extends EventTarget {
	constructor(iso) {
		super();

		this.iso=iso;
		this.currentUrl=String(iso.getUrl());
		this.pendingUrl=String(iso.getUrl());

		if (!this.iso.isSsr()) {
			window.addEventListener("popstate",(e)=>{
				this.setPendingUrl(String(window.location));
			});
		}
	}

	setPendingUrl(url) {
		if (this.pendingUrl==url)
			return;

		this.pendingUrl=url;
		this.dispatchEvent(new Event("change"));
	}

	isLoading() {
		return (this.currentUrl!=this.pendingUrl)
	}

	commit() {
		if (!this.isLoading())
			return;

		this.currentUrl=this.pendingUrl;
		this.dispatchEvent(new Event("change"));

		if (!this.iso.isSsr()) {
			if (window.location!=makeUrlCanonical(this.currentUrl)) {
				history.scrollRestoration="manual";
				history.pushState(null,null,makeUrlCanonical(this.currentUrl));
			}

			setTimeout(()=>this.postNavScroll(),0);
		}
	}

	postNavScroll() {
		let u=new URL(this.currentUrl);
		let el;

		if (u.hash) {
			let hash=u.hash.replace("#","");
			let els=window.document.getElementsByName(hash);
			if (els.length)
				el=els[0];
		}

		if (el)
			el.scrollIntoView({
				behavior: 'smooth'
			});

		else
			window.scrollTo(0,0);
	}
}

export function useRouter() {
	let iso=useIsoContext();
	if (!iso.router)
		iso.router=new Router(iso);

	return iso.router;
}

export function useLocation() {
	let router=useRouter();
	useEventUpdate(router,"change");
	let location=useContext(LocationContext);
	if (location)
		return location;

	return makeUrlCanonical(router.currentUrl);
}

export function useRedirect() {
	let iso=useIsoContext();
	let router=useRouter();

	if (iso.isSsr()) {
		return (url)=>{
			iso.redirect(url);
		}
	}

	return (url, options={})=>{
		let targetUrl=String(new URL(url,window.location));
		if (options.forceReload)
			targetUrl=makeUrlUnique(targetUrl);

		router.setPendingUrl(targetUrl);
	}
}
