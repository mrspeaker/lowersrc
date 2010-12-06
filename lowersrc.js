/*
    lowersrc: "Loren Ipsum" for images
    Dynamically created image placeholders.
    v1.0 by Mr Speaker (www.mrspeaker.net)
    Info: http://mrspeaker.github.com/lowersrc/
    Repo: https://github.com/mrspeaker/lowersrc/

    Usage: <img class="lowersrc" width="100" height="150" data-text="Main Image" />
*/
(function(){
    /* Run onload */
    window.addEventListener( "load", function(){
        lowersrc.run();
    }, false );
    
    // 
    var defaultAttrs = {
        "width": 120,
        "height": 150,
        "data-bg": "solid",
        "data-bg-col": "#f5f5f5",
        "data-fg": "cross",
        "data-fg-col": null,
        "data-border": "solid",
        "data-border-col": "#ccc",
        "data-text": null,
        "data-text-col": "#222",
        "data-text-bg-col": null
    };
    
    var lowersrc = {
        selector: "img.lowersrc",
        run: function(){
            this.setDefaults();

            each( document.querySelectorAll( this.selector ), function( item ) {
                this.swapImage( item, this.createImage( item ) );
            }, this );
        },
        swapImage: function( oldImage, newImage ){
            oldImage.setAttribute( "src", newImage.toDataURL() );
        },
        getSettings: function( image ) {
            var settings = mergeObj( {}, defaultAttrs ),
                toCopy = image.getAttribute( 'data-copy' ),
                toCopyImg;
            // Override default settings with attributes from image referenced in data-copy
            if( toCopy ){
                toCopyImg = document.getElementById( toCopy );
                if ( toCopyImg ) {
                    settings = mergeObj( settings, getAttr( toCopyImg ) );
                }
            }
            // Override settings with image attributes
            return mergeObj( settings, getAttr( image ) );
        },
        createImage: function( image ) {
            var _this = this,
                canvas = document.createElement( "canvas" ),
                settings = this.getSettings( image ),
                def = function( name, method ) { 
                    if(!method){
                        return settings[ name ];
                    }
                    return method[ settings[ name ] ];
                },
                spec;
            
            // Set some "default" colours if not set
            settings[ "data-fg-col" ] = settings[ "data-fg-col" ] || settings[ "data-border-col" ];
            settings[ "data-text-bg-col" ] = settings[ "data-text-bg-col" ] || settings[ "data-bg-col" ];

            spec = {
                height: def( "height" ),
                width: def( "width" ),
                background: {
                    method: def( "data-bg", render.background ),
                    color: processColor( def( "data-bg-col" ) )
                },
                border: {
                    method: def( "data-border", render.border ),
                    color: processColor( def( "data-border-col" ) )
                },
                foreground: {
                    method: def( "data-fg", render.foreground ),
                    color: processColor( def( "data-fg-col" ) )
                },
                text: {
                    content: def( "data-text", "" ),
                    color: def( "data-text-col" ),
                    backgroundColor: processColor( def( "data-text-bg-col" ) )
                }
            };
            spec.width = getDistance( image, spec.width );
            spec.height = getDistance( image, spec.height );

            // * Render
            canvas.setAttribute( "width", getDistance(image, spec.width) );
            canvas.setAttribute( "height", getDistance(image, spec.height) );
            canvas = spec.background.method( canvas, spec );
            canvas = spec.foreground.method( canvas, spec );
            canvas = spec.border.method( canvas, spec );
            canvas = render.text( canvas, spec );
            return canvas;
        },
        setDefaults: function() {
            var imageWithDefaults = document.querySelector( this.selector + "[data-default]" );
            if( ! imageWithDefaults ){
                return;
            }
            each( imageWithDefaults.attributes, function( attr ) {
                if( attr.specified && attr.name.indexOf( "data-" ) === 0) {
                    defaultAttrs[ attr.name ] = attr.value;
                }
            }, this );
            defaultAttrs[ "data-text" ] = ""; // Don't add default text message
        }
    };

    /* Renderers */
    var render = {
        border: {
            none: function( canvas ){
                return canvas;
            },
            solid: function( canvas, specs ) {
                var ctx = canvas.getContext( "2d" );
                ctx.strokeStyle = specs.border.color;
                ctx.lineWidth = "2";
                ctx.strokeRect( 0, 0, specs.width, specs.height );
                return canvas;
            }
        },
        background: {
            none: function ( canvas ){
                return canvas;
            },
            solid: function ( canvas, specs ) {
                var ctx = canvas.getContext( "2d" );
                ctx.fillStyle = specs.background.color;
                ctx.fillRect ( 0, 0, specs.width, specs.height );
                return canvas;
            }
        },
        foreground: {
            none: function(canvas){
                return canvas;
            },
            cross: function( canvas, specs ) {
                var ctx = canvas.getContext( "2d" );
                ctx.strokeStyle = specs.foreground.color;
                ctx.lineWidth = "1";
                ctx.beginPath();
                ctx.moveTo( 0, 0 );
                ctx.lineTo( specs.width, specs.height );
                ctx.moveTo( specs.width, 0 );
                ctx.lineTo( 0, specs.height );
                ctx.closePath();
                ctx.stroke();
                return canvas;
            },
            circle: function( canvas, specs ){
                var ctx = canvas.getContext( "2d" ),
                    height = parseInt( specs.height, 10 ),
                    width = parseInt( specs.width, 10 ),
                    halfHeight = height / 2,
                    halfWidth = width / 2;

                ctx.fillStyle = specs.foreground.color;
                ctx.beginPath();
                ctx.moveTo( halfWidth, 0 );
                ctx.bezierCurveTo( 
                    - halfWidth / 3, 0,
                    - halfWidth / 3, height,
                    halfWidth, height);
                ctx.bezierCurveTo( 
                    width + ( halfWidth / 3 ), height,
                    width + ( halfWidth / 3 ), 0,
                    halfWidth, 0 );
                ctx.fill();
                ctx.closePath();
                
                return canvas;
            }
        },
        text: function( canvas, specs ) {
            var ctx = canvas.getContext( "2d" ),
                content = specs.text.content;
            if( ! content ){
                return canvas;
            }
            
            ctx.font = "10pt Arial";
            var width = ctx.measureText ? ctx.measureText( content ).width : content.length * 7,
                top = ( specs.height / 2 ) + 4,
                left = ( specs.width / 2 ) - ( width / 2 );

            if( specs.text.backgroundColor ){
                ctx.fillStyle = specs.text.backgroundColor;
                ctx.fillRect ( left - 5, top - 15, width + 10, 20 );
            }
            ctx.fillStyle = specs.text.color;
            ctx.fillText( content, left, top );
            return canvas;
        }
    };
   
    // Helpers 
    var getStyle = function( el,styleProp ){
            var compStyle;
            if ( el.currentStyle ){
                compStyle = el.currentStyle[ styleProp ];
            }
            else if ( window.getComputedStyle ) {
                compStyle = document.defaultView.getComputedStyle( el, null ).getPropertyValue( styleProp );
            }
            return compStyle;
        },
        getDistance = function( item, distance ){
            distance = "" + distance;
            if( distance.indexOf( "%" ) === -1 || ! item.parentNode ) {
                return distance;
            }
            var container = item.parentNode,
                width = getStyle( container, "width" );
            return "" + ( parseInt( width, 10 ) * ( parseInt( distance, 10 ) / 100 ) );
        },
        getAttr = function(el){
            var res = {};
            each( el.attributes, function( attr ) {
                if( attr.specified && defaultAttrs[ attr.name ] !== undefined ) {
                    res[ attr.name ] = attr.value; 
                }
            }, this );
            return res;
        },
        mergeObj = function(src, dest) {
            for( var attr in dest ){
                src[ attr ] = dest[ attr ];
            }
            return src;
        },
        processColor =  function( color ) {
            if( color == "{random}" ) {
                return getRandomColor();
            }
            return color;
        },
        getRandomColor = function() {
            return "rgb(" 
                + ( ~~( Math.random() * 255 ) ) 
                + "," + ( ~~( Math.random() * 255 ) ) 
                + "," + ( ~~( Math.random() * 255 ) ) 
                + ")";
        },
        each = function( coll, func, context ) {
            for ( var i = 0; i < coll.length; i++ ) {
                var ret = func.call( context || this, coll[ i ] );
                if ( typeof ret == "boolean" ){
                    if ( ret ) {
                        continue;
                    }
                    break;
                }
            }
        };
})();