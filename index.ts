
const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

enum RawTile {
  AIR,
  FLUX,
  UNBREAKABLE,
  PLAYER,
  STONE, FALLING_STONE,
  BOX, FALLING_BOX,
  KEY1, LOCK1,
  KEY2, LOCK2
}

interface Tile {
  isAir(): boolean;
  isLock1(): boolean;
  isLock2(): boolean;
  draw(g: CanvasRenderingContext2D, x: number, y: number): void;
  moveHorizontal(player: Player, dx: number): void;
  moveVertical(player: Player, dy: number): void;
  update(x: number, y: number): void;
  getBlockOnTopState(): FallingState;
}

class Air implements Tile {
  isAir() { return true; }
  isLock1() { return false; }
  isLock2() { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) { }
  moveHorizontal(player: Player, dx: number) {
    player.move(dx, 0);
  }
  moveVertical(player: Player, dy: number) {
    player.move(0, dy);
  }
  update(x: number, y: number) { }
  getBlockOnTopState() {
    return new Falling();
  }
}

class Flux implements Tile {
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#ccffcc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(player: Player, dx: number) {
    player.move(dx, 0);
  }
  moveVertical(player: Player, dy: number) {
    player.move(0, dy);
  }
  update(x: number, y: number) { }
  getBlockOnTopState() { return new Resting(); }
}

class Unbreakable implements Tile {
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#999999";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(player: Player, dx: number) { }
  moveVertical(player: Player, dy: number) { }
  update(x: number, y: number) { }
  getBlockOnTopState() { return new Resting(); }
}

class PlayerTile implements Tile {
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) { }
  moveHorizontal(player: Player, dx: number) { }
  moveVertical(player: Player, dy: number) { }
  update(x: number, y: number) { }
  getBlockOnTopState() { return new Resting(); }
}

interface FallingState {
  isFalling(): boolean;
  moveHorizontal(player: Player, tile: Tile, dx: number): void;
  drop(tile: Tile, x: number, y: number): void;
}
class Falling {
  isFalling() { return true; }
  moveHorizontal(player: Player, tile: Tile, dx: number) {
  }
  drop(tile: Tile, x: number, y: number) {
    map[y + 1][x] = tile;
    map[y][x] = new Air();
  }
}
class Resting {
  isFalling() { return false; }
  moveHorizontal(player: Player, tile: Tile, dx: number) {
    player.pushHorizontal(tile, dx);
  }
  drop(tile: Tile, x: number, y: number) {
  }
}
class Stone implements Tile {
  private fallStrategy: FallStrategy;
  constructor(falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#0000cc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(player: Player, dx: number) {
    this.fallStrategy.moveHorizontal(player, this, dx);
  }
  moveVertical(player: Player, dy: number) { }
  update(x: number, y: number) {
    this.fallStrategy.update(this, x, y);
  }
  getBlockOnTopState() {
    return new Resting();
  }
}

class Box implements Tile {
  private fallStrategy: FallStrategy;
  constructor(falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#8b4513";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(player: Player, dx: number) {
    this.fallStrategy.moveHorizontal(player, this, dx);
  }
  moveVertical(player: Player, dy: number) { }
  update(x: number, y: number) {
    this.fallStrategy.update(this, x, y);
  }
}

class Key implements Tile {
  constructor(private keyConf: KeyConfiguration) { }
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    this.keyConf.setColor(g);
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(player: Player, dx: number) {
    this.keyConf.removeLock();
    player.move(dx, 0);
  }
  moveVertical(player: Player, dy: number) {
    this.keyConf.removeLock();
    player.move(0, dy);
  }
  update(x: number, y: number) { }
}

class Lock implements Tile {
  constructor(private keyConf: KeyConfiguration) { }
  isAir() { return false; }
  isLock1() { return this.keyConf.is1(); }
  isLock2() { return !this.keyConf.is1(); }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    this.keyConf.setColor(g);
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(player: Player, dx: number) { }
  moveVertical(player: Player, dy: number) { }
  update(x: number, y: number) { }
}
// [getFalling]
// 1. getter 비공개 설정
// 2. 클래스로 코드 이관
// 3. 새로운 메서드 삭제 
// 4. if 문에서 else를 사용하지 말것
class FallStrategy {
  constructor(private falling: FallingState) { }
  update(tile: Tile, x: number, y: number) {
    this.falling = map[y + 1][x].getBlockOnTopState();
    this.falling.drop(tile, x, y);
  }

  moveHorizontal(player: Player, tile: Tile, dx: number) {
    this.falling.moveHorizontal(player, tile, dx);
  }
}

interface Input {
  handle(): void;
}

class Right implements Input {
  handle(player: Player) {
    player.moveHorizontal(1);
  }
}

class Left implements Input {
  handle(player: Player) {
    player.moveHorizontal(-1);
  }
}

class Up implements Input {
  handle(player: Player) {
    player.moveVertical(-1);
  }
}

class Down implements Input {
  handle(player: Player) {
    player.moveVertical(1);
  }
}

