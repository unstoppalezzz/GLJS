const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const WIDTH = canvas.width, HEIGHT = canvas.height;

const keys = {}, keysOnce = {};
let mousePressed = false;
let mouseX = 0, mouseY = 0;

function mouseDown(btn){ return btn==="leftButton" && mousePressed; }
document.addEventListener("keydown", e => { keys[e.key.toLowerCase()] = true; keysOnce[e.key.toLowerCase()] = true; });
document.addEventListener("keyup",   e => { keys[e.key.toLowerCase()] = false; keysOnce[e.key.toLowerCase()] = false; });
canvas.addEventListener("mousedown", e => {
    mousePressed = true;

    if(typeof mouseDown === "function") try{ mouseDown(); }catch(ex){}
});
canvas.addEventListener("mouseup",   () => mousePressed = false);
canvas.addEventListener("mousemove", e => { const r=canvas.getBoundingClientRect(); mouseX=e.clientX-r.left; mouseY=e.clientY-r.top; });
function keyDown(k){
    if(k==="space")  k=" ";
    if(k==="left")   k="arrowleft";
    if(k==="right")  k="arrowright";
    if(k==="up")     k="arrowup";
    if(k==="down")   k="arrowdown";
    if(k==="shift")  k="shift";
    return !!keys[k.toLowerCase()];
}
function keyWentDown(k){
    if(k==="space")  k=" ";
    if(k==="left")   k="arrowleft";
    if(k==="right")  k="arrowright";
    if(k==="up")     k="arrowup";
    if(k==="down")   k="arrowdown";
    if(k==="shift")  k="shift";
    if(keysOnce[k.toLowerCase()]){ keysOnce[k.toLowerCase()]=false; return true; }
    return false;
}

function randomNumber(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function dist(x1,y1,x2,y2){ return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)); }
function constrain(val, lo, hi){ return Math.min(Math.max(val, lo), hi); }
function map(val, inMin, inMax, outMin, outMax){ return outMin + (outMax - outMin) * ((val - inMin) / (inMax - inMin)); }
function abs(n)       { return Math.abs(n); }
function max(a, b)    { return Math.max(a, b); }
function min(a, b)    { return Math.min(a, b); }
function floor(n)     { return Math.floor(n); }
function ceil(n)      { return Math.ceil(n); }
function round(n)     { return Math.round(n); }
function sqrt(n)      { return Math.sqrt(n); }
function pow(b, e)    { return Math.pow(b, e); }

function sin(r)      { return Math.sin(r); }
function cos(r)      { return Math.cos(r); }
function tan(r)      { return Math.tan(r); }
function atan2(y, x) { return Math.atan2(y, x); }
function PI()         { return Math.PI; }

class Sprite {
    constructor(x, y, w=50, h=50){
        this._position = {x:x, y:y};
        this.width = w;
        this.height = h;
        this.vx = 0; this.vy = 0;
        this.scale = 1;
        this.visible = true;

        Object.defineProperty(this, 'velocityX', { get:()=>this.vx, set:(v)=>{ this.vx=v; } });
        Object.defineProperty(this, 'velocityY', { get:()=>this.vy, set:(v)=>{ this.vy=v; } });

        Object.defineProperty(this, 'position', {
            get: () => this._position,
            set: (p) => { 
                this._position = {...p};
                this.x = p.x; this.y = p.y;
            }
        });

        this.x = x; this.y = y;
        this.animations = {};
        this.currentAnim = null;
        this.currentImage = null;
        this.frameIndex = 0;
        this.frameCounter = 0;
        this.frameDelay = 5;
        this.playing = true;

        this.rotation      = 0;        
        this.rotationSpeed = 0;        
        this.alpha         = 1;        
        this.tint          = null;     
        this.shapeColor    = "orange"; 
        this.debug         = false;    

        this._colliderType    = "rectangle";
        this._colliderOffsetX = 0;
        this._colliderOffsetY = 0;
        this._colliderRadius  = null;
        this._colliderW       = null;
        this._colliderH       = null;

        this._overlapActive = new Map();

        this._mirrorX   = 1;
        this._mirrorY   = 1;
        this.depth      = 0;
        this.lifetime   = -1;
        this._lifeTick  = 0;
        this.bounciness = 0;
        this._destroyed = false;
        this.immovable  = false;  
    }

