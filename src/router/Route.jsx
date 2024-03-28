import {LocationContext, useRouter, useLocation} from "./Router.jsx";
import {createContext, useContext} from "react";
import {useEventUpdate} from "../utils/react-util.jsx";
import {urlMatchPath} from "../utils/js-util.js";
import {IsoSuspense, useIsoMemo} from "isoq";

const LoaderDataContext=createContext();

export function useLoaderData() {
	let data=useContext(LoaderDataContext);

	return data;
}

function LoaderDataProvider({loader, children}) {
	let url=useLocation();
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

export function Route({path, children, loader, class: className, style}) {
	let router=useRouter();
	useEventUpdate(router,"change");

	//console.log("current: "+router.currentUrl+" pending: "+router.pendingUrl);

	let content=children;
	if (loader)
		content=(
			<LoaderDataProvider loader={loader}>
				{children}
			</LoaderDataProvider>
		);

	let ret=[];
	if (urlMatchPath(router.currentUrl,path)) {
		ret.push(
			<IsoSuspense
					key={router.currentUrl}
					suspend={false}
					class={className}
					style={style}>
				<LocationContext.Provider value={router.currentUrl}>
					{content}
				</LocationContext.Provider>
			</IsoSuspense>
		);
	}

	if (router.isLoading() && 
			urlMatchPath(router.pendingUrl,path)) {
		ret.push(
			<IsoSuspense 
					key={router.pendingUrl}
					onComplete={()=>router.commit()}
					class={className}
					style={style}>
				<LocationContext.Provider value={router.pendingUrl}>
					{content}
				</LocationContext.Provider>
			</IsoSuspense>
		);
	}

	return (<>{ret}</>);
}