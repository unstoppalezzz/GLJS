# GLJS

GLJS (GameLab JavaScript) — a lightweight JavaScript game engine that runs your Code.org GameLab games in any browser.




---

## Setup

### 1. Add your sprite images

Place sprite images in the `img/` folder. For animations, use a numbered subfolder:

```
img/player/sprite_0.png
img/player/sprite_1.png
img/player/sprite_2.png
```

The subfolder name is the animation name you pass to `setAnimation()`.

---

### 2. Paste your GameLab code

Open `game.js` and paste your Code.org GameLab code in. The layer automatically calls `draw()` every frame.

```javascript
function draw() {
  background("black");
  textSize(20);
  fill("white");
  text("Hello World!", 100, 100);
}
```

---

### 3. Open in browser

Open `index.html` in your browser. No server required.

---

## Supported Features

### Drawing

| Function | Description |
|---|---|
| `background(c)` | Fill canvas. Accepts a colour string `"black"` or greyscale number `background(0)` |
| `fill(c)` | Set fill colour |
| `noFill()` | Disable fill |
| `stroke(c)` | Set stroke (outline) colour |
| `strokeWeight(w)` | Set stroke width in pixels |
| `noStroke()` | Disable stroke |
| `rect(x, y, w, h)` | Draw a rectangle |
| `ellipse(x, y, w, h)` | Draw an ellipse |
| `circle(x, y, d)` | Draw a circle by diameter |
| `arc(x, y, w, h, start, stop)` | Draw an arc/pie slice. Angles in degrees, 0 = top |
| `line(x1, y1, x2, y2)` | Draw a line |
| `point(x, y)` | Draw a point (sized by `strokeWeight`) |
| `regularPolygon(x, y, sides, size)` | Draw any regular polygon by centre + radius |
| `shape(x1,y1, x2,y2, ...)` | Draw a filled polygon from any number of point pairs |
| `text(str, x, y)` | Draw text |
| `textSize(n)` | Set font size |
| `textAlign(h, v)` | Set text alignment. Use constants `LEFT`, `CENTER`, `RIGHT`, `TOP`, `BOTTOM` |
| `translate(x, y)` | Shift the drawing origin |
| `push()` | Save canvas transform state |
| `pop()` | Restore canvas transform state |

---

### Color Helpers

| Function | Description |
|---|---|
| `color(r, g, b)` | Returns a CSS colour string from RGB values (0–255) |
| `color(r, g, b, a)` | Same with alpha (0–255) |
| `rgb(r, g, b)` | Alias for `color()` |
| `rgba(r, g, b, a)` | Alias for `color()` with alpha |

---

### Input

| Function | Description |
|---|---|
| `keyDown(key)` | Returns `true` while key is held. Supports `"left"`, `"right"`, `"up"`, `"down"`, `"space"`, `"shift"`, or any key name |
| `keyWentDown(key)` | Returns `true` only on the frame the key was first pressed |
| `mouseDown("leftButton")` | Returns `true` while left mouse button is held |
| `mouseDown = function(){ }` | Assign a callback that fires on each click |
| `mouseX` | Current mouse X position on the canvas |
| `mouseY` | Current mouse Y position on the canvas |

---

### Math

| Function | Description |
|---|---|
| `randomNumber(min, max)` | Random integer between min and max (inclusive) |
| `constrain(val, lo, hi)` | Clamp a value between lo and hi |
| `map(val, inMin, inMax, outMin, outMax)` | Re-map a number from one range to another |
| `dist(x1, y1, x2, y2)` | Distance between two points |
| `abs(n)` | Absolute value |
| `min(a, b)` | Smaller of two values |
| `max(a, b)` | Larger of two values |
| `floor(n)` | Round down |
| `ceil(n)` | Round up |
| `round(n)` | Round to nearest integer |
| `sqrt(n)` | Square root |
| `pow(base, exp)` | Power |
| `sin(r)` | Sine (radians) |
| `cos(r)` | Cosine (radians) |
| `tan(r)` | Tangent (radians) |
| `atan2(y, x)` | Angle from origin to point, in radians |
| `PI()` | Returns `Math.PI` |

---

### Game Loop

| Function | Description |
|---|---|
| `noLoop()` | Stop calling `draw()` each frame |
| `loop()` | Resume calling `draw()` after `noLoop()` |