    get hight(){ return this.height; } set hight(v){ this.height = v; }

    mirrorX(dir){ this._mirrorX = dir >= 0 ? 1 : -1; }
    mirrorY(dir){ this._mirrorY = dir >= 0 ? 1 : -1; }

    getScaledWidth(){  return this.width  * this.scale; }
    getScaledHeight(){ return this.height * this.scale; }

    getScaledhight(){ return this.getScaledHeight(); }
    getScaledHight(){ return this.getScaledHeight(); }

    destroy(){
        this._destroyed = true;
        this.visible = false;
        const i = allSprites.indexOf(this);
        if(i !== -1) allSprites.splice(i, 1);
    }
    setVelocity(x, y){ this.vx = x; this.vy = y; }

    setSpeedAndDirection(speed, angle){

        const rad = angle * Math.PI / 180;
        this.vx = Math.cos(rad) * speed;
        this.vy = Math.sin(rad) * speed;
    }
    getDirection(){
        if(this.vx === 0 && this.vy === 0) return 0;
        return ((Math.atan2(this.vy, this.vx) * 180 / Math.PI) + 90 + 360) % 360;
    }
    getSpeed(){ return Math.sqrt(this.vx * this.vx + this.vy * this.vy); }

    rotateToDirection(){
        if(this.vx !== 0 || this.vy !== 0) this.rotation = this.getDirection();
    }
    pointTo(x, y){
        this.rotation = ((Math.atan2(y - this.y, x - this.x) * 180 / Math.PI) + 90 + 360) % 360;
    }

    setCollider(type, offsetX=0, offsetY=0, widthOrRadius=null, height=null){
        this._colliderType    = type;
        this._colliderOffsetX = offsetX;
        this._colliderOffsetY = offsetY;
        if(type === "circle"){
            this._colliderRadius = widthOrRadius !== null ? widthOrRadius : Math.min(this.width, this.height) / 2;
        } else {
            this._colliderW = widthOrRadius !== null ? widthOrRadius : this.width;
            this._colliderH = height        !== null ? height        : this.height;
        }
    }

    _colliderBounds(){
        const cx = this.x + this._colliderOffsetX;
        const cy = this.y + this._colliderOffsetY;
        if(this._colliderType === "circle"){
            const r = (this._colliderRadius !== null ? this._colliderRadius : Math.min(this.width, this.height) / 2) * this.scale;
            return { type:"circle", cx, cy, r };
        }
        const w = (this._colliderW !== null ? this._colliderW : this.width)  * this.scale;
        const h = (this._colliderH !== null ? this._colliderH : this.height) * this.scale;
        return { type:"rectangle", cx, cy, w, h,
            left:cx-w/2, right:cx+w/2, top:cy-h/2, bottom:cy+h/2 };
    }

    _overlapsCollider(other){
        if(!other || other._destroyed || typeof other._colliderBounds !== "function") return false;
        const a = this._colliderBounds(), b = other._colliderBounds();
        if(a.type === "circle" && b.type === "circle"){
            const dx=a.cx-b.cx, dy=a.cy-b.cy;
            return Math.sqrt(dx*dx+dy*dy) < a.r + b.r;
        }
        if(a.type === "rectangle" && b.type === "rectangle"){
            return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        }

        const [circ, rect] = a.type === "circle" ? [a, b] : [b, a];
        const nearX = Math.max(rect.left, Math.min(circ.cx, rect.right));
        const nearY = Math.max(rect.top,  Math.min(circ.cy, rect.bottom));
        const dx=circ.cx-nearX, dy=circ.cy-nearY;
        return Math.sqrt(dx*dx+dy*dy) < circ.r;
    }

