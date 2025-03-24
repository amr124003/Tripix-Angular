declare module 'leaflet-routing-machine' {
    import * as L from 'leaflet';
    
    namespace Routing {
        function control(options?: any): any;
    }

    export = Routing;
}