---

### Sprites

Create sprites with `createSprite(x, y, w, h)`. All sprites are drawn automatically by `drawSprites()`.

#### Properties

| Property | Description |
|---|---|
| `x`, `y` | Position |
| `width`, `height` | Size |
| `scale` | Scale multiplier (default `1`) |
| `visible` | Show/hide (default `true`) |
| `rotation` | Rotation in degrees |
| `rotationSpeed` | Degrees added per frame automatically |
| `alpha` | Opacity 0–1 |
| `shapeColor` | Fallback colour when no animation is loaded |
| `depth` | Draw order — higher depth drawn on top |
| `life` | Frames until auto-removal. `-1` = never |
| `lifetime` | Alias for `life` |
| `vx`, `vy` | Velocity |
| `velocityX`, `velocityY` | Aliases for `vx`/`vy` |
| `bounciness` | Energy kept on `bounceOff()`, 0–1 |
| `immovable` | If `true`, collision methods won't push this sprite |
| `debug` | If `true`, draws the collider outline and velocity arrow |
| `tint` | CSS colour overlay e.g. `"rgba(255,0,0,0.5)"` |

#### Methods

| Method | Description |
|---|---|
| `setAnimation(name)` | Load frames from `img/<name>/sprite_0.png`, `sprite_1.png`, … |
| `setSpeed(speed, direction)` | Set velocity. Direction in degrees: 0 = right, 90 = down, 180 = left, 270 = up |
| `setSpeedAndDirection(speed, angle)` | Same as `setSpeed` |
| `setVelocity(vx, vy)` | Set velocity directly |
| `getSpeed()` | Returns current speed |
| `getDirection()` | Returns current direction in degrees |
| `setCollider(type, offsetX, offsetY, w, h)` | Set `"rectangle"` or `"circle"` collider |
| `mirrorX(dir)` | Pass `1` or `-1` to flip horizontally |
| `mirrorY(dir)` | Pass `1` or `-1` to flip vertically |
| `getScaledWidth()` | Returns `width * scale` |
| `getScaledHeight()` | Returns `height * scale` |
| `attractionPoint(speed, x, y)` | Nudge sprite toward a point at the given speed |
| `rotateToDirection()` | Set rotation to match velocity direction |
| `pointTo(x, y)` | Rotate sprite to face a point |
| `isTouching(other)` | Returns `true` if bounding boxes overlap |
| `overlap(other, callback)` | Detect overlap with a sprite or Group, fire callback once per contact |
| `collide(other, callback)` | Push self out of other on contact |
| `bounce(other, callback)` | Exchange velocities on contact |
| `bounceOff(other, callback)` | Reverse own velocity on contact (affected by `bounciness`) |
| `displace(other)` | Push other out of self |
| `destroy()` / `remove()` | Remove sprite from the scene immediately |
| `pause()` | Pause animation |
| `play()` | Resume animation |
| `setFrame(n)` | Jump to a specific animation frame |

---

### Groups

Groups are arrays of sprites with extra collision helpers.

```javascript
var enemies = new Group();
enemies.add(sprite);
enemies.remove(sprite);
enemies.contains(sprite); // true/false
enemies.forEach(function(e) { ... });
enemies.overlap(otherGroup, callback);
enemies.displace(otherGroup);
```

Groups work as the `other` argument in all sprite collision methods too:

```javascript
bullet.overlap(enemies, function(b, e) {
  b.remove();
  e.remove();
});
```

---

### Camera

The camera follows a world-space origin. Sprites are drawn offset by the camera position. HUD elements drawn before `drawSprites()` are always in screen space.

```javascript
camera.x = player.x;   // centre camera on player
camera.y = player.y;

camera.off();  // switch to screen space (for HUD)
// draw HUD here
camera.on();   // switch back to world space
```

---

### Notes

- `sin()`, `cos()`, `tan()`, `atan2()` use **radians**, matching how Code.org GameLab actually behaves internally when used with vector math.
- `mouseDown = function(){ }` — you can reassign `mouseDown` to a callback function and it will fire on every canvas click.
- Sprites with `immovable = true` won't be pushed by collision methods — useful for walls.
- `drawSprites()` automatically ticks `life` down each frame and removes sprites when it reaches 0.