    _pushOut(other){
        if(!other || other._destroyed || typeof other._colliderBounds !== "function") return "x";
        if(other.immovable){

            const a=this._colliderBounds(), b=other._colliderBounds();
            const dx=a.cx-b.cx, dy=a.cy-b.cy;
            if(a.type==="rectangle"&&b.type==="rectangle"){
                const ox=(a.w/2+b.w/2)-Math.abs(dx), oy=(a.h/2+b.h/2)-Math.abs(dy);
                if(ox<=oy){ this.x+=dx>=0?ox:-ox; return "x"; }
                else       { this.y+=dy>=0?oy:-oy; return "y"; }
            }
        }
        const a=this._colliderBounds(), b=other._colliderBounds();
        const dx=a.cx-b.cx, dy=a.cy-b.cy;
        if(a.type === "rectangle" && b.type === "rectangle"){
            const ox=(a.w/2+b.w/2)-Math.abs(dx), oy=(a.h/2+b.h/2)-Math.abs(dy);
            if(ox <= oy){ this.x += dx>=0 ? ox : -ox; return "x"; }
            else         { this.y += dy>=0 ? oy : -oy; return "y"; }
        }
        if(a.type === "circle" && b.type === "circle"){
            const d=Math.sqrt(dx*dx+dy*dy)||0.001, push=a.r+b.r-d;
            this.x+=(dx/d)*push; this.y+=(dy/d)*push;
            return Math.abs(dx)>=Math.abs(dy) ? "x" : "y";
        }
        const [circ,rect] = a.type==="circle" ? [a,b] : [b,a];
        const nearX=Math.max(rect.left,Math.min(circ.cx,rect.right));
        const nearY=Math.max(rect.top, Math.min(circ.cy,rect.bottom));
        const ex=circ.cx-nearX, ey=circ.cy-nearY;
        const d=Math.sqrt(ex*ex+ey*ey)||0.001, push=circ.r-d;
        const sign = a.type==="circle" ? 1 : -1;
        this.x+=sign*(ex/d)*push; this.y+=sign*(ey/d)*push;
        return Math.abs(ex)>=Math.abs(ey) ? "x" : "y";
    }

    collide(other, callback){
        if(Array.isArray(other)){
            let any = false;
            for(let i = other.length - 1; i >= 0; i--){
                if(this._overlapsCollider(other[i])){ const axis=this._pushOut(other[i]); if(axis==="x") this.vx=0; else this.vy=0; if(callback) callback(this,other[i]); any=true; }
            }
            return any;
        }
        if(!this._overlapsCollider(other)) return false;
        const axis=this._pushOut(other);
        if(axis==="x") this.vx=0; else this.vy=0;
        if(callback) callback(this, other);
        return true;
    }
    bounce(other, callback){
        if(Array.isArray(other)){
            let any = false;
            for(let i = other.length - 1; i >= 0; i--){
                if(this._overlapsCollider(other[i])){ const axis=this._pushOut(other[i]); if(axis==="x"){const t=this.vx;this.vx=other[i].vx;other[i].vx=t;}else{const t=this.vy;this.vy=other[i].vy;other[i].vy=t;} if(callback) callback(this,other[i]); any=true; }
            }
            return any;
        }
        if(!this._overlapsCollider(other)) return false;
        const axis=this._pushOut(other);
        if(axis==="x"){ const t=this.vx; this.vx=other.vx; other.vx=t; }
        else           { const t=this.vy; this.vy=other.vy; other.vy=t; }
        if(callback) callback(this, other);
        return true;
    }
    bounceOff(other, callback){
        if(!this._overlapsCollider(other)) return false;
        const axis=this._pushOut(other);
        const b = this.bounciness || 0;
        if(axis==="x") this.vx = -this.vx * (1 - b === 0 ? 1 : b || 1);
        else            this.vy = -this.vy * (1 - b === 0 ? 1 : b || 1);
        if(callback) callback(this, other);
        return true;
    }
    overlap(other, callback){

        if(Array.isArray(other)){
            let any = false;
            for(let i = other.length - 1; i >= 0; i--){
                const member = other[i];
                if(this._overlapsCollider(member)){
                    any = true;
                    if(callback){
                        const was = this._overlapActive.get(member) || false;
                        if(!was){ this._overlapActive.set(member, true); callback(this, member); }
                    } else {
                        this._overlapActive.set(member, true);
                    }
                } else {
                    if(this._overlapActive.get(member)) this._overlapActive.set(member, false);
                }
            }
            return any;
        }

        const touching = this._overlapsCollider(other);
        if(callback){
            const was = this._overlapActive.get(other) || false;
            if(touching && !was){ this._overlapActive.set(other, true);  callback(this, other); }
            else if(!touching && was){ this._overlapActive.set(other, false); }
        }
        return touching;
    }