// [단일 책임 원칙 적용해보기] 
//1. 기존 Player class 이름 변경
//2. 동일한 접사, 메서드 및 변수를 가진 그룹 찾기 - playerx, playery, drawPlayer
//3. 동일한 접사를 가진 것들 이동, private로 변경
//4. 새로운 getter, setter 만들기 
//5. 변수가 있던 지점에 let player = new Player();
//6. getter 비공개 설정
//7. 오류 수정
//8. 클래스로 코드 이관  
class Player {
  private x = 1;
  private y = 1;
  draw(g:CanvasRenderingContext2D) {
    g.fillStyle = "#ff0000";
    g.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(dx: number) {
    map[this.y][this.x + dx].moveHorizontal(this, dx);
  }
  moveVertical(dy: number) {
    map[this.y + dy][this.x].moveVertical(this, dy);
  }
  move(dx: number, dy: number) {
    this.moveToTile(this.x + dx, this.y + dy);
  }
  pushHorizontal(tile: Tile, dx: number) {
    if (map[this.y][this.x + dx + dx].isAir()
      && !map[this.y + 1][this.x + dx].isAir()) {
      map[this.y][this.x + dx + dx] = tile;
      this.moveToTile(this.x + dx, this.y);
    }
  }
  private moveToTile(newx: number, newy: number) {
    map[this.y][this.x] = new Air();
    map[newy][newx] = new PlayerTile();
    this.x = newx;
    this.y = newy;
  }
}

let player = new Player();
let rawMap: RawTile[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];
let map: Tile[][];
function assertExhausted(x: never): never {
  throw new Error("Unexpected object: " + x);
}
function transformTile(tile: RawTile) {
  switch (tile) {
    case RawTile.AIR: return new Air();
    case RawTile.PLAYER: return new Player();
    case RawTile.UNBREAKABLE: return new Unbreakable();
    case RawTile.STONE: return new Stone(new Resting());
    case RawTile.FALLING_STONE: return new Stone(new Falling());
    case RawTile.BOX: return new Box(new Resting());
    case RawTile.FALLING_BOX: return new Box(new Falling());
    case RawTile.FLUX: return new Flux();
    case RawTile.KEY1: return new Key(YELLOW_KEY);
    case RawTile.LOCK1: return new Lock(YELLOW_KEY);
    case RawTile.KEY2: return new Key(BLUE_KEY);
    case RawTile.LOCK2: return new Lock(BLUE_KEY);
    default: assertExhausted(tile);
  }
}
function transformMap() {
  map = new Array(rawMap.length);
  for (let y = 0; y < rawMap.length; y++) {
    map[y] = new Array(rawMap[y].length);
    for (let x = 0; x < rawMap[y].length; x++) {
      map[y][x] = transformTile(rawMap[y][x]);
    }
  }
}

let inputs: Input[] = [];

function remove(shouldRemove: RemoveStrategy) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (shouldRemove.check(map[y][x])) {
        map[y][x] = new Air();
      }
    }
  }
}

interface RemoveStrategy {
  check(tile: Tile): boolean;
}
class RemoveLock1 implements RemoveStrategy {
  check(tile: Tile) {
    return tile.isLock1();
  }
}
class RemoveLock2 implements RemoveStrategy {
  check(tile: Tile) {
    return tile.isLock2();
  }
}

// [getRemoveStrategy]
//1. getter를 비공개로 설정
//2. 오류 발생 줄에서 클래스로의 코드 이관 -> 인라인화
//3. 새로운 메서드 작성 후 사용하지 못하도록 삭제

// [getColor]
//1. setColor는 setter가 아님, 호출 또는 전달, 한 가지만 할 것을 위반
//2. 위와 마찬가지로 오류 발생 줄에서 클래스로의 코드 이관 -> 인라인화
class KeyConfiguration {
  constructor(private color: string, private _1: boolean, private removeStrategy: RemoveStrategy) { }
  setColor(g: CanvasRenderingContext2D) { 
    g.fillStyle =  this.color; 
  }
  is1() { return this._1; }
  removeLock() {
    remove(this.removeStrategy);
  }
}
const YELLOW_KEY = new KeyConfiguration("#ffcc00", true, new RemoveLock1());
const BLUE_KEY = new KeyConfiguration("#00ccff", false, new RemoveLock2());

function update(player: Player) {
  handleInputs();
  updateMap();
}

function handleInputs(player: Player) {
  while (inputs.length > 0) {
    let input = inputs.pop();
    input.handle();
  }
}

function updateMap() {
  for (let y = map.length - 1; y >= 0; y--) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].update(x, y);
    }
  }
}

function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");
  g.clearRect(0, 0, canvas.width, canvas.height);
  return g;
}

function draw(player: Player) {
  let g = createGraphics();
  drawMap(g);
  drawPlayer(g);
}

function drawMap(g: CanvasRenderingContext2D) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].draw(g, x, y);
    }
  }
}

function gameLoop() {
  let before = Date.now();
  update(player);
  draw(player);
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(() => gameLoop(), sleep);
}

window.onload = () => {
  transformMap();
  gameLoop();
}

const LEFT_KEY = "ArrowLeft";
const UP_KEY = "ArrowUp";
const RIGHT_KEY = "ArrowRight";
const DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", e => {
  if (e.key === LEFT_KEY || e.key === "a") inputs.push(new Left());
  else if (e.key === UP_KEY || e.key === "w") inputs.push(new Up());
  else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new Right());
  else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new Down());
});
