import {createContext, useState, useRef, useContext} from "react";
import {IsoSuspense} from "isoq";
import {useEventUpdate} from "../utils/react-util.jsx";

let SuspenseSwitchContext=createContext();
let SuspenseValueContext=createContext();

class SuspenseSwitchState extends EventTarget {
	constructor(value, onCommit) {
		super();

		this.currentValue=value;
		this.pendingValue=value;
		this.onCommit=onCommit;
	}

	isLoading() {
		return (this.currentValue!=this.pendingValue);
	}

	setPendingValue(pendingValue) {
		if (this.pendingValue==pendingValue)
			return;

		this.pendingValue=pendingValue;
		this.dispatchEvent(new Event("change"));
	}

	commit() {
		this.currentValue=this.pendingValue;
		this.dispatchEvent(new Event("commit"));
		//console.log("commit");
		if (this.onCommit)
			this.onCommit(this.currentValue);
	}
}

export function SuspenseSwitch({value, children, onCommit}) {
	console.log("suspense swithc value: "+value);

	let ref=useRef();
	if (!ref.current)
		ref.current=new SuspenseSwitchState(value, onCommit);

	let suspenseSwitchState=ref.current;
	console.log("val: "+suspenseSwitchState.currentValue);
	suspenseSwitchState.setPendingValue(value);

	useEventUpdate(suspenseSwitchState,"commit");
	//console.log("current: "+suspenseSwitchState.currentValue+" pending: "+suspenseSwitchState.pendingValue);

	return (
		<SuspenseSwitchContext.Provider value={suspenseSwitchState}>
			{children}
		</SuspenseSwitchContext.Provider>
	);
}

function checkMatch(match, value) {
	if (typeof match=="function")
		return match(value);

	return match==value;
}

export function useSuspenseValue() {
	let suspenseValueContext=useContext(SuspenseValueContext);
	return suspenseValueContext;
}

export function SuspenseValueProvider({value, children}) {
	return (
		<SuspenseValueContext.Provider value={value}>
			{children}
		</SuspenseValueContext.Provider>
	);
}

export function SuspenseCase({match, children}) {
	let suspenseSwitchState=useContext(SuspenseSwitchContext);
	useEventUpdate(suspenseSwitchState,"commit");
	useEventUpdate(suspenseSwitchState,"change");

	function onComplete() {
		suspenseSwitchState.commit();
	}

	//console.log("case current: "+suspenseSwitchState.currentValue+" pending: "+suspenseSwitchState.pendingValue);

	let ret=[];
	if (checkMatch(match,suspenseSwitchState.currentValue)) {
		ret.push(
			<IsoSuspense
					key={suspenseSwitchState.currentValue}
					suspend={false}>
				<SuspenseValueProvider
						value={suspenseSwitchState.currentValue}>
					{children}
				</SuspenseValueProvider>
			</IsoSuspense>
		);
	}

	if (suspenseSwitchState.isLoading() &&
			checkMatch(match,suspenseSwitchState.pendingValue)) {
		ret.push(
			<IsoSuspense 
					key={suspenseSwitchState.pendingValue}
					onComplete={onComplete}>
				<SuspenseValueProvider
						value={suspenseSwitchState.pendingValue}>
					{children}
				</SuspenseValueProvider>
			</IsoSuspense>
		);
	}

	return (<>{ret}</>);
}