    pause(){ this.playing = false; }
    play() { this.playing = true;  }
    setFrame(frame){
        if(!this.currentAnim) return;
        this.frameIndex   = Math.max(0, Math.min(frame, this.currentAnim.length - 1));
        this.frameCounter = 0;
        this.currentImage = this.currentAnim[this.frameIndex];
    }

    loadAnimationFromFolder(name, callback) {
        const imgs = [];
        let index = 0;
        const MAX_FRAMES = 50; 
        console.log(`Starting to load animation "${name}" from folder imgs/${name}/`);

        const tryLoad = () => {
            if (index >= MAX_FRAMES) {
                console.warn(`Stopped loading animation "${name}" after ${MAX_FRAMES} frames`);
                callback(imgs);
                return;
            }
            const img = new Image();
            img.src = `imgs/${name}/sprite_${index}.png`;
            console.log(`Trying to load: ${img.src}`);
            img.onload = () => {
                console.log(`Loaded: ${img.src}`);
                imgs.push(img);
                index++;
                tryLoad();
            }
            img.onerror = () => {
                if (imgs.length === 0) {
                    console.warn(`No sprites found for animation "${name}"`);
                } else {
                    console.log(`Finished loading ${imgs.length} frames for animation "${name}"`);
                }
                callback(imgs);
            }
        }
        tryLoad();
    }

    setAnimation(name) {
        console.log(`Setting animation: "${name}"`);
        if (this.animations[name]) {
            console.log(`Animation "${name}" already loaded, using cached frames.`);
            this.currentAnim = this.animations[name];
            this.frameIndex = 0;
            this.frameCounter = 0;
            this.currentImage = this.currentAnim[0];
            this.playing = true;
        } else {
            console.log(`Animation "${name}" not loaded yet, loading from folder...`);
            this.loadAnimationFromFolder(name, (imgs) => {
                if (imgs.length > 0) {
                    console.log(`Animation "${name}" loaded successfully with ${imgs.length} frames`);
                    this.animations[name] = imgs;
                    this.currentAnim = imgs;
                    this.frameIndex = 0;
                    this.frameCounter = 0;
                    this.currentImage = imgs[0];
                    this.playing = true;
                } else {
                    console.warn(`Failed to load animation "${name}"`);
                }
            });
        }
    }

    nextFrame(){
        if(!this.currentAnim) return;
        this.frameCounter++;
        if(this.frameCounter >= this.frameDelay){
            this.frameIndex = (this.frameIndex + 1) % this.currentAnim.length;
            this.currentImage = this.currentAnim[this.frameIndex];
            this.frameCounter = 0;
        }
    }

    update(){
        const externallyMoved = this._position && (
            (this._lastX !== undefined && Math.abs(this._position.x - this._lastX) > 0.001) ||
            (this._lastY !== undefined && Math.abs(this._position.y - this._lastY) > 0.001)
        );

        if(externallyMoved){
            this.x = this._position.x;
            this.y = this._position.y;
        } else {
            this.x += this.vx;
            this.y += this.vy;
            if(this._position){
                this._position.x = this.x;
                this._position.y = this.y;
            }
        }

        this._lastX = this._position ? this._position.x : this.x;
        this._lastY = this._position ? this._position.y : this.y;

        this.rotation = (this.rotation + this.rotationSpeed + 360) % 360;

        if(this.lifetime >= 0){
            this._lifeTick++;
            if(this._lifeTick >= this.lifetime) this.destroy();
        }

        if(this.playing && this.currentAnim) this.nextFrame();
    }

