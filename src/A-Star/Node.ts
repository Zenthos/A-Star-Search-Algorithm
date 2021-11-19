export interface Vector {
  x: number;
  y: number;
}

export class Node {
  key: string;
  wall: boolean;
  seen: boolean;
  parent: Node | null;

  x: number = 0;
  y: number = 0;

  h: number = 0;
  g: number = Infinity;
  f: number = Infinity;

  constructor(x: number, y: number) {
    this.wall = false;
    this.seen = false;
    this.parent = null;
    this.key = `${x},${y}`;
    this.x = x;
    this.y = y;
  }

  setPosition(point: Vector) {
    this.x = point.x;
    this.y = point.y;
    this.key = `${point.x},${point.y}`;
  }
}