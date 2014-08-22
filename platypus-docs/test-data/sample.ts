/**
 * @name plat
 * @kind namespace
 * 
 * @description
 * The entry point into the platypus library.
 */
module plat {
    /**
     * @name acquire
     * @memberof plat
     * @kind function
     * @variation 0
     * @access public
     * @static
     * 
     * @description
     * Returns the requested injectable dependency.
     * 
     * @typeparam T The type of the requested dependency.
     * 
     * @param {() => T} dependency The dependency Type to return.
     * 
     * @returns T The requested dependency.
     */
    export function acquire<T>(dependency: () => T): T;
    /**
     * @name acquire
     * @memberof plat
     * @kind function
     * @variation 1
     * @access public
     * @static
     * 
     * @description
     * Returns the requested injectable dependency.
     * 
     * @param {Function} dependency The dependency Type to return.
     * 
     * @returns {any} The requested dependency.
     */
    export function acquire(dependency: Function): any;
    /**
     * @name acquire
     * @memberof plat
     * @kind function
     * @variation 2
     * @access public
     * @static
     * 
     * @description
     * Returns the requested injectable dependency.
     * 
     * @param {Function} dependency An array of Types specifying the injectable dependencies.
     * 
     * @returns {Array<any>} The dependencies, in the order they were requested.
     */
    export function acquire(dependencies: Array<Function>): Array<any>;
    /**
     * @name acquire
     * @memberof plat
     * @kind function
     * @variation 3
     * @access public
     * @static
     * 
     * @description
     * Returns the requested injectable dependency.
     * 
     * @param {string} dependency The injectable dependency type to return.
     * 
     * @returns {any} The requested dependency.
     */
    export function acquire(dependency: string): any;
    /**
     * @name acquire
     * @memberof plat
     * @kind function
     * @variation 4
     * @access public
     * @static
     * 
     * @description
     * Gathers dependencies and returns them as an array in the order they were requested.
     * 
     * @param {Array<string>} dependencies An array of strings specifying the injectable dependencies.
     * 
     * @returns {Array<any>} The dependencies, in the order they were requested.
     */
    export function acquire(dependencies: Array<string>): Array<any>;
    /**
     * @name acquire
     * @memberof plat
     * @kind function
     * @variation 5
     * @access public
     * @static
     * 
     * @description
     * Gathers dependencies and returns them as an array in the order they were requested.
     * 
     * @param {Array<any>} dependencies An array of strings or Functions specifying the injectable dependencies.
     * 
     * @returns {Array<any>} The dependencies, in the order they were requested.
     */
    export function acquire(dependencies: Array<any>): Array<any>;
    export function acquire(dependencies: any) {
        var deps: Array<dependency.IInjector<any>>,
            array = isArray(dependencies);

        if (array) {
            deps = dependency.Injector.getDependencies(dependencies);
        } else {
            deps = dependency.Injector.getDependencies([dependencies]);
        }

        var length = deps.length,
            output: Array<any> = [];

        for (var i = 0; i < length; ++i) {
            output.push(deps[i].inject());
        }

        if (!array) {
            return output[0];
        }

        return output;
    }
    
    /**
     * @name App
     * @memberof plat
     * @kind class
     * 
     * @implements {plat.IApp}
     * 
     * @description
     * Class for every app. This class contains hooks for Application Lifecycle Events 
     * as well as error handling.
     */
    export class App implements IApp {
        /**
         * @name $Compat
         * @memberof plat.App
         * @kind property
         * @access public
         * @static
         * 
         * @type {plat.ICompat}
         * 
         * @description
         * Reference to the {@link plat.ICompat|ICompat} injectable.
         */
        static $Compat: ICompat;

        /**
         * @name $EventManagerStatic
         * @memberof plat.App
         * @kind property
         * @access public
         * @static
         * 
         * @type {plat.events.IEventManagerStatic}
         * 
         * @description
         * Reference to the {@link plat.events.IEventManagerStatic|IEventManagerStatic} injectable.
         */
        static $EventManagerStatic: events.IEventManagerStatic;

        /**
         * @name $Document
         * @memberof plat.App
         * @kind property
         * @access public
         * @static
         * 
         * @type {Document}
         * 
         * @description
         * Reference to the Document injectable.
         */
        static $Document: Document;

        /**
         * @name $Compiler
         * @memberof plat.App
         * @kind property
         * @access public
         * @static
         * 
         * @type {plat.processing.ICompiler}
         * 
         * @description
         * Reference to the {@link plat.processing.ICompiler|ICompiler} injectable.
         */
        static $Compiler: processing.ICompiler;

        /**
         * @name $LifecycleEventStatic
         * @memberof plat.App
         * @kind property
         * @access public
         * @static
         * 
         * @type {plat.events.ILifecycleEventStatic}
         * 
         * @description
         * Reference to the {@link plat.events.ILifecycleEventStatic|ILifecycleEventStatic} injectable.
         */
        static $LifecycleEventStatic: events.ILifecycleEventStatic;

        /**
         * @name start
         * @memberof plat.App
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * A static method for initiating the app startup.
         * 
         * @returns {void}
         */
        static start(): void {
            if (!App.$Compat.isCompatible) {
                var $exception: IExceptionStatic = acquire(__ExceptionStatic);
                $exception.fatal('PlatypusTS only supports modern browsers where ' +
                    'Object.defineProperty is defined', $exception.COMPAT);
                return;
            }

            App.__addPlatCss();

            var $EventManagerStatic = App.$EventManagerStatic;

            $EventManagerStatic.dispose('__app__');
            $EventManagerStatic.on('__app__', 'ready', App.__ready);
            $EventManagerStatic.on('__app__', 'shutdown', App.__shutdown);
            $EventManagerStatic.initialize();
        }

        /**
         * @name registerApp
         * @memberof plat.App
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * A static method called upon app registration. Primarily used 
         * to initiate a ready state in the case that amd is being used.
         * 
         * @param {any} app The app instance.
         * 
         * @returns {void}
         */
        static registerApp(app: any): void {
            if (!isNull(App.app) && isString(App.app.uid)) {
                App.$EventManagerStatic.dispose(App.app.uid);
            }

            App.app = app;

            if (App.$Compat.amd) {
                var $LifecycleEventStatic = App.$LifecycleEventStatic,
                    dispatch = $LifecycleEventStatic.dispatch;

                postpone(() => {
                    dispatch('ready', $LifecycleEventStatic);
                });
            }
        }

        /**
         * @name load
         * @memberof plat.App
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * Kicks off compilation of the DOM from the specified node. If no node is specified, 
         * the default start node is document.body.
         * 
         * @param {Node} node The node at which DOM compilation begins.
         * 
         * @returns {void}
         */
        static load(node?: Node): void {
            var $LifecycleEventStatic = App.$LifecycleEventStatic,
                $compiler = App.$Compiler,
                body = App.$Document.body,
                head = App.$Document.head;

            $LifecycleEventStatic.dispatch('beforeLoad', App);

            if (isNull(node)) {
                $compiler.compile(head);
                body.setAttribute(__Hide, '');
                $compiler.compile(body);
                body.removeAttribute(__Hide);
                return;
            }

            if (isFunction((<Element>node).setAttribute)) {
                (<Element>node).setAttribute(__Hide, '');
                $compiler.compile(node);
                (<Element>node).removeAttribute(__Hide);
            } else {
                $compiler.compile(node);
            }
        }

        /**
         * @name app
         * @memberof plat.App
         * @kind property
         * @access public
         * @static
         * 
         * @type {plat.IApp}
         * 
         * @description
         * The instance of the registered {@link plat.IApp|IApp}.
         */
        static app: IApp = null;

        /**
         * @name __ready
         * @memberof plat.App
         * @kind function
         * @access private
         * @static
         * 
         * @description
         * A static method called when the application is ready. It calls the app instance's 
         * ready function as well as checks for the presence of a module loader. If one exists, 
         * loading the DOM falls back to the app developer. If it doesn't, the DOM is loaded from 
         * document.body.
         * 
         * @param {plat.events.ILifecycleEvent} ev The {@link plat.events.ILifecycleEvent|ILifecycleEvent} for the app ready.
         * 
         * @returns {void}
         */
        private static __ready(ev: events.ILifecycleEvent): void {
            dependency.Injector.initialize();

            if (!isNull(App.app)) {
                App.__registerAppEvents(ev);
            }

            if (!App.$Compat.amd) {
                App.load();
            }
        }

        /**
         * @name __shutdown
         * @memberof plat.App
         * @kind function
         * @access private
         * @static
         * 
         * @description
         * A static method called when the application wants to programmatically shutdown.
         * 
         * @returns {void}
         */
        private static __shutdown(): void {
            var app = (<any>navigator).app;

            if (!isNull(app) && isFunction(app.exitApp)) {
                app.exitApp();
            }
        }

        /**
         * @name __registerAppEvents
         * @memberof plat.App
         * @kind function
         * @access private
         * @static
         * 
         * @description
         * A static method called to register all the {@link plat.events.ILifecycleEvent|ILifecycleEvents} for an app instance.
         * 
         * @returns {void}
         */
        private static __registerAppEvents(ev: events.ILifecycleEvent): void {
            var app = App.app;

            if (isFunction((<dependency.IInjector<any>>(<any>app)).inject)) {
                App.app = app = (<dependency.IInjector<any>>(<any>app)).inject();
            }

            app.on('suspend', app.suspend);
            app.on('resume', app.resume);
            app.on('online', app.online);
            app.on('offline', app.offline);
            app.on('error', app.error);

            if (isFunction(app.ready)) {
                app.ready(ev);
            }
        }
        
        /**
         * @name __addPlatCss
         * @memberof plat.App
         * @kind function
         * @access private
         * @static
         * 
         * @description
         * We need to add [plat-hide] as a css property if platypus.css doesn't exist so we can use it to temporarily 
         * hide elements.
         * 
         * @returns {void}
         */
        private static __addPlatCss(): void {
            var $document = App.$Document;
            if (App.$Compat.platCss) {
                return;
            } else if (!isNull($document.styleSheets) && $document.styleSheets.length > 0) {
                (<CSSStyleSheet>$document.styleSheets[0]).insertRule('[plat-hide] { display: none !important; }', 0);
                return;
            }

            var style = <HTMLStyleElement>document.createElement('style');

            style.textContent = '[plat-hide] { display: none !important; }';
            document.head.appendChild(style);
        }

        /**
         * @name uid
         * @memberof plat.App
         * @kind property
         * @access public
         * @readonly
         * 
         * @type {string}
         * 
         * @description
         * A unique id, created during instantiation.
         */
        uid: string;

        /**
         * @name constructor
         * @memberof plat.App
         * @kind function
         * @access public
         * 
         * @description
         * Class for every app. This class contains hooks for Application Lifecycle Management (ALM)
         * as well as error handling and navigation events.
         * 
         * @returns {plat.App}
         */
        constructor() {
            var ContextManager: observable.IContextManagerStatic = acquire(__ContextManagerStatic);
            ContextManager.defineGetter(this, 'uid', uniqueId('plat_'));
        }

        /**
         * @name suspend
         * @memberof plat.App
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * Event fired when the app is suspended.
         * 
         * @param {plat.events.ILifecycleEvent} ev The {@link plat.events.ILifecycleEvent|ILifecycleEvent} object.
         * 
         * @returns {void}
         */
        suspend(ev: events.ILifecycleEvent): void { }

        /**
         * @name resume
         * @memberof plat.App
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * Event fired when the app resumes from the suspended state.
         * 
         * @param {plat.events.ILifecycleEvent} ev The {@link plat.events.ILifecycleEvent|ILifecycleEvent} object.
         * 
         * @returns {void}
         */
        resume(ev: events.ILifecycleEvent): void { }

        /**
         * @name error
         * @memberof plat.App
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * Event fired when an internal error occures.
         * 
         * @param {plat.events.IErrorEvent<Error>} ev The {@link plat.events.IErrorEvent|IErrorEvent} object.
         * 
         * @returns {void}
         */
        error(ev: events.IErrorEvent<Error>): void { }

        /**
         * @name ready
         * @memberof plat.App
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * Event fired when the app is ready.
         * 
         * @param {plat.events.ILifecycleEvent} ev The {@link plat.events.ILifecycleEvent|ILifecycleEvent} object.
         * 
         * @returns {void}
         */
        ready(ev: events.ILifecycleEvent): void { }

        /**
         * @name online
         * @memberof plat.App
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * Event fired when the app regains connectivity and is now in an online state.
         * 
         * @param {plat.events.ILifecycleEvent} ev The {@link plat.events.ILifecycleEvent|ILifecycleEvent} object.
         * 
         * @returns {void}
         */
        online(ev: events.ILifecycleEvent): void { }

        /**
         * @name offline
         * @memberof plat.App
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * Event fired when the app loses connectivity and is now in an offline state.
         * 
         * @param {plat.events.ILifecycleEvent} ev The {@link plat.events.ILifecycleEvent|ILifecycleEvent} object.
         * 
         * @returns {void}
         */
        offline(ev: events.ILifecycleEvent): void { }

        /**
         * @name dispatchEvent
         * @memberof plat.App
         * @kind function
         * @access public
         * 
         * @description
         * Creates a new {@link plat.events.DispatchEvent|DispatchEvent} and propagates it to all 
         * listeners based on the {@link plat.events.EventManager.DIRECT|DIRECT} method. Propagation 
         * will always start with the sender, so the sender can both produce and consume the same event.
         * 
         * @param {string} name The name of the event to send, cooincides with the name used in the
         * {@link plat.App.on|app.on()} method.
         * @param {Array<any>} ...args Any number of arguments to send to all the listeners.
         * 
         * @returns {void}
         */
        dispatchEvent(name: string, ...args: any[]): void {
            App.$EventManagerStatic.dispatch(name, this, App.$EventManagerStatic.DIRECT, args);
        }