    draw() {
        if (!this.visible) return;

        const w = this.width  * this.scale * 1.05;
        const h = this.height * this.scale;

        const needsTransform = (this.rotation % 360 !== 0) || this.alpha !== 1 || this.tint
                             || this._mirrorX === -1 || this._mirrorY === -1;

        if(needsTransform){
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation - 90) * Math.PI / 180);
            ctx.scale(this._mirrorX, this._mirrorY);

            if(this.currentImage){
                ctx.drawImage(this.currentImage, -w/2, -h/2, w, h);
                if(this.tint){
                    ctx.globalCompositeOperation = "source-atop";
                    ctx.fillStyle = this.tint;
                    ctx.fillRect(-w/2, -h/2, w, h);
                    ctx.globalCompositeOperation = "source-over";
                }
            } else {
                ctx.fillStyle = this.shapeColor;
                ctx.fillRect(-w/2, -h/2, w, h);
            }

            if(this.debug){ this._drawDebug(w, h); }
            ctx.restore();

        } else {

            if(this.currentImage){
                ctx.drawImage(this.currentImage, this.x - w/2, this.y - h/2, w, h);
            } else {
                ctx.fillStyle = this.shapeColor;
                ctx.fillRect(this.x - w/2, this.y - h/2, w, h);
            }
            if(this.debug){ this._drawDebugAt(this.x, this.y, w, h); }
        }
    }

    _drawDebug(w, h){
        ctx.strokeStyle = "lime"; ctx.lineWidth = 1.5;
        if(this._colliderType === "circle"){
            const r = (this._colliderRadius !== null ? this._colliderRadius : Math.min(w,h)/2) * this.scale;
            ctx.beginPath();
            ctx.arc(this._colliderOffsetX, this._colliderOffsetY, r, 0, Math.PI*2);
            ctx.stroke();
        } else {
            const cw=(this._colliderW !== null ? this._colliderW : w)*this.scale;
            const ch=(this._colliderH !== null ? this._colliderH : h)*this.scale;
            ctx.strokeRect(this._colliderOffsetX-cw/2, this._colliderOffsetY-ch/2, cw, ch);
        }
        ctx.strokeStyle="yellow";
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(this.vx*6, this.vy*6); ctx.stroke();
    }

    _drawDebugAt(cx, cy, w, h){
        ctx.strokeStyle = "lime"; ctx.lineWidth = 1.5;
        const cw=(this._colliderW !== null ? this._colliderW : w)*this.scale;
        const ch=(this._colliderH !== null ? this._colliderH : h)*this.scale;
        ctx.strokeRect(cx-cw/2, cy-ch/2, cw, ch);
        ctx.strokeStyle="yellow";
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+this.vx*6, cy+this.vy*6); ctx.stroke();
    }

    isTouching(other){
        if(!other) return false;
        return (this.x < other.x + other.width &&
                this.x + this.width > other.x &&
                this.y < other.y + other.height &&
                this.y + this.height > other.y);
    }

    displace(other){
        if(this.isTouching(other)){
            this.x -= other.vx || 0;
            this.y -= other.vy || 0;
        }
    }

    remove(){
        this._destroyed = true;
        this.visible = false;
        const i = allSprites.indexOf(this);
        if(i !== -1) allSprites.splice(i, 1);
    }

    setSpeed(speed, direction){
        if(direction === undefined){
            this.vx = speed; this.vy = 0; return;
        }
        const rad = direction * Math.PI / 180;
        this.vx = Math.cos(rad) * speed;
        this.vy = Math.sin(rad) * speed;
    }

    attractionPoint(speed, targetX, targetY){
        const dx = targetX - this.x, dy = targetY - this.y;
        const d = Math.sqrt(dx*dx + dy*dy) || 0.001;
        this.vx = (dx/d) * speed;
        this.vy = (dy/d) * speed;
    }
}

