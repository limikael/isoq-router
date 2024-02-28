import {useRouter} from "./Router.jsx";

export function Link(props) {
	let router=useRouter();
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
			router.setPendingUrl(targetUrl);
		}
	}

	return <Element {...props} onClick={onLinkClick}>{props.children}</Element>
}
