'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">Eventer API Documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-ac3768a68711e0438d9ba9babbbe04f58d4d3b8f2ffb406abceb7b02f2c905b85f827219f7f07ec028188e50bbd0f2878fe413cd5d02709aaf8bd467632b1266"' : 'data-bs-target="#xs-controllers-links-module-AppModule-ac3768a68711e0438d9ba9babbbe04f58d4d3b8f2ffb406abceb7b02f2c905b85f827219f7f07ec028188e50bbd0f2878fe413cd5d02709aaf8bd467632b1266"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-ac3768a68711e0438d9ba9babbbe04f58d4d3b8f2ffb406abceb7b02f2c905b85f827219f7f07ec028188e50bbd0f2878fe413cd5d02709aaf8bd467632b1266"' :
                                            'id="xs-controllers-links-module-AppModule-ac3768a68711e0438d9ba9babbbe04f58d4d3b8f2ffb406abceb7b02f2c905b85f827219f7f07ec028188e50bbd0f2878fe413cd5d02709aaf8bd467632b1266"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-ac3768a68711e0438d9ba9babbbe04f58d4d3b8f2ffb406abceb7b02f2c905b85f827219f7f07ec028188e50bbd0f2878fe413cd5d02709aaf8bd467632b1266"' : 'data-bs-target="#xs-injectables-links-module-AppModule-ac3768a68711e0438d9ba9babbbe04f58d4d3b8f2ffb406abceb7b02f2c905b85f827219f7f07ec028188e50bbd0f2878fe413cd5d02709aaf8bd467632b1266"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-ac3768a68711e0438d9ba9babbbe04f58d4d3b8f2ffb406abceb7b02f2c905b85f827219f7f07ec028188e50bbd0f2878fe413cd5d02709aaf8bd467632b1266"' :
                                        'id="xs-injectables-links-module-AppModule-ac3768a68711e0438d9ba9babbbe04f58d4d3b8f2ffb406abceb7b02f2c905b85f827219f7f07ec028188e50bbd0f2878fe413cd5d02709aaf8bd467632b1266"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-a3d1db6a05e7eff53cb3e3639cefc980f44ad09a0a16f8d82c8fac3c66258217d91557919e0479d6c176a726df68c985882ee299ab07a5c5833d1acbdf872eb3"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-a3d1db6a05e7eff53cb3e3639cefc980f44ad09a0a16f8d82c8fac3c66258217d91557919e0479d6c176a726df68c985882ee299ab07a5c5833d1acbdf872eb3"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-a3d1db6a05e7eff53cb3e3639cefc980f44ad09a0a16f8d82c8fac3c66258217d91557919e0479d6c176a726df68c985882ee299ab07a5c5833d1acbdf872eb3"' :
                                            'id="xs-controllers-links-module-AuthModule-a3d1db6a05e7eff53cb3e3639cefc980f44ad09a0a16f8d82c8fac3c66258217d91557919e0479d6c176a726df68c985882ee299ab07a5c5833d1acbdf872eb3"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-a3d1db6a05e7eff53cb3e3639cefc980f44ad09a0a16f8d82c8fac3c66258217d91557919e0479d6c176a726df68c985882ee299ab07a5c5833d1acbdf872eb3"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-a3d1db6a05e7eff53cb3e3639cefc980f44ad09a0a16f8d82c8fac3c66258217d91557919e0479d6c176a726df68c985882ee299ab07a5c5833d1acbdf872eb3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-a3d1db6a05e7eff53cb3e3639cefc980f44ad09a0a16f8d82c8fac3c66258217d91557919e0479d6c176a726df68c985882ee299ab07a5c5833d1acbdf872eb3"' :
                                        'id="xs-injectables-links-module-AuthModule-a3d1db6a05e7eff53cb3e3639cefc980f44ad09a0a16f8d82c8fac3c66258217d91557919e0479d6c176a726df68c985882ee299ab07a5c5833d1acbdf872eb3"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CategoriesModule.html" data-type="entity-link" >CategoriesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CategoriesModule-4cea64a0f61d3b040ec010bb60f2af8447f769a78f6abedda94c4e79963f9bd1bedef19c14ec1718b3ac69a7282e1c1e278d7f09cf49537f85bcd72cf895d17c"' : 'data-bs-target="#xs-controllers-links-module-CategoriesModule-4cea64a0f61d3b040ec010bb60f2af8447f769a78f6abedda94c4e79963f9bd1bedef19c14ec1718b3ac69a7282e1c1e278d7f09cf49537f85bcd72cf895d17c"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CategoriesModule-4cea64a0f61d3b040ec010bb60f2af8447f769a78f6abedda94c4e79963f9bd1bedef19c14ec1718b3ac69a7282e1c1e278d7f09cf49537f85bcd72cf895d17c"' :
                                            'id="xs-controllers-links-module-CategoriesModule-4cea64a0f61d3b040ec010bb60f2af8447f769a78f6abedda94c4e79963f9bd1bedef19c14ec1718b3ac69a7282e1c1e278d7f09cf49537f85bcd72cf895d17c"' }>
                                            <li class="link">
                                                <a href="controllers/CategoriesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoriesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CategoriesModule-4cea64a0f61d3b040ec010bb60f2af8447f769a78f6abedda94c4e79963f9bd1bedef19c14ec1718b3ac69a7282e1c1e278d7f09cf49537f85bcd72cf895d17c"' : 'data-bs-target="#xs-injectables-links-module-CategoriesModule-4cea64a0f61d3b040ec010bb60f2af8447f769a78f6abedda94c4e79963f9bd1bedef19c14ec1718b3ac69a7282e1c1e278d7f09cf49537f85bcd72cf895d17c"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CategoriesModule-4cea64a0f61d3b040ec010bb60f2af8447f769a78f6abedda94c4e79963f9bd1bedef19c14ec1718b3ac69a7282e1c1e278d7f09cf49537f85bcd72cf895d17c"' :
                                        'id="xs-injectables-links-module-CategoriesModule-4cea64a0f61d3b040ec010bb60f2af8447f769a78f6abedda94c4e79963f9bd1bedef19c14ec1718b3ac69a7282e1c1e278d7f09cf49537f85bcd72cf895d17c"' }>
                                        <li class="link">
                                            <a href="injectables/CategoriesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoriesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EventsModule.html" data-type="entity-link" >EventsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-EventsModule-726cc37823b17783514497fdf901cead40d93d1817c7e67728e339a58ae7500cd88eda79f974a27bfa52c79e38665fe8ab53f480f24bf78757b2eccc7089287d"' : 'data-bs-target="#xs-controllers-links-module-EventsModule-726cc37823b17783514497fdf901cead40d93d1817c7e67728e339a58ae7500cd88eda79f974a27bfa52c79e38665fe8ab53f480f24bf78757b2eccc7089287d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-EventsModule-726cc37823b17783514497fdf901cead40d93d1817c7e67728e339a58ae7500cd88eda79f974a27bfa52c79e38665fe8ab53f480f24bf78757b2eccc7089287d"' :
                                            'id="xs-controllers-links-module-EventsModule-726cc37823b17783514497fdf901cead40d93d1817c7e67728e339a58ae7500cd88eda79f974a27bfa52c79e38665fe8ab53f480f24bf78757b2eccc7089287d"' }>
                                            <li class="link">
                                                <a href="controllers/EventsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EventsModule-726cc37823b17783514497fdf901cead40d93d1817c7e67728e339a58ae7500cd88eda79f974a27bfa52c79e38665fe8ab53f480f24bf78757b2eccc7089287d"' : 'data-bs-target="#xs-injectables-links-module-EventsModule-726cc37823b17783514497fdf901cead40d93d1817c7e67728e339a58ae7500cd88eda79f974a27bfa52c79e38665fe8ab53f480f24bf78757b2eccc7089287d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EventsModule-726cc37823b17783514497fdf901cead40d93d1817c7e67728e339a58ae7500cd88eda79f974a27bfa52c79e38665fe8ab53f480f24bf78757b2eccc7089287d"' :
                                        'id="xs-injectables-links-module-EventsModule-726cc37823b17783514497fdf901cead40d93d1817c7e67728e339a58ae7500cd88eda79f974a27bfa52c79e38665fe8ab53f480f24bf78757b2eccc7089287d"' }>
                                        <li class="link">
                                            <a href="injectables/EventsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EventTicketTypesModule.html" data-type="entity-link" >EventTicketTypesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-EventTicketTypesModule-09015859f9e32b5fee2829a299c819641e77fb340f17da039e0f891d3d9fd3f0717bccbfac1f5fb3704a0eb3ff6fae79964001b1cc2b2764521cf3c64fc51617"' : 'data-bs-target="#xs-controllers-links-module-EventTicketTypesModule-09015859f9e32b5fee2829a299c819641e77fb340f17da039e0f891d3d9fd3f0717bccbfac1f5fb3704a0eb3ff6fae79964001b1cc2b2764521cf3c64fc51617"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-EventTicketTypesModule-09015859f9e32b5fee2829a299c819641e77fb340f17da039e0f891d3d9fd3f0717bccbfac1f5fb3704a0eb3ff6fae79964001b1cc2b2764521cf3c64fc51617"' :
                                            'id="xs-controllers-links-module-EventTicketTypesModule-09015859f9e32b5fee2829a299c819641e77fb340f17da039e0f891d3d9fd3f0717bccbfac1f5fb3704a0eb3ff6fae79964001b1cc2b2764521cf3c64fc51617"' }>
                                            <li class="link">
                                                <a href="controllers/EventTicketTypesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventTicketTypesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EventTicketTypesModule-09015859f9e32b5fee2829a299c819641e77fb340f17da039e0f891d3d9fd3f0717bccbfac1f5fb3704a0eb3ff6fae79964001b1cc2b2764521cf3c64fc51617"' : 'data-bs-target="#xs-injectables-links-module-EventTicketTypesModule-09015859f9e32b5fee2829a299c819641e77fb340f17da039e0f891d3d9fd3f0717bccbfac1f5fb3704a0eb3ff6fae79964001b1cc2b2764521cf3c64fc51617"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EventTicketTypesModule-09015859f9e32b5fee2829a299c819641e77fb340f17da039e0f891d3d9fd3f0717bccbfac1f5fb3704a0eb3ff6fae79964001b1cc2b2764521cf3c64fc51617"' :
                                        'id="xs-injectables-links-module-EventTicketTypesModule-09015859f9e32b5fee2829a299c819641e77fb340f17da039e0f891d3d9fd3f0717bccbfac1f5fb3704a0eb3ff6fae79964001b1cc2b2764521cf3c64fc51617"' }>
                                        <li class="link">
                                            <a href="injectables/EventTicketTypesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventTicketTypesService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/EventsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PrismaModule.html" data-type="entity-link" >PrismaModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PrismaModule-7ec46d5213648d6af195ca52dfa87b1c4755e5bf4d88e606af4a6f96fffe160393eacdce8d2a5e5c86609ba2e65e54573d9bd60b03145287dbc37bed02a6aff4"' : 'data-bs-target="#xs-injectables-links-module-PrismaModule-7ec46d5213648d6af195ca52dfa87b1c4755e5bf4d88e606af4a6f96fffe160393eacdce8d2a5e5c86609ba2e65e54573d9bd60b03145287dbc37bed02a6aff4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PrismaModule-7ec46d5213648d6af195ca52dfa87b1c4755e5bf4d88e606af4a6f96fffe160393eacdce8d2a5e5c86609ba2e65e54573d9bd60b03145287dbc37bed02a6aff4"' :
                                        'id="xs-injectables-links-module-PrismaModule-7ec46d5213648d6af195ca52dfa87b1c4755e5bf4d88e606af4a6f96fffe160393eacdce8d2a5e5c86609ba2e65e54573d9bd60b03145287dbc37bed02a6aff4"' }>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TicketsModule.html" data-type="entity-link" >TicketsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-TicketsModule-5b8203fb5247b25cfa489d0b82c4062259a9546f7c7d91b9bcbc669b8cca35f84916ddfc59603582161f46b443c3c564c4572af46f57feb81d868105eda046ce"' : 'data-bs-target="#xs-controllers-links-module-TicketsModule-5b8203fb5247b25cfa489d0b82c4062259a9546f7c7d91b9bcbc669b8cca35f84916ddfc59603582161f46b443c3c564c4572af46f57feb81d868105eda046ce"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-TicketsModule-5b8203fb5247b25cfa489d0b82c4062259a9546f7c7d91b9bcbc669b8cca35f84916ddfc59603582161f46b443c3c564c4572af46f57feb81d868105eda046ce"' :
                                            'id="xs-controllers-links-module-TicketsModule-5b8203fb5247b25cfa489d0b82c4062259a9546f7c7d91b9bcbc669b8cca35f84916ddfc59603582161f46b443c3c564c4572af46f57feb81d868105eda046ce"' }>
                                            <li class="link">
                                                <a href="controllers/TicketsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TicketsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TicketsModule-5b8203fb5247b25cfa489d0b82c4062259a9546f7c7d91b9bcbc669b8cca35f84916ddfc59603582161f46b443c3c564c4572af46f57feb81d868105eda046ce"' : 'data-bs-target="#xs-injectables-links-module-TicketsModule-5b8203fb5247b25cfa489d0b82c4062259a9546f7c7d91b9bcbc669b8cca35f84916ddfc59603582161f46b443c3c564c4572af46f57feb81d868105eda046ce"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TicketsModule-5b8203fb5247b25cfa489d0b82c4062259a9546f7c7d91b9bcbc669b8cca35f84916ddfc59603582161f46b443c3c564c4572af46f57feb81d868105eda046ce"' :
                                        'id="xs-injectables-links-module-TicketsModule-5b8203fb5247b25cfa489d0b82c4062259a9546f7c7d91b9bcbc669b8cca35f84916ddfc59603582161f46b443c3c564c4572af46f57feb81d868105eda046ce"' }>
                                        <li class="link">
                                            <a href="injectables/EventsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TicketsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TicketsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersModule-4d6b04ba7f09f421e0d80821255ce0bd62bd67cf5a3077f0779973d578d8fb7964e485d484397453d30c5367724c672b7dcafd5937e479bdf30257a8c6f4bc86"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-4d6b04ba7f09f421e0d80821255ce0bd62bd67cf5a3077f0779973d578d8fb7964e485d484397453d30c5367724c672b7dcafd5937e479bdf30257a8c6f4bc86"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-4d6b04ba7f09f421e0d80821255ce0bd62bd67cf5a3077f0779973d578d8fb7964e485d484397453d30c5367724c672b7dcafd5937e479bdf30257a8c6f4bc86"' :
                                            'id="xs-controllers-links-module-UsersModule-4d6b04ba7f09f421e0d80821255ce0bd62bd67cf5a3077f0779973d578d8fb7964e485d484397453d30c5367724c672b7dcafd5937e479bdf30257a8c6f4bc86"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-4d6b04ba7f09f421e0d80821255ce0bd62bd67cf5a3077f0779973d578d8fb7964e485d484397453d30c5367724c672b7dcafd5937e479bdf30257a8c6f4bc86"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-4d6b04ba7f09f421e0d80821255ce0bd62bd67cf5a3077f0779973d578d8fb7964e485d484397453d30c5367724c672b7dcafd5937e479bdf30257a8c6f4bc86"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-4d6b04ba7f09f421e0d80821255ce0bd62bd67cf5a3077f0779973d578d8fb7964e485d484397453d30c5367724c672b7dcafd5937e479bdf30257a8c6f4bc86"' :
                                        'id="xs-injectables-links-module-UsersModule-4d6b04ba7f09f421e0d80821255ce0bd62bd67cf5a3077f0779973d578d8fb7964e485d484397453d30c5367724c672b7dcafd5937e479bdf30257a8c6f4bc86"' }>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/CreateCategoryDto.html" data-type="entity-link" >CreateCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateEventDto.html" data-type="entity-link" >CreateEventDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateEventTicketTypeDto.html" data-type="entity-link" >CreateEventTicketTypeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateTicketDto.html" data-type="entity-link" >CreateTicketDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserDto.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SignInDto.html" data-type="entity-link" >SignInDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateCategoryDto.html" data-type="entity-link" >UpdateCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateEventDto.html" data-type="entity-link" >UpdateEventDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateEventTicketTypeDto.html" data-type="entity-link" >UpdateEventTicketTypeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateTicketDto.html" data-type="entity-link" >UpdateTicketDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserDto.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AuthGuard.html" data-type="entity-link" >AuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/RolesGuard.html" data-type="entity-link" >RolesGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});