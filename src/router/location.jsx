import {createContext, useContext} from "react";
import {useIsoContext} from "isoq";
import {useEventUpdate} from "../utils/react-util.jsx";

class LocationState extends EventTarget {
	constructor() {
		super();

		if (globalThis.window) {
			window.addEventListener("popstate",(e)=>{
				this.dispatchEvent(new Event("locationChange"));
			});
		}
	}
}

let LocationContext=createContext(new LocationState());

export function useLocation() {
	let iso=useIsoContext();
	let locationState=useContext(LocationContext);
	useEventUpdate(locationState,"locationChange");

	if (iso.isSsr())
		return iso.getUrl();

	return String(globalThis.location);
}

export function useRedirect() {
	let iso=useIsoContext();
	let locationState=useContext(LocationContext);

	if (iso.isSsr()) {
		return (url)=>{
			iso.redirect(url);
		}
	}

	return (url)=>{
		let targetUrl=String(new URL(url,window.location));
		history.scrollRestoration="manual";
		history.pushState(null,null,targetUrl);
		locationState.dispatchEvent(new Event("locationChange"));
	}
}

export function Link(props) {
	let locationState=useContext(LocationContext);
	let Element="a";

	function onLinkClick(ev) {
		if (props.onClick)
			props.onClick(ev);

		if (props.onclick)
			props.onclick(ev);

		if (ev.defaultPrevented)
			return;

		ev.preventDefault();
		if (props.href) {
			let targetUrl=String(new URL(props.href,window.location));

			//console.log(targetUrl);

			history.scrollRestoration="manual";
			history.pushState(null,null,targetUrl);
			locationState.dispatchEvent(new Event("locationChange"));
		}
	}

	return <Element {...props} onClick={onLinkClick}>{props.children}</Element>
}