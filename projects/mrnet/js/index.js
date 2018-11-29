(function ($) {
    var contain_in = $('.mrnet-vis')
    var app = new PIXI.Application(contain_in.width(), contain_in.width() / 1.4, {transparent: true})
    contain_in.append(app.view);
    // document.body.appendChild(app.view);

    PIXI.loader
        .add('sa', './sprites/sa.json')
        .add('ax', './sprites/ax.json')
        .add('co', './sprites/co.json')
        .add('sac', './sprites/sac.json')
        .add('axc', './sprites/axc.json')
        .add('coc', './sprites/coc.json')
        .load(onAssetsLoaded);

    function getAnimatedSprite(prefix, numFrames) {
        // create an array of textures from an image path
        var frames = [];
        for (var i = 0; i < numFrames; i++) {
            var val = i < 10 ? '0' + i : i;
            val = prefix + val
            // magically works since the spritesheet was loaded with the pixi loader
            frames.push(PIXI.Texture.fromFrame(val + '.png'));
        }
        // create an AnimatedSprite (brings back memories from the days of Flash, right ?)
        var anim = new PIXI.extras.AnimatedSprite(frames);
        return anim
    }

    function setSpriteAttrs(anim, width, height, x, y, anchor, speed) {
        anim.anchor.set(anchor);
        anim.width = width;
        anim.height = height;
        anim.x = x;
        anim.y = y;

        anim.animationSpeed = speed;
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
        var views = ['Sagittal T2', 'Coronal T1', 'Axial PD']

        var padding = 10
        var image_size = (app.screen.width / 3) - padding
        var names = ['sa', 'co', 'ax', 'sac', 'coc', 'axc']
        var frames = [35, 36, 41]
        var speeds = [0.08, 0.15, 0.16]

        for (var i = 0; i < 6; i++) {
            var anim = getAnimatedSprite(names[i], frames[i % 3]);
            setSpriteAttrs(
                anim,
                image_size,
                image_size,
                (i % 3)*(image_size + padding),
                Math.floor(i / 3)*(image_size + padding) + padding,
                0,
                speeds[i % 3]);
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