function color(r, g, b, a){
    if(a !== undefined) return "rgba("+r+","+g+","+b+","+a+")";
    return "rgb("+r+","+g+","+b+")";
}

const CENTER="center", LEFT="left", RIGHT="right", TOP="top", BOTTOM="bottom";
function textAlign(h, v){
    ctx.textAlign    = h || "left";
    ctx.textBaseline = v === "center" ? "middle" : v || "alphabetic";
}

function background(c){

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if(typeof c === "number") ctx.fillStyle = "rgb("+c+","+c+","+c+")";
    else ctx.fillStyle = c;
    ctx.fillRect(0,0,WIDTH,HEIGHT);
}

function translate(x, y){ ctx.translate(x, y); }
function push(){ ctx.save(); }
function pop() { ctx.restore(); }

let currentFill = "white";
function fill(c){ currentFill = c; ctx.fillStyle = c; }

function textSize(s){      
    currentTextSize = s;      
    ctx.font = `${s}px Arial`;  
}

const _textState = { lastX: {}, lastY: null };

function text(txt, x, y){
    ctx.font = `${currentTextSize}px Arial`;
    ctx.fillStyle = currentFill;

    if (_textState.lastY !== y) {
        _textState.lastY = y;
        _textState.lastX[y] = x;
    }

    if (typeof txt === "number") {
        x = _textState.lastX[y] + 5; 
    }

    ctx.fillText(txt, x, y);

    _textState.lastX[y] = x + ctx.measureText(txt).width;
}
function rect(x, y, w, h){
    ctx.fillRect(x, y, w, h);
}

function ellipse(x, y, w, h){
    ctx.beginPath();
    if(ctx.ellipse){
        ctx.ellipse(x, y, w/2, h/2, 0, 0, Math.PI*2);
    } else {
        ctx.arc(x, y, Math.min(w,h)/2, 0, Math.PI*2);
    }
    if(currentFill){ ctx.fillStyle=currentFill; ctx.fill(); }
    if(currentStroke){ ctx.strokeStyle=currentStroke; ctx.lineWidth=currentStrokeWeight; ctx.stroke(); }
}

function circle(x, y, d){ ellipse(x, y, d, d); }

function rgb(r, g, b){ return "rgb("+r+","+g+","+b+")"; }
function rgba(r, g, b, a){ return "rgba("+r+","+g+","+b+","+a+")"; }

function noLoop(){ _loopActive = false; }
function loop()  { _loopActive = true;  }
let _loopActive = true;

let currentStroke = "black";
let currentStrokeWeight = 1;
function stroke(c){ currentStroke = c; ctx.strokeStyle = c; }
function strokeWeight(w){ currentStrokeWeight = w; ctx.lineWidth = w; }
function noStroke(){ currentStroke = null; }
function noFill(){ currentFill = null; }

