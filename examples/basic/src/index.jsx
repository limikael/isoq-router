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

    return (
        <div>
            Hello this page 1
        </div>
    );
}

function DataPage() {
    console.log("render data");
    let data=useIsoMemo(async()=>{
        console.log("getting some data");
        await new Promise(r=>setTimeout(r,1000));
        return "some data";
    });

    return (
        <div>
            Hello this data page, data={data}
        </div>
    );
}

function Redir() {
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
			&nbsp;|&nbsp;<Link href="/datapage">With Data</Link>
            &nbsp;|&nbsp;<Link href="/redir">Redirect</Link>
		</div>
		<Route path="/"><Page0/></Route>
		<Route path="/about"><Page1/></Route>
		<Route path="/datapage"><DataPage/></Route>
        <Route path="/redir"><Redir/></Route>
	</>);
}