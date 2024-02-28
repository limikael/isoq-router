import {Router, Route, Link, useRedirect} from "isoq-router";
import {useRef, useEffect, useState} from "react";
import {useIsoMemo, useIsoContext, useIsLoading} from "isoq";

function Page0() {
    return (
        <div>
            Hello this page 0...
        </div>
    );
}

function Page1() {
    console.log("render 1");
    let data=useIsoMemo(async()=>{
        console.log("getting some data for 1");
        await new Promise(r=>setTimeout(r,1000));
        return "some data";
    });

    return (
        <div>
            Hello this page 1, data={data}
        </div>
    );
}

function Page2() {
    return (
        <div>
            Hello this page 2...
        </div>
    );
}

function Redir() {
    /*let iso=useIsoContext();
    iso.redirect("/");*/

    let redirect=useRedirect();
    redirect("/");
}

export default function() {
    let loading=useIsLoading();
    let [cnt,setCnt]=useState(1);

	return (<>
		<h1>Test</h1>
        <div>
            Loading: {String(loading)}
        </div>
        <div>
            Cnt: {cnt}
        </div>
		<div>
			<Link href="/">Home</Link>
			&nbsp;|&nbsp;<Link onclick={()=>setCnt(cnt+1)} href="/about">About</Link>
			&nbsp;|&nbsp;<Link href="/page">With Data</Link>
            &nbsp;|&nbsp;<Link href="/redir">Redirect</Link>
		</div>
		<Router>
			<Route path="/"><Page0/></Route>
			<Route path="/about"><Page1/></Route>
			<Route path="/page"><Page2/></Route>
            <Route path="/redir"><Redir/></Route>
		</Router>
	</>);
}