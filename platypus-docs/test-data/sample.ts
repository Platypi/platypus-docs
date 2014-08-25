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
             * @typeparam {any} R The response type for the XMLHttpRequest object.
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
             * @typeparam {any} R The response type for the JSONP callback parameter.
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
             * @typeparam {any} R The response type for the XMLHttpRequest object.
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
             * @typeparam {any} R The response type for the JSONP callback parameter.
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
         * @typeparam {any} R The type of the AJAX response.
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
         * @typeparam {any} R The type of the {@link plat.async.IAjaxResponse|IAjaxResponse} object.
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
         * @kind class
         * 
         * @extends {plat.async.Promise}
         * @implements {plat.async.IAjaxPromise}
         * 
         * @description
         * Describes a type of {@link plat.async.Promise|Promise} that fulfills with an {@link plat.async.IAjaxResponse|IAjaxResponse} and can be optionally cancelled.
         * 
         * @typeparam {any} R The type of the response object in the {@link plat.async.IAjaxResponse|IAjaxResponse}.
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
             * @typeparam {any} U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
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
             * @typeparam {any} U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
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
             * @typeparam {any} U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
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
             * @typeparam {any} U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
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
         * @typeparam {any} R The return type for the {@link plat.async.IThenable|IThenable}.
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
             * @typeparam {any} U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
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
             * @typeparam {any} U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
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
             * @typeparam {any} U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
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
             * @typeparam {any} U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
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
         * Describes a type of {@link plat.async.IPromise|IPromise} that fulfills with an {@link plat.async.IAjaxResponse|IAjaxResponse} and can be optionally cancelled.
         * 
         * @typeparam {any} R The type of the response object in the {@link plat.async.IAjaxResponse|IAjaxResponse}.
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
             * @typeparam {any} U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
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
             * @typeparam {any} U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
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
             * @typeparam {any} U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
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
             * @typeparam {any} U The type of the object returned from the fulfill/reject callbacks, which will be carried to the 
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
             * @typeparam {any} R The type of the {@link plat.async.IAjaxPromise|IAjaxPromise}
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
             * @typeparam {any} R The type of the {@link plat.async.IAjaxPromise|IAjaxPromise}
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
             * @typeparam {any} R The type of the {@link plat.async.IAjaxPromise|IAjaxPromise}
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
             * @typeparam {any} R The type of the {@link plat.async.IAjaxPromise|IAjaxPromise}
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
             * @typeparam {any} R The type of the {@link plat.async.IAjaxPromise|IAjaxPromise}
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
             * @typeparam {any} R The type of the {@link plat.async.IAjaxPromise|IAjaxPromise}
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
         * Takes in a generic type corresponding to the fullfilled success type. 
         * 
         * @typeparam {any} R The return type of the promise.
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
             * @typeparam {any} R The return type of the promises.
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
             * @typeparam {any} R The type of the promises.
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
             * @typeparam {any} R The type of the input object to cast to a promise.
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
             * @typeparam {any} R The return type of the input promises.
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
             * @typeparam {any} R The type of the input objects.
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
             * @typeparam {any} R The value with which to resolve the promise.
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
             * @param {any} error The value to reject.
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
             * @typeparam {any} R The return type of the input {@link plat.async.Promise|Promise}.
             * 
             * @param {plat.async.IResolveFunction<R>} resolveFunction The resolve function to invoke.
             * @param {plat.async.Promise<R>} promise The promise on which to invoke the resolve function.
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
             * @typeparam {any} R The return type of the promise.
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
             * @typeparam {any} R The return type of the promise.
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
             * @typeparam {any} R The return type of the promise.
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

                    if (isPromise(value)) {
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
             * @typeparam {any} R The return type of the promise.
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
             * @typeparam {any} R The return type of the promise.
             * 
             * @param {plat.async.IResolveFunction<R>} resolveFunction A IResolveFunction for fulfilling/rejecting the Promise.
             * 
             * @returns {plat.async.Promise<R>} A promise object.
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
             * @typeparam {any} U The return type of the returned promise.
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
             * @typeparam {any} U The return type of the returned promise.
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
             * @typeparam {any} U The return type of the returned promise.
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
             * @typeparam {any} U The return type of the returned promise.
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
             * @typeparam {any} U The return type of the returned promise.
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
             * @typeparam {any} U The return type of the returned promise.
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
         * @name IThenable
         * @memberof plat.async
         * @kind interface
         * 
         * @description
         * Describes a chaining function that fulfills when the previous link is complete and is 
         * able to be caught in the case of an error.
         * 
         * @typeparam {any} R The return type of the thenable.
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
             * @typeparam {any} U The return type of the returned promise.
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
             * @typeparam {any} U The return type of the returned promise.
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
             * @typeparam {any} U The return type of the returned promise.
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
             * @typeparam {any} U The return type of the returned promise.
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
             * @typeparam {any} U The return type of the returned promise.
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
             * @typeparam {any} U The return type of the returned promise.
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
             * @typeparam {any} R The return type of the promise.
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
             * @typeparam {any} R The return type of the promises.
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
             * @typeparam {any} R The type of the promises.
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
             * @typeparam {any} R The type of the input object to cast to a promise.
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
             * @typeparam {any} R The return type of the input promises.
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
             * @typeparam {any} R The type of the input objects.
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
             * @typeparam {any} R The value with which to resolve the promise.
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

    /**
     * @name Compat
     * @memberof plat
     * @kind class
     * 
     * @implements {plat.ICompat}
     * 
     * @description
     * A class containing boolean values signifying browser 
     * and/or platform compatibilities.
     */
    export class Compat implements ICompat {
        /**
         * @name $Window
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {Window}
         * 
         * @description
         * The window injectable.
         */
        $Window: Window = acquire(__Window);

        /**
         * @name $Document
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {Document}
         * 
         * @description
         * The document injectable.
         */
        $Document: Document = acquire(__Document);

        /**
         * @name isCompatible
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Determines if the browser is modern enough to correctly 
         * run PlatypusTS.
         */
        isCompatible: boolean;

        /**
         * @name cordova
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether or not Cordova is defined. If it is, 
         * we hook up ALM events to Cordova's functions.
         */
        cordova: boolean;

        /**
         * @name pushState
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether window.history.pushState is defined.
         */
        pushState: boolean;

        /**
         * @name fileSupported
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether the File API is supported.
         */
        fileSupported: boolean;

        /**
         * @name amd
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether Require is present. If it is, we assume 
         * it is going to be used and leave the loading of the app up 
         * to the developer.
         */
        amd: boolean;

        /**
         * @name msApp
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether we are in the contet of a Windows 8 app.
         */
        msApp: boolean;

        /**
         * @name indexedDb
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether indexedDB exists on the window.
         */
        indexedDb: boolean;

        /**
         * @name proto
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether Object.prototype.__proto__ exists.
         */
        proto: boolean;

        /**
         * @name getProto
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether Object.prototype.getPrototypeOf exists.
         */
        getProto: boolean;

        /**
         * @name setProto
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether Object.prototype.setPrototypeOf exists.
         */
        setProto: boolean;

        /**
         * @name hasTouchEvents
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Whether or not the current browser has touch events 
         * like touchstart, touchmove, touchend, etc.
         */
        hasTouchEvents: boolean;

        /**
         * @name hasPointerEvents
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Whether or not the current browser has pointer events 
         * like pointerdown, MSPointerMove, pointerup, etc.
         */
        hasPointerEvents: boolean;

        /**
         * @name hasMsPointerEvents
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Whether or not the current browser has touch events 
         * like MSPointerDown, touchmove, MSPointerUp, etc.
         */
        hasMsPointerEvents: boolean;

        /**
         * @name animationSupported
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Whether or not the browser supports animations.
         */
        animationSupported: boolean;

        /**
         * @name platCss
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Whether the platypus.css file was included or not.
         */
        platCss: boolean;

        /**
         * @name mappedEvents
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {plat.IMappedEvents}
         * 
         * @description
         * An object containing the correctly mapped touch events for the browser.
         */
        mappedEvents: IMappedEvents;

        /**
         * @name animationEvents
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {plat.IAnimationEvents}
         * 
         * @description
         * An object containing the properly prefixed animation events.
         */
        animationEvents: IAnimationEvents;

        /**
         * @name vendorPrefix
         * @memberof plat.Compat
         * @kind property
         * @access public
         * 
         * @type {plat.IVendorPrefix}
         * 
         * @description
         * An object containing information regarding any potential vendor prefix.
         */
        vendorPrefix: IVendorPrefix;

        /**
         * @name constructor
         * @memberof plat.Compat
         * @kind function
         * @access public
         * 
         * @description
         * Define everything
         * 
         * @returns {void}
         */
        constructor() {
            this.__defineBooleans();
            this.__defineMappedEvents();
            this.__defineAnimationEvents();
            this.__determineCss();
        }

        /**
         * @name __defineBooleans
         * @memberof plat.Compat
         * @kind function
         * @access private
         * 
         * @description
         * Define booleans
         * 
         * @returns {void}
         */
        private __defineBooleans(): void {
            var $window = this.$Window,
                navigator = $window.navigator,
                history = $window.history,
                def = (<any>$window).define,
                msA = (<any>$window).MSApp;

            this.isCompatible = isFunction(Object.defineProperty) && isFunction(this.$Document.querySelector);
            this.cordova = !isNull((<any>$window).cordova);
            this.pushState = !(isNull(history) || isNull(history.pushState));
            this.fileSupported = !(isUndefined((<any>$window).File) || isUndefined((<any>$window).FormData));
            this.amd = isFunction(def) && !isNull(def.amd);
            this.msApp = isObject(msA) && isFunction(msA.execUnsafeLocalFunction);
            this.indexedDb = !isNull($window.indexedDB);
            this.proto = isObject((<any>{}).__proto__);
            this.getProto = isFunction(Object.getPrototypeOf);
            this.setProto = isFunction((<any>Object).setPrototypeOf);
            this.hasTouchEvents = !isUndefined((<any>$window).ontouchstart);
            this.hasPointerEvents = !!navigator.pointerEnabled;
            this.hasMsPointerEvents = !!navigator.msPointerEnabled;
        }

        /**
         * @name __defineMappedEvents
         * @memberof plat.Compat
         * @kind function
         * @access private
         * 
         * @description
         * Define {@link plat.IMappedEvents|mapped events}
         * 
         * @returns {void}
         */
        private __defineMappedEvents(): void {
            if (this.hasPointerEvents) {
                this.mappedEvents = {
                    $touchstart: 'pointerdown',
                    $touchend: 'pointerup',
                    $touchmove: 'pointermove',
                    $touchcancel: 'pointercancel'
                };
            } else if (this.hasMsPointerEvents) {
                this.mappedEvents = {
                    $touchstart: 'MSPointerDown',
                    $touchend: 'MSPointerUp',
                    $touchmove: 'MSPointerMove',
                    $touchcancel: 'MSPointerCancel'
                };
            } else if (this.hasTouchEvents) {
                this.mappedEvents = {
                    $touchstart: 'touchstart',
                    $touchend: 'touchend',
                    $touchmove: 'touchmove',
                    $touchcancel: 'touchcancel'
                };
            } else {
                this.mappedEvents = {
                    $touchstart: 'mousedown',
                    $touchend: 'mouseup',
                    $touchmove: 'mousemove',
                    $touchcancel: null
                };
            }
        }

        /**
         * @name __defineAnimationEvents
         * @memberof plat.Compat
         * @kind function
         * @access private
         * 
         * @description
         * Define {@link plat.IAnimationEvents|animation events}
         * 
         * @returns {void}
         */
        private __defineAnimationEvents(): void {
            var documentElement = this.$Document.documentElement,
                styles = this.$Window.getComputedStyle(documentElement, ''),
                prefix: string;

            if (!isUndefined((<any>styles).OLink)) {
                prefix = 'o';
            } else {
                var matches = Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/);
                prefix = (isArray(matches) && matches.length > 1) ? matches[1] : '';
            }

            this.vendorPrefix = {
                lowerCase: prefix,
                css: prefix === '' ? '' : '-' + prefix + '-',
                js: prefix[0].toUpperCase() + prefix.substr(1)
            };

            if (prefix === 'webkit') {
                this.animationSupported = !isUndefined((<any>documentElement.style).WebkitAnimation);
                if (!this.animationSupported) {
                    this.animationEvents = {
                        $animation: '',
                        $animationStart: '',
                        $animationEnd: '',
                        $transition: '',
                        $transitionStart: '',
                        $transitionEnd: ''
                    };
                    return;
                }

                this.animationEvents = {
                    $animation: 'webkitAnimation',
                    $animationStart: 'webkitAnimationStart',
                    $animationEnd: 'webkitAnimationEnd',
                    $transition: 'webkitTransition',
                    $transitionStart: 'webkitTransitionStart',
                    $transitionEnd: 'webkitTransitionEnd'
                };
            } else {
                this.animationSupported = !isUndefined((<any>documentElement.style).animation);
                if (!this.animationSupported) {
                    this.animationEvents = {
                        $animation: '',
                        $animationStart: '',
                        $animationEnd: '',
                        $transition: '',
                        $transitionStart: '',
                        $transitionEnd: ''
                    };
                    return;
                }

                this.animationEvents = {
                    $animation: 'animation',
                    $animationStart: 'animationstart',
                    $animationEnd: 'animationend',
                    $transition: 'transition',
                    $transitionStart: 'transitionstart',
                    $transitionEnd: 'transitionend'
                };
            }
        }

        /**
         * @name __determineCss
         * @memberof plat.Compat
         * @kind function
         * @access private
         * 
         * @description
         * Determines whether or not platypus css styles exist.
         * 
         * @returns {void}
         */
        private __determineCss(): void {
            var $document = this.$Document,
                head = $document.head,
                element = $document.createElement('div');

            element.setAttribute(__Hide, '');
            head.insertBefore(element, null);

            var computedStyle = this.$Window.getComputedStyle(element),
                display = computedStyle.display,
                visibility = computedStyle.visibility;

            if (display === 'none' || visibility === 'hidden') {
                this.platCss = true;
            } else {
                this.platCss = false;
            }

            head.removeChild(element);
        }
    }

    /**
     * The Type for referencing the '$Compat' injectable as a dependency.
     */
    export function ICompat(): ICompat {
        return new Compat();
    }

    register.injectable(__Compat, ICompat);

    /**
     * @name ICompat
     * @memberof plat
     * @kind interface
     * 
     * @description
     * An object containing boolean values signifying browser 
     * and/or platform compatibilities.
     */
    export interface ICompat {
        /**
         * @name isCompatible
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Determines if the browser is modern enough to correctly 
         * run PlatypusTS.
         */
        isCompatible: boolean;

        /**
         * @name cordova
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether or not Cordova is defined. If it is, 
         * we hook up ALM events to Cordova's functions.
         */
        cordova: boolean;

        /**
         * @name pushState
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether window.history.pushState is defined.
         */
        pushState: boolean;

        /**
         * @name fileSupported
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether the File API is supported.
         */
        fileSupported: boolean;

        /**
         * @name amd
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether Require is present. If it is, we assume 
         * it is going to be used and leave the loading of the app up 
         * to the developer.
         */
        amd: boolean;

        /**
         * @name msApp
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether we are in the contet of a Windows 8 app.
         */
        msApp: boolean;

        /**
         * @name indexedDb
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether indexedDB exists on the window.
         */
        indexedDb: boolean;

        /**
         * @name proto
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether Object.prototype.__proto__ exists.
         */
        proto: boolean;

        /**
         * @name getProto
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether Object.prototype.getPrototypeOf exists.
         */
        getProto: boolean;

        /**
         * @name setProto
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Signifies whether Object.prototype.setPrototypeOf exists.
         */
        setProto: boolean;

        /**
         * @name hasTouchEvents
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Whether or not the current browser has touch events 
         * like touchstart, touchmove, touchend, etc.
         */
        hasTouchEvents: boolean;

        /**
         * @name hasPointerEvents
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Whether or not the current browser has pointer events 
         * like pointerdown, MSPointerMove, pointerup, etc.
         */
        hasPointerEvents: boolean;

        /**
         * @name hasMsPointerEvents
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Whether or not the current browser has touch events 
         * like MSPointerDown, touchmove, MSPointerUp, etc.
         */
        hasMsPointerEvents: boolean;

        /**
         * @name animationSupported
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Whether or not the browser supports animations.
         */
        animationSupported: boolean;

        /**
         * @name platCss
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {boolean}
         * 
         * @description
         * Whether the platypus.css file was included or not.
         */
        platCss: boolean;

        /**
         * @name mappedEvents
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {plat.IMappedEvents}
         * 
         * @description
         * An object containing the correctly mapped touch events for the browser.
         */
        mappedEvents: IMappedEvents;

        /**
         * @name animationEvents
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {plat.IAnimationEvents}
         * 
         * @description
         * An object containing the properly prefixed animation events.
         */
        animationEvents: IAnimationEvents;

        /**
         * @name vendorPrefix
         * @memberof plat.ICompat
         * @kind property
         * @access public
         * 
         * @type {plat.IVendorPrefix}
         * 
         * @description
         * An object containing information regarding any potential vendor prefix.
         */
        vendorPrefix: IVendorPrefix;
    }

    /**
     * @name IMappedEvents
     * @memberof plat
     * @kind interface
     * 
     * @extends {plat.IObject}
     * 
     * @description
     * Describes an object containing the correctly mapped touch events for the browser.
     */
    export interface IMappedEvents extends IObject<string> {
        /**
         * @name $touchstart
         * @memberof plat.IMappedEvents
         * @kind property
         * @access public
         * 
         * @type {string}
         * 
         * @description
         * An event type for touch start.
         */
        $touchstart: string;

        /**
         * @name $touchend
         * @memberof plat.IMappedEvents
         * @kind property
         * @access public
         * 
         * @type {string}
         * 
         * @description
         * An event type for touch end.
         */
        $touchend: string;

        /**
         * @name $touchmove
         * @memberof plat.IMappedEvents
         * @kind property
         * @access public
         * 
         * @type {string}
         * 
         * @description
         * An event type for touch move.
         */
        $touchmove: string;

        /**
         * @name $touchcancel
         * @memberof plat.IMappedEvents
         * @kind property
         * @access public
         * 
         * @type {string}
         * 
         * @description
         * An event type for touch cancel.
         */
        $touchcancel: string;
    }

    /**
     * @name IAnimationEvents
     * @memberof plat
     * @kind interface
     * 
     * @extends {plat.IObject}
     * 
     * @description
     * Describes an object containing the properly prefixed animation events.
     */
    export interface IAnimationEvents extends IObject<string> {
        /**
         * @name $animation
         * @memberof plat.IAnimationEvents
         * @kind property
         * @access public
         * 
         * @type {string}
         * 
         * @description
         * The animation identifier.
         */
        $animation: string;

        /**
         * @name $animationStart
         * @memberof plat.IAnimationEvents
         * @kind property
         * @access public
         * 
         * @type {string}
         * 
         * @description
         * The animation start event.
         */
        $animationStart: string;

        /**
         * @name $animationEnd
         * @memberof plat.IAnimationEvents
         * @kind property
         * @access public
         * 
         * @type {string}
         * 
         * @description
         * The animation end event.
         */
        $animationEnd: string;

        /**
         * @name $transition
         * @memberof plat.IAnimationEvents
         * @kind property
         * @access public
         * 
         * @type {string}
         * 
         * @description
         * The transition identifier.
         */
        $transition: string;

        /**
         * @name $transitionStart
         * @memberof plat.IAnimationEvents
         * @kind property
         * @access public
         * 
         * @type {string}
         * 
         * @description
         * The transition start event.
         */
        $transitionStart: string;

        /**
         * @name $transitionEnd
         * @memberof plat.IAnimationEvents
         * @kind property
         * @access public
         * 
         * @type {string}
         * 
         * @description
         * The transition end event.
         */
        $transitionEnd: string;
    }

    /**
     * @name IVendorPrefix
     * @memberof plat
     * @kind interface
     * 
     * @extends {plat.IObject}
     * 
     * @description
     * Describes an object that contains information regarding the browser's 
     * vendor prefix.
     */
    export interface IVendorPrefix extends IObject<string> {
        /**
         * @name lowerCase
         * @memberof plat.IVendorPrefix
         * @kind property
         * @access public
         * 
         * @type {string}
         * 
         * @description
         * The lowercase representation of the browser's vendor prefix.
         */
        lowerCase: string;

        /**
         * @name css
         * @memberof plat.IVendorPrefix
         * @kind property
         * @access public
         * 
         * @type {string}
         * 
         * @description
         * The css representation of the browser's vendor prefix 
         * denoted by -{prefix}-.
         */
        css: string;

        /**
         * @name js
         * @memberof plat.IVendorPrefix
         * @kind property
         * @access public
         * 
         * @type {string}
         * 
         * @description
         * The JavaScript representation of the browser's vendor prefix 
         * denoted by it beginning with a capital letter.
         */
        js: string;
    }

    /**
     * @name Control
     * @memberof plat
     * @kind class
     * 
     * @implements {plat.IControl}
     * 
     * @description
     * Used for facilitating data and DOM manipulation. Contains lifecycle events 
     * as well as properties for communicating with other controls. This is the base
     * class for all types of controls.
     */
    export class Control implements IControl {
        /**
         * @name $Parser
         * @memberof plat.Control
         * @kind property
         * @access public
         * @static
         * 
         * @type {plat.expressions.IParser}
         * 
         * @description
         * Reference to the {@link plat.expressions.IParser|IParser} injectable.
         */
        static $Parser: expressions.IParser;

        /**
         * @name $ContextManagerStatic
         * @memberof plat.Control
         * @kind property
         * @access public
         * @static
         * 
         * @type {plat.observable.IContextManagerStatic}
         * 
         * @description
         * Reference to the {@link plat.observable.IContextManagerStatic|IContextManagerStatic} injectable.
         */
        static $ContextManagerStatic: observable.IContextManagerStatic;

        /**
         * @name $EventManagerStatic
         * @memberof plat.Control
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
         * @name __eventListeners
         * @memberof plat.Control
         * @kind property
         * @access private
         * @static
         * 
         * @type {plat.IObject<Array<plat.IRemoveListener>>}
         * 
         * @description
         * An object containing all controls' registered event listeners.
         */
        private static __eventListeners: IObject<Array<IRemoveListener>> = {};

        /**
         * @name getRootControl
         * @memberof plat.Control
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * Finds the ancestor control for the given control that contains the root 
         * context.
         * 
         * @param {plat.IControl} control The control with which to find the root.
         * 
         * @returns {plat.ui.ITemplateControl} The root control.
         */
        static getRootControl(control: IControl): ui.ITemplateControl;
        static getRootControl(control: ui.ITemplateControl) {
            if (isNull(control)) {
                return control;
            }

            var root = control;

            while (!(isNull(root.parent) || root.hasOwnContext)) {
                if (!isNull(root.root)) {
                    root = root.root;
                    break;
                }
                root = root.parent;
            }

            return root;
        }

        /**
         * @name load
         * @memberof plat.Control
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * Given a control, calls the loaded method for the control if it exists.
         * 
         * @param {plat.IControl} control The control to load.
         * 
         * @returns {void}
         */
        static load(control: IControl): void {
            if (isNull(control)) {
                return;
            }

            var ctrl = <ui.ITemplateControl>control;
            if (isString(ctrl.absoluteContextPath) && isFunction(ctrl.contextChanged)) {
                var contextManager = Control.$ContextManagerStatic.getManager(ctrl.root);

                contextManager.observe(ctrl.absoluteContextPath, {
                    uid: control.uid,
                    listener: (newValue, oldValue) => {
                        ui.TemplateControl.contextChanged(control, newValue, oldValue);
                    }
                });

                if (isFunction((<any>ctrl).zCC__plat)) {
                    (<any>ctrl).zCC__plat();
                    deleteProperty(ctrl, 'zCC__plat');
                }
            }

            if (isFunction(control.loaded)) {
                control.loaded();
            }
        }

        /**
         * @name dispose
         * @memberof plat.Control
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * Disposes all the necessary memory for a control. Uses specific dispose 
         * methods related to a control's constructor if necessary.
         * 
         * @param {plat.IControl} control The {@link plat.Control|Control} to dispose.
         * 
         * @returns {void}
         */
        static dispose(control: IControl): void {
            var ctrl = <any>control;

            if (isNull(ctrl)) {
                return;
            } else if (!isUndefined(ctrl.templateControl)) {
                controls.AttributeControl.dispose(ctrl);
                return;
            } else if (ctrl.hasOwnContext) {
                ui.ViewControl.dispose(ctrl);
                return;
            } else if (ctrl.controls) {
                ui.TemplateControl.dispose(ctrl);
                return;
            }

            Control.removeEventListeners(control);
            Control.$ContextManagerStatic.dispose(control);
            control.dispose();
            control.element = null;
            Control.removeParent(control);
        }

        /**
         * @name removeParent
         * @memberof plat.Control
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * Splices a control from its parent's controls list. Sets the control's parent 
         * to null.
         * 
         * @param {plat.IControl} control The control whose parent will be removed.
         * 
         * @returns {void}
         */
        static removeParent(control: IControl): void {
            if (isNull(control)) {
                return;
            }

            var parent = control.parent;

            if (isNull(parent)) {
                return;
            }

            var controls = parent.controls || [],
                index = controls.indexOf(control);

            if (index !== -1) {
                controls.splice(index, 1);
            }

            control.parent = null;
        }

        /**
         * @name removeEventListeners
         * @memberof plat.Control
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * Removes all event listeners for a control with the given uid.
         * 
         * @param {plat.IControl} control The control having its event listeners removed.
         * 
         * @returns {void}
         */
        static removeEventListeners(control: IControl): void {
            if (isNull(control)) {
                return;
            }

            var removeListeners = Control.__eventListeners,
                uid = control.uid;

            var listeners = removeListeners[uid];
            if (isArray(listeners)) {
                var index = listeners.length;
                while (index-- > 0) {
                    listeners[index]();
                }

                deleteProperty(removeListeners, uid);
            }
        }

        /**
         * @name getInstance
         * @memberof plat.Control
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * Returns a new instance of {@link plat.Control|Control}.
         * 
         * @returns {plat.IControl} The newly instantiated control.
         */
        static getInstance(): IControl {
            return new Control();
        }

        /**
         * @name __addRemoveListener
         * @memberof plat.Control
         * @kind function
         * @access private
         * @static
         * 
         * @description
         * Adds a function to remove an event listener for the control specified 
         * by its uid.
         * 
         * @param {string} uid The uid of the control associated with the remove function.
         * @param {plat.IRemoveListener} listener The remove function to add.
         * 
         * @returns {void}
         */
        private static __addRemoveListener(uid: string, listener: IRemoveListener): void {
            var removeListeners = Control.__eventListeners;

            if (isArray(removeListeners[uid])) {
                removeListeners[uid].push(listener);
                return;
            }

            removeListeners[uid] = [listener];
        }

        /**
         * @name __spliceRemoveListener
         * @memberof plat.Control
         * @kind function
         * @access private
         * @static
         * 
         * @description
         * Removes a {@link plat.IRemoveListener|IRemoveListener} from a control's listeners.
         * 
         * @param {string} uid The uid of the control associated with the remove function.
         * @param {plat.IRemoveListener} listener The remove function to add.
         * 
         * @returns {void}
         */
        private static __spliceRemoveListener(uid: string, listener: IRemoveListener): void {
            var removeListeners = Control.__eventListeners,
                controlListeners = removeListeners[uid];

            if (isArray(controlListeners)) {
                var index = controlListeners.indexOf(listener);
                if (index === -1) {
                    return;
                }

                controlListeners.splice(index, 1);
            }
        }

        /**
         * @name __getControls
         * @memberof plat.Control
         * @kind function
         * @access private
         * @static
         * 
         * @description
         * Gets controls that have a specific key/value string pair.
         * 
         * 
         * @param {plat.IControl} control The at which to start searching for key/value pairs.
         * @param {string} key The key to search for on all the controls in the tree.
         * @param {string} value The expected value used to find similar controls.
         * 
         * @returns {Array<plat.IControl>} The controls matching the input key/value pair.
         */
        private static __getControls(control: IControl, key: string, value: string): Array<IControl> {
            var controls: Array<IControl> = [],
                root = Control.getRootControl(control),
                child: IControl;

            if (!isNull(root) && (<any>root)[key] === value) {
                controls.push(root);
            }

            var children = root.controls;

            if (isNull(children)) {
                return controls;
            }

            var queue: Array<IControl> = [];
            queue = queue.concat(children);

            while (queue.length > 0) {
                child = queue.shift();

                if ((<any>child)[key] === value) {
                    controls.push(child);
                }

                if (isNull((<ui.ITemplateControl>child).controls)) {
                    continue;
                }

                queue = queue.concat((<ui.ITemplateControl>child).controls);
            }

            return controls;
        }

        /**
         * @name uid
         * @memberof plat.Control
         * @kind property
         * @access public
         * @readonly
         * 
         * @type {string}
         * 
         * @description
         * A unique id, created during instantiation and found on every {@link plat.Control|Control}.
         */
        uid: string;

        /**
         * @name name
         * @memberof plat.Control
         * @kind property
         * @access public
         * @readonly
         * 
         * @type {string}
         * 
         * @description
         * The name of a {@link plat.Control|Control}.
         */
        name: string;

        /**
         * @name type
         * @memberof plat.Control
         * @kind property
         * @access public
         * @readonly
         * 
         * @type {string}
         * 
         * @description
         * The type of a {@link plat.Control|Control}.
         */
        type: string;

        /**
         * @name priority
         * @memberof plat.Control
         * @kind property
         * @access public
         * 
         * @type {number}
         * 
         * @description
         * Specifies the priority of the control. The purpose of 
         * this is so that controls like plat-bind can have a higher 
         * priority than plat-tap. The plat-bind will be initialized 
         * and loaded before plat-tap, meaning it has the first chance 
         * to respond to events.
         */
        priority = 0;

        /**
         * @name parent
         * @memberof plat.Control
         * @kind property
         * @access public
         * @readonly
         * 
         * @type {plat.ui.ITemplateControl}
         * 
         * @description
         * The parent control that created this control.
         */
        parent: ui.ITemplateControl;

        /**
         * @name element
         * @memberof plat.Control
         * @kind property
         * @access public
         * 
         * @type {HTMLElement}
         * 
         * @description
         * The HTMLElement that represents this {@link plat.Control|Control}. Should only be modified by controls that implement 
         * {plat.ui.ITemplateControl|ITemplateControl}. During initialize the control should populate this element with what it wishes
         * to render to the user. 
         * 
         * @remarks
         * When there is innerHTML in the element prior to instantiating the control:
         *     The element will include the innerHTML
         * When the control implements templateString or templateUrl:
         *     The serialized DOM will be auto-generated and included in the element. Any
         *     innerHTML will be stored in the innerTemplate property on the control.
         * After an {@link plat.IControl|IControl} is initialized its element will be compiled.
         */
        element: HTMLElement;

        /**
         * @name attributes
         * @memberof plat.Control
         * @kind property
         * @access public
         * 
         * @type {plat.ui.IAttributesInstance}
         * 
         * @description
         * The attributes object representing all the attributes for a {@link plat.Control|Control's} element. All attributes are 
         * converted from dash notation to camelCase.
         */
        attributes: ui.IAttributesInstance;

        /**
         * @name dom
         * @memberof plat.Control
         * @kind property
         * @access public
         * @readonly
         * 
         * @type {plat.ui.IDom}
         * 
         * @description
         * Contains DOM helper methods for manipulating this control's element.
         */
        dom: ui.IDom = acquire(__Dom);

        /**
         * @name constructor
         * @memberof plat.Control
         * @kind function
         * @access public
         * 
         * @description
         * The constructor for a control. Any injectables specified during control registration will be
         * passed into the constructor as arguments as long as the control is instantiated with its associated
         * injector.
         * 
         * @returns {plat.Control}
         */
        constructor() {
            var ContextManager: observable.IContextManagerStatic = Control.$ContextManagerStatic ||
                acquire(__ContextManagerStatic);
            ContextManager.defineGetter(this, 'uid', uniqueId('plat_'));
        }

        /**
         * @name initialize
         * @memberof plat.Control
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * The initialize event method for a control. In this method a control should initialize all the necessary 
         * variables. This method is typically only necessary for view controls. If a control does not implement 
         * {@link plat.ui.IBaseViewControl|IBaseViewControl} then it is not safe to access, observe, or modify 
         * the context property in this method. A view control should call services/set context in this method in 
         * order to fire the loaded event. No control will be loaded until the view control has specified a context.
         * 
         * @returns {void}
         */
        initialize() { }

        /**
         * @name loaded
         * @memberof plat.Control
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * The loaded event method for a control. This event is fired after a control has been loaded,
         * meaning all of its children have also been loaded and initial DOM has been created and populated. It is now 
         * safe for all controls to access, observe, and modify the context property.
         * 
         * @returns {void}
         */
        loaded() { }

        /**
         * @name getControlsByName
         * @memberof plat.Control
         * @kind function
         * @access public
         * 
         * @description
         * Retrieves all the controls with the specified name.
         * 
         * @param {string} name The string name with which to populate the returned controls array.
         * 
         * @returns {Array<plat.IControl>} The controls that match the input name.
         */
        getControlsByName(name: string): Array<IControl> {
            return Control.__getControls(this, 'name', name);
        }

        /**
         * @name getControlsByType
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Retrieves all the controls of the specified type.
         * 
         * @typeparam {plat.Control} T The type of control to be returned in an Array.
         * 
         * @param {string} type The type used to find controls (e.g. 'plat-foreach')
         * 
         * @returns {Array<T>} The controls matching the input type.
         */
        getControlsByType<T extends Control>(type: string): Array<T>;
        /**
         * @name getControlsByType
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Retrieves all the controls of the specified type.
         * 
         * @typeparam {plat.Control} T The type of control to be returned in an Array.
         * 
         * @param {new () => T} Constructor The constructor used to find controls.
         * 
         * @returns {Array<T>} The controls matching the input type.
         */
        getControlsByType<T extends Control>(Constructor: new () => T): Array<T>;
        getControlsByType(type: any) {
            if (isString(type)) {
                return Control.__getControls(this, 'type', type);
            }
            return Control.__getControls(this, 'constructor', type);
        }

        /**
         * @name addEventListener
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Adds an event listener of the specified type to the specified element. Removal of the 
         * event is handled automatically upon disposal.
         * 
         * @param {EventTarget} element The element to add the event listener to.
         * @param {string} type The type of event to listen to.
         * @param {plat.ui.IGestureListener} listener The listener to fire when the event occurs.
         * @param {boolean} useCapture? Whether to fire the event on the capture or the bubble phase 
         * of event propagation.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop listening to the event.
         */
        addEventListener(element: EventTarget, type: string, listener: ui.IGestureListener, useCapture?: boolean): IRemoveListener;
        /**
         * @name addEventListener
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Adds an event listener of the specified type to the specified element. Removal of the 
         * event is handled automatically upon disposal.
         * 
         * @param {EventTarget} element The element to add the event listener to.
         * @param {string}  type The type of event to listen to.
         * @param {EventListener} listener The listener to fire when the event occurs.
         * @param {boolean} useCapture? Whether to fire the event on the capture or the bubble phase 
         * of event propagation.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop listening to the event.
         */
        addEventListener(element: EventTarget, type: string, listener: EventListener, useCapture?: boolean): IRemoveListener;
        addEventListener(element: any, type: string, listener: ui.IGestureListener, useCapture?: boolean): IRemoveListener {
            if (!isFunction(listener)) {
                var Exception: IExceptionStatic = acquire(__ExceptionStatic);
                Exception.warn('"Control.addEventListener" must take a function as the third argument.', Exception.EVENT);
                return noop;
            }

            listener = listener.bind(this);
            var removeListener = this.dom.addEventListener(element, type, listener, useCapture),
                uid = this.uid;

            Control.__addRemoveListener(uid, removeListener);

            return () => {
                removeListener();
                Control.__spliceRemoveListener(uid, removeListener);
            };
        }

        /**
         * @name observe
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Allows a {@link plat.Control|Control} to observe any property on its context and receive updates when
         * the property is changed.
         * 
         * @typeparam {any} T The type of object to observe.
         * 
         * @param {any} context The immediate parent object containing the property.
         * @param {string} property The property identifier to watch for changes.
         * @param {(value: T, oldValue: T) => void} listener The method called when the property is changed. This method will have its 'this'
         * context set to the control instance.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the property.
         */
        observe<T>(context: any, property: string, listener: (value: T, oldValue: T) => void): IRemoveListener;
        /**
         * @name observe
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Allows a {@link plat.Control|Control} to observe any property on its context and receive updates when
         * the property is changed.
         * 
         * @typeparam {any} T The type of object to observe.
         * 
         * @param {any} context The immediate parent object containing the property.
         * @param {number} property The property identifier to watch for changes.
         * @param {(value: T, oldValue: T) => void} listener The method called when the property is changed. This method will have its 'this'
         * context set to the control instance.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the property.
         */
        observe<T>(context: any, property: number, listener: (value: T, oldValue: T) => void): IRemoveListener;
        observe(context: any, property: any, listener: (value: any, oldValue: any) => void): IRemoveListener {
            if (isNull(context) || !context.hasOwnProperty(property)) {
                return noop;
            }

            var control = isFunction((<ui.ITemplateControl>(<any>this)).getAbsoluteIdentifier) ? this : <IControl>this.parent;

            if (isNull(control) || !isFunction((<ui.ITemplateControl>(<any>control)).getAbsoluteIdentifier)) {
                return noop;
            }

            var absoluteIdentifier = (<ui.ITemplateControl>(<any>control)).getAbsoluteIdentifier(context);

            if (isNull(absoluteIdentifier)) {
                return noop;
            }

            var contextManager = Control.$ContextManagerStatic.getManager(Control.getRootControl(this));

            return contextManager.observe(absoluteIdentifier + '.' + property, {
                listener: listener.bind(this),
                uid: this.uid
            });
        }

        /**
         * @name observeArray
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Allows a {@link plat.Control|Control} to observe an array and receive updates when certain array-changing methods are called.
         * The methods watched are push, pop, shift, sort, splice, reverse, and unshift. This method does not watch
         * every item in the array.
         * 
         * @typeparam {any} T The type of the Array to observe.
         * 
         * @param {any} context The immediate parent object containing the array as a property.
         * @param {string} property The array property identifier to watch for changes.
         * @param {(ev: plat.observable.IArrayMethodInfo<T>) => void} listener The method called when an array-changing method is called. This method will have its 'this'
         * context set to the control instance.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the array.
         */
        observeArray<T>(context: any, property: string, listener: (ev: observable.IArrayMethodInfo<T>) => void): IRemoveListener;
        /**
         * @name observeArray
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Allows a {@link plat.Control|Control} to observe an array and receive updates when certain array-changing methods are called.
         * The methods watched are push, pop, shift, sort, splice, reverse, and unshift. This method does not watch
         * every item in the array.
         * 
         * @typeparam {any} T The type of the Array to observe.
         * 
         * @param {any} context The immediate parent object containing the array as a property.
         * @param {number} property The array property identifier to watch for changes.
         * @param {(ev: plat.observable.IArrayMethodInfo<T>) => void} listener The method called when an array-changing method is called. This method will have its 'this'
         * context set to the control instance.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the array.
         */
        observeArray<T>(context: any, property: number, listener: (ev: observable.IArrayMethodInfo<T>) => void): IRemoveListener;
        observeArray(context: any, property: any, listener: (ev: observable.IArrayMethodInfo<any>) => void): IRemoveListener {
            if (isNull(context) || !context.hasOwnProperty(property)) {
                return noop;
            }

            var array = context[property],
                callback = listener.bind(this);

            if (!isArray(array)) {
                return noop;
            }

            var control = isFunction((<ui.ITemplateControl>this).getAbsoluteIdentifier) ? this : <IControl>this.parent;

            if (isNull(control) || !isFunction((<ui.ITemplateControl>control).getAbsoluteIdentifier)) {
                return noop;
            }

            var absoluteIdentifier = (<ui.ITemplateControl>control).getAbsoluteIdentifier(context),
                ContextManager = Control.$ContextManagerStatic;

            if (isNull(absoluteIdentifier)) {
                if (property === 'context') {
                    absoluteIdentifier = (<ui.ITemplateControl>control).absoluteContextPath;
                } else {
                    return noop;
                }
            } else {
                absoluteIdentifier += '.' + property;
            }

            var contextManager = ContextManager.getManager(Control.getRootControl(this)),
                uid = this.uid,
                removeCallback = contextManager.observe(absoluteIdentifier, {
                    listener: (newValue: Array<any>, oldValue: Array<any>) => {
                        removeListener();
                        removeListener = contextManager.observeArray(uid, callback, absoluteIdentifier, newValue, oldValue);
                    },
                    uid: uid
                }),
                removeListener = contextManager.observeArray(uid, callback, absoluteIdentifier, array, null);

            // need to call callback if 
            return () => {
                ContextManager.removeArrayListeners(absoluteIdentifier, uid);
                removeListener();
                removeCallback();
            };
        }

        /**
         * @name observeExpression
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Parses an expression string and observes any associated identifiers. When an identifier
         * value changes, the listener will be called.
         * 
         * @param {string} expression The expression string to watch for changes.
         * @param {(value: any, oldValue: any) => void} listener The listener to call when the expression identifer values change.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the expression.
         */
        observeExpression(expression: string, listener: (value: any, oldValue: any) => void): IRemoveListener;
        /**
         * @name observeExpression
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Using a {@link plat.expressions.IParsedExpression|IParsedExpression} observes any associated identifiers. When an identifier
         * value changes, the listener will be called.
         * 
         * @param {plat.expressions.IParsedExpression} expression The expression string to watch for changes.
         * @param {(value: any, oldValue: any) => void} listener The listener to call when the expression identifer values change.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the expression.
         */
        observeExpression(expression: expressions.IParsedExpression, listener: (value: any, oldValue: any) => void): IRemoveListener;
        observeExpression(expression: any, listener: (value: any, oldValue: any) => void): IRemoveListener {
            if (isNull(expression)) {
                return noop;
            } else if (!(isString(expression) || isFunction(expression.evaluate))) {
                return noop;
            }

            var parsedExpression: expressions.IParsedExpression = isString(expression) ? Control.$Parser.parse(expression) : expression,
                aliases = parsedExpression.aliases,
                control: ui.TemplateControl = !isNull((<ui.TemplateControl>(<any>this)).resources) ?
                <ui.TemplateControl>(<any>this) :
                <ui.TemplateControl>this.parent,
                alias: string,
                length = aliases.length,
                resources: IObject<observable.IContextManager> = {},
                ContextManager = Control.$ContextManagerStatic,
                getManager = ContextManager.getManager,
                TemplateControl = ui.TemplateControl,
                findResource = TemplateControl.findResource,
                evaluateExpression = TemplateControl.evaluateExpression,
                i: number;

            if (isNull(control) || !isString(control.absoluteContextPath)) {
                return noop;
            }

            for (i = 0; i < length; ++i) {
                alias = aliases[i];

                var resourceObj = findResource(control, alias);
                if (!isNull(resourceObj) && resourceObj.resource.type === 'observable') {
                    resources[alias] = getManager(resourceObj.control);
                }
            }

            var identifiers = parsedExpression.identifiers,
                contextManager = getManager(Control.getRootControl(control)),
                identifier: string,
                split: Array<string> = [],
                absolutePath = control.absoluteContextPath + '.',
                managers: IObject<observable.IContextManager> = {};

            length = identifiers.length;

            for (i = 0; i < length; ++i) {
                identifier = identifiers[i];
                split = identifier.split('.');

                if (identifier.indexOf('this') === 0) {
                    identifier = identifier.slice(5);
                } else if (identifier[0] === '@') {
                    alias = split[0].substr(1);
                    identifier = identifier.replace('@' + alias, 'resources.' + alias + '.value');

                    if (!isNull(resources[alias])) {
                        managers[identifier] = resources[alias];
                    }

                    continue;
                }

                managers[absolutePath + identifier] = contextManager;
            }

            identifiers = Object.keys(managers);
            length = identifiers.length;

            var oldValue = evaluateExpression(parsedExpression, control),
                listeners: Array<IRemoveListener> = [],
                uid = this.uid;

            for (i = 0; i < length; ++i) {
                identifier = identifiers[i];

                listeners.push(managers[identifier].observe(identifier, {
                    uid: uid,
                    listener: () => {
                        var value = evaluateExpression(parsedExpression, control);
                        listener.call(this, value, oldValue);
                        oldValue = value;
                    }
                }));
            }

            return () => {
                var length = listeners.length;

                for (var i = 0; i < length; ++i) {
                    listeners[i]();
                }
            };
        }

        /**
         * @name evaluateExpression
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Evaluates an expression string, using the control.parent.context.
         * 
         * @param {string} expression The expression string to evaluate.
         * @param {any} aliases Optional alias values to parse with the expression
         * 
         * @returns {any} The evaluated expression
         */
        evaluateExpression(expression: string, aliases?: any): any;
        /**
         * @name evaluateExpression
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Evaluates an {@link plat.expressions.IParsedExpression|IParsedExpression} using the control.parent.context.
         * 
         * @param {string} expression The expression string to evaluate.
         * @param {any} aliases Optional alias values to parse with the expression
         * 
         * @returns {any} The evaluated expression
         */
        evaluateExpression(expression: expressions.IParsedExpression, aliases?: any): any;
        evaluateExpression(expression: any, aliases?: any): any {
            var TemplateControl = ui.TemplateControl;
            return TemplateControl.evaluateExpression(expression, this.parent, aliases);
        }

        /**
         * @name dispatchEvent
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Creates a new {@link plat.events.DispatchEvent|DispatchEvent} and propagates it to controls based on the 
         * provided direction mechanism. Controls in the propagation chain that registered
         * the event using the control.on() method will receive the event. Propagation will
         * always start with the sender, so the sender can both produce and consume the same
         * event.
         * 
         * @param {string} name The name of the event to send, cooincides with the name used in the
         * control.on() method.
         * @param {string} direction='up' Equivalent to {@link plat.events.EventManager.UP|EventManager.UP}
         * @param {Array<any>} ...args Any number of arguments to send to all the listeners.
         * 
         * @returns {void}
         */
        dispatchEvent(name: string, direction?: 'up', ...args: any[]): void;
        /**
         * @name dispatchEvent
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Creates a new {@link plat.events.DispatchEvent|DispatchEvent} and propagates it to controls based on the 
         * provided direction mechanism. Controls in the propagation chain that registered
         * the event using the control.on() method will receive the event. Propagation will
         * always start with the sender, so the sender can both produce and consume the same
         * event.
         * 
         * @param {string} name The name of the event to send, cooincides with the name used in the
         * control.on() method.
         * @param {string} direction='down' Equivalent to {@link plat.events.EventManager.DOWN|EventManager.DOWN}
         * @param {Array<any>} ...args Any number of arguments to send to all the listeners.
         * 
         * @returns {void}
         */
        dispatchEvent(name: string, direction?: 'down', ...args: any[]): void;
        /**
         * @name dispatchEvent
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 2
         * 
         * @description
         * Creates a new {@link plat.events.DispatchEvent|DispatchEvent} and propagates it to controls based on the 
         * provided direction mechanism. Controls in the propagation chain that registered
         * the event using the control.on() method will receive the event. Propagation will
         * always start with the sender, so the sender can both produce and consume the same
         * event.
         * 
         * @param {string} name The name of the event to send, cooincides with the name used in the
         * control.on() method.
         * @param {string} direction='direct' Equivalent to {@link plat.events.EventManager.DIRECT|EventManager.DIRECT}
         * @param {Array<any>} ...args Any number of arguments to send to all the listeners.
         * 
         * @returns {void}
         */
        dispatchEvent(name: string, direction?: 'direct', ...args: any[]): void;
        /**
         * @name dispatchEvent
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 3
         * 
         * @description
         * Creates a new {@link plat.events.DispatchEvent|DispatchEvent} and propagates it to controls based on the 
         * provided direction mechanism. Controls in the propagation chain that registered
         * the event using the control.on() method will receive the event. Propagation will
         * always start with the sender, so the sender can both produce and consume the same
         * event.
         * 
         * @param {string} name The name of the event to send, cooincides with the name used in the
         * control.on() method.
         * @param {string} direction The direction in which to send the event.
         * @param {Array<any>} ...args Any number of arguments to send to all the listeners.
         * 
         * @returns {void}
         */
        dispatchEvent(name: string, direction?: string, ...args: any[]): void;
        dispatchEvent(name: string, direction?: string, ...args: any[]) {
            var manager = Control.$EventManagerStatic;

            if (!manager.hasDirection(direction)) {
                if (!isUndefined(direction)) {
                    args.unshift(direction);
                }
                direction = manager.UP;
            }
            var sender: any = this;

            if (!isNull(sender.templateControl)) {
                sender = sender.templateControl;
            }

            manager.dispatch(name, sender, direction, args);
        }

        /**
         * @name on
         * @memberof plat.Control
         * @kind function
         * @access public
         * 
         * @description
         * Registers a listener for a {@link plat.events.DispatchEvent|DispatchEvent}. The listener will be called when a {@link plat.events.DispatchEvent|DispatchEvent} is 
         * propagating over the control. Any number of listeners can exist for a single event name.
         * 
         * @param {string} name The name of the event, cooinciding with the {@link plat.events.DispatchEvent|DispatchEvent} name.
         * @param {(ev: plat.events.IDispatchEventInstance, ...args: Array<any>) => void} listener The method called when the {@link plat.events.DispatchEvent|DispatchEvent} is fired.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop listening for this event.
         */
        on(name: string, listener: (ev: events.IDispatchEventInstance, ...args: any[]) => void): IRemoveListener {
            var manager = Control.$EventManagerStatic;
            return manager.on(this.uid, name, listener, this);
        }

        /**
         * @name dispose
         * @memberof plat.Control
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * The dispose event is called when a control is being removed from memory. A control should release 
         * all of the memory it is using, including DOM event and property listeners.
         * 
         * @returns {void}
         */
        dispose(): void { }
    }

    /**
     * The Type for referencing the '$ControlFactory' injectable as a dependency.
     */
    export function IControlFactory(
        $Parser?: expressions.IParser,
        $ContextManagerStatic?: observable.IContextManagerStatic,
        $EventManagerStatic?: events.IEventManagerStatic): IControlFactory {
        Control.$Parser = $Parser;
        Control.$ContextManagerStatic = $ContextManagerStatic;
        Control.$EventManagerStatic = $EventManagerStatic;
        return Control;
    }

    register.injectable(__ControlFactory, IControlFactory, [
        __Parser,
        __ContextManagerStatic,
        __EventManagerStatic
    ], __FACTORY);

    /**
     * @name IControlFactory
     * @memberof plat
     * @kind interface
     * 
     * @description
     * Creates and manages instances of {@link plat.IControl|IControl}.
     */
    export interface IControlFactory {
        /**
         * @name getRootControl
         * @memberof plat.IControlFactory
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * Finds the ancestor control for the given control that contains the root 
         * context.
         * 
         * @param {plat.IControl} control The control with which to find the root.
         * 
         * @returns {plat.ui.ITemplateControl} The root control.
         */
        getRootControl(control: IControl): ui.ITemplateControl;

        /**
         * @name load
         * @memberof plat.IControlFactory
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * Given a control, calls the loaded method for the control if it exists.
         * 
         * @param {plat.IControl} control The control to load.
         * 
         * @returns {void}
         */
        load(control: IControl): void;

        /**
         * @name dispose
         * @memberof plat.IControlFactory
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * Disposes all the necessary memory for a control. Uses specific dispose 
         * methods related to a control's constructor if necessary.
         * 
         * @param {plat.IControl} control The {@link plat.Control|Control} to dispose.
         * 
         * @returns {void}
         */
        dispose(control: IControl): void;

        /**
         * @name removeParent
         * @memberof plat.IControlFactory
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * Splices a control from its parent's controls list. Sets the control's parent 
         * to null.
         * 
         * @param {plat.IControl} control The control whose parent will be removed.
         * 
         * @returns {void}
         */
        removeParent(control: IControl): void;

        /**
         * @name removeEventListeners
         * @memberof plat.IControlFactory
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * Removes all event listeners for a control with the given uid.
         * 
         * @param {plat.IControl} control The control having its event listeners removed.
         * 
         * @returns {void}
         */
        removeEventListeners(control: IControl): void;

        /**
         * @name getInstance
         * @memberof plat.IControlFactory
         * @kind function
         * @access public
         * @static
         * 
         * @description
         * Returns a new instance of {@link plat.Control|Control}.
         * 
         * @returns {plat.IControl} The newly instantiated control.
         */
        getInstance(): IControl;
    }

    /**
     * @name IControl
     * @memberof plat
     * @kind interface
     * 
     * @description
     * Used for facilitating data and DOM manipulation. Contains lifecycle events 
     * as well as properties for communicating with other controls. This is the base
     * class for all types of controls.
     */
    export interface IControl {
        /**
         * @name uid
         * @memberof plat.IControl
         * @kind property
         * @access public
         * @readonly
         * 
         * @type {string}
         * 
         * @description
         * A unique id, created during instantiation and found on every {@link plat.Control|Control}.
         */
        uid: string;

        /**
         * @name name
         * @memberof plat.IControl
         * @kind property
         * @access public
         * @readonly
         * 
         * @type {string}
         * 
         * @description
         * The name of a {@link plat.Control|Control}.
         */
        name?: string;

        /**
         * @name type
         * @memberof plat.IControl
         * @kind property
         * @access public
         * @readonly
         * 
         * @type {string}
         * 
         * @description
         * The type of a {@link plat.Control|Control}.
         */
        type?: string;

        /**
         * @name priority
         * @memberof plat.IControl
         * @kind property
         * @access public
         * 
         * @type {number}
         * 
         * @description
         * Specifies the priority of the control. The purpose of 
         * this is so that controls like plat-bind can have a higher 
         * priority than plat-tap. The plat-bind will be initialized 
         * and loaded before plat-tap, meaning it has the first chance 
         * to respond to events.
         */
        priority?: number;

        /**
         * @name parent
         * @memberof plat.IControl
         * @kind property
         * @access public
         * @readonly
         * 
         * @type {plat.ui.ITemplateControl}
         * 
         * @description
         * The parent control that created this control.
         */
        parent?: ui.ITemplateControl;

        /**
         * @name element
         * @memberof plat.IControl
         * @kind property
         * @access public
         * 
         * @type {HTMLElement}
         * 
         * @description
         * The HTMLElement that represents this {@link plat.Control|Control}. Should only be modified by controls that implement 
         * {plat.ui.ITemplateControl|ITemplateControl}. During initialize the control should populate this element with what it wishes
         * to render to the user. 
         * 
         * @remarks
         * When there is innerHTML in the element prior to instantiating the control:
         *     The element will include the innerHTML
         * When the control implements templateString or templateUrl:
         *     The serialized DOM will be auto-generated and included in the element. Any
         *     innerHTML will be stored in the innerTemplate property on the control.
         * After an {@link plat.IControl|IControl} is initialized its element will be compiled.
         */
        element?: HTMLElement;

        /**
         * @name attributes
         * @memberof plat.IControl
         * @kind property
         * @access public
         * 
         * @type {plat.ui.IAttributesInstance}
         * 
         * @description
         * The attributes object representing all the attributes for a {@link plat.Control|Control's} element. All attributes are 
         * converted from dash notation to camelCase.
         */
        attributes?: ui.IAttributesInstance;

        /**
         * @name dom
         * @memberof plat.IControl
         * @kind property
         * @access public
         * @readonly
         * 
         * @type {plat.ui.IDom}
         * 
         * @description
         * Contains DOM helper methods for manipulating this control's element.
         */
        dom: ui.IDom;

        /**
         * @name initialize
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * The initialize event method for a control. In this method a control should initialize all the necessary 
         * variables. This method is typically only necessary for view controls. If a control does not implement 
         * {@link plat.ui.IBaseViewControl|IBaseViewControl} then it is not safe to access, observe, or modify 
         * the context property in this method. A view control should call services/set context in this method in 
         * order to fire the loaded event. No control will be loaded until the view control has specified a context.
         * 
         * @returns {void}
         */
        initialize? (): void;

        /**
         * @name loaded
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * The loaded event method for a control. This event is fired after a control has been loaded,
         * meaning all of its children have also been loaded and initial DOM has been created and populated. It is now 
         * safe for all controls to access, observe, and modify the context property.
         * 
         * @returns {void}
         */
        loaded? (): void;

        /**
         * @name getControlsByName
         * @memberof plat.Control
         * @kind function
         * @access public
         * 
         * @description
         * Retrieves all the controls with the specified name.
         * 
         * @param {string} name The string name with which to populate the returned controls array.
         * 
         * @returns {Array<plat.IControl>} The controls that match the input name.
         */
        getControlsByName? (name: string): Array<IControl>;

        /**
         * @name getControlsByType
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Retrieves all the controls of the specified type.
         * 
         * @typeparam {plat.Control} T The type of control to be returned in an Array.
         * 
         * @param {string} type The type used to find controls (e.g. 'plat-foreach')
         * 
         * @returns {Array<T>} The controls matching the input type.
         */
        getControlsByType? <T extends IControl>(type: string): Array<T>;
        /**
         * @name getControlsByType
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Retrieves all the controls of the specified type.
         * 
         * @typeparam {plat.Control} T The type of control to be returned in an Array.
         * 
         * @param {new () => T} Constructor The constructor used to find controls.
         * 
         * @returns {Array<T>} The controls matching the input type.
         */
        getControlsByType? <T extends IControl>(Constructor: new () => T): Array<T>;

        /**
         * @name addEventListener
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Adds an event listener of the specified type to the specified element. Removal of the 
         * event is handled automatically upon disposal.
         * 
         * @param {EventTarget} element The element to add the event listener to.
         * @param {string} type The type of event to listen to.
         * @param {plat.ui.IGestureListener} listener The listener to fire when the event occurs.
         * @param {boolean} useCapture? Whether to fire the event on the capture or the bubble phase 
         * of event propagation.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop listening to the event.
         */
        addEventListener? (element: EventTarget, type: string, listener: ui.IGestureListener, useCapture?: boolean): IRemoveListener;
        /**
         * @name addEventListener
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Adds an event listener of the specified type to the specified element. Removal of the 
         * event is handled automatically upon disposal.
         * 
         * @param {EventTarget} element The element to add the event listener to.
         * @param {string}  type The type of event to listen to.
         * @param {EventListener} listener The listener to fire when the event occurs.
         * @param {boolean} useCapture? Whether to fire the event on the capture or the bubble phase 
         * of event propagation.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop listening to the event.
         */
        addEventListener? (element: EventTarget, type: string, listener: EventListener, useCapture?: boolean): IRemoveListener;

        /**
         * @name observe
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Allows a {@link plat.Control|Control} to observe any property on its context and receive updates when
         * the property is changed.
         * 
         * @typeparam {any} T The type of object to observe.
         * 
         * @param {any} context The immediate parent object containing the property.
         * @param {string} property The property identifier to watch for changes.
         * @param {(value: T, oldValue: T) => void} listener The method called when the property is changed. This method will have its 'this'
         * context set to the control instance.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the property.
         */
        observe? <T>(context: any, property: string, listener: (value: T, oldValue: T) => void): IRemoveListener;
        /**
         * @name observe
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Allows a {@link plat.Control|Control} to observe any property on its context and receive updates when
         * the property is changed.
         * 
         * @typeparam {any} T The type of object to observe.
         * 
         * @param {any} context The immediate parent object containing the property.
         * @param {number} property The property identifier to watch for changes.
         * @param {(value: T, oldValue: T) => void} listener The method called when the property is changed. This method will have its 'this'
         * context set to the control instance.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the property.
         */
        observe? <T>(context: any, property: number, listener: (value: T, oldValue: T) => void): IRemoveListener;

        /**
         * @name observeArray
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Allows a {@link plat.Control|Control} to observe an array and receive updates when certain array-changing methods are called.
         * The methods watched are push, pop, shift, sort, splice, reverse, and unshift. This method does not watch
         * every item in the array.
         * 
         * @typeparam {any} T The type of the Array to observe.
         * 
         * @param {any} context The immediate parent object containing the array as a property.
         * @param {string} property The array property identifier to watch for changes.
         * @param {(ev: plat.observable.IArrayMethodInfo<T>) => void} listener The method called when an array-changing method is called. This method will have its 'this'
         * context set to the control instance.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the array.
         */
        observeArray? <T>(context: any, property: string, listener: (ev: observable.IArrayMethodInfo<T>) => void): IRemoveListener;
        /**
         * @name observeArray
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Allows a {@link plat.Control|Control} to observe an array and receive updates when certain array-changing methods are called.
         * The methods watched are push, pop, shift, sort, splice, reverse, and unshift. This method does not watch
         * every item in the array.
         * 
         * @typeparam {any} T The type of the Array to observe.
         * 
         * @param {any} context The immediate parent object containing the array as a property.
         * @param {number} property The array property identifier to watch for changes.
         * @param {(ev: plat.observable.IArrayMethodInfo<T>) => void} listener The method called when an array-changing method is called. This method will have its 'this'
         * context set to the control instance.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the array.
         */
        observeArray? <T>(context: any, property: number, listener: (ev: observable.IArrayMethodInfo<T>) => void): IRemoveListener;

        /**
         * @name observeExpression
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Parses an expression string and observes any associated identifiers. When an identifier
         * value changes, the listener will be called.
         * 
         * @param {string} expression The expression string to watch for changes.
         * @param {(value: any, oldValue: any) => void} listener The listener to call when the expression identifer values change.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the expression.
         */
        observeExpression? (expression: string, listener: (value: any, oldValue: any) => void): IRemoveListener;
        /**
         * @name observeExpression
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Using a {@link plat.expressions.IParsedExpression|IParsedExpression} observes any associated identifiers. When an identifier
         * value changes, the listener will be called.
         * 
         * @param {plat.expressions.IParsedExpression} expression The expression string to watch for changes.
         * @param {(value: any, oldValue: any) => void} listener The listener to call when the expression identifer values change.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the expression.
         */
        observeExpression? (expression: expressions.IParsedExpression, listener: (value: any, oldValue: any) => void): IRemoveListener;

        /**
         * @name evaluateExpression
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Evaluates an expression string, using the control.parent.context.
         * 
         * @param {string} expression The expression string to evaluate.
         * @param {any} aliases Optional alias values to parse with the expression
         * 
         * @returns {any} The evaluated expression
         */
        evaluateExpression? (expression: string, aliases?: any): any;
        /**
         * @name evaluateExpression
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Evaluates an {@link plat.expressions.IParsedExpression|IParsedExpression} using the control.parent.context.
         * 
         * @param {string} expression The expression string to evaluate.
         * @param {any} aliases Optional alias values to parse with the expression
         * 
         * @returns {any} The evaluated expression
         */
        evaluateExpression? (expression: expressions.IParsedExpression, aliases?: any): any;

        /**
         * @name dispatchEvent
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Creates a new {@link plat.events.DispatchEvent|DispatchEvent} and propagates it to controls based on the 
         * provided direction mechanism. Controls in the propagation chain that registered
         * the event using the control.on() method will receive the event. Propagation will
         * always start with the sender, so the sender can both produce and consume the same
         * event.
         * 
         * @param {string} name The name of the event to send, cooincides with the name used in the
         * control.on() method.
         * @param {string} direction='up' Equivalent to {@link plat.events.EventManager.UP|EventManager.UP}
         * @param {Array<any>} ...args Any number of arguments to send to all the listeners.
         * 
         * @returns {void}
         */
        dispatchEvent? (name: string, direction?: 'up', ...args: any[]): void;
        /**
         * @name dispatchEvent
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Creates a new {@link plat.events.DispatchEvent|DispatchEvent} and propagates it to controls based on the 
         * provided direction mechanism. Controls in the propagation chain that registered
         * the event using the control.on() method will receive the event. Propagation will
         * always start with the sender, so the sender can both produce and consume the same
         * event.
         * 
         * @param {string} name The name of the event to send, cooincides with the name used in the
         * control.on() method.
         * @param {string} direction='down' Equivalent to {@link plat.events.EventManager.DOWN|EventManager.DOWN}
         * @param {Array<any>} ...args Any number of arguments to send to all the listeners.
         * 
         * @returns {void}
         */
        dispatchEvent? (name: string, direction?: 'down', ...args: any[]): void;
        /**
         * @name dispatchEvent
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 2
         * 
         * @description
         * Creates a new {@link plat.events.DispatchEvent|DispatchEvent} and propagates it to controls based on the 
         * provided direction mechanism. Controls in the propagation chain that registered
         * the event using the control.on() method will receive the event. Propagation will
         * always start with the sender, so the sender can both produce and consume the same
         * event.
         * 
         * @param {string} name The name of the event to send, cooincides with the name used in the
         * control.on() method.
         * @param {string} direction='direct' Equivalent to {@link plat.events.EventManager.DIRECT|EventManager.DIRECT}
         * @param {Array<any>} ...args Any number of arguments to send to all the listeners.
         * 
         * @returns {void}
         */
        dispatchEvent? (name: string, direction?: 'direct', ...args: any[]): void;
        /**
         * @name dispatchEvent
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @variation 3
         * 
         * @description
         * Creates a new {@link plat.events.DispatchEvent|DispatchEvent} and propagates it to controls based on the 
         * provided direction mechanism. Controls in the propagation chain that registered
         * the event using the control.on() method will receive the event. Propagation will
         * always start with the sender, so the sender can both produce and consume the same
         * event.
         * 
         * @param {string} name The name of the event to send, cooincides with the name used in the
         * control.on() method.
         * @param {string} direction The direction in which to send the event.
         * @param {Array<any>} ...args Any number of arguments to send to all the listeners.
         * 
         * @returns {void}
         */
        dispatchEvent? (name: string, direction?: string, ...args: any[]): void;

        /**
         * @name on
         * @memberof plat.IControl
         * @kind function
         * @access public
         * 
         * @description
         * Registers a listener for a {@link plat.events.DispatchEvent|DispatchEvent}. The listener will be called when a {@link plat.events.DispatchEvent|DispatchEvent} is 
         * propagating over the control. Any number of listeners can exist for a single event name.
         * 
         * @param {string} name The name of the event, cooinciding with the {@link plat.events.DispatchEvent|DispatchEvent} name.
         * @param {(ev: plat.events.IDispatchEventInstance, ...args: Array<any>) => void} listener The method called when the {@link plat.events.DispatchEvent|DispatchEvent} is fired.
         * 
         * @returns {plat.IRemoveListener} A function to call in order to stop listening for this event.
         */
        on? (name: string, listener: (ev: events.IDispatchEventInstance, ...args: any[]) => void): IRemoveListener;

        /**
         * @name dispose
         * @memberof plat.IControl
         * @kind function
         * @access public
         * @virtual
         * 
         * @description
         * The dispose event is called when a control is being removed from memory. A control should release 
         * all of the memory it is using, including DOM event and property listeners.
         * 
         * @returns {void}
         */
        dispose? (): void;
    }
    /**
     * @name observable
     * @memberof plat
     * @kind namespace
     * 
     * @description
     * Holds all observable interfaces and classes.
     */
    export module observable {
        /**
         * @name IObservableProperty
         * @memberof plat.observable
         * @access public
         * @kind interface
         * 
         * @description
         * Defines the object added to a template control when its element 
         * has an attribute control that extends {@link plat.controls.ObservableAttributeControl|ObservableAttributeControl}.
         * 
         * This will contain the value of the expression as well as a way to observe the 
         * attribute value for changes.
         * 
         * @remarks
         * {@link plat.controls.Option|plat-options} is a control that implements this interface, and puts an 'options' 
         * property on its associated template control.
         * 
         * The generic type corresponds to the type of object created when the attribute 
         * expression is evaluated.
         * 
         * @typeparam {any} T The type of the value obtained from the attribute's expression.
         */
        export interface IObservableProperty<T> {
            /**
             * @name value
             * @memberof plat.observable.IObservableProperty
             * @access public
             * @kind property
             * 
             * @type {T}
             * 
             * @description
             * The value obtained from evaluating the attribute's expression.
             */
            value: T;

            /**
             * @name observe
             * @memberof plat.observable.IObservableProperty
             * @access public
             * @kind function
             * 
             * @description
             * A method for observing the attribute for changes.
             * 
             * @param {(newValue: T, oldValue: T) => void} listener The listener callback which will be pre-bound to the 
             * template control.
             * 
             * @returns {plat.IRemoveListener} A method for removing the listener.
             */
            observe(listener: (newValue: T, oldValue: T) => void): IRemoveListener;
        }
    }

    /**
     * @name controls
     * @memberof plat
     * @kind namespace
     * 
     * @description
     * Holds all attribute controls
     */
    export module controls {
        /**
         * @name AttributeControl
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.Control}
         * @implements {plat.controls.IAttributeControl}
         * 
         * @description
         * A type of control that can be used as an attribute but will 
         * not be used to add, remove, or modify DOM.
         */
        export class AttributeControl extends Control implements IAttributeControl {
            /**
             * @name dispose
             * @memberof plat.controls.AttributeControl
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Method for disposing an attribute control. Removes any 
             * necessary objects from the control.
             * 
             * @param {plat.IAttributeControl} control The {@link plat.controls.AttributeControl|AttributeControl} to dispose.
             * 
             * @returns {void}
             */
            static dispose(control: IAttributeControl): void {
                deleteProperty(control, 'templateControl');

                Control.dispose(control);
            }

            /**
             * @name getInstance
             * @memberof plat.controls.AttributeControl
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Returns a new instance of {@link plat.controls.AttributeControl|AttributeControl}.
             * 
             * @returns {plat.IAttributeControl}
             */
            static getInstance(): IAttributeControl {
                return new AttributeControl();
            }

            /**
             * @name templateControl
             * @memberof plat.controls.AttributeControl
             * @kind property
             * @access public
             * 
             * @type {plat.ui.ITemplateControl}
             * 
             * @description
             * Specifies the {@link plat.ui.ITemplateControl|ITemplateControl} associated with this
             * control's element. Can be null if no {@link plat.ui.ITemplateControl|ITemplateControl}
             * exists.
             */
            templateControl: ui.ITemplateControl = null;
        }

        /**
         * The Type for referencing the '$AttributeControlFactory' injectable as a dependency.
         */
        export function IAttributeControlFactory(): IAttributeControlFactory {
            return AttributeControl;
        }

        register.injectable(__AttributeControlFactory, IAttributeControlFactory, null, __FACTORY);

        /**
         * @name IAttributeControlFactory
         * @memberof plat.controls
         * @kind interface
         * 
         * @description
         * Creates and manages instances of {@link plat.controls.IAttributeControl|IAttributeControl}.
         */
        export interface IAttributeControlFactory {
            /**
             * @name dispose
             * @memberof plat.controls.IAttributeControlFactory
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Method for disposing an attribute control. Removes any 
             * necessary objects from the control.
             * 
             * @param {plat.IAttributeControl} control The {@link plat.controls.AttributeControl|AttributeControl} to dispose.
             * 
             * @returns {void}
             */
            dispose(control: IAttributeControl): void;

            /**
             * @name getInstance
             * @memberof plat.controls.IAttributeControlFactory
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Returns a new instance of {@link plat.controls.AttributeControl|AttributeControl}.
             * 
             * @returns {plat.IAttributeControl}
             */
            getInstance(): IAttributeControl;
        }

        /**
         * @name IAttributeControl
         * @memberof plat.controls
         * @kind interface
         * 
         * @extends {plat.IControl}
         * 
         * @description
         * An object describing a type of control that can be used as an attribute but will 
         * not be used to add, remove, or modify DOM.
         */
        export interface IAttributeControl extends IControl {
            /**
             * @name templateControl
             * @memberof plat.controls.IAttributeControl
             * @kind property
             * @access public
             * 
             * @type {plat.ui.ITemplateControl}
             * 
             * @description
             * Specifies the {@link plat.ui.ITemplateControl|ITemplateControl} associated with this
             * control's element. Can be null if no {@link plat.ui.ITemplateControl|ITemplateControl}
             * exists.
             */
            templateControl?: ui.ITemplateControl;
        }

        /**
         * @name Bind
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.AttributeControl}
         * 
         * @description
         * Facilitates two-way databinding for HTMLInputElements, HTMLSelectElements, and HTMLTextAreaElements.
         */
        export class Bind extends AttributeControl {
            /**
             * @name $Parser
             * @memberof plat.controls.Bind
             * @kind property
             * @access public
             * @static
             * 
             * @type {plat.expressions.IParser}
             * 
             * @description
             * Reference to the {@link plat.expressions.IParser|IParser} injectable.
             */
            $Parser: expressions.IParser = acquire(__Parser);

            /**
             * @name $ContextManagerStatic
             * @memberof plat.controls.Bind
             * @kind property
             * @access public
             * @static
             * 
             * @type {plat.observable.IContextManagerStatic}
             * 
             * @description
             * Reference to the {@link plat.observable.IContextManagerStatic|IContextManagerStatic} injectable.
             */
            $ContextManagerStatic: observable.IContextManagerStatic = acquire(__ContextManagerStatic);

            /**
             * @name $document
             * @memberof plat.controls.Bind
             * @kind property
             * @access public
             * @static
             * 
             * @type {Document}
             * 
             * @description
             * Reference to the Document injectable.
             */
            $document: Document = acquire(__Document);

            /**
             * @name priority
             * @memberof plat.controls.Bind
             * @kind property
             * @access public
             * 
             * @type {number}
             * 
             * @description
             * The priority of Bind is set high to take precede 
             * other controls that may be listening to the same 
             * event.
             */
            priority: number = 100;

            /**
             * @name _addEventType
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * The function used to add the proper event based on the input type.
             * 
             * @returns {void}
             */
            _addEventType: () => void;

            /**
             * @name _getter
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * The function used to get the bound value.
             * 
             * @returns {any} The bound value.
             */
            _getter: () => any;

            /**
             * @name _setter
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * The function used to set the bound value.
             * 
             * @returns {void}
             */
            _setter: (newValue: any, oldValue?: any, firstTime?: boolean) => void;

            /**
             * @name _expression
             * @memberof plat.controls.Bind
             * @kind property
             * @access protected
             * 
             * @type {plat.expressions.IParsedExpression}
             * 
             * @description
             * The expression to evaluate as the bound value.
             */
            _expression: expressions.IParsedExpression;

            /**
             * @name _contextExpression
             * @memberof plat.controls.Bind
             * @kind property
             * @access protected
             * 
             * @type {plat.expressions.IParsedExpression}
             * 
             * @description
             * The IParsedExpression used to evaluate the context 
             * of the bound property.
             */
            _contextExpression: expressions.IParsedExpression;

            /**
             * @name _property
             * @memberof plat.controls.Bind
             * @kind property
             * @access protected
             * 
             * @type {string}
             * 
             * @description
             * The bound property name.
             */
            _property: string;

            /**
             * @name __fileSupported
             * @memberof plat.controls.Bind
             * @kind property
             * @access private
             * 
             * @type {boolean}
             * 
             * @description
             * Whether or not the File API is supported.
             */
            private __fileSupported = (<ICompat>acquire(__Compat)).fileSupported;

            /**
             * @name __fileNameRegex
             * @memberof plat.controls.Bind
             * @kind property
             * @access private
             * 
             * @type {RegExp}
             * 
             * @description
             * Used to grab a filename from input[type="file"].
             */
            private __fileNameRegex = (<expressions.IRegex>acquire(__Regex)).fileNameRegex;

            /**
             * @name __isSelf
             * @memberof plat.controls.Bind
             * @kind property
             * @access private
             * 
             * @type {boolean}
             * 
             * @description
             * Used to denote that a property change happened from within this control.
             */
            private __isSelf = false;

            /**
             * @name initialize
             * @memberof plat.controls.Bind
             * @kind function
             * @access public
             * 
             * @description
             * Determines the type of Element being bound to 
             * and sets the necessary handlers.
             * 
             * @returns {void}
             */
            initialize(): void {
                this._determineType();
            }

            /**
             * @name loaded
             * @memberof plat.controls.Bind
             * @kind function
             * @access public
             * 
             * @description
             * Parses and watches the expression being bound to.
             * 
             * @returns {void}
             */
            loaded(): void {
                if (isNull(this.parent) || isNull(this.element)) {
                    return;
                }

                var attr = camelCase(this.type),
                    expression = this._expression = this.$Parser.parse((<any>this.attributes)[attr]);

                var identifiers = expression.identifiers;

                if (identifiers.length !== 1) {
                    var $exception: IExceptionStatic = acquire(__ExceptionStatic);
                    $exception.warn('Only 1 identifier allowed in a plat-bind expression', $exception.BIND);
                    this._contextExpression = null;
                    return;
                }

                var split = identifiers[0].split('.');

                this._property = split.pop();

                if (split.length > 0) {
                    this._contextExpression = this.$Parser.parse(split.join('.'));
                } else if (expression.aliases.length > 0) {
                    var alias = expression.aliases[0],
                        resourceObj = this.parent.findResource(alias);

                    if (isNull(resourceObj) || resourceObj.resource.type !== 'observable') {
                        return;
                    }

                    this._property = 'value';

                    this._contextExpression = {
                        evaluate: () => {
                            return resourceObj.resource;
                        },
                        aliases: [],
                        identifiers: [],
                        expression: ''
                    };
                } else {
                    this._contextExpression = {
                        evaluate: () => {
                            return this.parent.context;
                        },
                        aliases: [],
                        identifiers: [],
                        expression: ''
                    };
                }

                this._watchExpression();

                if (isNull(this._addEventType)) {
                    return;
                }

                this._addEventType();
            }

            /**
             * @name contextChanged
             * @memberof plat.controls.Bind
             * @kind function
             * @access public
             * 
             * @description
             * Re-observes the expression with the new context.
             * 
             * @returns {void}
             */
            contextChanged(): void {
                this._watchExpression();
            }

            /**
             * @name dispose
             * @memberof plat.controls.Bind
             * @kind function
             * @access public
             * 
             * @description
             * Removes all of the element's event listeners.
             * 
             * @returns {void}
             */
            dispose(): void {
                this._addEventType = null;
            }

            /**
             * @name _addTextEventListener
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Adds a text event as the event listener. 
             * Used for textarea and input[type=text].
             * 
             * @returns {void}
             */
            _addTextEventListener(): void {
                var element = this.element,
                    composing = false,
                    timeout: IRemoveListener,
                    eventListener = () => {
                        if (composing) {
                            return;
                        }

                        this._propertyChanged();
                    },
                    postponedEventListener = () => {
                        if (isFunction(timeout)) {
                            return;
                        }

                        timeout = postpone(() => {
                            eventListener();
                            timeout = null;
                        });
                    };

                this.addEventListener(element, 'compositionstart', () => composing = true, false);
                this.addEventListener(element, 'compositionend', () => composing = false, false);
                this.addEventListener(element, 'keydown', (ev: Event) => {
                    var key = (<KeyboardEvent>ev).keyCode,
                        codes = KeyCodes;

                    if (key === codes.lwk ||
                        key === codes.rwk ||
                        (key > 15 && key < 28) ||
                        (key > 32 && key < 41)) {
                        return;
                    }

                    postponedEventListener();
                }, false);
                this.addEventListener(element, 'cut', postponedEventListener, false);
                this.addEventListener(element, 'paste', postponedEventListener, false);
                this.addEventListener(element, 'change', eventListener, false);
            }

            /**
             * @name _addChangeEventListener
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Adds a change event as the event listener. 
             * Used for select, input[type=radio], and input[type=range].
             * 
             * @returns {void}
             */
            _addChangeEventListener(): void {
                this.addEventListener(this.element, 'change', this._propertyChanged, false);
            }

            /**
             * @name _addButtonEventListener
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Adds a $tap event as the event listener. 
             * Used for input[type=button] and button.
             * 
             * @returns {void}
             */
            _addButtonEventListener(): void {
                this.addEventListener(this.element, __$tap, this._propertyChanged, false);
            }

            /**
             * @name _getChecked
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Getter for input[type=checkbox] and input[type=radio]
             * 
             * @returns {boolean} Whether or not the input element is checked
             */
            _getChecked(): boolean {
                return (<HTMLInputElement>this.element).checked;
            }

            /**
             * @name _getValue
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Getter for input[type=text], input[type=range], 
             * textarea, and select.
             * 
             * @returns {string} The input value
             */
            _getValue(): string {
                return (<HTMLInputElement>this.element).value;
            }

            /**
             * @name _getTextContent
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Getter for button.
             * 
             * @returns {string} The button textContent
             */
            _getTextContent(): string {
                return (<HTMLInputElement>this.element).textContent;
            }

            /**
             * @name _getFile
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Getter for input[type="file"]. Creates a partial IFile 
             * element if file is not supported.
             * 
             * @returns {plat.controls.IFile} The input file
             */
            _getFile(): IFile {
                var element = <HTMLInputElement>this.element,
                    value = element.value;

                if (this.__fileSupported && element.files.length > 0) {
                    return <IFile>element.files[0];
                }

                return {
                    name: value.replace(this.__fileNameRegex, ''),
                    path: value,
                    lastModifiedDate: undefined,
                    type: undefined,
                    size: undefined,
                    msDetachStream: noop,
                    msClose: noop,
                    slice: () => <Blob>{}
                };
            }

            /**
             * @name _getFiles
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Getter for input[type="file"]-multiple
             * 
             * @returns {Array<plat.controls.IFile>} The input files
             */
            _getFiles(): Array<IFile> {
                var element = <HTMLInputElement>this.element;

                if (this.__fileSupported) {
                    return Array.prototype.slice.call(element.files);
                }

                // this case should never be hit since ie9 does not support multi-file uploads, 
                // but kept in here for now for consistency's sake
                var filelist = element.value.split(/,|;/g),
                    length = filelist.length,
                    files: Array<IFile> = [],
                    fileValue: string;

                for (var i = 0; i < length; ++i) {
                    fileValue = filelist[i];
                    files.push({
                        name: fileValue.replace(this.__fileNameRegex, ''),
                        path: fileValue,
                        lastModifiedDate: undefined,
                        type: undefined,
                        size: undefined,
                        msDetachStream: noop,
                        msClose: noop,
                        slice: () => <Blob>{}
                    });
                }

                return files;
            }

            /**
             * @name _getSelectedValues
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Getter for select-multiple
             * 
             * @returns {Array<string>} The selected values
             */
            _getSelectedValues(): Array<string> {
                var options = (<HTMLSelectElement>this.element).options,
                    length = options.length,
                    option: HTMLOptionElement,
                    selectedValues: Array<string> = [];

                for (var i = 0; i < length; ++i) {
                    option = options[i];
                    if (option.selected) {
                        selectedValues.push(option.value);
                    }
                }

                return selectedValues;
            }

            /**
             * @name _setText
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Setter for textarea, input[type=text], 
             * and input[type=button], and select
             * 
             * @param {any} newValue The new value to set
             * @param {any} oldValue? The previously bound value
             * @param {boolean} firstTime? The context is being evaluated for the first time and 
             * should thus change the property if null
             * 
             * @returns {void}
             */
            _setText(newValue: any, oldValue?: any, firstTime?: boolean): void {
                if (this.__isSelf) {
                    return;
                }

                if (isNull(newValue)) {
                    newValue = '';

                    if (firstTime === true) {
                        if (isNull((<HTMLInputElement>this.element).value)) {
                            this.__setValue(newValue);
                        }
                        this._propertyChanged();
                        return;
                    }
                }

                this.__setValue(newValue);
            }

            /**
             * @name _setRange
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Setter for input[type=range]
             * 
             * @param {any} newValue The new value to set
             * @param {any} oldValue? The previously bound value
             * @param {boolean} firstTime? The context is being evaluated for the first time and 
             * should thus change the property if null
             * 
             * @returns {void}
             */
            _setRange(newValue: any, oldValue?: any, firstTime?: boolean): void {
                if (this.__isSelf) {
                    return;
                }

                if (isEmpty(newValue)) {
                    newValue = 0;

                    if (firstTime === true) {
                        if (isEmpty((<HTMLInputElement>this.element).value)) {
                            this.__setValue(newValue);
                        }
                        this._propertyChanged();
                        return;
                    }
                }

                this.__setValue(newValue);
            }

            /**
             * @name _setChecked
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Setter for input[type=checkbox]
             * 
             * @param {any} newValue The new value to set
             * @param {any} oldValue? The previously bound value
             * @param {boolean} firstTime? The context is being evaluated for the first time and 
             * should thus change the property if null
             * 
             * @returns {void}
             */
            _setChecked(newValue: any, oldValue?: any, firstTime?: boolean): void {
                if (this.__isSelf) {
                    return;
                } else if (!isBoolean(newValue)) {
                    if (firstTime === true) {
                        this._propertyChanged();
                        return;
                    }
                    newValue = !!newValue;
                }

                (<HTMLInputElement>this.element).checked = newValue;
            }

            /**
             * @name _setRadio
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Setter for input[type=radio]
             * 
             * @param {any} newValue The new value to set
             * 
             * @returns {void}
             */
            _setRadio(newValue: any): void {
                var element = (<HTMLInputElement>this.element);
                if (this.__isSelf) {
                    return;
                } else if (isNull(newValue) && element.checked) {
                    this._propertyChanged();
                    return;
                }

                element.checked = (element.value === newValue);
            }

            /**
             * @name _setSelectedIndex
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Setter for select
             * 
             * @param {any} newValue The new value to set
             * @param {any} oldValue? The previously bound value
             * @param {boolean} firstTime? The context is being evaluated for the first time and 
             * should thus change the property if null
             * 
             * @returns {void}
             */
            _setSelectedIndex(newValue: any, oldValue?: any, firstTime?: boolean): void {
                if (this.__isSelf) {
                    return;
                } else if (firstTime === true && this.__checkAsynchronousSelect()) {
                    if (isNull(newValue)) {
                        this._propertyChanged();
                    }
                    return;
                }

                var element = <HTMLSelectElement>this.element,
                    value = element.value;
                if (isNull(newValue)) {
                    if (firstTime === true || !this.$document.body.contains(element)) {
                        this._propertyChanged();
                        return;
                    }
                    element.selectedIndex = -1;
                    return;
                } else if (!isString(newValue)) {
                    var Exception: IExceptionStatic = acquire(__ExceptionStatic),
                        message: string;
                    if (isNumber(newValue)) {
                        newValue = newValue.toString();
                        message = 'Trying to bind a value of type number to a select element. ' +
                        'The value will implicitly be converted to type string.';
                    } else {
                        message = 'Trying to bind a value that is not a string to a select element. ' +
                        'The element\'s selected index will be set to -1.';
                    }

                    Exception.warn(message, Exception.BIND);
                } else if (value === newValue) {
                    return;
                } else if (!this.$document.body.contains(element)) {
                    element.value = newValue;
                    if (element.value !== newValue) {
                        element.value = value;
                        this._propertyChanged();
                    }
                    return;
                }

                element.value = newValue;
                // check to make sure the user changed to a valid value
                // second boolean argument is an ie fix for inconsistency
                if (element.value !== newValue || element.selectedIndex === -1) {
                    element.selectedIndex = -1;
                }
            }

            /**
             * @name _setSelectedIndices
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Setter for select-multiple
             * 
             * @param {any} newValue The new value to set
             * @param {any} oldValue? The previously bound value
             * @param {boolean} firstTime? The context is being evaluated for the first time and 
             * should thus change the property if null
             * 
             * @returns {void}
             */
            _setSelectedIndices(newValue: any, oldValue?: any, firstTime?: boolean): void {
                if (this.__isSelf) {
                    return;
                } else if (firstTime === true && this.__checkAsynchronousSelect()) {
                    return;
                }

                var options = (<HTMLSelectElement>this.element).options,
                    length = isNull(options) ? 0 : options.length,
                    option: HTMLOptionElement,
                    nullValue = isNull(newValue);

                if (nullValue || !isArray(newValue)) {
                    if (firstTime === true) {
                        this._propertyChanged();
                    }
                    // unselects the options unless a match is found
                    while (length-- > 0) {
                        option = options[length];
                        if (!nullValue && option.value === '' + newValue) {
                            option.selected = true;
                            return;
                        }

                        option.selected = false;
                    }
                    return;
                }

                var value: any,
                    numberValue: number;

                while (length-- > 0) {
                    option = options[length];
                    value = option.value;
                    numberValue = Number(value);

                    if (newValue.indexOf(value) !== -1 || (isNumber(numberValue) && newValue.indexOf(numberValue) !== -1)) {
                        option.selected = true;
                        continue;
                    }

                    option.selected = false;
                }
            }

            /**
             * @name _determineType
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Determines the type of Element being bound to 
             * and sets the necessary handlers.
             * 
             * @returns {void}
             */
            _determineType(): void {
                if (!isNull(this.templateControl) && this._observedBindableProperty()) {
                    return;
                }

                var element = this.element;
                if (isNull(element)) {
                    return;
                }

                switch (element.nodeName.toLowerCase()) {
                    case 'textarea':
                        this._addEventType = this._addTextEventListener;
                        this._getter = this._getValue;
                        this._setter = this._setText;
                        break;
                    case 'input':
                        switch ((<HTMLInputElement>element).type) {
                            case 'button':
                            case 'submit':
                            case 'reset':
                                this._addEventType = this._addButtonEventListener;
                                this._getter = this._getValue;
                                break;
                            case 'checkbox':
                                this._addEventType = this._addChangeEventListener;
                                this._getter = this._getChecked;
                                this._setter = this._setChecked;
                                break;
                            case 'radio':
                                this.__initializeRadio();
                                break;
                            case 'range':
                                this._addEventType = this._addChangeEventListener;
                                this._getter = this._getValue;
                                this._setter = this._setRange;
                                break;
                            case 'file':
                                var multi = (<HTMLInputElement>element).multiple;
                                this._addEventType = this._addChangeEventListener;
                                this._getter = multi ? this._getFiles : this._getFile;
                                break;
                            default:
                                this._addEventType = this._addTextEventListener;
                                this._getter = this._getValue;
                                this._setter = this._setText;
                                break;
                        }
                        break;
                    case 'select':
                        this.__initializeSelect();
                        break;
                    case 'button':
                        this._addEventType = this._addButtonEventListener;
                        this._getter = this._getTextContent;
                        break;
                }
            }

            /**
             * @name _watchExpression
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Observes the expression to bind to.
             * 
             * @returns {void}
             */
            _watchExpression(): void {
                var contextExpression = this._contextExpression,
                    context = this.evaluateExpression(contextExpression);

                if (!isObject(context)) {
                    if (isNull(context) && contextExpression.identifiers.length > 0) {
                        context = this.$ContextManagerStatic.createContext(this.parent,
                            contextExpression.identifiers[0]);
                    } else {
                        var Exception: IExceptionStatic = acquire(__ExceptionStatic);
                        Exception.warn('plat-bind is trying to index into a primitive type. ' +
                            this._contextExpression.expression + ' is already defined and not ' +
                            'an object when trying to evaluate plat-bind="' +
                            this._expression.expression + '"', Exception.BIND);
                    }
                }

                var property: string;
                if (!isFunction(this._setter)) {
                    return;
                } else if (this._setter === this._setSelectedIndices) {
                    property = this._property;
                    if (isNull(context[property])) {
                        context[property] = [];
                    }
                    this.observeArray(context, property, (arrayInfo: observable.IArrayMethodInfo<string>) => {
                        this._setter(arrayInfo.newArray, arrayInfo.oldArray, true);
                    });
                }

                var expression = this._expression;

                this.observeExpression(expression, this._setter);
                this._setter(this.evaluateExpression(expression), undefined, true);
            }

            /**
             * @name _propertyChanged
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Sets the context property being bound to when the 
             * element's property is changed.
             * 
             * @returns {void}
             */
            _propertyChanged(): void {
                if (isNull(this._contextExpression)) {
                    return;
                }

                var context = this.evaluateExpression(this._contextExpression),
                    property = this._property;

                var newValue = this._getter();

                if (isNull(context) || context[property] === newValue) {
                    return;
                }

                // set flag to let setter functions know we changed the property
                this.__isSelf = true;
                context[property] = newValue;
                this.__isSelf = false;
            }

            /**
             * @name _observedBindableProperty
             * @memberof plat.controls.Bind
             * @kind function
             * @access protected
             * 
             * @description
             * Checks if the associated {@link plat.ui.TemplateControl|TemplateControl} is a 
             * {@link plat.ui.BindablePropertyControl|BindablePropertyControl} and 
             * initializes all listeners accordingly.
             * 
             * @returns {boolean} Whether or not the associated {@link plat.ui.TemplateControl|TemplateControl} 
             * is a {@link plat.ui.BindablePropertyControl|BindablePropertyControl}
             */
            _observedBindableProperty(): boolean {
                var templateControl = <ui.IBindablePropertyControl>this.templateControl;

                if (isFunction(templateControl.observeProperty) &&
                    isFunction(templateControl.setProperty)) {
                    templateControl.observeProperty((newValue: any) => {
                        this._getter = () => newValue;
                        this._propertyChanged();
                    });

                    this._setter = this.__setBindableProperty;
                    return true;
                }

                return false;
            }

            /**
             * @name __setBindableProperty
             * @memberof plat.controls.Bind
             * @kind function
             * @access private
             * 
             * @description
             * Sets the value on a {@link plat.ui.BindablePropertyControl|BindablePropertyControl}.
             * 
             * @param {any} newValue The new value to set
             * @param {any} oldValue? The previously bound value
             * @param {boolean} firstTime? The context is being evaluated for the first time and 
             * should thus change the property if null
             * 
             * @returns {void}
             */
            private __setBindableProperty(newValue: any, oldValue?: any, firstTime?: boolean): void {
                if (this.__isSelf) {
                    return;
                }

                (<ui.IBindablePropertyControl>this.templateControl).setProperty(newValue, oldValue, firstTime);
            }

            /**
             * @name __setValue
             * @memberof plat.controls.Bind
             * @kind function
             * @access private
             * 
             * @description
             * Sets the value on an element.
             * 
             * @param {any} newValue The new value to set
             * 
             * @returns {void}
             */
            private __setValue(newValue: any): void {
                var element = <HTMLInputElement>this.element;
                if (element.value === newValue) {
                    return;
                }

                element.value = newValue;
            }

            /**
             * @name __setValue
             * @memberof plat.controls.Bind
             * @kind function
             * @access private
             * 
             * @description
             * Normalizes input[type="radio"] for cross-browser compatibility.
             * 
             * @returns {void}
             */
            private __initializeRadio(): void {
                var element = this.element;

                this._addEventType = this._addChangeEventListener;
                this._getter = this._getValue;
                this._setter = this._setRadio;

                if (!element.hasAttribute('name')) {
                    var attr = camelCase(this.type),
                        expression = (<any>this.attributes)[attr];

                    element.setAttribute('name', expression);
                }

                if (element.hasAttribute('value')) {
                    return;
                }

                element.setAttribute('value', '');
            }

            /**
             * @name __initializeSelect
             * @memberof plat.controls.Bind
             * @kind function
             * @access private
             * 
             * @description
             * Normalizes HTMLSelectElements for cross-browser compatibility.
             * 
             * @returns {void}
             */
            private __initializeSelect(): void {
                var element = <HTMLSelectElement>this.element,
                    multiple = element.multiple,
                    options = element.options,
                    length = options.length,
                    option: HTMLSelectElement;

                this._addEventType = this._addChangeEventListener;
                if (multiple) {
                    this._getter = this._getSelectedValues;
                    this._setter = this._setSelectedIndices;
                } else {
                    this._getter = this._getValue;
                    this._setter = this._setSelectedIndex;
                }

                for (var i = 0; i < length; ++i) {
                    option = options[i];
                    if (!option.hasAttribute('value')) {
                        option.setAttribute('value', option.textContent);
                    }
                }
            }

            /**
             * @name __checkAsynchronousSelect
             * @memberof plat.controls.Bind
             * @kind function
             * @access private
             * 
             * @description
             * Checks to see if a {@link plat.ui.control.Select|Select} is loading items.
             * 
             * @returns {boolean} Whether or not the select is loading items.
             */
            private __checkAsynchronousSelect(): boolean {
                var select = <ui.controls.Select>this.templateControl;
                if (!isNull(select) && (select.type === __Select || select.type === __ForEach) && isPromise(select.itemsLoaded)) {
                    var split = select.absoluteContextPath.split('.'),
                        key = split.pop();

                    this.observeArray(this.$ContextManagerStatic.getContext(this.parent, split), key,
                        (ev: observable.IArrayMethodInfo<any>) => {
                            select.itemsLoaded.then(() => {
                                this._setter(this.evaluateExpression(this._expression));
                            });
                        });

                    select.itemsLoaded.then(() => {
                        this._setter(this.evaluateExpression(this._expression));
                    });

                    return true;
                }

                return false;
            }
        }

        register.control(__Bind, Bind);

        /**
         * @name IFile
         * @memberof plat.controls
         * @kind interface
         * 
         * @extends {File}
         * 
         * @description
         * A file interface for browsers that do not support the 
         * File API.
         */
        export interface IFile extends File {
            /**
             * @name string
             * @memberof plat.controls.IFile
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * An absolute path to the file. The property is not added to 
             * File types.
             */
            path?: string;
        }

        /**
         * @name ElementPropertyControl
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SetAttributeControl}
         * 
         * @description
         * Base class used for setting the property of an element (e.g. href for anchor elements).
         */
        export class ElementPropertyControl extends SetAttributeControl {
            /**
             * @name setter
             * @memberof plat.controls.ElementPropertyControl
             * @kind function
             * @access public
             * 
             * @description
             * The function for setting the corresponding 
             * attribute property value to the evaluated expression.
             * 
             * @returns {void}
             */
            setter(): void {
                var element = this.element,
                    elementProperty = this.property,
                    expression = (<any>this.attributes)[this.attribute];

                if (isEmpty(expression) || isNull(element)) {
                    return;
                }

                if (!isUndefined((<any>element)[elementProperty])) {
                    (<any>element)[elementProperty] = expression;
                }
            }
        }

        /**
         * @name Href
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.ElementPropertyControl}
         * 
         * @description
         * A type of {@link plat.controls.ElementPropertyControl|ElementPropertyControl} used to set 'href' on an anchor tag.
         */
        export class Href extends ElementPropertyControl {
            /**
             * @name property
             * @memberof plat.controls.Href
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * Used to set the element's href property.
             */
            property: string = 'href';
        }

        /**
         * @name Src
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.ElementPropertyControl}
         * 
         * @description
         * A type of {@link plat.controls.ElementPropertyControl|ElementPropertyControl} used to set 'src' on an anchor tag.
         */
        export class Src extends ElementPropertyControl {
            /**
             * @name property
             * @memberof plat.controls.Src
             * @kind property
             * @access public
             * @readonly
             * 
             * @type {string}
             * 
             * @description
             * Used to set the element's src property.
             */
            property: string = 'src';
        }

        register.control(__Href, Href);
        register.control(__Src, Src);

        /**
     * @name KeyCodes
     * @memberof plat.controls
     * @kind property
     * @access public
     * 
     * @type {any}
     * 
     * @description
     * A mapping of all keys to their equivalent keyCode.
     */
        export var KeyCodes = {
            'backspace': 8,
            'tab': 9,
            'enter': 13,
            'shift': 16,
            'ctrl': 17,
            'alt': 18,
            'pause': 19, 'break': 19,
            'caps lock': 20,
            'escape': 27,
            'space': 32,
            'page up': 33,
            'page down': 34,
            'end': 35,
            'home': 36,
            'left': 37, 'left arrow': 37,
            'up': 38, 'up arrow': 38,
            'right': 39, 'right arrow': 39,
            'down': 40, 'down arrow': 40,
            'insert': 45,
            'delete': 46,
            '0': 48, 'zero': 48,
            ')': 48, 'right parenthesis': 48,
            '1': 49, 'one': 49,
            '!': 49, 'exclamation': 49, 'exclamation point': 49,
            '2': 50, 'two': 50,
            '@': 50, 'at': 50,
            '3': 51, 'three': 51,
            '#': 51, 'number sign': 51,
            'hash': 51, 'pound': 51,
            '4': 52, 'four': 52,
            '$': 52, 'dollar': 52, 'dollar sign': 52,
            '5': 53, 'five': 53,
            '%': 53, 'percent': 53, 'percent sign': 53,
            '6': 54, 'six': 54,
            '^': 54, 'caret': 54,
            '7': 55, 'seven': 55,
            '&': 55, 'ampersand': 55,
            '8': 56, 'eight': 56,
            '*': 56, 'asterisk': 56,
            '9': 57, 'nine': 57,
            '(': 57, 'left parenthesis': 57,
            'a': 65, 'b': 66, 'c': 67, 'd': 68, 'e': 69,
            'f': 70, 'g': 71, 'h': 72, 'i': 73, 'j': 74,
            'k': 75, 'l': 76, 'm': 77, 'n': 78, 'o': 79,
            'p': 80, 'q': 81, 'r': 82, 's': 83, 't': 84,
            'u': 85, 'v': 86, 'w': 87, 'x': 88, 'y': 89,
            'z': 90,
            'lwk': 91, 'left window key': 91,
            'rwk': 92, 'right window key': 92,
            'select': 93, 'select key': 93,
            'numpad 0': 96,
            'numpad 1': 97,
            'numpad 2': 98,
            'numpad 3': 99,
            'numpad 4': 100,
            'numpad 5': 101,
            'numpad 6': 102,
            'numpad 7': 103,
            'numpad 8': 104,
            'numpad 9': 105,
            'multiply': 106,
            'add': 107,
            'subtract': 109,
            'decimal point': 110,
            'divide': 111,
            'f1': 112, 'f2': 113, 'f3': 114, 'f4': 115,
            'f5': 116, 'f6': 117, 'f7': 118, 'f8': 119,
            'f9': 120, 'f10': 121, 'f11': 122, 'f12': 123,
            'num lock': 144,
            'scroll lock': 145,
            ';': 186, 'semi-colon': 186,
            ':': 186, 'colon': 186,
            '=': 187, 'equal': 187, 'equal sign': 187,
            '+': 187, 'plus': 187,
            ',': 188, 'comma': 188,
            '<': 188, 'lt': 188, 'less than': 188,
            'left angle bracket': 188,
            '-': 189, 'dash': 189,
            '_': 189, 'underscore': 189,
            '.': 190, 'period': 190,
            '>': 190, 'gt': 190, 'greater than': 190,
            'right angle bracket': 190,
            '/': 191, 'forward slash': 191,
            '?': 191, 'question mark': 191,
            '`': 192, 'grave accent': 192,
            '~': 192, 'tilde': 192,
            '[': 219, 'open bracket': 219,
            '{': 219, 'open brace': 219,
            '\\': 220, 'back slash': 220,
            '|': 220, 'pipe': 220,
            ']': 221, 'close bracket': 221,
            '}': 221, 'close brace': 221,
            '\'': 222, 'single quote': 222,
            '"': 222, 'double quote': 222
        };

        /**
         * @name KeyCodeEventControl
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * @implements {plat.controls.IKeyCodeEventControl}
         * 
         * @description
         * Base class used for filtering keys on KeyboardEvents.
         */
        export class KeyCodeEventControl extends SimpleEventControl implements IKeyCodeEventControl {
            /**
             * @name $Regex
             * @memberof plat.controls.KeyCodeEventControl
             * @kind property
             * @access public
             * 
             * @type {plat.expressions.IRegex}
             * 
             * @description
             * Reference to the {@link plat.expressions.IRegex|IRegex} injectable.
             */
            $Regex: plat.expressions.IRegex = plat.acquire(__Regex);

            /**
             * @name keyCodes
             * @memberof plat.controls.KeyCodeEventControl
             * @kind property
             * @access public
             * 
             * @type {plat.IObject<{ shifted: boolean; }>}
             * 
             * @description
             * Holds the key mappings to filter for in a KeyboardEvent.
             */
            keyCodes: IObject<{ shifted: boolean; }>;

            /**
             * @name _setListener
             * @memberof plat.controls.KeyCodeEventControl
             * @kind function
             * @access protected
             * 
             * @description
             * Checks if the {@link plat.controls.IKeyboardEventInput|IKeyboardEventInput} is an expression object 
             * and sets the necessary listener.
             * 
             * @returns {void}
             */
            _setListener(): void {
                var attr = this.attribute;
                if (isEmpty(this.event) || isEmpty(attr)) {
                    return;
                }

                var expression = (<any>this.attributes)[attr].trim();

                if (expression[0] === '{') {
                    var eventObject: IKeyboardEventInput = this.evaluateExpression(expression) ||
                        { method: '', key: null },
                        key = eventObject.key,
                        keys = eventObject.keys;

                    this._parseArgs(eventObject.method);

                    if (isNull(key) && isNull(keys)) {
                        (<any>this.attributes)[attr] = eventObject.method;

                        this._setKeyCodes();
                        super._setListener();
                        return;
                    }

                    keys = isArray(keys) ? keys : [key];
                    this._setKeyCodes(keys);
                    this.addEventListener(this.element, this.event, this._onEvent, false);

                    return;
                }

                this._setKeyCodes();
                super._setListener();
            }

            /**
             * @name _onEvent
             * @memberof plat.controls.KeyCodeEventControl
             * @kind function
             * @access protected
             * 
             * @description
             * Matches the event's keyCode if necessary and then handles the event if 
             * a match is found or if there are no filter keyCodes.
             * 
             * @param {KeyboardEvent} ev The keyboard event object.
             * 
             * @returns {void}
             */
            _onEvent(ev: KeyboardEvent): void {
                var keyCodes = this.keyCodes,
                    code: { shifted?: boolean };

                if (isEmpty(keyCodes)) {
                    super._onEvent(ev);
                } else if (!isUndefined(keyCodes[ev.keyCode])) {
                    code = keyCodes[ev.keyCode];

                    if (!code.shifted || ev.shiftKey) {
                        super._onEvent(ev);
                    }
                }
            }

            /**
             * @name _setKeyCodes
             * @memberof plat.controls.KeyCodeEventControl
             * @kind function
             * @access protected
             * 
             * @description
             * Sets the defined key codes as they correspond to 
             * the {@link plat.controls.KeyCodes|KeyCodes} map.
             * 
             * @param {Array<string>} keys? The array of defined keys to satisfy the 
             * key press condition.
             * 
             * @returns {void}
             */
            _setKeyCodes(keys?: Array<string>): void {
                if (!isArray(keys)) {
                    keys = [];
                }

                var length = keys.length,
                    key: string,
                    keyCodes = this.keyCodes,
                    index: string,
                    shifted = this.$Regex.shiftedKeyRegex;

                if (!isObject(keyCodes)) {
                    keyCodes = this.keyCodes = {};
                }

                for (var i = 0; i < length; ++i) {
                    key = keys[i];
                    index = isNumber(key) ? key : (<any>KeyCodes)[key.toLowerCase()];

                    keyCodes[index] = { shifted: shifted.test(key) };
                }
            }
        }

        /**
         * @name IKeyCodeEventControl
         * @memberof plat.controls
         * @kind interface
         * 
         * @extends {plat.controls.ISimpleEventControl}
         * 
         * @description
         * An attribute object that binds to specified key code scenarios.
         */
        export interface IKeyCodeEventControl extends ISimpleEventControl {
            /**
             * @name keyCodes
             * @memberof plat.controls.IKeyCodeEventControl
             * @kind property
             * @access public
             * 
             * @type {plat.IObject<{ shifted: boolean; }>}
             * 
             * @description
             * Holds the key mappings to filter for in a KeyboardEvent.
             */
            keyCodes: IObject<{ shifted: boolean; }>;
        }

        /**
         * @name IKeyboardEventInput
         * @memberof plat.controls
         * @kind interface
         * 
         * @description
         * The available options for {@link plat.controls.KeyCodeEventControl|KeyCodeEventControl}.
         */
        export interface IKeyboardEventInput {
            /**
             * @name method
             * @memberof plat.controls.IKeyboardEventInput
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The method to call when the condition is satisfied.
             */
            method: string;

            /**
             * @name key
             * @memberof plat.controls.IKeyboardEventInput
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The key to satisfy the press condition. Can be specified either as a numeric key code 
             * or a string representation as seen by the KeyCodes mapping.
             */
            key?: string;

            /**
             * @name keys
             * @memberof plat.controls.IKeyboardEventInput
             * @kind property
             * @access public
             * 
             * @type {Array<string>}
             * 
             * @description
             * An optional array of keys if more than one key can satisfy the condition.
             */
            keys?: Array<string>;
        }

        /**
         * @name KeyDown
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.KeyCodeEventControl}
         * 
         * @description
         * Used for filtering keys on keydown events.
         */
        export class KeyDown extends KeyCodeEventControl {
            /**
             * @name event
             * @memberof plat.controls.KeyDown
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = 'keydown';
        }

        /**
         * @name KeyPress
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.KeyCodeEventControl}
         * 
         * @description
         * Used for filtering only printing keys (a-z, A-Z, 0-9, and special characters) on keydown events.
         */
        export class KeyPress extends KeyCodeEventControl {
            /**
             * @name event
             * @memberof plat.controls.KeyPress
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = 'keydown';

            /**
             * @name _onEvent
             * @memberof plat.controls.KeyPress
             * @kind function
             * @access protected
             * 
             * @description
             * Filters only 'printing keys' (a-z, A-Z, 0-9, and special characters)
             * 
             * @param {KeyboardEvent} ev The KeyboardEvent object.
             * 
             * @returns {void}
             */
            _onEvent(ev: KeyboardEvent): void {
                var keyCode = ev.keyCode;

                if ((keyCode >= 48 && keyCode <= 90) ||
                    (keyCode >= 186) ||
                    (keyCode >= 96 && keyCode <= 111)) {
                    super._onEvent(ev);
                }
            }
        }

        /**
         * @name KeyUp
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.KeyCodeEventControl}
         * 
         * @description
         * Used for filtering keys on keyup events.
         */
        export class KeyUp extends KeyCodeEventControl {
            /**
             * @name event
             * @memberof plat.controls.KeyDown
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = 'keyup';
        }

        register.control(__KeyDown, KeyDown);
        register.control(__KeyPress, KeyPress);
        register.control(__KeyUp, KeyUp);

        /**
         * @name Name
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.AttributeControl}
         * 
         * @description
         * Allows for assigning a name to an Element or {@link plat.ui.TemplateControl|TemplateControl} and referencing it 
         * from parent controls.
         * 
         * @remarks
         * This control is useful for avoiding query selectors since it will store itself on all of its ancestor controls using 
         * the associated name.
         */
        export class Name extends AttributeControl {
            /**
             * @name _label
             * @memberof plat.controls.Name
             * @kind property
             * @access protected
             * @static
             * 
             * @type {string}
             * 
             * @description
             * The property name on the ancestor controls to set as the {@link plat.controls.INamedElement|INamedElement}.
             */
            _label: string;

            /**
             * @name initialize
             * @memberof plat.controls.Name
             * @kind function
             * @access public
             * 
             * @description
             * Defines the property specified by the attribute value as the {@link plat.controls.INamedElement|INamedElement} 
             * on all the ancestor controls, ignoring those that already have the property defined.
             * 
             * @returns {void}
             */
            initialize(): void {
                var attr = camelCase(this.type),
                    name = (<any>this.attributes)[attr];

                if (isEmpty(name) || this._isPrecompiled()) {
                    return;
                }

                this._label = name;
                this._define(name);
            }

            /**
             * @name dispose
             * @memberof plat.controls.Name
             * @kind function
             * @access public
             * 
             * @description
             * Removes the {@link plat.controls.INamedElement|INamedElement} from the ancestor controls.
             * 
             * @returns {void}
             */
            dispose(): void {
                var name = this._label,
                    control: any = this.parent;

                while (!isUndefined(name) && isObject(control)) {
                    if (isObject(control[name]) &&
                        isNode(control[name].element) &&
                        control[name].element === this.element) {
                        deleteProperty(control, name);
                    }

                    control = control.parent;
                }
            }

            /**
             * @name _define
             * @memberof plat.controls.Name
             * @kind function
             * @access protected
             * 
             * @description
             * Defines the property specified by the attribute value as the {@link plat.controls.INamedElement|INamedElement} 
             * on all the ancestor controls, ignoring those that already have the property defined.
             * 
             * @param {string} name The name to define on all the ancestor controls.
             * 
             * @returns {void}
             */
            _define(name: string): void {
                var templateControl = this.templateControl;

                if (!isNull(templateControl)) {
                    templateControl.name = name;
                }

                var control: any = this.parent,
                    namedElement = {
                        element: this.element,
                        control: templateControl
                    };

                while (isObject(control)) {
                    var obj = control[name];

                    if (!isObject(obj)) {
                        control[name] = namedElement;
                    }

                    control = control.parent;
                }
            }

            /**
             * @name _isPrecompiled
             * @memberof plat.controls.Name
             * @kind function
             * @access protected
             * 
             * @description
             * Determines whether or not this control is part of a pre-compiled control tree. In the event 
             * that it is, it shouldn't set itself on the ancestor controls.
             * 
             * @param {string} name The name to define on all the ancestor controls.
             * 
             * @returns {void}
             */
            _isPrecompiled(): boolean {
                var control = this.parent;

                while (!isNull(control)) {
                    if (control.type.indexOf(__COMPILED) !== -1) {
                        return true;
                    }
                    control = control.parent;
                }
                return false;
            }
        }

        register.control(__Name, Name);

        /**
         * @name INamedElement
         * @memberof plat.controls
         * @kind interface
         * 
         * @description
         * Defines the object added to a root control when an HTML element has 
         * a plat-name attribute. If the element corresponds to a registered 
         * control, the control will be included in the object.
         * 
         * @typeparam {Element} E The type of element that is named.
         * @typeparam {any} C The type of control that is named.
         */
        export interface INamedElement<E extends Element, C> {
            /**
             * @name element
             * @memberof plat.controls.INamedElement
             * @kind property
             * 
             * @type {E}
             * 
             * @description
             * The element on which the plat-name is specified.
             */
            element: E;

            /**
             * @name control
             * @memberof plat.controls.INamedElement
             * @kind property
             * 
             * @type {C}
             * 
             * @description
             * The template control on the associated element, if one 
             * exists.
             */
            control?: C;
        }

        /**
         * @name ObservableAttributeControl
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.AttributeControl}
         * @implements {plat.controls.IObservableAttributeControl}
         * 
         * @description
         * An {@link plat.controls.AttributeControl|AttributeControl} that deals with observing changes for a specified property.
         */
        export class ObservableAttributeControl extends AttributeControl implements IObservableAttributeControl {
            /**
             * @name $ContextManagerStatic
             * @memberof plat.controls.ObservableAttributeControl
             * @kind property
             * @access public
             * 
             * @type {plat.observable.IContextManagerStatic}
             * 
             * @description
             * Reference to the {@link plat.observable.IContextManagerStatic|IContextManagerStatic} injectable.
             */
            $ContextManagerStatic: observable.IContextManagerStatic = acquire(__ContextManagerStatic);

            /**
             * @name property
             * @memberof plat.controls.ObservableAttributeControl
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The property to set on the associated template control.
             */
            property: string = '';

            /**
             * @name attribute
             * @memberof plat.controls.ObservableAttributeControl
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The camel-cased name of the control as it appears as an attribute.
             */
            attribute: string;

            /**
             * @name priority
             * @memberof plat.controls.ObservableAttributeControl
             * @kind property
             * @access public
             * 
             * @type {number}
             * 
             * @description
             * This control needs to load before its templateControl
             */
            priority = 200;

            /**
             * @name _listeners
             * @memberof plat.controls.ObservableAttributeControl
             * @kind property
             * @access protected
             * 
             * @type {Array<plat.IPropertyChangedListener>}
             * 
             * @description
             * The set of functions added by the Template Control that listens 
             * for property changes.
             */
            _listeners: Array<(newValue: any, oldValue?: any) => void> = [];

            /**
             * @name _removeListener
             * @memberof plat.controls.ObservableAttributeControl
             * @kind property
             * @access protected
             * 
             * @type {IRemoveListener}
             * 
             * @description
             * The function to stop listening for property changes.
             */
            _removeListener: IRemoveListener;

            /**
             * @name initialize
             * @memberof plat.controls.ObservableAttributeControl
             * @kind function
             * @access public
             * 
             * @description
             * Sets the initial value of the property on 
             * the Template Control.
             * 
             * @returns {void}
             */
            initialize(): void {
                this.attribute = camelCase(this.type);
                this._setProperty(this._getValue());
            }

            /**
             * @name loaded
             * @memberof plat.controls.ObservableAttributeControl
             * @kind function
             * @access public
             * 
             * @description
             * Observes the property and resets the value.
             * 
             * @returns {void}
             */
            loaded(): void {
                this._observeProperty();
                this._setProperty(this._getValue());
            }

            /**
             * @name dispose
             * @memberof plat.controls.ObservableAttributeControl
             * @kind function
             * @access public
             * 
             * @description
             * Stops listening for changes to the evaluated 
             * expression and removes references to the listeners 
             * defined by the Template Control.
             * 
             * @returns {void}
             */
            dispose(): void {
                if (isFunction(this._removeListener)) {
                    this._removeListener();
                }

                this._listeners = [];
            }

            /**
             * @name _setProperty
             * @memberof plat.controls.ObservableAttributeControl
             * @kind function
             * @access protected
             * 
             * @description
             * Sets the property on the Template Control.
             * 
             * @param {any} value The new value of the evaluated expression.
             * @param {any} oldValue? The old value of the evaluated expression.
             * 
             * @returns {void}
             */
            _setProperty(value: any, oldValue?: any): void {
                var templateControl = this.templateControl;

                if (isNull(templateControl)) {
                    return;
                }

                this.$ContextManagerStatic.defineGetter(templateControl, this.property, <observable.IObservableProperty<any>>{
                    value: value,
                    observe: this._addListener.bind(this)
                }, true, true);
                this._callListeners(value, oldValue);
            }

            /**
             * @name _callListeners
             * @memberof plat.controls.ObservableAttributeControl
             * @kind function
             * @access protected
             * 
             * @description
             * Calls the listeners defined by the Template Control.
             * 
             * @param {any} value The new value of the evaluated expression.
             * @param {any} oldValue The old value of the evaluated expression.
             * 
             * @returns {void}
             */
            _callListeners(newValue: any, oldValue: any): void {
                var listeners = this._listeners,
                    length = listeners.length,
                    templateControl = this.templateControl;

                for (var i = 0; i < length; ++i) {
                    listeners[i].call(templateControl, newValue, oldValue);
                }
            }

            /**
             * @name _addListener
             * @memberof plat.controls.ObservableAttributeControl
             * @kind function
             * @access protected
             * 
             * @description
             * Adds a listener as defined by the Template Control.
             * 
             * @param {plat.IPropertyChangedListener} listener The listener added by the Template Control.
             */
            _addListener(listener: (newValue: any, oldValue: any) => void): IRemoveListener {
                var listeners = this._listeners,
                    index = listeners.length;

                listeners.push(listener);

                return () => {
                    listeners.splice(index, 1);
                };
            }

            /**
             * @name _getValue
             * @memberof plat.controls.ObservableAttributeControl
             * @kind function
             * @access protected
             * 
             * @description
             * Evaluates the attribute's value.
             * 
             * @returns {any}
             */
            _getValue(): any {
                var expression = (<any>this.attributes)[this.attribute],
                    templateControl = this.templateControl;

                if (isNull(templateControl)) {
                    return;
                }

                return this.evaluateExpression(expression);
            }

            /**
             * @name _observeProperty
             * @memberof plat.controls.ObservableAttributeControl
             * @kind function
             * @access protected
             * 
             * @description
             * Observes the attribute's value.
             * 
             * @returns {void}
             */
            _observeProperty(): void {
                var expression = (<any>this.attributes)[this.attribute],
                    templateControl = this.templateControl;

                if (isNull(templateControl)) {
                    return;
                }

                this._removeListener = this.observeExpression(expression, this._setProperty);
            }
        }

        /**
         * @name IObservableAttributeControl
         * @memberof plat.controls
         * @kind interface
         * 
         * @extends {plat.controls.IAttributeControl}
         * 
         * @description
         * An {@link plat.controls.IAttributeControl|IAttributeControl} that deals with observing changes for a specified property.
         */
        export interface IObservableAttributeControl extends IAttributeControl {
            /**
             * @name property
             * @memberof plat.controls.IObservableAttributeControl
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The property to set on the associated template control.
             */
            property: string;

            /**
             * @name attribute
             * @memberof plat.controls.IObservableAttributeControl
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The camel-cased name of the control as it appears as an attribute.
             */
            attribute: string;
        }

        /**
         * @name Options
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.ObservableAttributeControl}
         * 
         * @description
         * An {@link plat.controls.ObservableAttributeControl|ObservableAttributeControl} that sets 'options' as the 
         * associated property.
         */
        export class Options extends ObservableAttributeControl {
            /**
             * @name property
             * @memberof plat.controls.Options
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The property to set on the associated template control.
             */
            property: string = 'options';
        }

        register.control(__Options, Options);

        /**
         * @name SetAttributeControl
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.AttributeControl}
         * @implements {plat.controls.ISetAttributeControl}
         * 
         * @description
         * An {@link plat.controls.AttributeControl|AttributeControl} that deals with binding to a specified property on its element.
         */
        export class SetAttributeControl extends AttributeControl implements ISetAttributeControl {
            /**
             * @name property
             * @memberof plat.controls.SetAttributeControl
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The property to set on the associated template control.
             */
            property: string = '';

            /**
             * @name attribute
             * @memberof plat.controls.SetAttributeControl
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The camel-cased name of the control as it appears as an attribute.
             */
            attribute: string;

            /**
             * @name __removeListener
             * @memberof plat.controls.SetAttributeControl
             * @kind property
             * @access private
             * 
             * @type {IRemoveListener}
             * 
             * @description
             * The function to stop listening for attribute changes.
             */
            private __removeListener: IRemoveListener;

            /**
             * @name loaded
             * @memberof plat.controls.SetAttributeControl
             * @kind function
             * @access public
             * 
             * @description
             * Sets the corresponding attribute {property} value and 
             * observes the attribute for changes.
             * 
             * @returns {void}
             */
            loaded(): void {
                if (isNull(this.element)) {
                    return;
                }

                this.attribute = camelCase(this.type);
                this.setter();
                this.__removeListener = this.attributes.observe(this.attribute, this.setter);
            }

            /**
             * @name contextChanged
             * @memberof plat.controls.SetAttributeControl
             * @kind function
             * @access public
             * 
             * @description
             * Resets the corresponding attribute property value upon 
             * a change of context.
             * 
             * @returns {void}
             */
            contextChanged(): void {
                if (isNull(this.element)) {
                    return;
                }

                this.setter();
            }

            /**
             * @name dispose
             * @memberof plat.controls.SetAttributeControl
             * @kind function
             * @access public
             * 
             * @description
             * Stops listening to attribute changes.
             * 
             * @returns {void}
             */
            dispose(): void {
                if (isFunction(this.__removeListener)) {
                    this.__removeListener();
                    this.__removeListener = null;
                }
            }

            /**
             * @name setter
             * @memberof plat.controls.SetAttributeControl
             * @kind function
             * @access public
             * @virtual
             * 
             * @description
             * The function for setting the corresponding 
             * attribute property value.
             * 
             * @returns {void}
             */
            setter(): void {
                var expression = (<any>this.attributes)[this.attribute];

                postpone(() => {
                    if (!isNode(this.element)) {
                        return;
                    }

                    switch (expression) {
                        case 'false':
                        case '0':
                        case 'null':
                        case '':
                            this.element.setAttribute(this.property, '');
                            (<any>this.element)[this.property] = false;
                            this.element.removeAttribute(this.property);
                            break;
                        default:
                            this.element.setAttribute(this.property, this.property);
                            (<any>this.element)[this.property] = true;
                    }
                });
            }
        }

        /**
         * @name ISetAttributeControl
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.IAttributeControl}
         * 
         * @description
         * An {@link plat.controls.IAttributeControl|IAttributeControl} that deals with binding to a specified property on its element.
         */
        export interface ISetAttributeControl extends IAttributeControl {
            /**
             * @name property
             * @memberof plat.controls.ISetAttributeControl
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The property to set on the associated template control.
             */
            property: string;

            /**
             * @name attribute
             * @memberof plat.controls.ISetAttributeControl
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The camel-cased name of the control as it appears as an attribute.
             */
            attribute: string;

            /**
             * @name setter
             * @memberof plat.controls.ISetAttributeControl
             * @kind function
             * @access public
             * 
             * @description
             * The function for setting the corresponding 
             * attribute property value.
             * 
             * @returns {void}
             */
            setter(): void;
        }

        /**
         * @name Checked
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SetAttributeControl}
         * 
         * @description
         * A {@link plat.controls.SetAttributeControl|SetAttributeControl} for the 'checked' attribute.
         */
        export class Checked extends SetAttributeControl {
            /**
             * @name property
             * @memberof plat.controls.Checked
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The property to set on the associated template control.
             */
            property: string = 'checked';
        }

        /**
         * @name Disabled
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SetAttributeControl}
         * 
         * @description
         * A {@link plat.controls.SetAttributeControl|SetAttributeControl} for the 'disabled' attribute.
         */
        export class Disabled extends SetAttributeControl {
            /**
             * @name property
             * @memberof plat.controls.Disabled
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The property to set on the associated template control.
             */
            property: string = 'disabled';
        }

        /**
         * @name Selected
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SetAttributeControl}
         * 
         * @description
         * A {@link plat.controls.SetAttributeControl|SetAttributeControl} for the 'selected' attribute.
         */
        export class Selected extends SetAttributeControl {
            /**
             * @name property
             * @memberof plat.controls.Selected
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The property to set on the associated template control.
             */
            property: string = 'selected';
        }

        /**
         * @name ReadOnly
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SetAttributeControl}
         * 
         * @description
         * A {@link plat.controls.SetAttributeControl|SetAttributeControl} for the 'readonly' attribute.
         */
        export class ReadOnly extends SetAttributeControl {
            /**
             * @name property
             * @memberof plat.controls.ReadOnly
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The property to set on the associated template control.
             */
            property: string = 'readonly';
        }

        /**
         * @name Visible
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SetAttributeControl}
         * 
         * @description
         * A {@link plat.controls.SetAttributeControl|SetAttributeControl} for the 'plat-hide' attribute.
         */
        export class Visible extends SetAttributeControl {
            /**
             * @name property
             * @memberof plat.controls.Visible
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The property to set on the associated template control.
             */
            property: string = __Hide;

            /**
             * @name initialize
             * @memberof plat.controls.Visible
             * @kind function
             * @access public
             * 
             * @description
             * Hides the element.
             * 
             * @returns {void}
             */
            initialize(): void {
                this.__hide();
            }

            /**
             * @name setter
             * @memberof plat.controls.Visible
             * @kind function
             * @access public
             * 
             * @description
             * Hides or shows the element depending upon the attribute value
             * 
             * @returns {void}
             */
            setter(): void {
                var expression = (<any>this.attributes)[this.attribute];

                postpone(() => {
                    if (!isNode(this.element)) {
                        return;
                    }

                    switch (expression) {
                        case 'false':
                        case '0':
                        case 'null':
                        case '':
                            this.__hide();
                            break;
                        default:
                            this.__show();
                    }
                });
            }

            /**
             * @name __hide
             * @memberof plat.controls.Visible
             * @kind function
             * @access private
             * 
             * @description
             * Hides the element.
             * 
             * @returns {void}
             */
            private __hide(): void {
                if (!this.element.hasAttribute(this.property)) {
                    this.element.setAttribute(this.property, '');
                }
            }

            /**
             * @name __show
             * @memberof plat.controls.Visible
             * @kind function
             * @access private
             * 
             * @description
             * Shows the element.
             * 
             * @returns {void}
             */
            private __show(): void {
                if (this.element.hasAttribute(this.property)) {
                    this.element.removeAttribute(this.property);
                }
            }
        }

        /**
         * @name Style
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SetAttributeControl}
         * 
         * @description
         * A {@link plat.controls.SetAttributeControl|SetAttributeControl} for the 'style' attribute.
         */
        export class Style extends SetAttributeControl {
            /**
             * @name setter
             * @memberof plat.controls.Style
             * @kind function
             * @access public
             * 
             * @description
             * Sets the evaluated styles on the element.
             * 
             * @returns {void}
             */
            setter(): void {
                var expression: string = (<any>this.attributes)[this.attribute];

                if (isEmpty(expression)) {
                    return;
                }

                var attributes = expression.split(';'),
                    elementStyle = this.element.style,
                    length = attributes.length,
                    splitStyles: Array<string>,
                    styleType: string,
                    styleValue: string;

                for (var i = 0; i < length; ++i) {
                    splitStyles = attributes[i].split(':');
                    if (splitStyles.length === 2) {
                        styleType = camelCase(splitStyles[0].trim());
                        styleValue = splitStyles[1].trim();

                        if (!isUndefined((<any>elementStyle)[styleType])) {
                            (<any>elementStyle)[styleType] = styleValue;
                        }
                    }
                }
            }
        }

        register.control(__Checked, Checked);
        register.control(__Disabled, Disabled);
        register.control(__Selected, Selected);
        register.control(__ReadOnly, ReadOnly);
        register.control(__Visible, Visible);
        register.control(__Style, Style);

        /**
         * @name SimpleEventControl
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.AttributeControl}
         * @implements {plat.controls.ISimpleEventControl}
         * 
         * @description
         * An {@link plat.controls.AttributeControl|AttributeControl} that binds to a specified DOM event handler.
         */
        export class SimpleEventControl extends AttributeControl implements ISimpleEventControl {
            /**
             * @name $Parser
             * @memberof plat.controls.SimpleEventControl
             * @kind property
             * @access public
             * 
             * @type {plat.expressions.IParser}
             * 
             * @description
             * Reference to the {@link plat.expressions.IParser|IParser} injectable.
             */
            $Parser: expressions.IParser = acquire(__Parser);

            /**
             * @name $Regex
             * @memberof plat.controls.SimpleEventControl
             * @kind property
             * @access public
             * 
             * @type {plat.expressions.IRegex}
             * 
             * @description
             * Reference to the {@link plat.expressions.IRegex|IRegex} injectable.
             */
            $Regex: expressions.IRegex = acquire(__Regex);

            /**
             * @name event
             * @memberof plat.controls.SimpleEventControl
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string;

            /**
             * @name attribute
             * @memberof plat.controls.SimpleEventControl
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The camel-cased name of the control as it appears as an attribute.
             */
            attribute: string;

            /**
             * @name _expression
             * @memberof plat.controls.SimpleEventControl
             * @kind property
             * @access protected
             * 
             * @type {Array<string>}
             * 
             * @description
             * A parsed form of the expression found in the attribute's value.
             */
            _expression: Array<string> = [];

            /**
             * @name _aliases
             * @memberof plat.controls.SimpleEventControl
             * @kind property
             * @access protected
             * 
             * @type {Array<string>}
             * 
             * @description
             * An array of the aliases used in the expression.
             */
            _aliases: Array<string> = [];

            /**
             * @name loaded
             * @memberof plat.controls.SimpleEventControl
             * @kind function
             * @access public
             * 
             * @description
             * Kicks off finding and setting the listener.
             * 
             * @returns {void}
             */
            loaded(): void {
                if (isNull(this.element)) {
                    return;
                }

                this.attribute = camelCase(this.type);
                this._setListener();
            }

            /**
             * @name _setListener
             * @memberof plat.controls.SimpleEventControl
             * @kind function
             * @access protected
             * 
             * @description
             * Sets the event listener.
             * 
             * @returns {void}
             */
            _setListener(): void {
                var attr = this.attribute;
                if (isEmpty(this.event) || isEmpty(attr)) {
                    return;
                }

                this._parseArgs((<any>this.attributes)[attr]);

                if (isNull(this._expression)) {
                    return;
                }

                this.addEventListener(this.element, this.event, this._onEvent, false);
            }

            /**
             * @name _findListener
             * @memberof plat.controls.SimpleEventControl
             * @kind function
             * @access protected
             * 
             * @description
             * Finds the first instance of the specified function 
             * in the parent control chain.
             * 
             * @param {string} identifier the function identifer
             * 
             * @returns {{ control: ui.ITemplateControl; value: any; }} The instance of the specified function.
             */
            _findListener(identifier: string): { control: ui.ITemplateControl; value: any; } {
                var control: ui.ITemplateControl = <any>this,
                    expression = this.$Parser.parse(identifier),
                    value: any;

                while (!isNull(control)) {
                    value = expression.evaluate(control);
                    if (!isNull(value)) {
                        return {
                            control: control,
                            value: value
                        };
                    }
                    control = control.parent;
                }

                return {
                    control: null,
                    value: null
                };
            }

            /**
             * @name _buildExpression
             * @memberof plat.controls.SimpleEventControl
             * @kind function
             * @access protected
             * 
             * @description
             * Constructs the function to evaluate with 
             * the evaluated arguments taking resources 
             * into account.
             * 
             * @returns {{ fn: () => void; control: ui.ITemplateControl; args: Array<expressions.IParsedExpression>; }} 
             * The function to call and the associated arguments, as well as the control context with which to call the function.
             */
            _buildExpression(): { fn: () => void; control: ui.ITemplateControl; args: Array<expressions.IParsedExpression>; } {
                var expression = this._expression.slice(0),
                    hasParent = !isNull(this.parent),
                    aliases = hasParent ? this.parent.getResources(this._aliases) : null,
                    listenerStr = expression.shift(),
                    listener: { control: ui.ITemplateControl; value: any; },
                    control: ui.ITemplateControl,
                    fn: () => void;

                if (listenerStr[0] !== '@') {
                    listener = this._findListener(listenerStr);

                    if (isNull(listener)) {
                        return {
                            fn: noop,
                            control: <ui.ITemplateControl>{},
                            args: []
                        };
                    }

                    fn = listener.value;
                    control = listener.control;
                } else {
                    fn = aliases[listenerStr];
                    control = null;
                }

                var length = expression.length,
                    args: Array<expressions.IParsedExpression> = [],
                    $parser = this.$Parser;

                for (var i = 0; i < length; ++i) {
                    args.push($parser.parse(expression[i]).evaluate(hasParent ? this.parent.context : null, aliases));
                }

                return {
                    fn: fn,
                    control: control,
                    args: args
                };
            }

            /**
             * @name _onEvent
             * @memberof plat.controls.SimpleEventControl
             * @kind function
             * @access protected
             * 
             * @description
             * Calls the specified function when the DOM event is fired.
             * 
             * @param {Event} ev The event object.
             * 
             * @returns {void}
             */
            _onEvent(ev: Event): void {
                var expression = this._buildExpression(),
                    fn = expression.fn,
                    control = expression.control,
                    args = expression.args;

                if (!isFunction(fn)) {
                    var $exception: IExceptionStatic = acquire(__ExceptionStatic);
                    $exception.warn('Cannot find registered event method ' +
                        this._expression[0] + ' for control: ' + this.type, $exception.BIND);
                    return;
                }

                fn.apply(control, args.concat(<any>ev));
            }

            /**
             * @name _findAliases
             * @memberof plat.controls.SimpleEventControl
             * @kind function
             * @access protected
             * 
             * @description
             * Finds all alias contained within the expression.
             * 
             * @param {Array<string>} args The array of arguments as strings.
             * 
             * @returns {Array<string>} The aliases.
             */
            _findAliases(args: Array<string>): Array<string> {
                var length = args.length,
                    arg: string,
                    exec: RegExpExecArray,
                    aliases: IObject<boolean> = {},
                    $regex = this.$Regex;

                for (var i = 0; i < length; ++i) {
                    arg = args[i].trim();

                    if (arg[0] === '@') {
                        exec = $regex.aliasRegex.exec(arg);
                        aliases[!isNull(exec) ? exec[0] : arg.substr(1)] = true;
                    }
                }

                return Object.keys(aliases);
            }

            /**
             * @name _parseArgs
             * @memberof plat.controls.SimpleEventControl
             * @kind function
             * @access protected
             * 
             * @description
             * Parses the expression and separates the function 
             * from its arguments.
             * 
             * @param {string} expression The expression to parse.
             * 
             * @returns {void}
             */
            _parseArgs(expression: string): void {
                var exec = this.$Regex.argumentRegex.exec(expression),
                    haveArgs = !isNull(exec);

                if (isEmpty(expression)) {
                    return;
                }

                if (haveArgs) {
                    this._expression = [expression.slice(0, exec.index)]
                        .concat((exec[1] !== '') ? exec[1].split(',') : []);
                } else {
                    this._expression.push(expression);
                }

                this._aliases = this._findAliases(this._expression);
            }
        }

        /**
         * @name ISimpleEventControl
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.IAttributeControl}
         * 
         * @description
         * An {@link plat.controls.IAttributeControl|IAttributeControl} that binds to a specified DOM event handler.
         */
        export interface ISimpleEventControl extends IAttributeControl {
            /**
             * @name event
             * @memberof plat.controls.ISimpleEventControl
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string;

            /**
             * @name attribute
             * @memberof plat.controls.ISimpleEventControl
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The camel-cased name of the control as it appears as an attribute.
             */
            attribute: string;
        }

        /**
         * @name Tap
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$tap' event.
         */
        export class Tap extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.Tap
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$tap;
        }

        /**
         * @name Blur
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the 'blur' event.
         */
        export class Blur extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.Blur
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = 'blur';
        }

        /**
         * @name Change
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the 'change' event.
         */
        export class Change extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.Change
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = 'change';
        }

        /**
         * @name Copy
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the 'copy' event.
         */
        export class Copy extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.Copy
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = 'copy';
        }

        /**
         * @name Cut
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the 'cut' event.
         */
        export class Cut extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.Cut
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = 'cut';
        }

        /**
         * @name Paste
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the 'paste' event.
         */
        export class Paste extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.Paste
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = 'paste';
        }

        /**
         * @name DblTap
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$dbltap' event.
         */
        export class DblTap extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.DblTap
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$dbltap;
        }

        /**
         * @name Focus
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the 'focus' event.
         */
        export class Focus extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.Focus
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = 'focus';
        }

        /**
         * @name TouchStart
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$touchstart' event.
         */
        export class TouchStart extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.TouchStart
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$touchstart;
        }

        /**
         * @name TouchEnd
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$touchend' event.
         */
        export class TouchEnd extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.TouchEnd
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$touchend;
        }

        /**
         * @name TouchMove
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$touchmove' event.
         */
        export class TouchMove extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.TouchMove
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$touchmove;
        }

        /**
         * @name TouchCancel
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$touchcancel' event.
         */
        export class TouchCancel extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.TouchCancel
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$touchcancel;
        }

        /**
         * @name Hold
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$hold' event.
         */
        export class Hold extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.Hold
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$hold;
        }

        /**
         * @name Release
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$release' event.
         */
        export class Release extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.Release
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$release;
        }

        /**
         * @name Swipe
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$swipe' event.
         */
        export class Swipe extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.Swipe
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$swipe;
        }

        /**
         * @name SwipeLeft
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$swipeleft' event.
         */
        export class SwipeLeft extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.SwipeLeft
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$swipeleft;
        }

        /**
         * @name SwipeRight
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$swiperight' event.
         */
        export class SwipeRight extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.SwipeRight
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$swiperight;
        }

        /**
         * @name SwipeUp
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$swipeup' event.
         */
        export class SwipeUp extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.SwipeUp
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$swipeup;
        }

        /**
         * @name SwipeDown
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$swipedown' event.
         */
        export class SwipeDown extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.SwipeDown
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$swipedown;
        }

        /**
         * @name Track
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$track' event.
         */
        export class Track extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.Track
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$track;
        }

        /**
         * @name TrackLeft
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$trackleft' event.
         */
        export class TrackLeft extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.TrackLeft
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$trackleft;
        }

        /**
         * @name TrackRight
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$trackright' event.
         */
        export class TrackRight extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.TrackRight
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$trackright;
        }

        /**
         * @name TrackUp
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$trackup' event.
         */
        export class TrackUp extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.TrackUp
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$trackup;
        }

        /**
         * @name TrackDown
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$trackdown' event.
         */
        export class TrackDown extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.TrackDown
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$trackdown;
        }

        /**
         * @name TrackEnd
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the '$trackend' event.
         */
        export class TrackEnd extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.TrackEnd
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = __$trackend;
        }

        /**
         * @name Submit
         * @memberof plat.controls
         * @kind class
         * 
         * @extends {plat.controls.SimpleEventControl}
         * 
         * @description
         * A {@link plat.controls.SimpleEventControl|SimpleEventControl} for the 'submit' event.
         */
        export class Submit extends SimpleEventControl {
            /**
             * @name event
             * @memberof plat.controls.Submit
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event name.
             */
            event: string = 'submit';

            /**
             * @name _onEvent
             * @memberof plat.controls.SimpleEventControl
             * @kind function
             * @access protected
             * 
             * @description
             * Prevents the default submit action unless 
             * the "action" attribute is present.
             * 
             * @param {Event} ev The event object.
             */
            _onEvent(ev: Event): void {
                if (!this.element.hasAttribute('action')) {
                    ev.preventDefault();
                }

                super._onEvent(ev);
            }
        }

        register.control(__Tap, Tap);
        register.control(__Blur, Blur);
        register.control(__Change, Change);
        register.control(__Copy, Copy);
        register.control(__Cut, Cut);
        register.control(__Paste, Paste);
        register.control(__DblTap, DblTap);
        register.control(__Focus, Focus);
        register.control(__Submit, Submit);
        register.control(__TouchStart, TouchStart);
        register.control(__TouchEnd, TouchEnd);
        register.control(__TouchMove, TouchMove);
        register.control(__TouchCancel, TouchCancel);
        register.control(__Hold, Hold);
        register.control(__Release, Release);
        register.control(__Swipe, Swipe);
        register.control(__SwipeLeft, SwipeLeft);
        register.control(__SwipeRight, SwipeRight);
        register.control(__SwipeUp, SwipeUp);
        register.control(__SwipeDown, SwipeDown);
        register.control(__Track, Track);
        register.control(__TrackLeft, TrackLeft);
        register.control(__TrackRight, TrackRight);
        register.control(__TrackUp, TrackUp);
        register.control(__TrackDown, TrackDown);
        register.control(__TrackEnd, TrackEnd);
    }

    /**
     * @name plat
     * @memberof plat
     * @kind namespace
     * 
     * @description
     * Holds classes and interfaces related to dependency injection.
     */
    export module dependency {
        /**
         * @name Injector
         * @memberof plat.dependency
         * @kind class
         * 
         * @implements {plat.dependency.IInjector}
         * 
         * @description
         * The Injector class is used for dependency injection. You can create an injector object,
         * specify dependencies and a constructor for your component. When the injector object is
         * 'injected' it will create a new instance of your component and pass in the dependencies
         * to the constructor.
         * 
         * @typeparam {any} T The type of object that will be returned when the inject method is invoked.
         */
        export class Injector<T> implements IInjector<T> {
            /**
             * @name initialize
             * @memberof plat.dependency.Injector
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Initializes all static injectors.
             * 
             * @returns {void}
             */
            static initialize(): void {
                var injectors = staticInjectors,
                    keys = Object.keys(injectors),
                    length = keys.length;

                for (var i = 0; i < length; ++i) {
                    injectors[keys[i]].inject();
                }

                staticInjectors = {};
            }

            /**
             * @name getDependencies
             * @memberof plat.dependency.Injector
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Gathers and returns the array of listed dependencies.
             * 
             * @param {Array<any>} dependencies The array of dependencies specified 
             * by either their Constructor or their registered name.
             * 
             * @returns {Array<plat.dependency.IInjecor<any>>} The dependencies
             */
            static getDependencies(dependencies: Array<any>): Array<IInjector<any>> {
                if (isNull(dependencies) || isEmpty(dependencies)) {
                    return [];
                }

                var deps: Array<IInjector<any>> = [],
                    length = dependencies.length;

                for (var i = 0; i < length; ++i) {
                    deps.push(Injector.getDependency(dependencies[i]));
                }

                return deps;
            }

            /**
             * @name getDependency
             * @memberof plat.dependency.Injector
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Finds and returns the dependency.
             * 
             * @param {any} dependency an object/string used to find the dependency.
             * 
             * @returns {plat.dependency.IInjector<any>} The dependency
             */
            static getDependency(dependency: any): IInjector<any> {
                if (isNull(dependency) || dependency === __noopInjector) {
                    return Injector.__noop();
                } else if (Injector.isInjector(dependency)) {
                    return dependency;
                }

                return Injector.__locateInjector(dependency);
            }

            /**
             * @name convertDependencies
             * @memberof plat.dependency.Injector
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Converts dependencies specified by their Constructors into 
             * equivalent dependencies specified by their registered string 
             * name.
             * 
             * @param {Array<any>} dependencies The array of dependencies specified 
             * by either their Constructor or their registered name.
             * 
             * @returns {Array<string>} The dependency strings.
             */
            static convertDependencies(dependencies: Array<any>): Array<string> {
                if (!isArray(dependencies)) {
                    return [];
                }
                var deps: Array<string> = [],
                    length = dependencies.length,
                    dependency: any,
                    value: string;

                for (var i = 0; i < length; ++i) {
                    dependency = dependencies[i];

                    if (isNull(dependency)) {
                        deps.push('noop');
                        continue;
                    }

                    value = Injector.__getInjectorName(dependency);

                    deps.push(value);
                }

                return deps;
            }

            /**
             * @name isInjector
             * @memberof plat.dependency.Injector
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Checks if the object being passed in fulfills the requirements for being an Injector.
             * 
             * @param {plat.dependency.Injector<any>} dependency The object to check.
             * 
             * @returns {boolean} Whether or not the object passed in is an injector.
             */
            static isInjector(dependency: Injector<any>): boolean {
                return isFunction(dependency.inject) &&
                    !isUndefined(dependency.type) &&
                    !isUndefined(dependency.name) &&
                    !isUndefined(dependency.Constructor);
            }

            /**
             * @name __getInjectorName
             * @memberof plat.dependency.Injector
             * @kind function
             * @access private
             * @static
             * 
             * @description
             * Gets the string name related to an injector.
             * 
             * @param {any} dependency The object to search for.
             * 
             * @returns {string} The string injector name
             */
            private static __getInjectorName(dependency: any): string {
                if (isNull(dependency)) {
                    return __noopInjector;
                } else if (isString(dependency)) {
                    return dependency;
                } else if (dependency === window) {
                    return __Window;
                } else if (dependency === window.document) {
                    return __Document;
                }

                var injectors = injectableInjectors,
                    injector: IInjector<any>,
                    keys = Object.keys(injectors),
                    length = keys.length,
                    key: string,
                    value: any;

                for (var i = 0; i < length; ++i) {
                    key = keys[i];
                    injector = injectors[key];

                    value = injector.Constructor;

                    if (value === dependency) {
                        return key;
                    }
                }

                return __noopInjector;
            }

            /**
             * @name __construct
             * @memberof plat.dependency.Injector
             * @kind function
             * @access private
             * @static
             * 
             * @description
             * Calls the injector's constructor with the associated dependencies.
             * 
             * @param {any} Constructor The Constructor to call.
             * @param {Array<any>} args The arguments to pass to the constructor.
             * 
             * @returns {any} The instantiated constructor.
             */
            private static __construct(Constructor: any, args: Array<any>): any {
                if (isNull(Constructor) || isNull(Constructor.prototype)) {
                    return Constructor;
                }
                var obj = Object.create(Constructor.prototype),
                    ret = obj.constructor.apply(obj, args);

                if (!isUndefined(ret)) {
                    return ret;
                }

                return obj;
            }

            /**
             * @name __locateInjector
             * @memberof plat.dependency.Injector
             * @kind function
             * @access private
             * @static
             * 
             * @description
             * Finds an injector object with the associated constructor.
             * 
             * @param {any} Constructor The Constructor to locate.
             * 
             * @returns {any} The located injector.
             */
            private static __locateInjector(Constructor: any): any {
                if (isNull(Constructor)) {
                    return;
                } else if (isString(Constructor)) {
                    return injectableInjectors[Constructor] || Injector.__noop();
                } else if (Constructor === window) {
                    return (<any>injectableInjectors).$Window;
                } else if (Constructor === window.document) {
                    return (<any>injectableInjectors).$Document;
                }

                var injectors = injectableInjectors,
                    injector: IInjector<any>,
                    keys = Object.keys(injectors),
                    length = keys.length;

                for (var i = 0; i < length; ++i) {
                    injector = injectors[keys[i]];

                    if (injector.Constructor === Constructor) {
                        return injector;
                    }
                }

                return Injector.__wrap(Constructor);
            }

            /**
             * @name __wrap
             * @memberof plat.dependency.Injector
             * @kind function
             * @access private
             * @static
             * 
             * @description
             * Once an injector is injected, it is wrapped to prevent further injection.
             * 
             * @param {any} value The injected value.
             * 
             * @returns {plat.dependency.IInjector<any>} The wrapped injector.
             */
            private static __wrap(value: any): IInjector<any> {
                return {
                    inject: () => value,
                    name: 'wrapped',
                    __dependencies: [],
                    Constructor: value
                };
            }

            /**
             * @name __noop
             * @memberof plat.dependency.Injector
             * @kind function
             * @access private
             * @static
             * 
             * @description
             * Returns an empty injector object.
             * 
             * @returns {plat.dependency.IInjector<any>} The noop injector.
             */
            private static __noop(): IInjector<any> {
                return {
                    inject: noop,
                    type: __noopInjector,
                    name: __noopInjector,
                    __dependencies: [],
                    Constructor: <any>noop
                };
            }

            /**
             * @name __findCircularReferences
             * @memberof plat.dependency.Injector
             * @kind function
             * @access private
             * @static
             * 
             * @description
             * Determines if there is a circular dependency in a dependency tree.
             * 
             * @param {plat.dependency.Injector<any>} injector The starting point for the dependency tree search.
             * 
             * @returns {string} The end of the circular dependency chain, if one exists.
             */
            private static __findCircularReferences(injector: Injector<any>): string {
                if (!(isObject(injector) && isArray(injector.__dependencies))) {
                    return;
                }

                var source = injector.name,
                    dependencies = injector.__dependencies,
                    node: {
                        name: string;
                        dependencies: Array<string>;
                    },
                    stack: Array<typeof node> = [{
                        name: source,
                        dependencies: dependencies.slice(0)
                    }],
                    dependency: string,
                    locate = Injector.__locateInjector,
                    length: number;

                while (stack.length > 0) {
                    node = stack.pop();

                    dependencies = node.dependencies;
                    length = dependencies.length;

                    for (var i = 0; i < length; ++i) {
                        dependency = dependencies[i];

                        if (dependency === source) {
                            return node.name;
                        }

                        injector = locate(dependency);

                        if (!(isObject(injector) && isArray(injector.__dependencies))) {
                            continue;
                        }

                        stack.push({
                            name: injector.name,
                            dependencies: injector.__dependencies.slice(0)
                        });
                    }
                }
            }

            /**
             * @name __dependencies
             * @memberof plat.dependency.Injector
             * @kind property
             * @access private
             * 
             * @type {Array<string>}
             * 
             * @description
             * The dependencies for this injector
             */
            private __dependencies: Array<string>;

            /**
             * @name constructor
             * @memberof plat.dependency.Injector
             * @kind function
             * @access public
             * 
             * @description
             * The constructor for an injector. Converts any non-string dependencies to strings to support mocking Injectors during runtime.
             * 
             * @param {string} name The name of the injected type.
             * @param {new () => T} Constructor The constructor method for the component requiring the dependency 
             * injection.
             * @param {Array<any>} dependencies An array of strings specifying the injectable dependencies for the 
             * associated constructor.
             * @param {string} type The type of injector, used for injectables specifying a injectableType of 
             * STATIC, SINGLETON, FACTORY, INSTANCE, or CLASS. The default is SINGLETON.
             * 
             * @returns {plat.dependency.Injector}
             */
            constructor(public name: string, public Constructor: new () => T, dependencies?: Array<any>, public type: string = null) {
                var deps = this.__dependencies = Injector.convertDependencies(dependencies),
                    index = deps.indexOf(__noopInjector),
                    circularReference: string;

                if (index > -1) {
                    var dependency = dependencies[index];

                    if (isNull(dependency)) {
                        throw new TypeError('The dependency for ' +
                            name + ' at index ' +
                            index + ' is undefined, did you forgot to include a file?');
                    }

                    throw new TypeError('Could not resolve dependency ' +
                        dependency.substring(9, dependency.indexOf('(')) +
                        ' for ' +
                        name +
                        '. Are you using a static injectable Type?');
                }

                circularReference = Injector.__findCircularReferences(this);

                if (isString(circularReference)) {
                    throw new Error('Circular dependency detected from ' + name + ' to ' + circularReference + '.');
                }

                if (name === __AppStatic) {
                    var App: IAppStatic = <IAppStatic>(<any>this).inject();
                    this.__dependencies = deps;
                    App.start();
                }
            }

            /**
             * @name inject
             * @memberof plat.dependency.Injector
             * @kind function
             * @access public
             * 
             * @description
             * Gathers the dependencies for the Injector object and creates a new instance of the 
             * Constructor, passing in the dependencies in the order they were specified. If the 
             * Injector contains a Constructor for an injectable and the Constructor is registered 
             * as a SINGLE type it will only inject that injectable once.
             * 
             * @returns {T} The injected object
             */
            inject(): T {
                var toInject: any = [],
                    type = this.type;

                var dependencies = this.__dependencies,
                    length = dependencies.length,
                    dependency: IInjector<any>,
                    injectable: any;

                for (var i = 0; i < length; ++i) {
                    dependency = Injector.getDependency(dependencies[i]);
                    toInject.push(dependency.inject());
                }

                injectable = <T>Injector.__construct(this.Constructor, toInject);

                if (type === __SINGLETON || type === __FACTORY ||
                    type === __STATIC || type === __CLASS) {
                    this._wrapInjector(injectable);
                }

                return injectable;
            }

            /**
             * @name _wrapInjector
             * @memberof plat.dependency.Injector
             * @kind function
             * @access protected
             * 
             * @description
             * Wraps the injector with the instantiated value in the case of a 
             * SINGLE or STATIC type so that it does not re-instantiate.
             * 
             * @param {any} value The value to wrap
             */
            _wrapInjector(value: any): IInjector<any> {
                var name = this.name;
                return injectableInjectors[name] = <IInjector<any>>{
                    type: this.type,
                    name: name,
                    __dependencies: this.__dependencies,
                    Constructor: this.Constructor,
                    inject: () => <T>value
                };
            }
        }

        /**
         * @name IInjectorObject
         * @memberof plat.dependency
         * @kind interface
         * @access public
         * 
         * @description
         * An object whose values are all {@link plat.dependency.IInjector|IInjectors}.
         */
        export interface IInjectorObject<T> extends IObject<IInjector<T>> { }

        /**
         * @name IInjector
         * @memberof plat.dependency
         * @kind class
         * 
         * @description
         * The IInjector interface is used for dependency injection. You can create an injector object,
         * specify dependencies and a constructor for your component. When the injector object is
         * 'injected' it will create a new instance of your component and pass in the dependencies
         * to the constructor.
         * 
         * @typeparam {any} T The type of object that will be returned when the inject method is invoked.
         */
        export interface IInjector<T> {
            /**
             * @name inject
             * @memberof plat.dependency.IInjector
             * @kind function
             * @access public
             * 
             * @description
             * Gathers the dependencies for the IInjector object and creates a new instance of the 
             * Constructor, passing in the dependencies in the order they were specified. If the 
             * Injector contains a Constructor for an injectable and the Constructor is registered 
             * as a SINGLE type it will only inject that injectable once.
             * 
             * @returns {T} The injected object
             */
            inject(): T;

            /**
             * @name Constructor
             * @memberof plat.dependency.IInjector
             * @kind property
             * @access public
             * 
             * @type {new () => T}
             * 
             * @description
             * The constructor method for the component requiring the dependency injection.
             */
            Constructor: new () => T;

            /**
             * @name type
             * @memberof plat.dependency.IInjector
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The type of injector, used for injectables specifying a register.injectableType of 
             * STATIC, SINGLE, or MULTI. The default is SINGLE.
             */
            type?: string;

            /**
             * @name name
             * @memberof plat.dependency.IInjector
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The name registered for the injector.
             */
            name: string;
        }
    }

    /**
     * @name events
     * @memberof plat
     * @kind namespace
     * 
     * @description
     * Holds classes and interfaces related to event management.
     */
    export module events {
        /**
         * @name DispatchEvent
         * @memberof plat.events
         * @kind class
         * 
         * @implements {plat.events.IDispatchEventInstance}
         * 
         * @description
         * An event class that propagates through a control tree. 
         * Propagation of the event always starts at the sender, allowing a control to both 
         * initialize and consume an event. If a consumer of an event throws an error while 
         * handling the event it will be logged to the app using exception.warn. Errors will 
         * not stop propagation of the event.
         */
        export class DispatchEvent implements IDispatchEventInstance {
            /**
             * @name $EventManagerStatic
             * @memberof plat.events.DispatchEvent
             * @kind property
             * @access public
             * 
             * @type {plat.events.IEventManagerStatic}
             * 
             * @description
             * Reference to the {@link plat.events.IEventManagerStatic|IEventManagerStatic} injectable.
             */
            $EventManagerStatic: IEventManagerStatic = acquire(__EventManagerStatic);

            /**
             * @name sender
             * @memberof plat.events.DispatchEvent
             * @kind property
             * @access public
             * 
             * @type {any}
             * 
             * @description
             * The object that initiated the event.
             */
            sender: any;

            /**
             * @name name
             * @memberof plat.events.DispatchEvent
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The name of the event.
             */
            name: string;

            /**
             * @name direction
             * @memberof plat.events.DispatchEvent
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event direction this object is using for propagation.
             */
            direction: string;

            /**
             * @name initialize
             * @memberof plat.events.DispatchEvent
             * @kind function
             * @access public
             * @variation 0
             * 
             * @description
             * Initializes the event, populating its public properties.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The object that initiated the event.
             * @param {string} direction='up' Equivalent to {@link plat.events.EventManager.UP|EventManager.UP}.
             * 
             * @returns {void}
             */
            initialize(name: string, sender: any, direction?: 'up'): void;
            /**
             * @name initialize
             * @memberof plat.events.DispatchEvent
             * @kind function
             * @access public
             * @variation 1
             * 
             * @description
             * Initializes the event, populating its public properties.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The object that initiated the event.
             * @param {string} direction='down' Equivalent to {@link plat.events.EventManager.DOWN|EventManager.DOWN}.
             * 
             * @returns {void}
             */
            initialize(name: string, sender: any, direction?: 'down'): void;
            /**
             * @name initialize
             * @memberof plat.events.DispatchEvent
             * @kind function
             * @access public
             * @variation 2
             * 
             * @description
             * Initializes the event, populating its public properties.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The object that initiated the event.
             * @param {string} direction='direct' Equivalent to {@link plat.events.EventManager.DIRECT|EventManager.DIRECT}.
             * 
             * @returns {void}
             */
            initialize(name: string, sender: any, direction?: 'direct'): void;
            /**
             * @name initialize
             * @memberof plat.events.DispatchEvent
             * @kind function
             * @access public
             * @variation 3
             * 
             * @description
             * Initializes the event, populating its public properties.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The object that initiated the event.
             * @param {string} direction The direction of propagation
             * 
             * @returns {void}
             */
            initialize(name: string, sender: any, direction?: string): void;
            initialize(name: string, sender: any, direction?: string) {
                this.name = name;
                this.direction = direction || this.$EventManagerStatic.DIRECT;
                this.sender = sender;
            }

            /**
             * @name stopPropagation
             * @memberof plat.events.DispatchEvent
             * @kind function
             * @access public
             * 
             * @description
             * Call this method to halt the propagation of an upward-moving event.
             * Downward events cannot be stopped with this method.
             * 
             * @returns {void}
             */
            stopPropagation(): void {
                if (this.direction === this.$EventManagerStatic.UP) {
                    (<any>this.$EventManagerStatic.propagatingEvents)[this.name] = false;
                }
            }
        }

        /**
         * The Type for referencing the '$DispatchEventInstance' injectable as a dependency.
         */
        export function IDispatchEventInstance(): IDispatchEventInstance {
            return new DispatchEvent();
        }

        register.injectable(__DispatchEventInstance, IDispatchEventInstance, null, __INSTANCE);

        /**
         * @name IDispatchEvent
         * @memberof plat.events
         * @kind interface
         * 
         * @description
         * Describes an event that propagates through a control tree. 
         * Propagation of the event always starts at the sender, allowing a control to both 
         * initialize and consume an event. If a consumer of an event throws an error while 
         * handling the event it will be logged to the app using exception.warn. Errors will 
         * not stop propagation of the event.
         */
        export interface IDispatchEventInstance {
            /**
             * @name sender
             * @memberof plat.events.IDispatchEventInstance
             * @kind property
             * @access public
             * 
             * @type {any}
             * 
             * @description
             * The object that initiated the event.
             */
            sender: any;

            /**
             * @name name
             * @memberof plat.events.IDispatchEventInstance
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The name of the event.
             */
            name: string;

            /**
             * @name direction
             * @memberof plat.events.IDispatchEventInstance
             * @kind property
             * @access public
             * 
             * @type {string}
             * 
             * @description
             * The event direction this object is using for propagation.
             */
            direction: string;

            /**
             * @name initialize
             * @memberof plat.events.IDispatchEventInstance
             * @kind function
             * @access public
             * @variation 0
             * 
             * @description
             * Initializes the event, populating its public properties.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The object that initiated the event.
             * @param {string} direction='up' Equivalent to {@link plat.events.EventManager.UP|EventManager.UP}.
             * 
             * @returns {void}
             */
            initialize(name: string, sender: any, direction?: 'up'): void;
            /**
             * @name initialize
             * @memberof plat.events.IDispatchEventInstance
             * @kind function
             * @access public
             * @variation 1
             * 
             * @description
             * Initializes the event, populating its public properties.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The object that initiated the event.
             * @param {string} direction='down' Equivalent to {@link plat.events.EventManager.DOWN|EventManager.DOWN}.
             * 
             * @returns {void}
             */
            initialize(name: string, sender: any, direction?: 'down'): void;
            /**
             * @name initialize
             * @memberof plat.events.IDispatchEventInstance
             * @kind function
             * @access public
             * @variation 2
             * 
             * @description
             * Initializes the event, populating its public properties.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The object that initiated the event.
             * @param {string} direction='direct' Equivalent to {@link plat.events.EventManager.DIRECT|EventManager.DIRECT}.
             * 
             * @returns {void}
             */
            initialize(name: string, sender: any, direction?: 'direct'): void;
            /**
             * @name initialize
             * @memberof plat.events.IDispatchEventInstance
             * @kind function
             * @access public
             * @variation 3
             * 
             * @description
             * Initializes the event, populating its public properties.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The object that initiated the event.
             * @param {string} direction The direction of propagation
             * 
             * @returns {void}
             */
            initialize(name: string, sender: any, direction?: string): void;

            /**
             * @name stopPropagation
             * @memberof plat.events.IDispatchEventInstance
             * @kind function
             * @access public
             * 
             * @description
             * Call this method to halt the propagation of an upward-moving event.
             * Downward events cannot be stopped with this method.
             * 
             * @returns {void}
             */
            stopPropagation(): void;
        }
        /**
     * @name ErrorEvent
     * @memberof plat.events
     * @kind class
     * 
     * @extends {plat.events.DispatchEvent}
     * @implements {plat.events.IErrorEvent}
     * 
     * @description
     * Represents an internal Error Event. This is used for any 
     * internal errors (both fatal and warnings). All error events are 
     * direct events.
     * 
     * @typeparam {Error} E The type of Error this event represents.
     */
        export class ErrorEvent<E extends Error> extends DispatchEvent implements IErrorEvent<E> {
            /**
             * @name $EventManagerStatic
             * @memberof plat.events.ErrorEvent
             * @kind property
             * @access public
             * @static
             * 
             * @type {plat.events.IEventManagerStatic}
             * 
             * @description
             * Reference to the {@link plat.events.IEventManagerStatic|IEventManagerStatic} injectable.
             */
            static $EventManagerStatic: IEventManagerStatic;

            /**
             * @name dispatch
             * @memberof plat.events.ErrorEvent
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Creates a new ErrorEvent and fires it.
             * 
             * @typeparam {Error} E The type of Error this event represents.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The sender of the event.
             * @param {E} error The error that occurred, resulting in the event.
             * 
             * @returns {void}
             */
            static dispatch<E extends Error>(name: string, sender: any, error: E): void {
                var event = new ErrorEvent<E>();

                event.initialize(name, sender, null, error);
                ErrorEvent.$EventManagerStatic.sendEvent(event);
            }

            /**
             * @name error
             * @memberof plat.events.ErrorEvent
             * @kind property
             * @access public
             * @static
             * 
             * @type {E}
             * 
             * @description
             * The error being dispatched.
             */
            error: E;

            /**
             * @name initialize
             * @memberof plat.events.ErrorEvent
             * @kind function
             * @access public
             * 
             * @description
             * Initializes the event, populating its public properties.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The sender of the event.
             * @param {string} direction='direct' Equivalent to {@link plat.events.EventManager.DIRECT|EventManager.DIRECT}.
             * @param {E} error The error that occurred, resulting in the event.
             * 
             * @returns {void}
             */
            initialize(name: string, sender: any, direction?: 'direct', error?: E): void;
            /**
             * @name initialize
             * @memberof plat.events.ErrorEvent
             * @kind function
             * @access public
             * 
             * @description
             * Initializes the event, populating its public properties.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The sender of the event.
             * @param {string} direction This is always a direct event.
             * @param {E} error The error that occurred, resulting in the event.
             * 
             * @returns {void}
             */
            initialize(name: string, sender: any, direction?: string, error?: E): void;
            initialize(name: string, sender: any, direction?: string, error?: E) {
                super.initialize(name, sender, this.$EventManagerStatic.DIRECT);

                this.error = error;
            }
        }

        /**
         * The Type for referencing the '$ErrorEventStatic' injectable as a dependency.
         */
        export function IErrorEventStatic($EventManagerStatic?: IEventManagerStatic): IErrorEventStatic {
            ErrorEvent.$EventManagerStatic = $EventManagerStatic;
            return ErrorEvent;
        }

        register.injectable(__ErrorEventStatic, IErrorEventStatic, [__EventManagerStatic], __STATIC);

        /**
         * @name IErrorEventStatic
         * @memberof plat.events
         * @kind interface
         * 
         * @description
         * Dispatches {@link plat.events.ErrorEvent|ErrorEvents}
         */
        export interface IErrorEventStatic {
            /**
             * @name dispatch
             * @memberof plat.events.IErrorEventStatic
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Creates a new ErrorEvent and fires it.
             * 
             * @typeparam {Error} E The type of Error this event represents.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The sender of the event.
             * @param {E} error The error that occurred, resulting in the event.
             * 
             * @returns {void}
             */
            dispatch<E extends Error>(name: string, sender: any, error: E): void;
        }

        /**
         * @name IErrorEvent
         * @memberof plat.events
         * @kind interface
         * 
         * @extends {plat.events.IDispatchEventInstance}
         * 
         * @description
         * Represents an internal Error Event. This is used for any 
         * internal errors (both fatal and warnings). All error events are 
         * direct events.
         * 
         * @typeparam {Error} E The type of Error this event represents.
         */
        export interface IErrorEvent<E extends Error> extends IDispatchEventInstance {
            /**
             * @name error
             * @memberof plat.events.IErrorEvent
             * @kind property
             * @access public
             * @static
             * 
             * @type {E}
             * 
             * @description
             * The error being dispatched.
             */
            error: E;

            /**
             * @name initialize
             * @memberof plat.events.IErrorEvent
             * @kind function
             * @access public
             * 
             * @description
             * Initializes the event, populating its public properties.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The sender of the event.
             * @param {string} direction='direct' Equivalent to {@link plat.events.EventManager.DIRECT|EventManager.DIRECT}.
             * @param {E} error The error that occurred, resulting in the event.
             * 
             * @returns {void}
             */
            initialize(name: string, sender: any, direction?: 'direct', error?: E): void;
            /**
             * @name initialize
             * @memberof plat.events.IErrorEvent
             * @kind function
             * @access public
             * 
             * @description
             * Initializes the event, populating its public properties.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The sender of the event.
             * @param {string} direction This is always a direct event.
             * @param {E} error The error that occurred, resulting in the event.
             * 
             * @returns {void}
             */
            initialize(name: string, sender: any, direction?: string, error?: E): void;
        }
        /**
     * @name LifecycleEvent
     * @memberof plat.events
     * @kind class
     * 
     * @extends {plat.events.DispatchEvent}
     * @implements {plat.events.ILifecycleEvent}
     * 
     * @description
     * Represents a Lifecycle Event. Lifecycle Events are always direct events.
     */
        export class LifecycleEvent extends DispatchEvent implements ILifecycleEvent {
            /**
             * @name dispatch
             * @memberof plat.events.LifecycleEvent
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Creates a new LifecycleEvent and fires it.
             * 
             * @typeparam {Error} E The type of Error this event represents.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The sender of the event.
             * 
             * @returns {void}
             */
            static dispatch(name: string, sender: any): void {
                var event = new LifecycleEvent();

                event.initialize(name, sender);
                EventManager.sendEvent(event);
            }

            /**
             * @name initialize
             * @memberof plat.events.LifecycleEvent
             * @kind function
             * @access public
             * 
             * @description
             * Initializes the event, populating its public properties.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The sender of the event.
             */
            initialize(name: string, sender: any): void {
                super.initialize(name, sender, this.$EventManagerStatic.DIRECT);
            }
        }

        /**
         * The Type for referencing the '$LifecycleEventStatic' injectable as a dependency.
         */
        export function ILifecycleEventStatic(): ILifecycleEventStatic {
            return LifecycleEvent;
        }

        register.injectable(__LifecycleEventStatic, ILifecycleEventStatic, null, __STATIC);

        /**
         * @name IErrorEventStatic
         * @memberof plat.events
         * @kind interface
         * 
         * @description
         * Dispatches {@link plat.events.LifecycleEvent|LifecycleEvent}
         */
        export interface ILifecycleEventStatic {
            /**
             * @name dispatch
             * @memberof plat.events.ILifecycleEvent
             * @kind function
             * @access public
             * @static
             * 
             * @description
             * Creates a new LifecycleEvent and fires it.
             * 
             * @typeparam {Error} E The type of Error this event represents.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The sender of the event.
             * 
             * @returns {void}
             */
            dispatch(name: string, sender: any): void;
        }

        /**
         * @name ILifecycleEvent
         * @memberof plat.events
         * @kind interface
         * 
         * @extends {plat.events.IDispatchEventInstance}
         * 
         * @description
         * Represents a Lifecycle Event. Lifecycle Events are always direct events.
         */
        export interface ILifecycleEvent extends IDispatchEventInstance {
            /**
             * @name initialize
             * @memberof plat.events.ILifecycleEvent
             * @kind function
             * @access public
             * 
             * @description
             * Initializes the event, populating its public properties.
             * 
             * @param {string} name The name of the event.
             * @param {any} sender The sender of the event.
             * 
             * @returns {void}
             */
            initialize(name: string, sender: any): void;
        }
    }
}