function arc(x, y, w, h, start, stop){
    var startRad = (start - 90) * Math.PI / 180;
    var stopRad  = (stop  - 90) * Math.PI / 180;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(w / 2, h / 2);
    ctx.beginPath();
    ctx.arc(0, 0, 1, startRad, stopRad);
    ctx.restore();

    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();

    if(ctx.ellipse){
        ctx.ellipse(0, 0, w/2, h/2, 0, startRad, stopRad);
    } else {

        var steps = 60;
        var range = stopRad - startRad;
        for(var i = 0; i <= steps; i++){
            var a = startRad + (range * i / steps);
            var px = Math.cos(a) * w / 2;
            var py = Math.sin(a) * h / 2;
            if(i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
    }
    if(currentFill){ ctx.fillStyle = currentFill; ctx.fill(); }
    if(currentStroke){ ctx.strokeStyle = currentStroke; ctx.lineWidth = currentStrokeWeight; ctx.stroke(); }
    ctx.restore();
}

function line(x1, y1, x2, y2){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = currentStroke || currentFill || "black";
    ctx.lineWidth = currentStrokeWeight;
    ctx.stroke();
}

function point(x, y){
    var r = Math.max(1, currentStrokeWeight / 2);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = currentStroke || currentFill || "black";
    ctx.fill();
}

function regularPolygon(x, y, sides, size){
    if(sides < 3) return;
    ctx.beginPath();
    for(var i = 0; i < sides; i++){
        var angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        var px = x + Math.cos(angle) * size;
        var py = y + Math.sin(angle) * size;
        if(i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if(currentFill){ ctx.fillStyle = currentFill; ctx.fill(); }
    if(currentStroke){ ctx.strokeStyle = currentStroke; ctx.lineWidth = currentStrokeWeight; ctx.stroke(); }
}

function shape(){
    var pts = Array.prototype.slice.call(arguments);
    if(pts.length < 6 || pts.length % 2 !== 0) return;
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for(var i = 2; i < pts.length; i += 2){
        ctx.lineTo(pts[i], pts[i+1]);
    }
    ctx.closePath();
    if(currentFill){ ctx.fillStyle = currentFill; ctx.fill(); }
    if(currentStroke){ ctx.strokeStyle = currentStroke; ctx.lineWidth = currentStrokeWeight; ctx.stroke(); }
}

const allSprites=[];

const camera = {
    x: WIDTH/2, y: HEIGHT/2,
    _active: true,
    on(){  this._active = true;  },
    off(){ this._active = false; }
};

class Group extends Array {
    add(s)      { if(!this.includes(s)) this.push(s); }
    remove(s)   { const i=this.indexOf(s); if(i!==-1) this.splice(i,1); }
    contains(s) { return this.includes(s); }
    forEach(fn) {
        const snap = this.slice();
        for(let i=0;i<snap.length;i++) fn(snap[i],i,this);
    }
    overlap(other, callback){
        let any = false;
        const selfSnap = this.slice();
        const otherSnap = Array.isArray(other) ? other.slice() : [other];
        for(let i=selfSnap.length-1;i>=0;i--){
            for(let j=otherSnap.length-1;j>=0;j--){
                const a=selfSnap[i], b=otherSnap[j];
                if(!a||a._destroyed||!b||b._destroyed) continue;
                if(typeof a._overlapsCollider==="function" && a._overlapsCollider(b)){
                    any = true;
                    if(callback) callback(a, b);
                }
            }
        }
        return any;
    }
    displace(other){
        const selfSnap = this.slice();
        const otherSnap = Array.isArray(other) ? other.slice() : [other];
        for(let i=0;i<selfSnap.length;i++){
            for(let j=0;j<otherSnap.length;j++){
                const a=selfSnap[i], b=otherSnap[j];
                if(!a||a._destroyed||!b||b._destroyed||a===b) continue;
                if(typeof a._overlapsCollider==="function" && a._overlapsCollider(b)){
                    a._pushOut(b);
                }
            }
        }
    }
    get length(){ return super.length; }
}

function createSprite(x,y,w,h){
    const s=new Sprite(x,y,w,h);
    allSprites.push(s);
    return s;
}

function drawSprites(){

    for(let i=allSprites.length-1;i>=0;i--){
        const s=allSprites[i];
        if(s.life !== undefined && s.life !== null && s.life > 0){
            s.life--;
            if(s.life <= 0){ s.remove(); continue; }
        }
    }
    allSprites.sort((a,b)=>(a.depth||0)-(b.depth||0));

    ctx.save();
    if(camera._active){
        ctx.translate(WIDTH/2 - camera.x, HEIGHT/2 - camera.y);
    }
    allSprites.forEach(s=>{ s.update(); s.draw(); });
    ctx.restore();
}

let _frameCounter=0; const DRAW_EVERY=2;
function gameLoop(){
    _frameCounter++;
    if(_frameCounter%DRAW_EVERY===0){
        if(_loopActive && typeof window.draw==="function"){
            try{ window.draw(); } catch(e){ console.error(e); }
        }
    }
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);