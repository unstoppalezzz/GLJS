# Code.org GameLab → JS Compatibility Layer

This project provides a **compatibility layer** to run Code.org GameLab games in plain JavaScript.  

---

## Setup

### 1. Add your sprite images

Place all your sprite images in the `img/` folder.

- For animations, use a subfolder with frames like:

```js
img/player/sprite_0.png
img/player/sprite_1.png
img/player/sprite_2.png
```
with player being the given sprites name

---

### 2. Paste your GameLab code

Open `game.js` and find the placeholder:

```javascript
// paste your gamelab code here
``` 
Copy your Code.org GameLab code into this section.

The layer will automatically call draw() every frame.
Example:
```javascript
function draw() {
  background("black");
  textSize(20);
  fill("white");
  text("Hello World!", 100, 100);
}
```

3. Run the project

Open index.html in your browser.
