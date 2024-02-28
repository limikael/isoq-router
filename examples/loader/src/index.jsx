import {Router, Route, Link, useLoaderData, useRouterUrl} from "isoq-router";
import {useRef, useEffect} from "react";
import {useIsoMemo} from "isoq";

function Home() {
    return (
        <div>
            Hello this page 0...
        </div>
    );
}

function About() {
    return (
        <div>
            Hello this page 1
        </div>
    );
}

function Page() {
    let data=useLoaderData();

    return (
        <div>
            Hello this is the page, data={data}
        </div>
    );
}

Page.loader=async (url)=>{
    await new Promise(r=>setTimeout(r,1000));
    return "some data: "+url;
}

function OtherPage() {
    let url=useRouterUrl();

    return (
        <div>
            Hello this is the other page, url={url}
        </div>
    );
}

export default function() {
	return (<>
		<h1>Test</h1>
		<div>
			<Link href="/">Home</Link>
			&nbsp;|&nbsp;<Link href="/about">About</Link>
			&nbsp;|&nbsp;<Link href="/page/1">Page 1</Link>
            &nbsp;|&nbsp;<Link href="/page/2">Page 2</Link>
            &nbsp;|&nbsp;<Link href="/otherpage/1">Other 1</Link>
            &nbsp;|&nbsp;<Link href="/otherpage/2">Other 2</Link>
		</div>
		<Router>
			<Route path="/"><Home/></Route>
			<Route path="/about">
                <About/>
            </Route>
			<Route path="/page/*" loader={Page.loader}>
                <Page/>
            </Route>
            <Route path="/otherpage/*">
                <OtherPage/>
            </Route>
		</Router>
	</>);
}