        /**
         * @name on
         * @memberof plat.App
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Registers a listener for a beforeNavigate event. The listener will be called when a beforeNavigate 
         * event is propagating over the app. Any number of listeners can exist for a single event name. 
         * This event is cancelable using the {@link plat.events.INavigationEvent.cancel|ev.cancel()} method, 
         * and thereby preventing the navigation.
         * 
         * @param {string} name='beforeNavigate' The name of the event, cooinciding with the beforeNavigate event.
         * @param {(ev: plat.events.INavigationEvent<any>) => void} listener The method called when the beforeNavigate event is fired.
         * 
         * @returns {plat.IRemoveListener} A method for removing the listener. 
         */
        on(name: 'beforeNavigate', listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * @name on
         * @memberof plat.App
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Registers a listener for a navigating event. The listener will be called when a navigating 
         * event is propagating over the app. Any number of listeners can exist for a single event name. 
         * This event is cancelable using the {@link plat.events.INavigationEvent.cancel|ev.cancel()} method, 
         * and thereby preventing the navigation.
         * 
         * @param {string} name='navigating' The name of the event, cooinciding with the navigating event.
         * @param {(ev: plat.events.INavigationEvent<any>) => void} listener The method called when the navigating 
         * event is fired.
         * 
         * @returns {plat.IRemoveListener} A method for removing the listener. 
         */
        on(name: 'navigating', listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * @name on
         * @memberof plat.App
         * @kind function
         * @access public
         * @variation 2
         * 
         * @description
         * Registers a listener for a navigated event. The listener will be called when a navigated 
         * event is propagating over the app. Any number of listeners can exist for a single event name. 
         * This event is not cancelable.
         * 
         * @param {string} name='navigated' The name of the event, cooinciding with the navigated event.
         * @param {(ev: plat.events.INavigationEvent<any>) => void} listener The method called when the navigated 
         * event is fired.
         * 
         * @returns {plat.IRemoveListener} A method for removing the listener. 
         */
        on(name: 'navigated', listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * @name on
         * @memberof plat.App
         * @kind function
         * @access public
         * @variation 3
         * 
         * @description
         * Registers a listener for a routeChanged event. The listener will be called when a routeChange event 
         * is propagating over the app. Any number of listeners can exist for a single event name.
         * 
         * @param {string} eventName='routeChange' This specifies that the listener is for a routeChange event.
         * @param {(ev: plat.events.INavigationEvent<plat.web.IRoute<any>>) => void} listener The method called 
         * when the routeChange is fired. The route argument will contain a parsed route.
         * @returns {plat.IRemoveListener} A method for removing the listener.
         */
        on(name: 'routeChanged', listener: (ev: events.INavigationEvent<web.IRoute<any>>) => void): IRemoveListener;
        /**
         * @name on
         * @memberof plat.App
         * @kind function
         * @access public
         * @variation 4
         * 
         * @description
         * Registers a listener for a {@link plat.events.NavigationEvent|NavigationEvent}. The listener will be called 
         * when a NavigationEvent is propagating over the app. Any number of listeners can exist for a single event name.
         * 
         * @param {string} name The name of the event, cooinciding with the {@link plat.events.NavigationEvent|NavigationEvent} name.
         * @param {(ev: plat.events.INavigationEvent<any>) => void} listener The method called when the 
         * {@link plat.events.NavigationEvent|NavigationEvent} is fired.
         * 
         * @returns {plat.IRemoveListener} A method for removing the listener.
         */
        on(name: string, listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * @name on
         * @memberof plat.App
         * @kind function
         * @access public
         * @variation 5
         * 
         * @description
         * Registers a listener for a {@link plat.events.DispatchEvent|DispatchEvent}. The listener will be called when 
         * a DispatchEvent is propagating over the app. Any number of listeners can exist for a single event name.
         * 
         * @param {string} name The name of the event, cooinciding with the DispatchEvent name.
         * @param {(ev: plat.events.IDispatchEventInstance, ...args: Array<any>) => void} listener The method called when 
         * the DispatchEvent is fired.
         * 
         * @returns {plat.IRemoveListener} A method for removing the listener.
         */
        on(name: string, listener: (ev: events.IDispatchEventInstance, ...args: any[]) => void): IRemoveListener {
            return App.$EventManagerStatic.on(this.uid, name, listener, this);
        }

        /**
         * @name load
         * @memberof plat.App
         * @kind function
         * @access public
         * 
         * @description
         * Kicks off compilation of the DOM from the specified node. If no node is specified, 
         * the default start node is document.body. This method should be called from the app when 
         * using module loaders. If a module loader is in use, the app will delay loading until 
         * this method is called.
         * 
         * @param {Node} node The node where at which DOM compilation begins.
         * 
         * @returns {void}
         */
        load(node?: Node): void {
            App.load(node);
        }
    }

    /**
     * The Type for referencing the '$AppStatic' injectable as a dependency.
     */
    export function IAppStatic(
        $Compat?: ICompat,
        $EventManagerStatic?: events.IEventManagerStatic,
        $Document?: Document,
        $Compiler?: processing.ICompiler,
        $LifecycleEventStatic?: events.ILifecycleEventStatic): IAppStatic {
            App.$Compat = $Compat;
            App.$EventManagerStatic = $EventManagerStatic;
            App.$Document = $Document;
            App.$Compiler = $Compiler;
            App.$LifecycleEventStatic = $LifecycleEventStatic;
            return App;
    }

    register.injectable(__AppStatic, IAppStatic, [
        __Compat,
        __EventManagerStatic,
        __Document,
        __Compiler,
        __LifecycleEventStatic
    ], __STATIC);

    /**
     * The Type for referencing the '$App' injectable as a dependency.
     */
    export function IApp($AppStatic?: IAppStatic): IApp {
        return $AppStatic.app;
    }

    register.injectable(__App, IApp, [__AppStatic], __INSTANCE);

    /**
     * @name IAppStatic
     * @memberof plat
     * @kind interface
     * 
     * @description
     * The external interface for the '$AppStatic' injectable.
     */
    export interface IAppStatic {
        /**
         * @name start
         * @memberof plat.IAppStatic
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * A static method for initiating the app startup.
         * 
         * @returns {void}
         */
        start(): void;

        /**
         * @name registerApp
         * @memberof plat.IAppStatic
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * A static methods called upon app registration. Primarily used 
         * to initiate a ready state in the case that amd is being used.
         * 
         * @returns {void}
         */
        registerApp(app: dependency.IInjector<IApp>): void;

        /**
         * @name load
         * @memberof plat.IAppStatic
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * Kicks off compilation of the DOM from the specified node. If no node is specified,
         * the default start node is document.body.
         * 
         * @param node The node at which DOM compilation begins.
         * 
         * @returns {void}
         */
        load(node?: Node): void;

        /**
         * @name app
         * @memberof plat.IAppStatic
         * @kind property
         * @access public
         * @static
         * 
         * @type {plat.IApp}
         * 
         * @description
         * The instance of the registered {@link plat.IApp|IApp}.
         */
        app: IApp;
    }

    /**
     * @name IApp
     * @memberof plat
     * @kind interface
     * 
     * @description
     * An object implementing IApp implements the methods called by the framework to support 
     * Application Lifecycle Management (ALM) as well as error handling and navigation events.
     */
    export interface IApp {
        /**
         * @name uid
         * @memberof plat.IApp
         * @kind property
         * @access public
         * @readonly
         * 
         * @type {string}
         * 
         * @description
         * A unique id, created during instantiation.
         */
        uid: string;

        /**
         * @name suspend
         * @memberof plat.IApp
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * Event fired when the app is suspended.
         * 
         * @param {plat.events.ILifecycleEvent} ev The {@link plat.events.ILifecycleEvent|ILifecycleEvent} object.
         * 
         * @returns {void}
         */
        suspend? (ev: events.ILifecycleEvent): void;

        /**
         * @name resume
         * @memberof plat.IApp
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * Event fired when the app resumes from the suspended state.
         * 
         * @param {plat.events.ILifecycleEvent} ev The {@link plat.events.ILifecycleEvent|ILifecycleEvent} object.
         * 
         * @returns {void}
         */
        resume? (ev: events.ILifecycleEvent): void;

        /**
         * @name error
         * @memberof plat.IApp
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * Event fired when an internal error occures.
         * 
         * @param {plat.events.IErrorEvent} ev The {@link plat.events.IErrorEvent|IErrorEvent} object.
         * 
         * @returns {void}
         */
        error? (ev: events.IErrorEvent<Error>): void;

        /**
         * @name ready
         * @memberof plat.IApp
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * Event fired when the app is ready.
         * 
         * @param {plat.events.ILifecycleEvent} ev The {@link plat.events.ILifecycleEvent|ILifecycleEvent} object.
         * 
         * @returns {void}
         */
        ready? (ev: events.ILifecycleEvent): void;

        /**
         * @name online
         * @memberof plat.IApp
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * Event fired when the app regains connectivity and is now in an online state.
         * 
         * @param {plat.events.ILifecycleEvent} ev The {@link plat.events.ILifecycleEvent|ILifecycleEvent} object.
         * 
         * @returns {void}
         */
        online? (ev: events.ILifecycleEvent): void;

        /**
         * @name offline
         * @memberof plat.IApp
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * Event fired when the app loses connectivity and is now in an offline state.
         * 
         * @param {plat.events.ILifecycleEvent} ev The {@link plat.events.ILifecycleEvent|ILifecycleEvent} object.
         * 
         * @returns {void}
         */
        offline? (ev: events.ILifecycleEvent): void;

        /**
         * @name dispatchEvent
         * @memberof plat.IApp
         * @kind function
         * @access public
         * 
         * @description
         * Creates a new {@link plat.events.DispatchEvent|DispatchEvent} and propagates it to all 
         * listeners based on the {@link plat.events.EventManager.DIRECT|DIRECT} method. Propagation 
         * will always start with the sender, so the sender can both produce and consume the same event.
         * 
         * @param {string} name The name of the event to send, cooincides with the name used in the
         * {@link plat.App.on|app.on()} method.
         * @param {Array<any>} ...args Any number of arguments to send to all the listeners.
         * 
         * @returns {void}
         */
        dispatchEvent(name: string, ...args: any[]): void;

        /**
         * @name on
         * @memberof plat.IApp
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Registers a listener for a beforeNavigate event. The listener will be called when a beforeNavigate 
         * event is propagating over the app. Any number of listeners can exist for a single event name. 
         * This event is cancelable using the {@link plat.events.INavigationEvent.cancel|ev.cancel()} method, 
         * and thereby preventing the navigation.
         * 
         * @param {string} name='beforeNavigate' The name of the event, cooinciding with the beforeNavigate event.
         * @param {(ev: plat.events.INavigationEvent<any>) => void} listener The method called when the beforeNavigate event is fired.
         * 
         * @returns {plat.IRemoveListener} A method for removing the listener. 
         */
        on(name: 'beforeNavigate', listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * @name on
         * @memberof plat.IApp
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Registers a listener for a navigating event. The listener will be called when a navigating 
         * event is propagating over the app. Any number of listeners can exist for a single event name. 
         * This event is cancelable using the {@link plat.events.INavigationEvent.cancel|ev.cancel()} method, 
         * and thereby preventing the navigation.
         * 
         * @param {string} name='navigating' The name of the event, cooinciding with the navigating event.
         * @param {(ev: plat.events.INavigationEvent<any>) => void} listener The method called when the navigating 
         * event is fired.
         * 
         * @returns {plat.IRemoveListener} A method for removing the listener. 
         */
        on(name: 'navigating', listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * @name on
         * @memberof plat.IApp
         * @kind function
         * @access public
         * @variation 2
         * 
         * @description
         * Registers a listener for a navigated event. The listener will be called when a navigated 
         * event is propagating over the app. Any number of listeners can exist for a single event name. 
         * This event is not cancelable.
         * 
         * @param {string} name='navigated' The name of the event, cooinciding with the navigated event.
         * @param {(ev: plat.events.INavigationEvent<any>) => void} listener The method called when the navigated 
         * event is fired.
         * 
         * @returns {plat.IRemoveListener} A method for removing the listener. 
         */
        on(name: 'navigated', listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * @name on
         * @memberof plat.IApp
         * @kind function
         * @access public
         * @variation 3
         * 
         * @description
         * Registers a listener for a routeChanged event. The listener will be called when a routeChange event 
         * is propagating over the app. Any number of listeners can exist for a single event name.
         * 
         * @param {string} eventName='routeChange' This specifies that the listener is for a routeChange event.
         * @param {(ev: plat.events.INavigationEvent<plat.web.IRoute<any>>) => void} listener The method called 
         * when the routeChange is fired. The route argument will contain a parsed route.
         * @returns {plat.IRemoveListener} A method for removing the listener.
         */
        on(name: 'routeChanged', listener: (ev: events.INavigationEvent<web.IRoute<any>>) => void): IRemoveListener;
        /**
         * @name on
         * @memberof plat.IApp
         * @kind function
         * @access public
         * @variation 4
         * 
         * @description
         * Registers a listener for a {@link plat.events.NavigationEvent|NavigationEvent}. The listener will be called 
         * when a NavigationEvent is propagating over the app. Any number of listeners can exist for a single event name.
         * 
         * @param {string} name The name of the event, cooinciding with the {@link plat.events.NavigationEvent|NavigationEvent} name.
         * @param {(ev: plat.events.INavigationEvent<any>) => void} listener The method called when the 
         * {@link plat.events.NavigationEvent|NavigationEvent} is fired.
         * 
         * @returns {plat.IRemoveListener} A method for removing the listener.
         */
        on(name: string, listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * @name on
         * @memberof plat.IApp
         * @kind function
         * @access public
         * @variation 5
         * 
         * @description
         * Registers a listener for a {@link plat.events.DispatchEvent|DispatchEvent}. The listener will be called when 
         * a DispatchEvent is propagating over the app. Any number of listeners can exist for a single event name.
         * 
         * @param {string} name The name of the event, cooinciding with the DispatchEvent name.
         * @param {(ev: plat.events.IDispatchEventInstance, ...args: Array<any>) => void} listener The method called when 
         * the DispatchEvent is fired.
         * 
         * @returns {plat.IRemoveListener} A method for removing the listener.
         */
        on(name: string, listener: (ev: events.IDispatchEventInstance, ...args: any[]) => void): IRemoveListener;

        /**
         * @name load
         * @memberof plat.IApp
         * @kind function
         * @access public
         * 
         * @description
         * Kicks off compilation of the DOM from the specified node. If no node is specified, 
         * the default start node is document.body. This method should be called from the app when 
         * using module loaders. If a module loader is in use, the app will delay loading until 
         * this method is called.
         * 
         * @param {Node} node The node where at which DOM compilation begins.
         * 
         * @returns {void}
         */
        load(node?: Node): void;
    }

    /**
     * @name IObject
     * @memberof plat
     * @kind interface
     * 
     * @description
     * Interface for an object where every key has the same typed value.
     * 
     * @typeparam T The type of each value in the object.
     */
    export interface IObject<T> {
        /**
         * @name [key: string]
         * @memberof plat.IObject
         * @kind property
         * @access public
         * @static
         * 
         * @type {T}
         * 
         * @description
         * Every key must be of type T
         */
        [key: string]: T
    }
    
    /**
     * @name IRemoveListener
     * @memberof plat
     * @kind interface
     * 
     * @description
     * Defines a function that will halt further callbacks to a listener.
     * Equivalent to `() => void`.
     */
    export interface IRemoveListener {
        /**
         * @memberof plat.IRemoveListener
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * The method signature for {@link plat.IRemoveListener|IRemoveListener}.
         * 
         * @returns {void}
         */
        (): void;
    }

    /**
     * @name IPropertyChangedListener
     * @memberof plat
     * @kind interface
     * 
     * @description
     * Defines a function that will be called whenever a property has changed.
     */
    export interface IPropertyChangedListener {
        /**
         * @memberof plat.IPropertyChangedListener
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * The method signature for {@link plat.IPropertyChangedListener|IPropertyChangedListener}.
         * 
         * @param {any} newValue The new value of the observed property.
         * @param {any} oldValue The previous value of the observed property.
         */
        (newValue: any, oldValue: any): void;
    }
    
    /**
     * @name async
     * @memberof plat
     * @kind namespace
     * 
     * @description
     * Holds all the async members.
     */
    export module async {
        /**
         * @name HttpRequest
         * @memberof plat.async
         * @kind class
         * @exported false
         * 
         * @implements {plat.async.IHttpRequest}
         * 
         * @description
         * HttpRequest provides a wrapper for the XMLHttpRequest object. Allows for
         * sending AJAX requests to a server. This class does not support 
         * synchronous requests.
         */
        class HttpRequest implements IHttpRequest {
            /**
             * @name clearTimeout
             * @memberof plat.async.HttpRequest
             * @kind property
             * @access public
             * 
             * @type {plat.IRemoveListener}
             * 
             * @description
             * The timeout ID associated with the specified timeout
             */
            clearTimeout: plat.IRemoveListener;

            /**
             * @name xhr
             * @memberof plat.async.HttpRequest
             * @kind property
             * @access public
             * 
             * @type {XMLHttpRequest}
             * 
             * @description
             * The created XMLHttpRequest
             */
            xhr: XMLHttpRequest;

            /**
             * @name jsonpCallback
             * @memberof plat.async.HttpRequest
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The JSONP callback name
             */
            jsonpCallback: string;

            /**
             * @name $Browser
             * @memberof plat.async.HttpRequest
             * @kind property
             * @access public
             * 
             * @type {web.IBrowser}
             * 
             * @description
             * The plat.IBrowser injectable instance
             */
            $Browser: web.IBrowser = acquire(__Browser);

            /**
             * @name $Window
             * @memberof plat.async.HttpRequest
             * @kind property
             * @access public
             * 
             * @type {Window}
             * 
             * @description
             * The injectable instance of type Window
             */
            $Window: Window = acquire(__Window);

            /**
             * @name $Document
             * @memberof plat.async.HttpRequest
             * @kind property
             * @access public
             * 
             * @type {Document}
             * 
             * @description
             * The injectable instance of type Document
             */
            $Document: Document = acquire(__Document);
            
            /**
             * @name $config
             * @memberof plat.async.HttpRequest
             * @kind property
             * @access public
             * 
             * @type {plat.async.IHttpConfig}
             * 
             * @description
             * The configuration for an HTTP Request
             */
            $config: IHttpConfig = acquire(__HttpConfig);

            /**
             * @name __fileSupported
             * @memberof plat.async.HttpRequest
             * @kind property
             * @access private
             * 
             * @type {boolean}
             * 
             * @description
             * Whether or not the browser supports the File API.
             */
            private __fileSupported = (<ICompat>acquire(__Compat)).fileSupported;

            /**
             * @name __options
             * @memberof plat.async.HttpRequest
             * @kind property
             * @access public
             * 
             * @type {plat.async.IHttpConfig}
             * 
             * @description
             * The configuration for the specific HTTP Request
             */
            private __options: IHttpConfig;

            /**
             * @name constructor
             * @memberof plat.async.HttpRequest
             * @kind function
             * @access public
             * 
             * @description
             * The constructor for a {@link plat.async.HttpRequest|HttpRequest}.
             * 
             * @param {plat.async.IHttpConfig} options The IHttpConfigStatic used to customize this HttpRequest.
             * 
             * @returns {plat.async.HttpRequest}
             */
            constructor(options: IHttpConfig) {
                this.__options = extend({}, this.$config, options);
            }

            /**
             * @name execute
             * @memberof plat.async.HttpRequest
             * @kind function
             * @access public
             * 
             * @description
             * Executes an XMLHttpRequest and resolves an {@link plat.async.IAjaxPromise|IAjaxPromise} upon completion.
             * 
             * @typeparam R The response type for the XMLHttpRequest object.
             * 
             * @returns {plat.async.IAjaxPromise} A promise that fulfills when the XMLHttpRequest is done. 
             */
            execute<R>(): IAjaxPromise<R> {
                var options = this.__options,
                    url = options.url;

                if (!isString(url) || isEmpty(url.trim())) {
                    return this._invalidOptions();
                }

                options.url = this.$Browser.urlUtils(url).toString();

                var isCrossDomain = options.isCrossDomain || false,
                    xDomain = false;

                // check if forced cross domain call or cors is not supported (IE9)
                if (isCrossDomain) {
                    xDomain = true;
                } else {
                    this.xhr = new XMLHttpRequest();
                    if (isUndefined(this.xhr.withCredentials)) {
                        xDomain = this.$Browser.isCrossDomain(url);
                    }
                }

                if (xDomain) {
                    this.xhr = null;
                    this.jsonpCallback = options.jsonpCallback || uniqueId('plat_callback');
                    return this.executeJsonp();
                }

                return this._sendXhrRequest();
            }

            /**
             * @name executeJsonp
             * @memberof plat.async.HttpRequest
             * @kind function
             * @access public
             * 
             * @description
             * Executes an JSONP request and resolves an {@link plat.async.IAjaxPromise|IAjaxPromise} upon completion.
             * 
             * @typeparam R The response type for the JSONP callback parameter.
             * 
             * @returns {plat.async.IAjaxPromise} A promise that fulfills when the JSONP request is done. 
             */
            executeJsonp<R>(): IAjaxPromise<R> {
                var options = this.__options,
                    url = options.url;

                if (!isString(url) || isEmpty(url.trim())) {
                    return this._invalidOptions();
                }

                options.url = this.$Browser.urlUtils(url).toString();
                if (isNull(this.jsonpCallback)) {
                    this.jsonpCallback = options.jsonpCallback || uniqueId('plat_callback');
                }

                return new AjaxPromise((resolve, reject) => {
                    var $window = <any>this.$Window,
                        $document = this.$Document,
                        scriptTag = $document.createElement('script'),
                        jsonpCallback = this.jsonpCallback,
                        jsonpIdentifier = options.jsonpIdentifier || 'callback';

                    scriptTag.src = url + '?' + jsonpIdentifier + '=' + jsonpCallback;

                    var oldValue = $window[jsonpCallback];
                    $window[jsonpCallback] = (response: any) => {
                        // clean up
                        if (isFunction(this.clearTimeout)) {
                            this.clearTimeout();
                        }

                        $document.head.removeChild(scriptTag);
                        if (!isUndefined(oldValue)) {
                            $window[jsonpCallback] = oldValue;
                        } else {
                            deleteProperty($window, jsonpCallback);
                        }

                        // call callback
                        resolve({
                            response: response,
                            // ok
                            status: 200
                        });
                    };

                    $document.head.appendChild(scriptTag);

                    var timeout = options.timeout;
                    if (isNumber(timeout) && timeout > 0) {
                        // we first postpone to avoid always timing out when debugging, though this is not
                        // a foolproof method.
                        this.clearTimeout = postpone(() => {
                            this.clearTimeout = defer(() => {
                                reject(new AjaxError({
                                    response: 'Request timed out in ' + timeout + 'ms for ' + url,
                                    // request timeout
                                    status: 408
                                }));
                                $window[jsonpCallback] = noop;
                            }, timeout - 1);
                        });
                    }
                }, { __http: this });
            }

            /**
             * @name _xhrOnReadyStateChange
             * @memberof plat.async.HttpRequest
             * @kind function
             * @access protected
             * 
             * @description
             * A wrapper for the XMLHttpRequest's onReadyStateChanged callback.
             * 
             * @returns {boolean} Waits for the readyState to be complete and then 
             * return true in the case of a success and false in the case of 
             * an error.
             */
            _xhrOnReadyStateChange(): boolean {
                var xhr = this.xhr;
                if (xhr.readyState === 4) {
                    var status = xhr.status;

                    if (status === 0) {
                        var response = xhr.response;
                        if (isNull(response)) {
                            try {
                                response = xhr.responseText;
                            } catch (e) { }
                        }

                        // file protocol issue **Needs to be tested more thoroughly**
                        // ok if response is not empty, Not Found otherwise
                        if (!isEmpty(response)) {
                            return true;
                        }

                        return false;
                    }

                    // 304 is not modified
                    if ((status >= 200 && status < 300) || status === 304) {
                        return true;
                    } else {
                        return false;
                    }
                }
                // else {} TODO: add progress for xhr if we choose to add progress to AjaxPromise
            }

            /**
             * @name _sendXhrRequest
             * @memberof plat.async.HttpRequest
             * @kind function
             * @access protected
             * 
             * @description
             * The function that initializes and sends the XMLHttpRequest.
             * 
             * @returns {plat.async.IAjaxPromise} A promise that fulfills with the 
             * formatted {@link plat.async.IAjaxResponse|IAjaxResponse} and rejects if there is a problem with an 
             * {@link plat.async.IAjaxError|IAjaxError}.
             */
            _sendXhrRequest(): IAjaxPromise<any> {
                var xhr = this.xhr,
                    options = this.__options,
                    method = options.method,
                    url = options.url;

                return new AjaxPromise((resolve, reject) => {
                    xhr.onreadystatechange = () => {
                        var success = this._xhrOnReadyStateChange();

                        if (isNull(success)) {
                            return;
                        }

                        var response = this._formatResponse(options.responseType, success);

                        if (success) {
                            resolve(response);
                        } else {
                            reject(new AjaxError(response));
                        }

                        this.xhr = options = null;
                    };

                    if (!isString(method)) {
                        var Exception: IExceptionStatic = acquire(__ExceptionStatic);
                        Exception.warn('AjaxOptions method was not of type string. Defaulting to "GET".', Exception.AJAX);
                        method = 'GET';
                    }

                    xhr.open(
                        method.toUpperCase(),
                        url,
                        // synchronous XHR not supported
                        true,
                        options.user,
                        options.password
                        );

                    var responseType = options.responseType;
                    if (!(this.__fileSupported || responseType === '' || responseType === 'text')) {
                        responseType = '';
                    }

                    xhr.responseType = responseType;
                    xhr.withCredentials = options.withCredentials;

                    var mimeType = options.overrideMimeType,
                        data = options.data;

                    if (isString(mimeType) && !isEmpty(mimeType)) {
                        xhr.overrideMimeType(mimeType);
                    }

                    if (isNull(data) || data === '') {
                        // no data exists so set headers and send request
                        this.__setHeaders();
                        xhr.send();
                    } else {
                        var transforms = options.transforms || [],
                            length = transforms.length,
                            contentType = options.contentType,
                            contentTypeExists = isString(contentType) && !isEmpty(contentType);

                        if (length > 0) {
                            // if data transforms defined, assume they're going to take care of 
                            // any and all transformations.
                            for (var i = 0; i < length; ++i) {
                                data = transforms[i](data, xhr);
                            }

                            // if contentType exists, assume they did not set it in 
                            // their headers as well
                            if (contentTypeExists) {
                                xhr.setRequestHeader('Content-Type', contentType);
                            }

                            this.__setHeaders();
                            xhr.send(data);
                        } else if (isObject(data)) {
                            // if isObject and contentType exists we want to transform the data
                            if (contentTypeExists) {
                                var contentTypeLower = contentType.toLowerCase();
                                if (contentTypeLower.indexOf('x-www-form-urlencoded') !== -1) {
                                    // perform an encoded form transformation
                                    data = this.__serializeFormData();
                                    // set Content-Type header because we're assuming they didn't set it 
                                    // in their headers object
                                    xhr.setRequestHeader('Content-Type', contentType);
                                    this.__setHeaders();
                                    xhr.send(data);
                                } else if (contentTypeLower.indexOf('multipart/form-data') !== -1) {
                                    // need to check if File is a supported object
                                    if (this.__fileSupported) {
                                        // use FormData
                                        data = this.__appendFormData();
                                        // do not set the Content-Type header due to modern browsers 
                                        // setting special headers for multipart/form-data
                                        this.__setHeaders();
                                        xhr.send(data);
                                    } else {
                                        // use iframe trick for older browsers (do not send a request)
                                        // this case is the reason for this giant, terrible, nested if-else statement
                                        this.__submitFramedFormData().then((response) => {
                                            resolve(response);
                                        }, () => {
                                            this.xhr = null;
                                        });
                                    }
                                } else {
                                    // assume stringification is possible
                                    data = JSON.stringify(data);
                                    // set Content-Type header because we're assuming they didn't set it 
                                    // in their headers object
                                    xhr.setRequestHeader('Content-Type', contentType);
                                    this.__setHeaders();
                                    xhr.send(data);
                                }
                            } else {
                                // contentType does not exist so simply set defined headers and send raw data
                                this.__setHeaders();
                                xhr.send(data);
                            }
                        } else {
                            // if contentType exists set Content-Type header because we're assuming they didn't set it 
                            // in their headers object
                            if (contentTypeExists) {
                                xhr.setRequestHeader('Content-Type', contentType);
                            }

                            this.__setHeaders();
                            xhr.send(data);
                        }
                    }

                    var timeout = options.timeout;
                    if (isNumber(timeout) && timeout > 0) {
                        // we first postpone to avoid always timing out when debugging, though this is not
                        // a foolproof method.
                        this.clearTimeout = postpone(() => {
                            this.clearTimeout = defer(() => {
                                reject(new AjaxError({
                                    response: 'Request timed out in ' + timeout + 'ms for ' + options.url,
                                    status: xhr.status,
                                    getAllResponseHeaders: xhr.getAllResponseHeaders,
                                    xhr: xhr
                                }));

                                xhr.onreadystatechange = null;
                                xhr.abort();
                                this.xhr = null;
                            }, timeout - 1);
                        });
                    }
                }, { __http: this });
            }
            
            /**
             * @name _invalidOptions
             * @memberof plat.async.HttpRequest
             * @kind function
             * @access protected
             * 
             * @description
             * Returns a promise that is immediately rejected due to an error.
             * 
             * @returns {plat.async.IAjaxPromise} A promise that immediately rejects 
             * with an {@link plat.async.IAjaxError|IAjaxError}
             */
            _invalidOptions(): IAjaxPromise<any> {
                return new AjaxPromise((resolve, reject) => {
                    var exceptionFactory: IExceptionStatic = acquire(__ExceptionStatic);
                    exceptionFactory.warn('Attempting a request without specifying a url', exceptionFactory.AJAX);
                    reject(new AjaxError({
                        response: 'Attempting a request without specifying a url',
                        status: null,
                        getAllResponseHeaders: null,
                        xhr: null
                    }));
                });
            }
            
            /**
             * @name _formatResponse
             * @memberof plat.async.HttpRequest
             * @kind function
             * @access protected
             * 
             * @description
             * The function that formats the response from the XMLHttpRequest.
             * 
             * @param {string} responseType The user designated responseType
             * @param {boolean} success Signifies if the response was a success
             * 
             * @returns {IAjaxResponse<any>} The {@link plat.async.IAjaxResponse|IAjaxResponse} to be returned to 
             * the requester.
             */
            _formatResponse(responseType: string, success: boolean): IAjaxResponse<any> {
                var xhr = this.xhr,
                    status = xhr.status,
                    response = xhr.response;

                // need to try, catch instead of boolean short circuit because chrome doesn't like checking 
                // responseText when the responseType is anything other than empty or 'text'
                if (isNull(response)) {
                    try {
                        response = xhr.responseText;
                    } catch (e) { }
                }

                if (status === 0) {
                    // file protocol issue **Needs to be tested more thoroughly**
                    // ok if response empty, Not Found otherwise
                    status = success ? 200 : 404;
                }

                xhr.onreadystatechange = null;

                if (isFunction(this.clearTimeout)) {
                    this.clearTimeout();
                }

                if (responseType === 'json' && isString(response)) {
                    try {
                        response = JSON.parse(response);
                    } catch (e) { }
                }

                return {
                    response: response,
                    status: status,
                    getAllResponseHeaders: xhr.getAllResponseHeaders,
                    xhr: xhr
                };
            }

            /**
             * @name __setHeaders
             * @memberof plat.async.HttpRequest
             * @kind function
             * @access private
             * 
             * @description
             * Sets the headers for an XMLHttpRequest
             * 
             * @returns {void}
             */
            private __setHeaders(): void {
                var headers = this.__options.headers,
                    keys = Object.keys(headers || {}),
                    xhr = this.xhr,
                    length = keys.length,
                    key: string,
                    i: number;

                for (i = 0; i < length; ++i) {
                    key = keys[i];
                    xhr.setRequestHeader(key, headers[key]);
                }
            }

            /**
             * @name __serializeFormData
             * @memberof plat.async.HttpRequest
             * @kind function
             * @access private
             * 
             * @description
             * Serializes multipart form data in an XMLHttpRequest as a string.
             * 
             * @returns {string}
             */
            private __serializeFormData(): string {
                var data = this.__options.data,
                    keys = Object.keys(data),
                    key: string,
                    val: any,
                    formBuffer: Array<string> = [];

                while (keys.length > 0) {
                    key = keys.pop();
                    val = data[key];
                    if (isNull(val)) {
                        val = '';
                    } else if (isObject(val)) {
                        // may throw a fatal error but this is an invalid case
                        var $exception: IExceptionStatic = acquire(__ExceptionStatic);
                        $exception.warn('Invalid form entry with key "' + key + '" and value "' + val, $exception.AJAX);
                        val = JSON.stringify(val);
                    }

                    formBuffer.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
                }

                return formBuffer.join('&').replace(/%20/g, '+');
            }

            /**
             * @name __appendFormData
             * @memberof plat.async.HttpRequest
             * @kind function
             * @access private
             * 
             * @description
             * Creates FormData to add to the XMLHttpRequest.
             * 
             * @returns {FormData}
             */
            private __appendFormData(): FormData {
                var data = this.__options.data,
                    formData = new FormData(),
                    keys = Object.keys(data),
                    key: string,
                    val: any;

                while (keys.length > 0) {
                    key = keys.pop();
                    val = data[key];
                    if (isNull(val)) {
                        formData.append(key, '');
                    } else if (isObject(val)) {
                        if (isFile(val)) {
                            formData.append(key, val, val.name || val.fileName || 'blob');
                        } else {
                            // may throw a fatal error but this is an invalid case
                            var $exception: IExceptionStatic = acquire(__ExceptionStatic);
                            $exception.warn('Invalid form entry with key "' + key + '" and value "' + val, $exception.AJAX);
                            formData.append(key, JSON.stringify(val));
                        }
                    } else {
                        formData.append(key, val);
                    }
                }

                return formData;
            }

            /**
             * @name __submitFramedFormData
             * @memberof plat.async.HttpRequest
             * @kind function
             * @access private
             * 
             * @description
             * Handles submitting multipart form data using an iframe.
             * 
             * @returns {plat.async.IThenable} A promise that fulfills after the form data is submitted.
             */
            private __submitFramedFormData(): IThenable<IAjaxResponse<any>> {
                var options = this.__options,
                    data = options.data,
                    url = options.url,
                    $document = this.$Document,
                    $body = $document.body,
                    Promise: IPromise = acquire(__Promise),
                    form = $document.createElement('form'),
                    iframe = $document.createElement('iframe'),
                    iframeName = uniqueId('iframe_target'),
                    keys = Object.keys(data),
                    key: string;

                iframe.name = form.target = iframeName;
                iframe.src = 'javascript:false;';
                form.enctype = form.encoding = 'multipart/form-data';
                form.action = url;
                form.method = 'POST';
                form.style.display = 'none';

                while (keys.length > 0) {
                    key = keys.pop();
                    form.insertBefore(this.__createInput(key, data[key]), null);
                }

                return new Promise<IAjaxResponse<any>>((resolve, reject) => {
                    this.xhr.abort = () => {
                        iframe.onload = null;
                        $body.removeChild(form);
                        $body.removeChild(iframe);
                        reject();
                    };

                    iframe.onload = () => {
                        var content = iframe.contentDocument.body.innerHTML;

                        $body.removeChild(form);
                        $body.removeChild(iframe);

                        resolve({
                            response: content,
                            status: 200,
                            getAllResponseHeaders: () => ''
                        });

                        this.xhr = iframe.onload = null;
                    };

                    $body.insertBefore(form, null);
                    $body.insertBefore(iframe, null);
                    form.submit();
                });
            }

            /**
             * @name __createInput
             * @memberof plat.async.HttpRequest
             * @kind function
             * @access private
             * 
             * @description
             * Creates input for form data submissions.
             * 
             * @returns {HTMLInputElement}
             */
            private __createInput(key: string, val: any): HTMLInputElement {
                var $document = this.$Document,
                    $exception: IExceptionStatic,
                    input = <HTMLInputElement>$document.createElement('input');

                input.type = 'hidden';
                input.name = key;

                if (isNull(val)) {
                    input.value = '';
                } else if (isObject(val)) {
                    // check if val is an pseudo File
                    if (isFunction(val.slice) && !(isUndefined(val.name) || isUndefined(val.path))) {
                        var fileList = $document.querySelectorAll('input[type="file"][name="' + key + '"]'),
                            length = fileList.length;
                        // if no inputs found, stringify the data
                        if (length === 0) {
                            $exception = acquire(__ExceptionStatic);
                            $exception.warn('Could not find input[type="file"] with [name="' + key +
                                '"]. Stringifying data instead.', $exception.AJAX);
                            input.value = JSON.stringify(val);
                        } else if (length === 1) {
                            input = <HTMLInputElement>fileList[0];
                            // swap nodes
                            var clone = input.cloneNode(true);
                            input.parentNode.insertBefore(clone, input);
                        } else {
                            // rare case but may have multiple forms with file inputs 
                            // that have the same name
                            var fileInput: HTMLInputElement,
                                path = val.path;
                            while (length-- > 0) {
                                fileInput = <HTMLInputElement>fileList[length];
                                if (fileInput.value === path) {
                                    input = fileInput;
                                    // swap nodes
                                    var inputClone = input.cloneNode(true);
                                    input.parentNode.insertBefore(inputClone, input);
                                    break;
                                }
                            }

                            // could not find the right file
                            if (length === -1) {
                                $exception = acquire(__ExceptionStatic);
                                $exception.warn('Could not find input[type="file"] with [name="' + key + '"] and [value="' +
                                    val.path + '"]. Stringifying data instead.', $exception.AJAX);
                                input.value = JSON.stringify(val);
                            }
                        }
                    } else {
                        // may throw a fatal error but this is an invalid case
                        $exception = acquire(__ExceptionStatic);
                        $exception.warn('Invalid form entry with key "' + key + '" and value "' + val, $exception.AJAX);
                        input.value = JSON.stringify(val);
                    }
                } else {
                    input.value = val;
                }

                return input;
            }
        }

        /**
         * @name IHttpRequest
         * @memberof plat.async
         * @kind interface
         * @exported false
         * 
         * @description
         * IHttpRequest provides a wrapper for the XMLHttpRequest object. Allows for
         * sending AJAX requests to a server.
         */
        interface IHttpRequest {
            /**
             * @name execute
             * @memberof plat.async.IHttpRequest
             * @kind function
             * @access public
             * 
             * @description
             * Executes an XMLHttpRequest and resolves an {@link plat.async.IAjaxPromise|IAjaxPromise} upon completion.
             * 
             * @typeparam R The response type for the XMLHttpRequest object.
             * 
             * @returns {plat.async.IAjaxPromise} A promise that fulfills when the XMLHttpRequest is done. 
             */
            execute<R>(): IAjaxPromise<R>;

            /**
             * @name executeJsonp
             * @memberof plat.async.IHttpRequest
             * @kind function
             * @access public
             * 
             * @description
             * Executes an JSONP request and resolves an {@link plat.async.IAjaxPromise|IAjaxPromise} upon completion.
             * 
             * @typeparam R The response type for the JSONP callback parameter.
             * 
             * @returns {plat.async.IAjaxPromise} A promise that fulfills when the JSONP request is done. 
             */
            executeJsonp<R>(): IAjaxPromise<R>;
        }

        /**
         * @name IHttpConfig
         * @memberof plat.async
         * @kind interface
         * 
         * @extends {plat.async.IJsonpConfig}
         * 
         * @description
         * Describes an object which contains Ajax configuration properties.
         */
        export interface IHttpConfig extends IJsonpConfig {
            /**
             * @name method
             * @memberof plat.async.IHttpConfig
             * @kind property
             * @access public
             * @optional
             * 
             * @type {string}
             * 
             * @description
             * The HTTP method type of XmlHttpRequest such as 'GET', 'POST', 'PUT', 
             * 'DELETE', etc. Ignored for non-HTTP urls. Defaults to 'GET'.
             */
            method?: string;

            /**
             * @name timeout
             * @memberof plat.async.IHttpConfig
             * @kind property
             * @access public
             * @optional
             * 
             * @type {number}
             * 
             * @description
             * The number of milliseconds a request can take before 
             * automatically being terminated. A value of 0 
             * means there is no timeout.
             */
            timeout?: number;

            /**
             * @name user
             * @memberof plat.async.IHttpConfig
             * @kind property
             * @access public
             * @optional
             * 
             * @type {string}
             * 
             * @description
             * An optional user string for the XmlHttpRequest
             */
            user?: string;

            /**
             * @name password
             * @memberof plat.async.IHttpConfig
             * @kind property
             * @access public
             * @optional
             * 
             * @type {string}
             * 
             * @description
             * An optional password string for the XmlHttpRequest
             */
            password?: string;

            /**
             * @name responseType
             * @memberof plat.async.IHttpConfig
             * @kind property
             * @access public
             * @optional
             * 
             * @type {string}
             * 
             * @description
             * The XMLHttpRequestResponseType. The response should 
             * still be checked when received due to browser 
             * incompatibilities. If a browser does not support a 
             * response type it will return the value as a string. 
             * The response type does not affect JSONP callback 
             * arguments.
             * 
             * @see config.XMLHttpRequestResponseType
             */
            responseType?: string;

            /**
             * @name contentType
             * @memberof plat.async.IHttpConfig
             * @kind property
             * @access public
             * @optional
             * 
             * @type {string}
             * 
             * @description
             * The Content-Type header for XMLHttpRequest when 
             * data is being sent. The default is 
             * 'application/json;charset=utf-8;'.
             */
            contentType?: string;

            /**
             * @name overrideMimeType
             * @memberof plat.async.IHttpConfig
             * @kind property
             * @access public
             * @optional
             * 
             * @type {string}
             * 
             * @description
             * A string to override the MIME type returned by the server.
             */
            overrideMimeType?: string;

            /**
             * @name headers
             * @memberof plat.async.IHttpConfig
             * @kind property
             * @access public
             * @optional
             * 
             * @type {any}
             * 
             * @description
             * A key/value pair object where the key is a DOMString header key
             * and the value is the DOMString header value.
             */
            headers?: any;

            /**
             * @name withCredentials
             * @memberof plat.async.IHttpConfig
             * @kind property
             * @access public
             * @optional
             * 
             * @type {boolean}
             * 
             * @description
             * Indicates whether or not cross-site Access-Control requests 
             * should be made using credentials such as cookies or 
             * authorization headers. The default is false.
             */
            withCredentials?: boolean;

            /**
             * @name data
             * @memberof plat.async.IHttpConfig
             * @kind property
             * @access public
             * @optional
             * 
             * @type {any}
             * 
             * @description
             * The request payload
             */
            data?: any;

            /**
             * @name transforms
             * @memberof plat.async.IHttpConfig
             * @kind property
             * @access public
             * @optional
             * 
             * @type {plat.async.IHttpTransformFunction}
             * 
             * @description
             * An array of data transform functions that fire in order and consecutively 
             * pass the returned result from one function to the next.
             */
            transforms?: Array<IHttpTransformFunction>;

            /**
             * @name isCrossDomain
             * @memberof plat.async.IHttpConfig
             * @kind property
             * @access public
             * @optional
             * 
             * @type {boolean}
             * 
             * @description
             * Forces a JSONP, cross-domain request when set to true.
             * The default is false.
             */
            isCrossDomain?: boolean;
        }

        /**
         * @name IHttpTransformFunction
         * @memberof plat.async
         * @kind interface
         * 
         * @description
         * A function that is used to transform XMLHttpRequest data.
         */
        export interface IHttpTransformFunction {
            /**
             * @memberof plat.async.IHttpTransformFunction
             * @kind function
             * @access public
             * 
             * @description
             * The method signature for {@link plat.async.IHttpTransformFunction|IHttpTransformFunction}.
             * 
             * @param {any} data The data for the XMLHttpRequest.
             * @param {XMLHttpRequest} xhr The XMLHttpRequest for the data.
             * 
             * @returns {any} The transformed data.
             */
            (data: any, xhr: XMLHttpRequest): any;
        }

        /**
         * @name IJsonpConfig
         * @memberof plat.async
         * @kind interface
         * 
         * @description
         * Describes an object which contains JSONP configuration properties.
         */
        export interface IJsonpConfig {
            /**
             * @name url
             * @memberof plat.async.IJsonpConfig
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The url for the JSONP callback 
             * (without the `?{callback}={callback_name}` parameter in the url) 
             * or for the XmlHttpRequest.
             */
            url: string;

            /**
             * @name jsonpIdentifier
             * @memberof plat.async.IJsonpConfig
             * @kind property
             * @access public
             * @optional
             * 
             * @type {string}
             * 
             * @description
             * The identifier the server uses to get the name of the JSONP
             * callback. The default is 'callback' as seen in 
             * http://www.platyfi.com/data?callback=plat_fnName.
             */
            jsonpIdentifier?: string;

            /**
             * @name jsonpCallback
             * @memberof plat.async.IJsonpConfig
             * @kind property
             * @access public
             * @optional
             * 
             * @type {string}
             * 
             * @description
             * A specified name for the JSONP callback (in case the server has 
             * it hardcoded and/or does not get it from the given url). The 
             * default is a unique plat id generated separately for 
             * each JSONP callback seen as 'plat_callback00' in
             * http://www.platyfi.com/data?callback=plat_callback00.
             */
            jsonpCallback?: string;
        }

        /**
         * @name IAjaxResponse
         * @memberof plat.async
         * @kind interface
         * 
         * @description
         * Describes an object that is the response to an AJAX request.
         * 
         * @typeparam R The type of the AJAX response.
         */
        export interface IAjaxResponse<R> {
            /**
             * @name response
             * @memberof plat.async.IAjaxResponse
             * @kind property
             * @access public
             * 
             * @type {R}
             * 
             * @description
             * The AJAX response or responseText. The response should 
             * be checked when received due to browser 
             * incompatibilities with responseType. If a browser does 
             * not support a response type it will return the value as 
             * a string.
             */
            response: R;

            /**
             * @name status
             * @memberof plat.async.IAjaxResponse
             * @kind property
             * @access public
             * 
             * @type {number}
             * 
             * @description
             * The XHR status. Resolves as 200 for JSONP.
             */
            status: number;

            /**
             * @name getAllResponseHeaders
             * @memberof plat.async.IAjaxResponse
             * @kind function
             * @access public
             * 
             * @description
             * A method for getting the XHR response headers.
             * 
             * @returns {void}
             */
            getAllResponseHeaders?: () => string;

            /**
             * @name xhr
             * @memberof plat.async.IAjaxResponse
             * @kind property
             * @access public
             * @optional
             * 
             * @type {XMLHttpRequest}
             * 
             * @description
             * The XMLHttpRequest object associated with the AJAX call
             */
            xhr?: XMLHttpRequest;
        }

        /**
         * @name IAjaxResolveFunction
         * @memberof plat.async
         * @kind interface
         * 
         * @description
         * Describes the AjaxPromise's resolve function
         * 
         * @typeparam R The type of the {@link plat.async.IAjaxResponse|IAjaxResponse} object.
         */
        export interface IAjaxResolveFunction<R> {
            /**
             * @memberof plat.async.IAjaxResolveFunction
             * @kind function
             * @access public
             * 
             * @description
             * The method signature for an {@link plat.async.IAjaxResolveFunction|IAjaxResolveFunction}.
             * 
             * @param {(value?: plat.async.IAjaxResponse<R>) => any} resolve The function to call when the 
             * AJAX call has successfully fulfilled.
             * @param {(reason?: plat.async.IAjaxError) => any} reject The function to call when the 
             * AJAX call fails.
             * 
             * @returns {void}
             */
            (resolve: (value?: IAjaxResponse<R>) => any, reject: (reason?: IAjaxError) => any): void;
        }

        /**
         * @name AjaxError
         * @memberof plat.async
         * @kind class
         * @exported false
         * 
         * @implements {plat.async.IAjaxError}
         * 
         * @description
         * A class that forms an Error object with an {@link plat.async.IAjaxResponse|IAjaxResponse}.
         */
        class AjaxError implements IAjaxError {
            /**
             * @name name
             * @memberof plat.async.AjaxError
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The name of the Error ('AjaxError')
             */
            name: string = 'AjaxError';

            /**
             * @name message
             * @memberof plat.async.AjaxError
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The Error message
             */
            message: string;

            /**
             * @name response
             * @memberof plat.async.AjaxError
             * @kind property
             * @access public
             * 
             * @type {any}
             * 
             * @description
             * The response from the XMLHttpRequest
             */
            response: any;

            /**
             * @name status
             * @memberof plat.async.AjaxError
             * @kind property
             * @access public
             * 
             * @type {number}
             * 
             * @description
             * The status code from the XMLHttpRequest
             */
            status: number;

            /**
             * @name getAllResponseHeaders
             * @memberof plat.async.AjaxError
             * @kind function
             * @access public
             * 
             * @description
             * A method for getting the XHR response headers.
             * 
             * @returns {void}
             */
            getAllResponseHeaders: () => string;

            /**
             * @name xhr
             * @memberof plat.async.AjaxError
             * @kind property
             * @access public
             * 
             * @type {XMLHttpRequest}
             * 
             * @description
             * The XMLHttpRequest object associated with the AJAX call
             */
            xhr: XMLHttpRequest;

            /**
             * @name constructor
             * @memberof plat.async.AjaxError
             * @kind function
             * @access public
             * 
             * @description
             * The constructor for an {@link plat.async.AjaxError|AjaxError}.
             * 
             * @param {plat.async.IAjaxResponse} response The {@link plat.async.IAjaxResponse|IAjaxResponse} object.
             * 
             * @returns {plat.async.AjaxError}
             */
            constructor(response: IAjaxResponse<any>) {
                Error.apply(this);
                this.response = this.message = response.response;
                this.status = response.status;
                this.getAllResponseHeaders = response.getAllResponseHeaders;
                this.xhr = response.xhr;
            }

            /**
             * @name toString
             * @memberof plat.async.AjaxError
             * @kind function
             * @access public
             * 
             * @description
             * Outputs a formatted string describing the {@link plat.async.AjaxError|AjaxError}.
             * 
             * @returns {string}
             */
            toString(): string {
                var response = this.response,
                    responseText = response;

                if (isObject(response) && !response.hasOwnProperty('toString')) {
                    responseText = JSON.stringify(response);
                }

                return 'Request failed with status: ' + this.status + ' and response: ' + responseText;
            }
        }

        // have to bypass TS flags in order to properly extend Error
        (<any>AjaxError).prototype = Error.prototype;

        /**
         * @name IAjaxError
         * @memberof plat.async
         * @kind interface
         * 
         * @implements {plat.async.IAjaxResponse}
         * 
         * @description
         * Describes an object that forms an Error object with an {@link plat.async.IAjaxResponse|IAjaxResponse}.
         */
        export interface IAjaxError extends Error, IAjaxResponse<any> { }

        /**
         * @name AjaxPromise
         * @memberof plat.async
         * @kind interface
         * 
         * @extends {plat.async.Promise}
         * @implements {plat.async.IAjaxPromise}
         * 
         * @description
         * Describes a type of {@link plat.async.Promise|Promise} that fulfills with an {@link plat.async.IAjaxResponse|IAjaxResponse} and can be optionally canceled.
         * 
         * @typeparam R The type of the response object in the {@link plat.async.IAjaxResponse|IAjaxResponse}.
         */
        export class AjaxPromise<R> extends Promise<IAjaxResponse<R>> implements IAjaxPromise<R> {
            /**
             * @name $Window
             * @memberof plat.async.AjaxPromise
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {Window}
             * 
             * @description
             * The Window object.
             */
            $Window: Window = acquire(__Window);

            /**
             * @name __http
             * @memberof plat.async.AjaxPromise
             * @kind property
             * @access private
             * @readonly
             * 
             * @type {plat.async.HttpRequest}
             * 
             * @description
             * The {@link plat.async.HttpRequest|HttpRequest} object.
             */
            private __http: HttpRequest;

            /**
             * @name constructor
             * @memberof plat.async.AjaxPromise
             * @kind function
             * @access public
             * @variation 0
             * 
             * @description
             * The constructor method for the {@link plat.async.AjaxPromise}.
             * 
             * @param {plat.async.IAjaxResolveFunction} resolveFunction The promise resolve function.
             * 
             * @returns {plat.async.AjaxPromise}
             */
            constructor(resolveFunction: IAjaxResolveFunction<R>);
            /**
             * @name constructor
             * @memberof plat.async.AjaxPromise
             * @kind function
             * @access public
             * @variation 1
             * 
             * @description
             * The constructor method for the {@link plat.async.AjaxPromise}.
             * 
             * @param {plat.async.IAjaxResolveFunction} resolveFunction The promise resolve function.
             * @param promise The promise object to allow for cancelling the {@link plat.async.AjaxPromise}.
             * 
             * @returns {plat.async.AjaxPromise}
             */
            constructor(resolveFunction: IAjaxResolveFunction<R>, promise: any);
            constructor(resolveFunction: IAjaxResolveFunction<R>, promise?: any) {
                super(resolveFunction);
                if (!isNull(promise)) {
                    this.__http = promise.__http;
                }
            }

            /**
             * @name cancel
             * @memberof plat.async.AjaxPromise
             * @kind function
             * @access public
             * 
             * @description
             * A method to cancel the AJAX call associated with this {@link plat.async.AjaxPromise}.
             * 
             * @returns {void}
             */
            cancel(): void {
                var http = this.__http,
                    xhr = http.xhr,
                    jsonpCallback = http.jsonpCallback;

                if (isFunction(http.clearTimeout)) {
                    http.clearTimeout();
                }

                if (!isNull(xhr)) {
                    xhr.onreadystatechange = null;
                    xhr.abort();
                    http.xhr = null;
                } else if (!isNull(jsonpCallback)) {
                    (<any>this.$Window)[jsonpCallback] = noop;
                }

                (<any>this).__subscribers = [];
            }

            /**
             * @name then
             * @memberof plat.async.AjaxPromise
             * @kind function
             * @access public
             * @variation 0
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
             * next then method in the promise chain.
             * 
             * @param {(success: plat.async.IAjaxResponse<R>) => plat.async.IAjaxThenable<U>} onFulfilled A method called when/if the promise fulfills. 
             * If undefined the next onFulfilled method in the promise chain will be called.
             * @param {(error: plat.async.IAjaxError) => plat.async.IAjaxThenable<U>} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            then<U>(onFulfilled: (success: IAjaxResponse<R>) => U,
                onRejected?: (error: IAjaxError) => any): IAjaxThenable<U>;
            /**
             * @name then
             * @memberof plat.async.AjaxPromise
             * @kind function
             * @access public
             * @variation 1
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
             * next then method in the promise chain.
             * 
             * @param {(success: plat.async.IAjaxResponse<R>) => plat.async.IAjaxThenable<U>} onFulfilled A method called when/if the promise fulfills. 
             * If undefined the next onFulfilled method in the promise chain will be called.
             * @param {(error: plat.async.IAjaxError) => U} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            then<U>(onFulfilled: (success: IAjaxResponse<R>) => IThenable<U>,
                onRejected?: (error: IAjaxError) => IThenable<U>): IAjaxThenable<U>;
            /**
             * @name then
             * @memberof plat.async.AjaxPromise
             * @kind function
             * @access public
             * @variation 2
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
             * next then method in the promise chain.
             * 
             * @param {(success: plat.async.IAjaxResponse<R>) => U} onFulfilled A method called when/if the promise fulfills. 
             * If undefined the next onFulfilled method in the promise chain will be called.
             * @param {(error: plat.async.IAjaxError) => plat.async.IAjaxThenable<U>} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            then<U>(onFulfilled: (success: IAjaxResponse<R>) => IThenable<U>,
                onRejected?: (error: IAjaxError) => any): IAjaxThenable<U>;
            /**
             * @name then
             * @memberof plat.async.AjaxPromise
             * @kind function
             * @access public
             * @variation 3
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
             * next then method in the promise chain.
             * 
             * @param {(success: plat.async.IAjaxResponse<R>) => U} onFulfilled A method called when/if the promise fulfills. 
             * If undefined the next onFulfilled method in the promise chain will be called.
             * @param {(error: plat.async.IAjaxError) => U} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            then<U>(onFulfilled: (success: IAjaxResponse<R>) => U,
                onRejected?: (error: IAjaxError) => IThenable<U>): IAjaxThenable<U>;
            then<U>(onFulfilled: (success: IAjaxResponse<R>) => U,
                onRejected?: (error: IAjaxError) => any): IAjaxThenable<U> {
                return <IAjaxThenable<U>><any>super.then<U>(onFulfilled, onRejected);
            }

            catch<U>(onRejected: (error: any) => IAjaxThenable<U>): IAjaxThenable<U>;
            catch<U>(onRejected: (error: any) => U): IAjaxThenable<U>;
            catch<U>(onRejected: (error: any) => any): IAjaxThenable<U> {
                return <IAjaxThenable<U>><any>super.catch<U>(onRejected);
            }
        }
        
        /**
         * @name IAjaxThenable
         * @memberof plat.async
         * @kind interface
         * 
         * @extends {plat.async.IThenable}
         * 
         * @description 
         * Describes a type of {@link plat.async.IThenable|IThenable} that can optionally cancel it's associated AJAX call.
         * 
         * @typeparam R The return type for the {@link plat.async.IThenable|IThenable}.
         */
        export interface IAjaxThenable<R> extends IThenable<R> {
            /**
             * @name cancel
             * @memberof plat.async.IAjaxThenable
             * @kind function
             * @access public
             * 
             * @description
             * A method to cancel the AJAX call associated with this {@link plat.async.AjaxPromise}.
             * 
             * @returns {void}
             */
            cancel(): void;

            /**
             * @name then
             * @memberof plat.async.IAjaxThenable
             * @kind function
             * @access public
             * @variation 0
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
             * next then method in the promise chain.
             * 
             * @param {(success: R) => plat.async.IAjaxThenable<U>} onFulfilled A method called when/if the promise fulfills. 
             * If undefined the next onFulfilled method in the promise chain will be called.
             * @param {(error: any) => plat.async.IAjaxThenable<U>} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            then<U>(onFulfilled: (success: R) => IAjaxThenable<U>, onRejected?: (error: any) => IAjaxThenable<U>): IAjaxThenable<U>;
            /**
             * @name then
             * @memberof plat.async.IAjaxThenable
             * @kind function
             * @access public
             * @variation 1
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
             * next then method in the promise chain.
             * 
             * @param {(success: R) => plat.async.IAjaxThenable<U>} onFulfilled A method called when/if the promise fulfills. 
             * If undefined the next onFulfilled method in the promise chain will be called.
             * @param {(error: any) => U} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            then<U>(onFulfilled: (success: R) => IAjaxThenable<U>, onRejected?: (error: any) => U): IAjaxThenable<U>;
            /**
             * @name then
             * @memberof plat.async.IAjaxThenable
             * @kind function
             * @access public
             * @variation 2
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
             * next then method in the promise chain.
             * 
             * @param {(success: R) => U} onFulfilled A method called when/if the promise fulfills. 
             * If undefined the next onFulfilled method in the promise chain will be called.
             * @param {(error: any) => plat.async.IAjaxThenable<U>} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            then<U>(onFulfilled: (success: R) => U, onRejected?: (error: any) => IAjaxThenable<U>): IAjaxThenable<U>;
            /**
             * @name then
             * @memberof plat.async.IAjaxThenable
             * @kind function
             * @access public
             * @variation 3
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
             * next then method in the promise chain.
             * 
             * @param {(success: R) => U} onFulfilled A method called when/if the promise fulfills. 
             * If undefined the next onFulfilled method in the promise chain will be called.
             * @param {(error: any) => U} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            then<U>(onFulfilled: (success: R) => U, onRejected?: (error: any) => U): IAjaxThenable<U>;

            /**
             * @name catch
             * @memberof plat.async.IAjaxThenable
             * @kind function
             * @access public
             * @variation 0
             * 
             * @description
             * A wrapper method for {@link plat.async.Promise|Promise.then(undefined, onRejected);}
             * 
             * @param {(error: any) => plat.async.IAjaxThenable<U>} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            catch<U>(onRejected: (error: any) => IAjaxThenable<U>): IAjaxThenable<U>;
            /**
             * @name catch
             * @memberof plat.async.IAjaxThenable
             * @kind function
             * @access public
             * @variation 1
             * 
             * @description
             * A wrapper method for {@link plat.async.Promise|Promise.then(undefined, onRejected);}
             * 
             * @param {(error: any) => U} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            catch<U>(onRejected: (error: any) => U): IAjaxThenable<U>;
        }

        /**
         * @name IAjaxPromise
         * @memberof plat.async
         * @kind interface
         * 
         * @extends {plat.async.IAjaxThenable}
         * 
         * @description
         * Describes a type of {@link plat.async.IPromise|IPromise} that fulfills with an {@link plat.async.IAjaxResponse|IAjaxResponse} and can be optionally canceled.
         * 
         * @typeparam R The type of the response object in the {@link plat.async.IAjaxResponse|IAjaxResponse}.
         */
        export interface IAjaxPromise<R> extends IAjaxThenable<IAjaxResponse<R>> {
            /**
             * @name cancel
             * @memberof plat.async.IAjaxPromise
             * @kind function
             * @access public
             * 
             * @description
             * A method to cancel the AJAX call associated with this {@link plat.async.AjaxPromise}.
             * 
             * @returns {void}
             */
            cancel(): void;

            /**
             * @name then
             * @memberof plat.async.IAjaxPromise
             * @kind function
             * @access public
             * @variation 0
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
             * next then method in the promise chain.
             * 
             * @param {(success: plat.async.IAjaxResponse<R>) => plat.async.IAjaxThenable<U>} onFulfilled A method called when/if the promise fulfills. 
             * If undefined the next onFulfilled method in the promise chain will be called.
             * @param {(error: plat.async.IAjaxError) => plat.async.IAjaxThenable<U>} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            then<U>(onFulfilled: (success: IAjaxResponse<R>) => IAjaxThenable<U>, onRejected?: (error: IAjaxError) => IAjaxThenable<U>): IAjaxThenable<U>;
            /**
             * @name then
             * @memberof plat.async.IAjaxPromise
             * @kind function
             * @access public
             * @variation 1
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
             * next then method in the promise chain.
             * 
             * @param {(success: plat.async.IAjaxResponse<R>) => plat.async.IAjaxThenable<U>} onFulfilled A method called when/if the promise fulfills. 
             * If undefined the next onFulfilled method in the promise chain will be called.
             * @param {(error: plat.async.IAjaxError) => U} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            then<U>(onFulfilled: (success: IAjaxResponse<R>) => IAjaxThenable<U>, onRejected?: (error: IAjaxError) => U): IAjaxThenable<U>;
            /**
             * @name then
             * @memberof plat.async.IAjaxPromise
             * @kind function
             * @access public
             * @variation 2
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
             * next then method in the promise chain.
             * 
             * @param {(success: plat.async.IAjaxResponse<R>) => U} onFulfilled A method called when/if the promise fulfills. 
             * If undefined the next onFulfilled method in the promise chain will be called.
             * @param {(error: plat.async.IAjaxError) => plat.async.IAjaxThenable<U>} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            then<U>(onFulfilled: (success: IAjaxResponse<R>) => U, onRejected?: (error: IAjaxError) => IAjaxThenable<U>): IAjaxThenable<U>;
            /**
             * @name then
             * @memberof plat.async.IAjaxPromise
             * @kind function
             * @access public
             * @variation 3
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
             * next then method in the promise chain.
             * 
             * @param {(success: plat.async.IAjaxResponse<R>) => U} onFulfilled A method called when/if the promise fulfills. 
             * If undefined the next onFulfilled method in the promise chain will be called.
             * @param {(error: plat.async.IAjaxError) => U} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            then<U>(onFulfilled: (success: IAjaxResponse<R>) => U, onRejected?: (error: IAjaxError) => U): IAjaxThenable<U>;

            /**
             * @name catch
             * @memberof plat.async.IAjaxPromise
             * @kind function
             * @access public
             * @variation 0
             * 
             * @description
             * A wrapper method for {@link plat.async.Promise|Promise.then(undefined, onRejected);}
             * 
             * @param {(error: plat.async.IAjaxError) => plat.async.IAjaxThenable<U>} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            catch<U>(onRejected: (error: IAjaxError) => IAjaxThenable<U>): IAjaxThenable<U>;
            /**
             * @name catch
             * @memberof plat.async.IAjaxPromise
             * @kind function
             * @access public
             * @variation 1
             * 
             * @description
             * A wrapper method for {@link plat.async.Promise|Promise.then(undefined, onRejected);}
             * 
             * @param {(error: plat.async.IAjaxError) => U} onRejected A method called when/if the promise rejects. 
             * If undefined the next onRejected method in the promise chain will be called.
             */
            catch<U>(onRejected: (error: IAjaxError) => U): IAjaxThenable<U>;
        }

        /**
         * @name IHttpResponseType
         * @memberof plat.async
         * @kind interface
         * 
         * @description
         * Describes an object that provides value mappings for XMLHttpRequestResponseTypes
         */
        export interface IHttpResponseType {
            /**
             * @name DEFAULT
             * @memberof plat.async.IHttpResponseType
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * The default response type (empty string)
             */
            DEFAULT: string;

            /**
             * @name ARRAYBUFFER
             * @memberof plat.async.IHttpResponseType
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * The arrayBuffer type ('arrayBuffer')
             */
            ARRAYBUFFER: string;

            /**
             * @name BLOB
             * @memberof plat.async.IHttpResponseType
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * The blob type ('blob')
             */
            BLOB: string;

            /**
             * @name DOCUMENT
             * @memberof plat.async.IHttpResponseType
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * The document type ('document')
             */
            DOCUMENT: string;

            /**
             * @name JSON
             * @memberof plat.async.IHttpResponseType
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * The json type ('json')
             */
            JSON: string;

            /**
             * @name TEXT
             * @memberof plat.async.IHttpResponseType
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * The text type ('text')
             */
            TEXT: string;
        }

        /**
         * @name IHttpContentType
         * @memberof plat.async
         * @kind interface
         * 
         * @description
         * Describes an object that provides Content-Type mappings for Http POST requests.
         */
        export interface IHttpContentType {
            /**
             * @name ENCODED_FORM
             * @memberof plat.async.IHttpContentType
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * Standard denotation for form encoded data. All objects are converted 
             * to string key-value pairs.
             */
            ENCODED_FORM: string;

            /**
             * @name JSON
             * @memberof plat.async.IHttpContentType
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * Standard denotation for JavaScript Object Notation (JSON).
             */
            JSON: string;

            /**
             * @name MULTIPART_FORM
             * @memberof plat.async.IHttpContentType
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * Standard denotation for a multi-part Webform. Associated with 
             * an entype of 'multipart/form-data'.
             */
            MULTIPART_FORM: string;

            /**
             * @name OCTET_STREAM
             * @memberof plat.async.IHttpContentType
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * Standard denotation for arbitrary binary data.
             */
            OCTET_STREAM: string;

            /**
             * @name XML
             * @memberof plat.async.IHttpContentType
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * Standard denotation for XML files.
             */
            XML: string;

            /**
             * @name PLAIN_TEXT
             * @memberof plat.async.IHttpContentType
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * Standard denotation for textual data.
             */
            PLAIN_TEXT: string;

            /**
             * @name HTML
             * @memberof plat.async.IHttpContentType
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * Standard denotation for HTML.
             */
            HTML: string;
        }

        /**
         * @name Http
         * @memberof plat.async
         * @kind class
         * 
         * @implements {plat.async.IHttp}
         * 
         * @description
         * The instantiated class of the injectable for making 
         * AJAX requests.
         */
        export class Http implements IHttp {
            /**
             * @name config
             * @memberof plat.async.Http
             * @kind property
             * @access public
             * @static
             * 
             * @type {plat.async.IHttpConfig}
             * 
             * @description
             * Default Http config
             */
            static config: IHttpConfig = {
                url: null,
                method: 'GET',
                responseType: '',
                transforms: [],
                headers: {},
                withCredentials: false,
                timeout: null,
                jsonpIdentifier: 'callback',
                contentType: 'application/json;charset=utf-8;'
            };

            /**
             * @name responseType
             * @memberof plat.async.Http
             * @kind property
             * @access public
             * 
             * @type {plat.async.IHttpResponseType}
             * 
             * @description
             * Provides value mappings for XMLHttpRequestResponseTypes
             */
            responseType: IHttpResponseType = {
                DEFAULT: '',
                ARRAYBUFFER: 'arraybuffer',
                BLOB: 'blob',
                DOCUMENT: 'document',
                JSON: 'json',
                TEXT: 'text'
            };

            /**
             * @name contentType
             * @memberof plat.async.Http
             * @kind property
             * @access public
             * 
             * @type {plat.async.IHttpContentType}
             * 
             * @description
             * Provides Content-Type mappings for Http POST requests.
             */
            contentType: IHttpContentType = {
                ENCODED_FORM: 'application/x-www-form-urlencoded;charset=utf-8;',
                JSON: 'application/json;charset=utf-8;',
                MULTIPART_FORM: 'multipart/form-data;',
                OCTET_STREAM: 'application/octet-stream;charset=utf-8;',
                XML: 'application/xml;charset=utf-8;',
                PLAIN_TEXT: 'text/plain;',
                HTML: 'text/html;'
            };

            /**
             * @name ajax
             * @memberof plat.async.Http
             * @kind function
             * @access public
             * 
             * @description
             * A wrapper method for the Http class that creates and executes a new Http with
             * the specified {@link plat.async.IAjaxOptions|IAjaxOptions}. This function will check if 
             * XMLHttpRequest level 2 is present, and will default to JSONP if it isn't and 
             * the request is cross-domain.
             * 
             * @typeparam R The type of the {@link plat.async.IAjaxPromise|IAjaxPromise}
             * 
             * @param {plat.async.IHttpConfig} options The {@link plat.async.IAjaxOptions|IAjaxOptions} for either the XMLHttpRequest 
             * or the JSONP callback.
             * 
             * @returns {plat.async.IAjaxPromise} A promise, when fulfilled
             * or rejected, will return an {@link plat.async.IAjaxResponse|IAjaxResponse} object.
             */
            ajax<R>(options: IHttpConfig): IAjaxPromise<R> {
                return new HttpRequest(options).execute<R>();
            }

            /**
             * @name jsonp
             * @memberof plat.async.Http
             * @kind function
             * @access public
             * 
             * @description
             * A direct method to force a cross-domain JSONP request.
             * 
             * @typeparam R The type of the {@link plat.async.IAjaxPromise|IAjaxPromise}
             * 
             * @param {plat.async.IJsonpConfig} options The {@link plat.async.IJsonpConfig|IJsonpConfig} 
             * 
             * @returns {plat.async.IAjaxPromise} A promise, when fulfilled or rejected, will return an 
             * {@link plat.async.IAjaxResponse|IAjaxResponse} object.
             */
            jsonp<R>(options: IJsonpConfig): IAjaxPromise<R> {
                return new HttpRequest(options).executeJsonp<R>();
            }

            /**
             * @name json
             * @memberof plat.async.Http
             * @kind function
             * @access public
             * 
             * @description
             * Makes an ajax request, specifying responseType: 'json'.
             * 
             * @typeparam R The type of the {@link plat.async.IAjaxPromise|IAjaxPromise}
             * 
             * @param {plat.async.IHttpConfig} options The {@link plat.async.IHttpConfig|IHttpConfig} 
             * for either the XMLHttpRequest or the JSONP callback.
             * 
             * @returns {plat.async.IAjaxPromise} A promise, when fulfilled or rejected, 
             * will return an {@link plat.async.IAjaxResponse|IAjaxResponse} object, with the response 
             * being a parsed JSON object (assuming valid JSON).
             */
            json<R>(options: IHttpConfig): IAjaxPromise<R> {
                return new HttpRequest(extend({}, options, { responseType: 'json' })).execute<R>();
            }
        }

        /**
         * The Type for referencing the '$Http' injectable as a dependency.
         */
        export function IHttp(): IHttp {
            return new Http();
        }

        register.injectable(__Http, IHttp);

        /**
         * @name IHttp
         * @memberof plat.async
         * @kind interface
         * 
         * @description
         * The interface of the injectable for making 
         * AJAX requests.
         */
        export interface IHttp {
            /**
             * @name responseType
             * @memberof plat.async.IHttp
             * @kind property
             * @access public
             * 
             * @type {plat.async.IHttpResponseType}
             * 
             * @description
             * Provides value mappings for
             * XMLHttpRequestResponseTypes
             */
            responseType: IHttpResponseType;

            /**
             * @name contentType
             * @memberof plat.async.IHttp
             * @kind property
             * @access public
             * 
             * @type {plat.async.IHttpContentType}
             * 
             * @description
             * Provides Content-Type mappings for Http POST requests.
             */
            contentType: IHttpContentType;

            /**
             * @name ajax
             * @memberof plat.async.IHttp
             * @kind function
             * @access public
             * 
             * @description
             * A wrapper method for the Http class that creates and executes a new Http with
             * the specified {@link plat.async.IAjaxOptions|IAjaxOptions}. This function will check if 
             * XMLHttpRequest level 2 is present, and will default to JSONP if it isn't and 
             * the request is cross-domain.
             * 
             * @typeparam R The type of the {@link plat.async.IAjaxPromise|IAjaxPromise}
             * 
             * @param {plat.async.IHttpConfig} options The {@link plat.async.IAjaxOptions|IAjaxOptions} for either the XMLHttpRequest 
             * or the JSONP callback.
             * 
             * @returns {plat.async.AjaxPromise} A promise, when fulfilled
             * or rejected, will return an {@link plat.async.IAjaxResponse|IAjaxResponse} object.
             */
            ajax<R>(options: IHttpConfig): IAjaxPromise<R>;

            /**
             * @name jsonp
             * @memberof plat.async.IHttp
             * @kind function
             * @access public
             * 
             * @description
             * A direct method to force a cross-domain JSONP request.
             * 
             * @typeparam R The type of the {@link plat.async.IAjaxPromise|IAjaxPromise}
             * 
             * @param {plat.async.IJsonpConfig} options The {@link plat.async.IJsonpConfig|IJsonpConfig} 
             * 
             * @returns {plat.async.IAjaxPromise} A promise, when fulfilled or rejected, will return an 
             * {@link plat.async.IAjaxResponse|IAjaxResponse} object.
             */
            jsonp? <R>(options: IJsonpConfig): IAjaxPromise<R>;

            /**
             * @name json
             * @memberof plat.async.IHttp
             * @kind function
             * @access public
             * 
             * @description
             * Makes an ajax request, specifying responseType: 'json'.
             * 
             * @typeparam R The type of the {@link plat.async.IAjaxPromise|IAjaxPromise}
             * 
             * @param {plat.async.IHttpConfig} options The {@link plat.async.IHttpConfig|IHttpConfig} 
             * for either the XMLHttpRequest or the JSONP callback.
             * 
             * @returns {plat.async.IAjaxPromise} A promise, when fulfilled or rejected, 
             * will return an {@link plat.async.IAjaxResponse|IAjaxResponse} object, with the response 
             * being a parsed JSON object (assuming valid JSON).
             */
            json? <R>(options: IHttpConfig): IAjaxPromise<R>;
        }

        /**
         * The Type for referencing the '$HttpConfig' injectable as a dependency.
         */
        export function IHttpConfig(): IHttpConfig {
            return Http.config;
        }

        register.injectable(__HttpConfig, IHttpConfig);
        
        /**
         * @name Promise
         * @memberof plat.async
         * @kind class
         * 
         * @implements {plat.async.IThenable}
         * 
         * @description
         * Takes in a generic typs corresponding to the fullfilled success type. 
         * 
         * @typeparam R The return type of the promise.
         */
        export class Promise<R> implements IThenable<R> {
            /**
             * @name __subscribers
             * @memberof plat.async.Promise
             * @kind property
             * @access private
             * 
             * @type {Array<any>}
             * 
             * @description
             * Holds all the subscriber promises
             */
            private __subscribers: Array<any>;

            /**
             * @name __state
             * @memberof plat.async.Promise
             * @kind property
             * @access private
             * 
             * @type {plat.async.State}
             * 
             * @description
             * The state of the promise (fulfilled/rejected)
             */
            private __state: State;

            /**
             * @name __detail
             * @memberof plat.async.Promise
             * @kind property
             * @access private
             * 
             * @type {any}
             * 
             * @description
             * The return detail of a promise.
             */
            private __detail: any;

            /**
             * @name config
             * @memberof plat.async.Promise
             * @kind property
             * @access public
             * @static
             * 
             * @type {any}
             * 
             * @description
             * The configuration for creating asynchronous promise flushing.
             */
            static config = {
                /**
                 * Handles asynchronous flushing of callbacks. If the callback queue is of 
                 * length 1, then we need to schedule a flush. Afterward, any additional 
                 * callbacks added to the queue will be flushed accordingly.
                 */
                async: (callback: (arg?: IThenable<any>) => void, arg?: IThenable<any>) => {
                    var length = queue.push([callback, arg]);
                    if (length === 1) {
                        scheduleFlush();
                    }
                }
            };

            /**
             * @name all
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             * @static
             * @variation 0
             * 
             * @description
             * Returns a promise that fulfills when every item in the array is fulfilled.
             * Casts arguments to promises if necessary. The result argument of the 
             * returned promise is an array containing the fulfillment result arguments 
             * in-order. The rejection argument is the rejection argument of the 
             * first-rejected promise.
             * 
             * @typeparam R The return type of the promises.
             * 
             * @param {Array<plat.async.IThenable<R>>} promises An array of promises, although every argument is potentially
             * cast to a promise meaning not every item in the array needs to be a promise.
             * 
             * @returns {plat.async.IThenable<Array<R>>} A promise that resolves after all the input promises resolve.
             */
            static all<R>(promises: Array<IThenable<R>>): IThenable<Array<R>>;
            /**
             * @name all
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             * @static
             * @variation 1
             * 
             * @description
             * Returns a promise that fulfills when every item in the array is fulfilled.
             * Casts arguments to promises if necessary. The result argument of the 
             * returned promise is an array containing the fulfillment result arguments 
             * in-order. The rejection argument is the rejection argument of the 
             * first-rejected promise.
             * 
             * @typeparam R The type of the promises.
             * 
             * @param {Array<R>} promises An array of objects, if an object is not a promise, it will be cast.
             * 
             * @returns {plat.async.IThenable<Array<R>>} A promise that resolves after all the input promises resolve.
             */
            static all<R>(promises: Array<R>): IThenable<Array<R>>;
            static all(promises: Array<any>): IThenable<Array<any>> {
                if (!isArray(promises)) {
                    return Promise.all([promises]);
                }

                return new Promise<Array<any>>((resolve: (value?: Array<any>) => void, reject: (reason?: any) => void) => {
                    var results: Array<any> = [],
                        remaining = promises.length,
                        promise: Promise<any>;

                    if (remaining === 0) {
                        resolve(<any>[]);
                    }

                    function resolver(index: number) {
                        return (value: any) => resolveAll(index, value);
                    }

                    function resolveAll(index: number, value: any) {
                        results[index] = value;
                        if (--remaining === 0) {
                            resolve(<any>results);
                        }
                    }

                    for (var i = 0; i < promises.length; i++) {
                        promise = promises[i];

                        if (isPromise(promise)) {
                            promise.then(resolver(i), reject);
                        } else {
                            resolveAll(i, promise);
                        }
                    }
                });
            }

            /**
             * @name cast
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Creates a promise that fulfills to the passed in object. If the
             * passed-in object is a promise it returns the promise.
             * 
             * @typeparam R The type of the input object to cast to a promise.
             * 
             * @param object The object to cast to a Promise.
             */
            static cast<R>(object?: R): Promise<R> {
                if (isObject(object) && (<any>object).constructor === Promise) {
                    return <Promise<R>>(<any>object);
                }

                return new Promise<R>((resolve: (value: R) => any) => resolve(object));
            }

            /**
             * @name race
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             * @static
             * @variation 0
             *
             * @description
             * Returns a promise that fulfills as soon as any of the promises fulfill,
             * or rejects as soon as any of the promises reject (whichever happens first).
             * 
             * @typeparam R The return type of the input promises.
             * 
             * @param {Array<plat.async.IThenable<R>>} promises An Array of promises to 'race'.
             * 
             * @returns {plat.async.IThenable<R>} A promise that fulfills when one of the input 
             * promises fulfilled.
             */
            static race<R>(promises: Array<IThenable<R>>): IThenable<R>;
            /**
             * @name race
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             * @static
             * @variation 1
             *
             * @description
             * Returns a promise that fulfills as soon as any of the promises fulfill,
             * or rejects as soon as any of the promises reject (whichever happens first).
             * 
             * @typeparam R The type of the input objects.
             * 
             * @param {Array<R>} promises An Array of anything to 'race'. Objects that aren't promises will
             * be cast.
             * 
             * @returns {plat.async.IThenable<R>} A promise that fulfills when one of the input 
             * promises fulfilled.
             */
            static race<R>(promises: Array<R>): IThenable<R>;
            static race(promises: Array<any>): IThenable<any> {
                if (!isArray(promises)) {
                    return Promise.race([promises]);
                }

                return new Promise<any>((resolve: (value: any) => any, reject: (error: any) => any) => {
                    var promise: Promise<any>;

                    for (var i = 0; i < promises.length; i++) {
                        promise = promises[i];

                        if (promise && typeof promise.then === 'function') {
                            promise.then(resolve, reject);
                        } else {
                            resolve(<any>promise);
                        }
                    }
                });
            }

            /**
             * @name resolve
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             * @static
             *
             * @description
             * Returns a promise that resolves with the input value.
             * 
             * @typeparam R The value with which to resolve the promise.
             * 
             * @param {R} value The value to resolve.
             * 
             * @returns {plat.async.IThenable<R>} A promise that will resolve with the associated value.
             */
            static resolve<R>(value?: R): IThenable<R> {
                return new Promise<R>((resolve: (value: R) => any, reject: (reason: any) => any) => {
                    resolve(value);
                });
            }

            /**
             * @name reject
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             * @static
             *
             * @description
             * Returns a promise that rejects with the input value.
             * 
             * @param {any} value The value to reject.
             * 
             * @returns {plat.async.IThenable<any>} A promise that will reject with the error.
             */
            static reject(error?: any): IThenable<any> {
                return new Promise<any>((resolve: (value: any) => any, reject: (error: any) => any) => {
                    reject(error);
                });
            }

            /**
             * @name __invokeResolveFunction
             * @memberof plat.async.Promise
             * @kind function
             * @access private
             * @static
             *
             * @description
             * Invokes the resolve function for a promise. Handles error catching.
             * 
             * @typeparam R The return type of the input {@link plat.async.Promise|Promise}.
             * 
             * @param {plat.async.IResolveFunction<R>} The resolve function to invoke.
             * @param {plat.async.Promise<R>} The promise on which to invoke the resolve function.
             * 
             * @returns {void}
             */
            private static __invokeResolveFunction<R>(resolveFunction: IResolveFunction<R>,
                promise: Promise<R>): void {
                function resolvePromise(value?: any) {
                    Promise.__resolve<R>(promise, value);
                }

                function rejectPromise(reason?: any) {
                    Promise.__reject(promise, reason);
                }

                try {
                    resolveFunction(resolvePromise, rejectPromise);
                } catch (e) {
                    rejectPromise(e);
                }
            }

            /**
             * @name __invokeCallback
             * @memberof plat.async.Promise
             * @kind function
             * @access private
             * @static
             *
             * @description
             * Invokes a callback for a promise with the specified detail.
             * 
             * @param {plat.async.State} settled The state of the promise.
             * @param {any} promise The promise object.
             * @param {(response: any) => void} callback The callback to invoke.
             * @param {any} detail The details to pass to the callback.
             * 
             * @returns {void}
             */
            private static __invokeCallback(settled: State, promise: any, callback: (response: any) => void, detail: any): void {
                var hasCallback = isFunction(callback),
                    value: any,
                    error: Error,
                    succeeded: boolean,
                    failed: boolean;

                if (hasCallback) {
                    try {
                        value = callback(detail);
                        succeeded = true;
                    } catch (e) {
                        failed = true;
                        error = e;
                    }
                } else {
                    value = detail;
                    succeeded = true;
                }

                if (Promise.__handleThenable<any>(promise, value)) {
                    return;
                } else if (hasCallback && succeeded) {
                    Promise.__resolve<any>(promise, value);
                } else if (failed) {
                    Promise.__reject(promise, error);
                } else if (settled === State.FULFILLED) {
                    Promise.__resolve<any>(promise, value);
                } else if (settled === State.REJECTED) {
                    Promise.__reject(promise, value);
                }
            }

            /**
             * @name __publish
             * @memberof plat.async.Promise
             * @kind function
             * @access private
             * @static
             *
             * @description
             * Publishes the promise details to all the subscribers for a promise.
             * 
             * @param {any} promise The promise object.
             * @param {plat.async.State} settled The state of the promise.
             * 
             * @returns {void}
             */
            private static __publish(promise: Promise<any>, settled: State): void {
                var subscribers = promise.__subscribers,
                    detail = promise.__detail,
                    child: any,
                    callback: () => void;

                for (var i = 0; i < subscribers.length; i += 3) {
                    child = subscribers[i];
                    callback = subscribers[i + settled];

                    Promise.__invokeCallback(settled, child, callback, detail);
                }

                promise.__subscribers = null;
            }

            /**
             * @name __publishFulfillment
             * @memberof plat.async.Promise
             * @kind function
             * @access private
             * @static
             *
             * @description
             * Publishes a promises that has been fulfilled.
             * 
             * @param {any} promise The promise object.
             * 
             * @returns {void}
             */
            private static __publishFulfillment(promise: any): void {
                Promise.__publish(promise, promise.__state = State.FULFILLED);
            }

            /**
             * @name __publishRejection
             * @memberof plat.async.Promise
             * @kind function
             * @access private
             * @static
             *
             * @description
             * Publishes a promises that has been rejected.
             * 
             * @param {any} promise The promise object.
             * 
             * @returns {void}
             */
            private static __publishRejection(promise: any): void {
                Promise.__publish(promise, promise.__state = State.REJECTED);
            }

            /**
             * @name __reject
             * @memberof plat.async.Promise
             * @kind function
             * @access private
             * @static
             *
             * @description
             * Asynchronously rejects a promise
             * 
             * @param {any} promise The promise object.
             * @param {any} reason The detail of the rejected promise.
             * 
             * @returns {void}
             */
            private static __reject(promise: any, reason: any): void {
                if (promise.__state !== State.PENDING) {
                    return;
                }
                promise.__state = State.SEALED;
                promise.__detail = reason;

                Promise.config.async(Promise.__publishRejection, promise);
            }

            /**
             * @name __fulfill
             * @memberof plat.async.Promise
             * @kind function
             * @access private
             * @static
             *
             * @description
             * Asynchronously fulfills a promise
             * 
             * @typeparam R The return type of the promise.
             * 
             * @param {plat.async.Promise<R>} promise The promise object.
             * @param {any} value The detail of the fulfilled promise.
             * 
             * @returns {void}
             */
            private static __fulfill<R>(promise: Promise<R>, value: any): void {
                if (promise.__state !== State.PENDING) {
                    return;
                }
                promise.__state = State.SEALED;
                promise.__detail = value;

                Promise.config.async(Promise.__publishFulfillment, promise);
            }

            /**
             * @name __resolve
             * @memberof plat.async.Promise
             * @kind function
             * @access private
             * @static
             *
             * @description
             * Asynchronously fulfills a promise, allowing for promise chaining.
             * 
             * @typeparam R The return type of the promise.
             * 
             * @param {plat.async.Promise<R>} promise The promise object.
             * @param {any} value The detail of the fulfilled promise.
             * 
             * @returns {void}
             */
            private static __resolve<R>(promise: Promise<R>, value: any): void {
                if (promise === value) {
                    Promise.__fulfill(promise, value);
                } else if (!Promise.__handleThenable<R>(promise, value)) {
                    Promise.__fulfill(promise, value);
                }
            }

            /**
             * @name __handleThenable
             * @memberof plat.async.Promise
             * @kind function
             * @access private
             * @static
             *
             * @description
             * Handles chaining promises together, when a promise is returned from within a then handler.
             * 
             * @typeparam R The return type of the promise.
             * 
             * @param {plat.async.Promise<R>} promise The promise object.
             * @param {plat.async.Promise<R>} value The next promise to await.
             * 
             * @returns {boolean} Whether or not the value passed in is a promise.
             */
            private static __handleThenable<R>(promise: Promise<R>, value: Promise<R>): boolean {
                var resolved: boolean;

                try {
                    if (promise === value) {
                        var $exception: IExceptionStatic = acquire(__ExceptionStatic);
                        $exception.fatal(new TypeError('A promises callback cannot return the same promise.'),
                            $exception.PROMISE);
                    }

                    if(isPromise(value)) {
                        value.then.call(value, (val: any) => {
                            if (resolved) {
                                return true;
                            }
                            resolved = true;

                            if (value !== val) {
                                Promise.__resolve<R>(promise, val);
                            } else {
                                Promise.__fulfill<R>(promise, val);
                            }
                        }, (val: any) => {
                            if (resolved) {
                                return true;
                            }
                            resolved = true;

                            Promise.__reject(promise, val);
                        });

                        return true;
                    }
                } catch (error) {
                    if (resolved) {
                        return true;
                    }
                    Promise.__reject(promise, error);
                    return true;
                }

                return false;
            }

            /**
             * @name __subscribe
             * @memberof plat.async.Promise
             * @kind function
             * @access private
             * @static
             *
             * @description
             * Adds a child promise to the parent's subscribers.
             * 
             * @typeparam R The return type of the promise.
             * 
             * @param {plat.async.Promise<any>} parent The parent promise.
             * @param {plat.async.Promise<any>} value The child promise.
             * @param {(success: any) => any} onFullfilled The fulfilled method for the child.
             * @param {(error: any) => any} onRejected The rejected method for the child.
             * 
             * @returns {void}
             */
            private static __subscribe(parent: Promise<any>, child: IThenable<any>,
                onFulfilled: (success: any) => any, onRejected: (error: any) => any): void {
                var subscribers = parent.__subscribers;
                var length = subscribers.length;

                subscribers[length] = child;
                subscribers[length + State.FULFILLED] = onFulfilled;
                subscribers[length + State.REJECTED] = onRejected;
            }

            /**
             * @name constructor
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             *
             * @description
             * An ES6 implementation of the Promise API. Useful for asynchronous programming.
             * Takes in 2 generic types corresponding to the fullfilled success and error types. 
             * The error type (U) should extend Error in order to get proper stack tracing.
             * 
             * @typeparam R The return type of the promise.
             * 
             * @param {plat.async.IResolveFunction<R>} resolveFunction A IResolveFunction for fulfilling/rejecting the Promise.
             * 
             * @returns {plat.async.IThenable<R>} A promise object.
             */
            constructor(resolveFunction: IResolveFunction<R>) {
                var $exception: IExceptionStatic;
                if (!isFunction(resolveFunction)) {
                    $exception = acquire(__ExceptionStatic);
                    $exception.fatal(new TypeError('You must pass a resolver function as the first argument to the promise constructor'),
                        $exception.PROMISE);
                }

                if (!(this instanceof Promise)) {
                    $exception = acquire(__ExceptionStatic);
                    $exception.fatal(new TypeError('Failed to construct "Promise": ' +
                        'Please use the "new" operator, this object constructor cannot be called as a function.'),
                        $exception.PROMISE);
                }

                this.__subscribers = [];

                Promise.__invokeResolveFunction<R>(resolveFunction, this);
            }

            /**
             * @name then
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             * @variation 0
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The return type of the returned promise.
             * 
             * @param {(success: R) => plat.async.IThenable<U>} onFulfilled A method called when/if the promise fulills. If undefined the next
             * onFulfilled method in the promise chain will be called.
             * @param {(error: any) => plat.async.IThenable<U>} onRejected A method called when/if the promise rejects. If undefined the next
             * onRejected method in the promise chain will be called.
             * 
             * @returns {plat.async.IThenable<U>} A promise that resolves with the input type parameter U.
             */
            then<U>(onFulfilled: (success: R) => IThenable<U>, onRejected?: (error: any) => IThenable<U>): IThenable<U>;
            /**
             * @name then
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             * @variation 1
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The return type of the returned promise.
             * 
             * @param {(success: R) => plat.async.IThenable<U>} onFulfilled A method called when/if the promise fulills. If undefined the next
             * onFulfilled method in the promise chain will be called.
             * @param {(error: any) => U} onRejected A method called when/if the promise rejects. If undefined the next
             * onRejected method in the promise chain will be called.
             * 
             * @returns {plat.async.IThenable<U>} A promise that resolves with the input type parameter U.
             */
            then<U>(onFulfilled: (success: R) => IThenable<U>, onRejected?: (error: any) => U): IThenable<U>;
            /**
             * @name then
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             * @variation 2
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The return type of the returned promise.
             * 
             * @param {(success: R) => U} onFulfilled A method called when/if the promise fulills. If undefined the next
             * onFulfilled method in the promise chain will be called.
             * @param {(error: any) => plat.async.IThenable<U>} onRejected A method called when/if the promise rejects. If undefined the next
             * onRejected method in the promise chain will be called.
             * 
             * @returns {plat.async.IThenable<U>} A promise that resolves with the input type parameter U.
             */
            then<U>(onFulfilled: (success: R) => U, onRejected?: (error: any) => IThenable<U>): IThenable<U>;
            /**
             * @name then
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             * @variation 3
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The return type of the returned promise.
             * 
             * @param {(success: R) => U} onFulfilled A method called when/if the promise fulills. If undefined the next
             * onFulfilled method in the promise chain will be called.
             * @param {(error: any) => U} onRejected A method called when/if the promise rejects. If undefined the next
             * onRejected method in the promise chain will be called.
             * 
             * @returns {plat.async.IThenable<U>} A promise that resolves with the input type parameter U.
             */
            then<U>(onFulfilled: (success: R) => U, onRejected?: (error: any) => U): IThenable<U>;
            then<U>(onFulfilled: (success: R) => any, onRejected?: (error: any) => any): IThenable<U> {
                var promise = this;
                
                var thenPromise = <IThenable<U>>new (<any>this).constructor(() => { }, this);

                if (this.__state) {
                    var callbacks = arguments;
                    Promise.config.async(() => {
                        Promise.__invokeCallback(promise.__state, thenPromise, callbacks[promise.__state - 1], promise.__detail);
                    });
                } else {
                    Promise.__subscribe(this, thenPromise, onFulfilled, onRejected);
                }

                return thenPromise;
            }

            /**
             * @name catch
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             * @variation 0
             * 
             * @description
             * A wrapper method for {@link plat.async.Promise|Promise.then(undefined, onRejected);}
             * 
             * @typeparam U The return type of the returned promise.
             * 
             * @param {(error: any) => plat.async.IThenable<U>} onRejected A method called when/if the promise rejects. If undefined the next
             * onRejected method in the promise chain will be called.
             * 
             * @returns {plat.async.IThenable<U>} A promise that resolves with the input type parameter U.
             */
            catch<U>(onRejected: (error: any) => IThenable<U>): IThenable<U>;
            /**
             * @name catch
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             * @variation 1
             * 
             * @description
             * A wrapper method for {@link plat.async.Promise|Promise.then(undefined, onRejected);}
             * 
             * @typeparam U The return type of the returned promise.
             * 
             * @param {(error: any) => U} onRejected A method called when/if the promise rejects. If undefined the next
             * onRejected method in the promise chain will be called.
             * 
             * @returns {plat.async.IThenable<U>} A promise that resolves with the input type parameter U.
             */
            catch<U>(onRejected: (error: any) => U): IThenable<U>;
            catch<U>(onRejected: (error: any) => any): IThenable<U> {
                return this.then(null, onRejected);
            }

            /**
             * @name toString
             * @memberof plat.async.Promise
             * @kind function
             * @access public
             * 
             * @description
             * Outputs the Promise as a readable string.
             */
            toString() {
                return '[object Promise]';
            }
        }

        /**
         * Describes a chaining function that fulfills when the previous link is complete and is 
         * able to be caught in the case of an error.
         */
        export interface IThenable<R> {
            /**
             * @name then
             * @memberof plat.async.IThenable
             * @kind function
             * @access public
             * @variation 0
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The return type of the returned promise.
             * 
             * @param {(success: R) => plat.async.IThenable<U>} onFulfilled A method called when/if the promise fulills. If undefined the next
             * onFulfilled method in the promise chain will be called.
             * @param {(error: any) => plat.async.IThenable<U>} onRejected A method called when/if the promise rejects. If undefined the next
             * onRejected method in the promise chain will be called.
             * 
             * @returns {plat.async.IThenable<U>} A promise that resolves with the input type parameter U.
             */
            then<U>(onFulfilled: (success: R) => IThenable<U>, onRejected?: (error: any) => IThenable<U>): IThenable<U>;
            /**
             * @name then
             * @memberof plat.async.IThenable
             * @kind function
             * @access public
             * @variation 1
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The return type of the returned promise.
             * 
             * @param {(success: R) => plat.async.IThenable<U>} onFulfilled A method called when/if the promise fulills. If undefined the next
             * onFulfilled method in the promise chain will be called.
             * @param {(error: any) => U} onRejected A method called when/if the promise rejects. If undefined the next
             * onRejected method in the promise chain will be called.
             * 
             * @returns {plat.async.IThenable<U>} A promise that resolves with the input type parameter U.
             */
            then<U>(onFulfilled: (success: R) => IThenable<U>, onRejected?: (error: any) => U): IThenable<U>;
            /**
             * @name then
             * @memberof plat.async.IThenable
             * @kind function
             * @access public
             * @variation 2
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The return type of the returned promise.
             * 
             * @param {(success: R) => U} onFulfilled A method called when/if the promise fulills. If undefined the next
             * onFulfilled method in the promise chain will be called.
             * @param {(error: any) => plat.async.IThenable<U>} onRejected A method called when/if the promise rejects. If undefined the next
             * onRejected method in the promise chain will be called.
             * 
             * @returns {plat.async.IThenable<U>} A promise that resolves with the input type parameter U.
             */
            then<U>(onFulfilled: (success: R) => U, onRejected?: (error: any) => IThenable<U>): IThenable<U>;
            /**
             * @name then
             * @memberof plat.async.IThenable
             * @kind function
             * @access public
             * @variation 3
             * 
             * @description
             * Takes in two methods, called when/if the promise fulfills/rejects.
             * 
             * @typeparam U The return type of the returned promise.
             * 
             * @param {(success: R) => U} onFulfilled A method called when/if the promise fulills. If undefined the next
             * onFulfilled method in the promise chain will be called.
             * @param {(error: any) => U} onRejected A method called when/if the promise rejects. If undefined the next
             * onRejected method in the promise chain will be called.
             * 
             * @returns {plat.async.IThenable<U>} A promise that resolves with the input type parameter U.
             */
            then<U>(onFulfilled: (success: R) => U, onRejected?: (error: any) => U): IThenable<U>;

            /**
             * @name catch
             * @memberof plat.async.IThenable
             * @kind function
             * @access public
             * @variation 0
             * 
             * @description
             * A wrapper method for {@link plat.async.Promise|Promise.then(undefined, onRejected);}
             * 
             * @typeparam U The return type of the returned promise.
             * 
             * @param {(error: any) => plat.async.IThenable<U>} onRejected A method called when/if the promise rejects. If undefined the next
             * onRejected method in the promise chain will be called.
             * 
             * @returns {plat.async.IThenable<U>} A promise that resolves with the input type parameter U.
             */
            catch<U>(onRejected: (error: any) => IThenable<U>): IThenable<U>;
            /**
             * @name catch
             * @memberof plat.async.IThenable
             * @kind function
             * @access public
             * @variation 1
             * 
             * @description
             * A wrapper method for {@link plat.async.Promise|Promise.then(undefined, onRejected);}
             * 
             * @typeparam U The return type of the returned promise.
             * 
             * @param {(error: any) => U} onRejected A method called when/if the promise rejects. If undefined the next
             * onRejected method in the promise chain will be called.
             * 
             * @returns {plat.async.IThenable<U>} A promise that resolves with the input type parameter U.
             */
            catch<U>(onRejected: (error: any) => U): IThenable<U>;
        }

        enum State {
            PENDING = <any>(void 0),
            SEALED = 0,
            FULFILLED = 1,
            REJECTED = 2
        };

        var browserGlobal: any = (typeof window !== 'undefined') ? window : {},
            BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;

        // node
        function useNextTick(): () => void {
            return () => {
                process.nextTick(flush);
            };
        }
        
        function useMutationObserver(): () => void {
            var observer = new BrowserMutationObserver(flush),
                $document = acquire(__Document),
                $window = acquire(__Window),
                element = $document.createElement('div');

            observer.observe(element, { attributes: true });

            $window.addEventListener('unload', () => {
                observer.disconnect();
                observer = null;
            }, false);

            return () => {
                element.setAttribute('drainQueue', 'drainQueue');
            };
        }

        function useSetTimeout(): () => void {
            var global: any = global,
                local = (typeof global !== 'undefined') ? global : this;

            return () => {
                local.setTimeout(flush, 1);
            };
        }

        var queue: Array<any> = [];
        function flush(): void {
            var tuple: Array<(response: any) => void>,
                callback: (response: any) => void,
                arg: any;

            for (var i = 0; i < queue.length; i++) {
                tuple = queue[i];
                callback = tuple[0];
                arg = tuple[1];
                callback(arg);
            }
            queue = [];
        }

        var process: any = process,
            scheduleFlush: () => void;

        // decide what async method to use to triggering processing of queued callbacks:
        if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
            scheduleFlush = useNextTick();
        } else if (BrowserMutationObserver) {
            scheduleFlush = useMutationObserver();
        } else {
            scheduleFlush = useSetTimeout();
        }

        /**
         * Describes a function passed into the constructor for a Promise. The function allows you to
         * resolve/reject the Promise.
         */
        export interface IResolveFunction<R> {
            /**
             * A function which allows you to resolve/reject a Promise.
             * 
             * @param resolve A method for resolving a Promise. If you pass in a 'thenable' argument 
             * (meaning if you pass in a Promise-like object), then the promise will resolve with the 
             * outcome of the object. Else the promise will resolve with the argument.
             * @param reject A method for rejecting a promise. The argument should be an instancof Error
             * to assist with debugging. If a method in the constructor for a Promise throws an error, 
             * the promise will reject with the error.
             */
            (resolve: (value?: R) => void, reject: (reason?: any) => void): void;
        }

        /**
         * The Type for referencing the '$Promise' injectable as a dependency.
         */
        export function IPromise($Window?: any): IPromise {
            if (!isNull($Window.Promise) &&
                isFunction($Window.Promise.all) &&
                isFunction($Window.Promise.cast) &&
                isFunction($Window.Promise.race) &&
                isFunction($Window.Promise.resolve) &&
                isFunction($Window.Promise.reject)) {
                return $Window.Promise;
            }
            return Promise;
        }

        register.injectable(__Promise, IPromise, [__Window], __CLASS);

        /**
         * @name IPromise
         * @memberof plat.async
         * @kind interface
         * 
         * @description
         * The injectable reference for the ES6 Promise implementation.
         */
        export interface IPromise {
            /**
             * @name constructor
             * @memberof plat.async.IPromise
             * @kind function
             * @access public
             *
             * @description
             * An ES6 implementation of the Promise API. Useful for asynchronous programming.
             * Takes in 2 generic types corresponding to the fullfilled success and error types. 
             * The error type (U) should extend Error in order to get proper stack tracing.
             * 
             * @typeparam R The return type of the promise.
             * 
             * @param {plat.async.IResolveFunction<R>} resolveFunction A IResolveFunction for fulfilling/rejecting the Promise.
             * 
             * @returns {plat.async.IThenable<R>} A promise object.
             */
            new <R>(resolveFunction: IResolveFunction<R>): IThenable<R>;

            /**
             * @name all
             * @memberof plat.async.IPromise
             * @kind function
             * @access public
             * @static
             * @variation 0
             *
             * @description
             * Returns a promise that fulfills when every item in the array is fulfilled.
             * Casts arguments to promises if necessary. The result argument of the
             * returned promise is an array containing the fulfillment result arguments
             * in-order. The rejection argument is the rejection argument of the
             * first-rejected promise.
             *
             * @typeparam R The return type of the promises.
             *
             * @param {Array<plat.async.IThenable<R>>} promises An array of promises, although every argument is potentially
             * cast to a promise meaning not every item in the array needs to be a promise.
             *
             * @returns {plat.async.IThenable<Array<R>>} A promise that resolves after all the input promises resolve.
             */
            all<R>(promises: Array<IThenable<R>>): IThenable<Array<R>>;
            /**
             * @name all
             * @memberof plat.async.IPromise
             * @kind function
             * @access public
             * @static
             * @variation 1
             * 
             * @description
             * Returns a promise that fulfills when every item in the array is fulfilled.
             * Casts arguments to promises if necessary. The result argument of the 
             * returned promise is an array containing the fulfillment result arguments 
             * in-order. The rejection argument is the rejection argument of the 
             * first-rejected promise.
             * 
             * @typeparam R The type of the promises.
             * 
             * @param {Array<R>} promises An array of objects, if an object is not a promise, it will be cast.
             * 
             * @returns {plat.async.IThenable<Array<R>>} A promise that resolves after all the input promises resolve.
             */
            all<R>(promises: Array<R>): IThenable<Array<R>>;

            /**
             * @name cast
             * @memberof plat.async.IPromise
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Creates a promise that fulfills to the passed in object. If the
             * passed-in object is a promise it returns the promise.
             * 
             * @typeparam R The type of the input object to cast to a promise.
             * 
             * @param {R} object The object to cast to a Promise.
             * 
             * @returns {plat.async.IThenable<R>} The cast promise.
             */
            cast<R>(object?: R): IThenable<R>;

            /**
             * @name race
             * @memberof plat.async.IPromise
             * @kind function
             * @access public
             * @static
             * @variation 0
             *
             * @description
             * Returns a promise that fulfills as soon as any of the promises fulfill,
             * or rejects as soon as any of the promises reject (whichever happens first).
             * 
             * @typeparam R The return type of the input promises.
             * 
             * @param {Array<plat.async.IThenable<R>>} promises An Array of promises to 'race'.
             * 
             * @returns {plat.async.IThenable<R>} A promise that fulfills when one of the input 
             * promises fulfilled.
             */
            race<R>(promises: Array<IThenable<R>>): IThenable<R>;
            /**
             * @name race
             * @memberof plat.async.IPromise
             * @kind function
             * @access public
             * @static
             * @variation 1
             *
             * @description
             * Returns a promise that fulfills as soon as any of the promises fulfill,
             * or rejects as soon as any of the promises reject (whichever happens first).
             * 
             * @typeparam R The type of the input objects.
             * 
             * @param {Array<R>} promises An Array of anything to 'race'. Objects that aren't promises will
             * be cast.
             * 
             * @returns {plat.async.IThenable<R>} A promise that fulfills when one of the input 
             * promises fulfilled.
             */
            race<R>(promises: Array<R>): IThenable<R>;

            /**
             * @name resolve
             * @memberof plat.async.IPromise
             * @kind function
             * @access public
             * @static
             *
             * @description
             * Returns a promise that resolves with the input value.
             * 
             * @typeparam R The value with which to resolve the promise.
             * 
             * @param {R} value The value to resolve.
             * 
             * @returns {plat.async.IThenable<R>} A promise that will resolve with the associated value.
             */
            resolve<R>(value: R): IThenable<R>;

            /**
             * @name reject
             * @memberof plat.async.IPromise
             * @kind function
             * @access public
             * @static
             *
             * @description
             * Returns a promise that rejects with the input value.
             * 
             * @param {any} value The value to reject.
             * 
             * @returns {plat.async.IThenable<any>} A promise that will reject with the error.
             */
            reject(error: any): IThenable<any>;
        }
    }
}