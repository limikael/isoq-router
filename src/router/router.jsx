import {useLocation} from "./location.jsx";
import {SuspenseSwitch, SuspenseCase, useSuspenseValue} from "./suspense-switch-case.jsx";
import {urlMatchPath} from "../utils/js-util.js";
import {useContext, createContext} from "react";
import {useIsoMemo} from "isoq";

let LoaderDataContext=createContext();

export function useLoaderData() {
	let data=useContext(LoaderDataContext);

	return data;
}

export function useRouterUrl() {
	let url=useSuspenseValue();

	return url;
}

function LoaderDataProvider({loader, children}) {
	let url=useSuspenseValue();
	let data=useIsoMemo(async()=>{
		return {
			loaderData: await loader(url)
		}
	});

	if (!data)
		return;

	return (
		<LoaderDataContext.Provider value={data.loaderData}>
			{children}
		</LoaderDataContext.Provider>
	)
}

export function Router({children}) {
	let location=useLocation();
	function onCommit(url) {
		// Maybe need to do on next frame?

		let u=new URL(url);
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

	return (
		<SuspenseSwitch value={location} onCommit={onCommit}>
			{children}
		</SuspenseSwitch>
	);
}

export function Route({path, children, loader}) {
	let content=children;
	if (loader)
		content=(
			<LoaderDataProvider loader={loader}>
				{children}
			</LoaderDataProvider>
		);

	return (
		<SuspenseCase match={v=>urlMatchPath(v,path)}>
			{content}
		</SuspenseCase>
	);
}