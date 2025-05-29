import ErrorBoundaryHook from './hooks/ErrorBoundaryHook';
import RouterHook from './hooks/router/RouterHook';
import TabsHook from './hooks/TabHook';
import Toaster from './hooks/Toaster';

export let errorBoundaryHook: ErrorBoundaryHook;
export let tabsHook: TabsHook;
export let routerHook: RouterHook;
export let toaster: Toaster;

setTimeout(() => {
	// console.log('Initializing client...');
	// errorBoundaryHook = new ErrorBoundaryHook();
	// routerHook = new RouterHook();
	// Object.assign(tabsHook, new TabsHook());
	// Object.assign(toaster, new Toaster());
	console.log('Initializing Millennium client...');
	toaster = new Toaster();

	toaster.toast({
		title: 'Welcome to Millennium',
		body: 'This is a sample notification.',
		icon: <></>,
	});

	// routerHook.addRoute('/millennium/example', () => <div>Hello</div>);
}, 5000);
