(function ($) {
    var contain_in = $('.mrnet-vis')
    var app = new PIXI.Application(contain_in.width(), contain_in.width() / 1.4, {transparent: true})
    contain_in.append(app.view);
    // document.body.appendChild(app.view);

    PIXI.loader
        .add('cor', './img/ex1.json')
        .add('sag', './img/ex2.json')
        .add('axi', './img/ex3.json')
        .load(onAssetsLoaded);

    function getAnimatedSprite(index, numFrames) {
        // create an array of textures from an image path
        var frames = [];
        for (var i = 0; i < numFrames; i++) {
            var val = i < 10 ? '0' + i : i;
            val = 'i' + index + val
            // magically works since the spritesheet was loaded with the pixi loader
            frames.push(PIXI.Texture.fromFrame(val + '.png'));
        }
        // create an AnimatedSprite (brings back memories from the days of Flash, right ?)
        var anim = new PIXI.extras.AnimatedSprite(frames);
        return anim
    }

    function setSpriteAttrs(anim, width, height, x, y, anchor) {
        anim.anchor.set(anchor);
        anim.width = width;
        anim.height = height;
        anim.x = x;
        anim.y = y;

        anim.animationSpeed = 0.15;
        anim.play();
        anim.interactive = true;

        // anim.onFrameChange = function (){
        //     if (anim.currentFrame > 24) {
        //         anim.animationSpeed = slowSpeed;
        //     }
        //     if (anim.currentFrame > 37) {
        //         anim.animationSpeed = fastSpeed;
        //     }
        // }
    }


    function createText(text, x, y) {
        var style = new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 15,
                fontWeight: 'bold',
                fill:'#fff',
                wordWrap: true,
                wordWrapWidth: 440

        });
        var basicText = new PIXI.Text(text, style);
        basicText.x = x;
        basicText.y = y;

        return basicText
    }

    function onAssetsLoaded(loader)
    {
        var anim_index = []
        var container = new PIXI.Container();
        app.stage.addChild(container);
        var views = ['Sagittal', 'Coronal', 'Axial']

        var padding = 10
        var image_size = (app.screen.width / 3) - padding

        for (var i = 0; i < 6; i++) {
            var anim = getAnimatedSprite(i%3 + 1, 38);
            setSpriteAttrs(
                anim,
                image_size,
                image_size,
                (i % 3)*(image_size + padding),
                Math.floor(i / 3)*(image_size + padding) + padding,
                0);
            anim.on('pointerdown', onClick);
            anim_index.push({
                obj: anim,
                index: i
            })
            container.addChild(anim);

            if (i < 3) {
                var text = createText(views[i],
                    (i % 3)*(image_size + padding) + padding/2,
                    padding*2);
                container.addChild(text)
            }
        }
        container.x = (app.screen.width - container.width) / 2;
        container.y = (app.screen.height - container.height) / 2;

        function onClick () {
            for (var i = 0; i < anim_index.length; i++) {
                var obj = anim_index[i].obj
                if (obj.playing) {
                    obj.stop();
                } else {
                    obj.play();
                }
            }
        }
    }
})($)
