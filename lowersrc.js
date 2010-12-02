(function(){

    /* Run onload */
    window.addEventListener("load", function(){
        lowersrc.run();
    }, false);
    
    var lowersrc = {
        run: function(){
            var images = this.findElements(document, "img", "lowersrc");
            each(images, function(item){
                this.swapImage(item, this.createImage(item));
            }, this);
        },
        findElements: function(container, elementType, className){
            return reduce(container.getElementsByTagName(elementType), function(item){
                return item.className == className;
            });
        },
        swapImage: function(oldImage, newImage){
            oldImage.setAttribute("src", newImage.toDataURL());
        },
        createImage: function(image){
            var canvas = document.createElement("canvas"),
                json = image.getAttribute("data-$"),
                spec;

            json = json && JSON ? JSON.parse(json) : {};

            spec = {
                height: image.getAttribute("height"),
                width: image.getAttribute("width"),
                border: json["border"] || image.getAttribute("data-border"),
                background: json["bg"] || image.getAttribute("data-bg"),
                color: image.getAttribute("data-bg-col"),
                text: image.getAttribute("data-text"),
                textColor: image.getAttribute("data-text-col" || "#fff")
            };
            spec.border = render.border[ spec.border ] ? render.border[ spec.border ] : render.border.thin;
            spec.background = render.background[ spec.background ] ? render.background[ spec.background ] : render.background.cross;
                        
            canvas.setAttribute("width", spec.width);
            canvas.setAttribute("height", spec.height);

            // * Render border
            canvas = spec.border(canvas, spec);

            // * Render background
            canvas = spec.background(canvas, spec);

            // * Render Text
            if(spec.text){
                canvas = render.text(canvas, spec);
            };
            return canvas;
        }
    };
    
    /* Renderers */
    var render = {
        border: {
            none: function(canvas){
                return canvas;
            },
            thin: function(canvas, specs){
                var ctx = canvas.getContext("2d");
                ctx.strokeStyle = "#ccc";
                ctx.lineWidth = "2";
                ctx.strokeRect(0,0,specs.width,specs.height);

                return canvas;
            }
        },
        background: {
            none: function(canvas){
                return canvas;
            },
            random: function(canvas, specs){
                var ctx = canvas.getContext("2d");
                ctx.fillStyle = render.getRandom();
                ctx.fillRect (0, 0, specs.width, specs.height);
                return canvas;
            },
            solid: function(canvas, specs){
                var ctx = canvas.getContext("2d");
                ctx.fillStyle = specs.color;
                ctx.fillRect (0, 0, specs.width, specs.height);
                return canvas;
            },
            circle: function(canvas, specs){
                var rad = specs.width / 2;
                var ctx = canvas.getContext("2d");
                ctx.fillStyle = render.getRandom();
                ctx.beginPath();
                ctx.arc( rad, rad, rad, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
                return canvas;
            },
            cross: function(canvas, specs){
                var ctx = canvas.getContext("2d");
                if(specs.color){
                    ctx.fillStyle = specs.color;
                    ctx.fillRect (0, 0, specs.width, specs.height);
                }
                ctx.strokeStyle = "#ccc";
                ctx.lineWidth = "1";
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(specs.width, specs.height);
                ctx.moveTo(specs.width, 0);
                ctx.lineTo(0, specs.height);
                ctx.closePath();
                ctx.stroke();
                return canvas;
            }
        },
        text: function(canvas, specs){
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = specs.textColor;
            ctx.font = "10pt Arial";
            ctx.fillText(specs.text, (specs.width / 2) - (specs.text.length * 3.5), (specs.height / 2) + 4);
            return canvas;
        },
        getRandom: function(){
            return "rgb(" + (~~(Math.random()*255)) + "," + (~~(Math.random()*255)) + "," + (~~(Math.random()*255)) + ")";
        }
    };
    
    /* Functional helper methods (so it works on iPhone3.2) */
    var each = function(coll, func, context){
            for(var i = 0; i < coll.length; i++){
                func.call(context||this,coll[i]);
            } 
        },
        map = function(coll, func, context){
            var mapped = [];
            each(coll, function(item){
                mapped.push(func(item));
            },context);
            return mapped;
        },
        reduce = function(coll, func, context){
            var matched = [];
            each(coll, function(item){
                if(func(item)){
                    matched.push(item);
                }
            }, context);
            return matched;
        };

})();